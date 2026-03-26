'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ImagePlus, X, ChevronLeft, Moon, Heart, Sunrise, Lock, Music, Users, PartyPopper, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SongSearch, type SpotifyTrack } from './song-search'

interface SpecialTemplatesProps {
  onComplete: (data: { type: string; images: string[]; files: File[]; song?: SpotifyTrack }) => void
  onSelectionChange?: (hasSelection: boolean) => void
  onBack?: () => void
}

const TEMPLATES = [
  {
    id: 'then-now',
    name: 'Damals vs. H\u00fct',
    icon: Star,
    description: 'Wer warsch du domols und wer bisch h\u00fct?',
    slots: [
      { label: 'Damals', hint: 'Foto vo fr\u00fcener' },
      { label: 'Heute', hint: 'Aktuells Foto' },
    ],
    layout: 'split' as const,
  },
  {
    id: 'love-story',
    name: 'Shake Love Story',
    icon: Heart,
    description: 'Hosch d\'Liebi im Shake gfunda?',
    slots: [
      { label: 'Damals', hint: 'Wie es agfanga het' },
      { label: 'Heute', hint: 'Wie es h\u00fct isch' },
    ],
    layout: 'split' as const,
  },
  {
    id: 'first-time',
    name: 'Mis 1. Mal',
    icon: PartyPopper,
    description: 'Erinnersch du di an dis erschte Mal?',
    slots: [{ label: 'Mis erschte Mal', hint: 'Foto oder Selfie' }],
    layout: 'single' as const,
    prompts: ['Wenn isch es gsi?', 'Mit wem warsch du do?', 'Was hosch gf\u00fchlt?'],
  },
  {
    id: 'crew',
    name: 'D\' Crew',
    icon: Users,
    description: 'Zeig dini Shake-Gang!',
    slots: [
      { label: 'D\' Crew', hint: 'Gruppefoto vo domols' },
      { label: 'Und h\u00fct?', hint: 'Gruppefoto vo h\u00fct' },
    ],
    layout: 'split' as const,
  },
  {
    id: 'best-night',
    name: 'Die beschti Nacht',
    icon: Moon,
    description: 'Die eini Nacht wo du nie vergissch',
    slots: [{ label: 'Foto', hint: 'Falls du eis hosch...' }],
    layout: 'single' as const,
    prompts: ['Was isch passiert?', 'Weles Johr?', 'Wel\u00e4 Song isch glofa?'],
  },
  {
    id: 'sunrise',
    name: 'Sunrise Session',
    icon: Sunrise,
    description: 'Die legend\u00e4ra Morga noch de Nacht',
    slots: [{ label: 'Sunrise', hint: 'De Morga drnoch' }],
    layout: 'single' as const,
    prompts: ['Wie isch de Heimweg gsi?'],
  },
  {
    id: 'confession',
    name: 'Beichte',
    icon: Lock,
    description: 'Was du no nie \u00f6pperem verzellt hosch...',
    slots: [],
    layout: 'text-only' as const,
    prompts: ['Was isch im Shake passiert, wo ni\u00e4med weiss?'],
  },
  {
    id: 'playlist',
    name: 'Mi Shake-Song',
    icon: Music,
    description: 'De Song wo di immer ans Shake erinnert',
    slots: [],
    layout: 'song' as const,
    prompts: ['Warum genau d\u00e4 Song?'],
  },
]

export function SpecialTemplates({ onComplete, onSelectionChange, onBack }: SpecialTemplatesProps) {
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

  // === Template chooser — unified dark surface, pink accent ===
  if (!selected) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {TEMPLATES.map((tmpl, i) => {
            const Icon = tmpl.icon
            return (
              <motion.button
                key={tmpl.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setSelected(tmpl.id)
                  setImages(new Array(tmpl.slots.length).fill(null))
                  setFiles(new Array(tmpl.slots.length).fill(null))
                  onSelectionChange?.(true)
                }}
                className="relative overflow-hidden rounded-2xl bg-shake-surface"
                style={{ height: '130px' }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,45,120,0.06),transparent_60%)]" />
                <div className="relative flex h-full flex-col justify-between p-4">
                  <Icon className="h-5 w-5 text-shake-neon-pink/60" />
                  <div>
                    <div className="text-sm font-bold text-shake-text leading-tight">{tmpl.name}</div>
                    <div className="mt-0.5 text-xs text-shake-text-muted leading-snug">{tmpl.description}</div>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>
    )
  }

  // === Selected template inner page ===
  const Icon = template?.icon || Star

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4 pb-4"
    >
      {/* Header with back */}
      <button
        onClick={() => { setSelected(null); setImages([]); setFiles([]); setAnswers({}); setSelectedSong(null); onSelectionChange?.(false) }}
        className="flex items-center gap-3 active:opacity-70 transition-opacity"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 border border-white/10">
          <ChevronLeft className="h-4 w-4 text-shake-text" />
        </div>
        <div>
          <div className="text-sm font-bold text-shake-text">{template?.name}</div>
          <div className="text-xs text-shake-text-muted">{template?.description}</div>
        </div>
      </button>

      {/* Confession template */}
      {template?.id === 'confession' && (
        <div className="rounded-2xl border border-shake-neon-pink/10 bg-shake-surface p-5 text-center">
          <Lock className="mx-auto h-5 w-5 text-shake-neon-pink/40 mb-2" />
          <span className="text-xs uppercase tracking-widest text-shake-neon-pink/40">Vertraulich</span>
        </div>
      )}

      {/* Split layout (Damals vs. Heute) */}
      {template?.layout === 'split' && (
        <div className="relative flex gap-3">
          {template.slots.map((slot, i) => (
            <div key={i} className="flex-1">
              <div className="mb-2 text-center text-xs font-bold uppercase tracking-wider text-shake-neon-pink/60">
                {slot.label}
              </div>
              {images[i] ? (
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10">
                  <img src={images[i]!} alt="" className="h-full w-full object-cover" />
                  <button
                    onClick={() => {
                      setImages(prev => { const n = [...prev]; n[i] = null; return n })
                      setFiles(prev => { const n = [...prev]; n[i] = null as unknown as File; return n })
                    }}
                    className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 backdrop-blur-sm active:scale-90"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              ) : (
                <label className="flex aspect-[3/4] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] active:bg-white/5 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    capture={i === 1 ? 'user' : undefined}
                    onChange={(e) => handleImageUpload(e, i)}
                    className="hidden"
                  />
                  <ImagePlus className="h-6 w-6 text-shake-text-muted/30" />
                  <span className="text-xs text-shake-text-muted/40">{slot.hint}</span>
                </label>
              )}
            </div>
          ))}

          {/* VS divider */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-shake-neon-pink/30 bg-shake-black text-xs font-black text-shake-neon-pink">
              VS
            </div>
          </div>
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
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 backdrop-blur-sm active:scale-90"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          ) : (
            <label className="mx-auto flex aspect-square max-w-xs cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] active:bg-white/5 transition-colors">
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 0)} className="hidden" />
              <ImagePlus className="h-8 w-8 text-shake-text-muted/30" />
              <span className="text-sm text-shake-text-muted/40">{template.slots[0].hint}</span>
            </label>
          )}
        </div>
      )}

      {/* Song search */}
      {template?.layout === 'song' && (
        <SongSearch selected={selectedSong} onSelect={setSelectedSong} />
      )}

      {/* Prompts */}
      {template?.prompts && (
        <div className="space-y-3 rounded-2xl bg-shake-surface p-4 border border-white/5">
          <div className="text-xs uppercase tracking-widest text-shake-text-muted/40">
            Erzähl meh...
          </div>
          {template.prompts.map((prompt) => (
            <div key={prompt}>
              <label className="mb-1.5 block text-xs font-medium text-shake-text-muted">
                {prompt}
              </label>
              <input
                value={answers[prompt] || ''}
                onChange={(e) => setAnswers(prev => ({ ...prev, [prompt]: e.target.value }))}
                placeholder="..."
                className="w-full rounded-xl border border-white/8 bg-white/[0.03] px-4 py-2.5 text-base text-shake-text placeholder:text-white/20 focus:border-shake-neon-pink/30 focus:outline-none transition-colors"
              />
            </div>
          ))}
        </div>
      )}

      {/* Done button — always pink */}
      {hasContent && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleComplete}
          className="w-full rounded-full bg-shake-neon-pink py-3 text-sm font-semibold text-white active:scale-[0.98] transition-transform"
        >
          Fertig
        </motion.button>
      )}
    </motion.div>
  )
}
