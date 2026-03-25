import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key for moderation (bypasses RLS)
function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  const { story_id, content_text } = await req.json()

  if (!story_id || !content_text) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const supabase = getServiceSupabase()
  let approved = true
  let reason = ''

  // Layer 1: OpenAI Moderation API (if key available)
  if (process.env.OPENAI_API_KEY) {
    try {
      const modResponse = await fetch('https://api.openai.com/v1/moderations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: content_text }),
      })

      const modResult = await modResponse.json()
      if (modResult.results?.[0]?.flagged) {
        approved = false
        reason = 'content_policy_violation'
      }
    } catch (e) {
      console.error('Moderation API error:', e)
      // Continue to layer 2
    }

    // Layer 2: Good vibes check via GPT-4o-mini
    if (approved) {
      try {
        const vibeResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            response_format: { type: 'json_object' },
            messages: [
              {
                role: 'system',
                content: `Du bist ein Content-Moderator für "Shake Memories", eine liebevolle Erinnerungsplattform für einen Nachtclub der nach 25 Jahren schließt.

Bewerte den Text und antworte mit JSON: {"approved": true/false, "reason": "string"}

GENEHMIGE: Nostalgische, lustige, herzliche, "bsoffene" (betrunkene aber harmlose) Geschichten, Liebesgeschichten, Freundschaftsgeschichten, Party-Erinnerungen.

ABLEHNEN: Hassrede, persönliche Angriffe auf andere Personen, Diskriminierung, explizite sexuelle Inhalte, Drogenverherrlichung, Gewalt, Negativität gegenüber dem Club oder dessen Betreiber, Spam, Werbung.

Sei großzügig - das sind Party-Erinnerungen, da darf es lustig und wild sein. Good vibes only!`,
              },
              { role: 'user', content: content_text },
            ],
            max_tokens: 100,
          }),
        })

        const vibeResult = await vibeResponse.json()
        const parsed = JSON.parse(vibeResult.choices[0].message.content)
        if (!parsed.approved) {
          approved = false
          reason = parsed.reason || 'bad_vibes'
        }
      } catch (e) {
        console.error('Vibe check error:', e)
        // If vibe check fails, auto-approve (fail open for UX)
        approved = true
      }
    }
  } else {
    // No OpenAI key: auto-approve (development mode)
    approved = true
  }

  // Update story moderation status
  const { error } = await supabase
    .from('stories')
    .update({
      moderation_status: approved ? 'approved' : 'rejected',
    })
    .eq('id', story_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ approved, reason })
}
