import { createServerSupabase } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime']

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase()

    let formData: FormData
    try {
      formData = await req.formData()
    } catch {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
    }

    const files = formData.getAll('files') as File[]
    const anonymousId = formData.get('anonymous_id') as string

    if (!files.length || !anonymousId) {
      return NextResponse.json({ error: 'No files or anonymous_id' }, { status: 400 })
    }

    if (files.length > 5) {
      return NextResponse.json({ error: 'Max 5 files' }, { status: 400 })
    }

    const urls: string[] = []

    for (const file of files) {
      // Validate
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: `File too large: ${file.name} (max 10MB)` }, { status: 400 })
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ error: `Invalid file type: ${file.type}` }, { status: 400 })
      }

      const ext = file.name.split('.').pop() || 'jpg'
      const path = `uploads/${anonymousId}/${crypto.randomUUID()}.${ext}`

      const { error } = await supabase.storage
        .from('media')
        .upload(path, file, {
          contentType: file.type,
          upsert: false,
        })

      if (error) {
        console.error('Supabase storage upload error:', error)
        return NextResponse.json(
          { error: `Upload failed: ${error.message}. Make sure the storage bucket "media" exists and allows uploads.` },
          { status: 500 }
        )
      }

      const { data: urlData } = supabase.storage.from('media').getPublicUrl(path)
      urls.push(urlData.publicUrl)
    }

    return NextResponse.json({ urls })
  } catch (e) {
    console.error('Upload route unexpected error:', e)
    return NextResponse.json({ error: 'Upload failed unexpectedly' }, { status: 500 })
  }
}
