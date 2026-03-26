'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, ImagePlus, X, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SongSearch, type SpotifyTrack } from './song-search'

interface SpecialTemplatesProps {
  onComplete: (data: { type: string; images: string[]; files: File[]; song?: SpotifyTrack }) => void
}

const TEMPLATES = [
  {
    id: 'then-now',
    name: 'Damals vs. Hüt',
    emoji: '📸',
    description: 'Wer warsch du domols und wer bisch hüt?',
    slots: [
      { label: 'Damals', hint: 'Foto vo früener' },
      { label: 'Heute', hint: 'Aktuells Foto' },
    ],
    layout: 'split' as const,
    gradient: 'from-shake-gold/30 to-shake-warm/20',
  },
  {
    id: 'love-story',
    name: 'Shake Love Story',
    emoji: '❤️',
    description: 'Hosch d\'Liebi im Shake gfunda?',
    slots: [
      { label: 'Damals', hint: 'Wie es agfanga het' },
      { label: 'Heute', hint: 'Wie es hüt isch' },
    ],
    layout: 'split' as const,
    gradient: 'from-shake-neon-pink/30 to-shake-neon-purple/20',
  },
  {
    id: 'first-time',
    name: 'Mis 1. Mal',
    emoji: '🎉',
    description: 'Erinnersch du di an dis erschte Mal?',
    slots: [{ label: 'Mis erschte Mal', hint: 'Foto oder Selfie' }],
    layout: 'single' as const,
    prompts: ['Wenn isch es gsi?', 'Mit wem warsch du do?', 'Was hosch gfühlt?'],
    gradient: 'from-shake-neon-green/20 to-shake-neon-blue/20',
  },
  {
    id: 'crew',
    name: 'D\' Crew',
    emoji: '👯',
    description: 'Zeig dini Shake-Gang!',
    slots: [
      { label: 'D\' Crew', hint: 'Gruppefoto vo domols' },
      { label: 'Und hüt?', hint: 'Gruppefoto vo hüt' },
    ],
    layout: 'split' as const,
    gradient: 'from-shake-neon-blue/20 to-shake-neon-purple/20',
  },
  {
    id: 'best-night',
    name: 'Die beschti Nacht',
    emoji: '🌙',
    description: 'Die eini Nacht wo du nie vergissch',
    slots: [{ label: 'Foto', hint: 'Falls du eis hosch...' }],
    layout: 'single' as const,
    prompts: ['Was isch passiert?', 'Weles Johr?', 'Welä Song isch glofa?'],
    gradient: 'from-shake-neon-purple/30 to-shake-black',
  },
  {
    id: 'sunrise',
    name: 'Sunrise Session',
    emoji: '🌅',
    description: 'Die legendära Morga noch de Nacht',
    slots: [{ label: 'Sunrise', hint: 'De Morga drnoch' }],
    layout: 'single' as const,
    prompts: ['Wie isch de Heimweg gsi?'],
    gradient: 'from-shake-warm/30 to-shake-gold/20',
  },
  {
    id: 'confession',
    name: 'Beichte',
    emoji: '🤫',
    description: 'Was du no nie öpperem verzellt hosch...',
    slots: [],
    layout: 'text-only' as const,
    prompts: ['Was isch im Shake passiert, wo niämed weiss?'],
    gradient: 'from-shake-neon-pink/20 to-shake-dark',
  },
  {
    id: 'playlist',
    name: 'Mi Shake-Song',
    emoji: '🎵',
    description: 'De Song wo di immer ans Shake erinnert',
    slots: [],
    layout: 'song' as const,
    prompts: ['Warum genau dä Song?'],
    gradient: 'from-shake-neon-blue/20 to-shake-dark',
  },
]

export function SpecialTemplates({ onComplete }: SpecialTemplatesProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [images, setImages] = useState<(string | null)[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selectedSong, setSelectedSong] = useState<SpotifyTrack | null>(null)

  const template = TEMPLATES.find((t) => t.id === selected)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setImages((prev) => { const next = [...prev]; next[index] = reader.result as string; return next })
      setFiles((prev) => { const next = [...prev]; next[index] = file; return next })
    }
    reader.readAsDataURL(file)
  }

  const handleComplete = () => {
    if (!template) return
    onComplete({
      type: template.name,
      images: images.filter(Boolean) as string[],
      files: files.filter(Boolean),
      ...(selectedSong && { song: selectedSong }),
    })
  }

  const hasContent = images.some(Boolean) || Object.values(answers).some((v) => v.trim()) || selectedSong

  // === Template chooser ===
  if (!selected) {
    return (
      <div className="space-y-2">
        {TEMPLATES.map((tmpl, i) => (
          <motion.button
            key={tmpl.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setSelected(tmpl.id)
              setImages(new Array(tmpl.slots.length).fill(null))
              setFiles(new Array(tmpl.slots.length).fill(null))
            }}
            className={cn(
              'flex w-full items-center gap-3 rounded-2xl border border-white/5 p-3.5 text-left transition-colors',
              `bg-gradient-to-r ${tmpl.gradient}`
            )}
          >
            <span className="text-3xl">{tmpl.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-shake-text">{tmpl.name}</div>
              <div className="text-[11px] text-shake-text-muted truncate">{tmpl.description}</div>
            </div>
            <span className="text-shake-text-muted text-lg">›</span>
          </motion.button>
        ))}
      </div>
    )
  }

  // === Selected template ===
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      {/* Header with back */}
      <button
        onClick={() => { setSelected(null); setImages([]); setFiles([]); setAnswers({}) }}
        className="flex items-center gap-2 text-shake-text-muted"
      >
        <ChevronLeft className="h-5 w-5" />
        <span className="text-3xl">{template?.emoji}</span>
        <div>
          <div className="text-sm font-bold text-shake-text">{template?.name}</div>
          <div className="text-[10px] text-shake-text-muted">{template?.description}</div>
        </div>
      </button>

      {/* Split layout (Damals vs. Heute etc.) */}
      {template?.layout === 'split' && (
        <div className="flex gap-2">
          {template.slots.map((slot, i) => (
            <div key={i} className="flex-1">
              <div className="mb-1.5 text-center text-xs font-bold text-shake-neon-pink uppercase tracking-wider">{slot.label}</div>
              {images[i] ? (
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10">
                  <img src={images[i]!} alt="" className="h-full w-full object-cover" />
                  <button
                    onClick={() => {
                      setImages(prev => { const n = [...prev]; n[i] = null; return n })
                      setFiles(prev => { const n = [...prev]; n[i] = null as unknown as File; return n })
                    }}
                    className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 backdrop-blur-sm"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              ) : (
                <label className="flex aspect-[3/4] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 bg-white/5 transition-colors active:bg-white/10">
                  <input
                    type="file"
                    accept="image/*"
                    capture={i === 1 ? 'user' : undefined}
                    onChange={(e) => handleImageUpload(e, i)}
                    className="hidden"
                  />
                  <Camera className="h-8 w-8 text-white/30" />
                  <span className="text-[11px] text-white/40">{slot.hint}</span>
                </label>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Single image */}
      {template?.layout === 'single' && template.slots.length > 0 && (
        <div>
          {images[0] ? (
            <div className="relative mx-auto aspect-square max-w-xs overflow-hidden rounded-2xl border border-white/10">
              <img src={images[0]} alt="" className="h-full w-full object-cover" />
              <button
                onClick={() => { setImages([null]); setFiles([null as unknown as File]) }}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 backdrop-blur-sm"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          ) : (
            <label className="flex aspect-square mx-auto max-w-xs cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 bg-white/5 transition-colors active:bg-white/10">
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 0)} className="hidden" />
              <ImagePlus className="h-10 w-10 text-white/30" />
              <span className="text-sm text-white/40">{template.slots[0].hint}</span>
            </label>
          )}
        </div>
      )}

      {/* Song search for "Mein Shake-Song" */}
      {template?.layout === 'song' && (
        <SongSearch selected={selectedSong} onSelect={setSelectedSong} />
      )}

      {/* Prompts */}
      {template?.prompts && (
        <div className="space-y-3">
          {template.prompts.map((prompt) => (
            <div key={prompt}>
              <label className="mb-1 block text-xs font-medium text-shake-neon-blue">{prompt}</label>
              <input
                value={answers[prompt] || ''}
                onChange={(e) => setAnswers(prev => ({ ...prev, [prompt]: e.target.value }))}
                placeholder="..."
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-shake-text placeholder:text-white/20 focus:border-shake-neon-pink/50 focus:outline-none"
              />
            </div>
          ))}
        </div>
      )}

      {/* Done button */}
      {hasContent && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleComplete}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-shake-neon-green/20 py-3 text-sm font-medium text-shake-neon-green active:bg-shake-neon-green/30"
        >
          ✓ Fertig
        </motion.button>
      )}
    </motion.div>
  )
}
