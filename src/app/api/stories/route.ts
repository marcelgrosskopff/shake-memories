import { createServerSupabase } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createServerSupabase()

  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('moderation_status', 'approved')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Get reactions counts
  const storyIds = data.map((s) => s.id)
  const { data: reactions } = await supabase
    .from('reactions')
    .select('story_id, reaction_type')
    .in('story_id', storyIds)

  // Aggregate reactions
  const reactionCounts: Record<string, Record<string, number>> = {}
  reactions?.forEach((r) => {
    if (!reactionCounts[r.story_id]) reactionCounts[r.story_id] = {}
    reactionCounts[r.story_id][r.reaction_type] =
      (reactionCounts[r.story_id][r.reaction_type] || 0) + 1
  })

  const storiesWithReactions = data.map((story) => ({
    ...story,
    reactions_count: reactionCounts[story.id] || {},
  }))

  return NextResponse.json(storiesWithReactions)
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase()
  const body = await req.json()

  const { content_text, author_name, instagram_handle, parent_story_id, media_urls, anonymous_id } =
    body

  if (!content_text || !anonymous_id) {
    return NextResponse.json({ error: 'content_text and anonymous_id are required' }, { status: 400 })
  }

  if (content_text.length > 2000) {
    return NextResponse.json({ error: 'Content too long (max 2000 chars)' }, { status: 400 })
  }

  // Rate limiting: max 5 stories per anonymous_id per hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count } = await supabase
    .from('stories')
    .select('*', { count: 'exact', head: true })
    .eq('anonymous_id', anonymous_id)
    .gte('created_at', oneHourAgo)

  if (count && count >= 5) {
    return NextResponse.json({ error: 'Too many stories. Please wait a bit.' }, { status: 429 })
  }

  const { data, error } = await supabase
    .from('stories')
    .insert({
      content_text,
      author_name: author_name || null,
      instagram_handle: instagram_handle || null,
      parent_story_id: parent_story_id || null,
      media_urls: media_urls || [],
      anonymous_id,
      moderation_status: 'pending',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Trigger moderation (await it so story gets approved before response)
  try {
    const moderateUrl = new URL('/api/moderate', req.url)
    const modResult = await fetch(moderateUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ story_id: data.id, content_text }),
    })
    const modData = await modResult.json()
    data.moderation_status = modData.approved ? 'approved' : 'rejected'
  } catch (e) {
    console.error('Moderation call failed:', e)
    // Story stays as 'pending' - will need manual approval
  }

  return NextResponse.json(data, { status: 201 })
}
