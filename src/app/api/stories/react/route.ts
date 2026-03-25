import { createServerSupabase } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase()
  const { story_id, reaction_type, anonymous_id } = await req.json()

  if (!story_id || !reaction_type || !anonymous_id) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // Toggle reaction: if it exists, delete it; otherwise, insert it
  const { data: existing } = await supabase
    .from('reactions')
    .select('id')
    .eq('story_id', story_id)
    .eq('reaction_type', reaction_type)
    .eq('anonymous_id', anonymous_id)
    .single()

  if (existing) {
    await supabase.from('reactions').delete().eq('id', existing.id)
    return NextResponse.json({ action: 'removed' })
  }

  const { error } = await supabase.from('reactions').insert({
    story_id,
    reaction_type,
    anonymous_id,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ action: 'added' })
}
