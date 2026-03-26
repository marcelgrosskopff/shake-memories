import { NextRequest, NextResponse } from 'next/server'

// Spotify Client Credentials flow - server-side only
// If no Spotify credentials, falls back to oEmbed search
let cachedToken: { token: string; expires: number } | null = null

async function getSpotifyToken(): Promise<string | null> {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) return null

  // Return cached token if still valid
  if (cachedToken && Date.now() < cachedToken.expires) {
    return cachedToken.token
  }

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!res.ok) return null

  const data = await res.json()
  cachedToken = {
    token: data.access_token,
    expires: Date.now() + (data.expires_in - 60) * 1000,
  }
  return data.access_token
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q')
  if (!query || query.length < 2) {
    return NextResponse.json({ tracks: [] })
  }

  const token = await getSpotifyToken()

  if (token) {
    // Full Spotify API search
    try {
      const res = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=8&market=AT`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (res.ok) {
        const data = await res.json()
        const tracks = data.tracks.items.map((track: Record<string, unknown>) => ({
          id: track.id as string,
          name: track.name as string,
          artist: (track.artists as Array<{ name: string }>).map((a) => a.name).join(', '),
          album: (track.album as { name: string }).name,
          image: (track.album as { images: Array<{ url: string }> }).images?.[2]?.url ||
                 (track.album as { images: Array<{ url: string }> }).images?.[0]?.url,
          uri: track.uri as string,
          external_url: (track.external_urls as { spotify: string }).spotify,
        }))
        return NextResponse.json({ tracks })
      }
    } catch (e) {
      console.error('Spotify API error:', e)
    }
  }

  // Fallback: return empty (user can paste Spotify URL manually)
  return NextResponse.json({ tracks: [], fallback: true })
}
