'use client'

import { useState, useCallback, useRef } from 'react'
import { Search, Music, X, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SpotifyTrack {
  id: string
  name: string
  artist: string
  album: string
  image: string | null
  uri: string
  external_url: string
}

interface SongSearchProps {
  onSelect: (track: SpotifyTrack) => void
  selected: SpotifyTrack | null
}

export function SongSearch({ onSelect, selected }: SongSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SpotifyTrack[]>([])
  const [loading, setLoading] = useState(false)
  const [fallback, setFallback] = useState(false)
  const [manualUrl, setManualUrl] = useState('')
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data.tracks || [])
      setFallback(data.fallback || false)
    } catch {
      setResults([])
      setFallback(true)
    }
    setLoading(false)
  }, [])

  const handleInput = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(value), 400)
  }

  // If a track is selected, show it
  if (selected) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-[#111]/80 p-3">
          {selected.image && (
            <img src={selected.image} alt="" className="h-14 w-14 rounded-lg object-cover" />
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-shake-text truncate">{selected.name}</div>
            <div className="text-xs text-shake-text-muted truncate">{selected.artist}</div>
          </div>
          <button
            onClick={() => onSelect(null as unknown as SpotifyTrack)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 active:bg-white/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Spotify Embed */}
        <iframe
          src={`https://open.spotify.com/embed/track/${selected.id}?utm_source=generator&theme=0`}
          width="100%"
          height="80"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="rounded-xl"
        />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Search input */}
      <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-[#111] px-3">
        <Search className="h-4 w-4 text-shake-text-muted shrink-0" />
        <input
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="Song oder Artist suchen..."
          className="w-full bg-transparent py-2.5 text-sm text-shake-text placeholder:text-shake-text-muted/60 focus:outline-none"
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]) }} className="text-shake-text-muted">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="py-4 text-center text-xs text-shake-text-muted">Suche...</div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="max-h-64 overflow-y-auto space-y-1 rounded-xl">
          {results.map((track) => (
            <button
              key={track.id}
              onClick={() => { onSelect(track); setQuery(''); setResults([]) }}
              className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors active:bg-white/10 hover:bg-white/5"
            >
              {track.image ? (
                <img src={track.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                  <Music className="h-5 w-5 text-shake-text-muted" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm text-shake-text truncate">{track.name}</div>
                <div className="text-xs text-shake-text-muted truncate">{track.artist}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results / fallback */}
      {!loading && query.length >= 2 && results.length === 0 && (
        <div className="rounded-xl bg-[#111]/60 p-4 text-center">
          <Music className="mx-auto mb-2 h-8 w-8 text-shake-text-muted/30" />
          <p className="text-xs text-shake-text-muted">
            {fallback ? 'Song-Suche nicht verfügbar.' : 'Kein Ergebnis.'} Du kannst auch einen Spotify-Link einfügen:
          </p>
          <input
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="https://open.spotify.com/track/..."
            className="mt-2 w-full rounded-lg border border-white/[0.06] bg-[#111] px-3 py-2 text-xs text-shake-text placeholder:text-shake-text-muted/40 focus:outline-none"
            onBlur={() => {
              // Extract track ID from Spotify URL
              const match = manualUrl.match(/track\/([a-zA-Z0-9]+)/)
              if (match) {
                onSelect({
                  id: match[1],
                  name: 'Spotify Track',
                  artist: '',
                  album: '',
                  image: null,
                  uri: `spotify:track:${match[1]}`,
                  external_url: manualUrl,
                })
              }
            }}
          />
        </div>
      )}

      {/* Hint when empty */}
      {!query && results.length === 0 && (
        <div className="py-2 text-center">
          <Music className="mx-auto mb-2 h-6 w-6 text-shake-text-muted/20" />
          <p className="text-xs text-shake-text-muted/60">
            Welcher Song erinnert dich ans Shake?
          </p>
        </div>
      )}
    </div>
  )
}
