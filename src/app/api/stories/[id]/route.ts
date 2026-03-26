import { createServerSupabase } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!id) {
    return NextResponse.json({ error: 'Missing story id' }, { status: 400 })
  }

  const supabase = await createServerSupabase()

  const { data: story, error } = await supabase
    .from('stories')
    .select('*')
    .eq('id', id)
    .eq('moderation_status', 'approved')
    .single()

  if (error || !story) {
    return NextResponse.json({ error: 'Story not found' }, { status: 404 })
  }

  // Get reactions counts for this story
  const { data: reactions } = await supabase
    .from('reactions')
    .select('reaction_type')
    .eq('story_id', id)

  const reactionCounts: Record<string, number> = {}
  reactions?.forEach((r) => {
    reactionCounts[r.reaction_type] = (reactionCounts[r.reaction_type] || 0) + 1
  })

  return NextResponse.json({
    ...story,
    reactions_count: reactionCounts,
  })
}
