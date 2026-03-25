'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, ImagePlus, X, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SpecialTemplatesProps {
  onComplete: (data: { type: string; images: string[]; files: File[] }) => void
}

const TEMPLATES = [
  {
    id: 'then-now',
    name: 'Damals vs. Heute',
    emoji: '📸',
    description: 'Zeig wer du damals warst und wer du heute bist',
    slots: [
      { label: 'Damals', hint: 'Foto von früher' },
      { label: 'Heute', hint: 'Aktuelles Foto' },
    ],
    layout: 'split',
  },
  {
    id: 'first-time',
    name: 'Mein 1. Mal im Shake',
    emoji: '🎉',
    description: 'Erinnerst du dich an dein erstes Mal?',
    slots: [
      { label: 'Mein erstes Mal', hint: 'Foto oder Selfie' },
    ],
    layout: 'single',
    prompts: ['Wann war es?', 'Mit wem warst du da?', 'Was hast du gefühlt?'],
  },
  {
    id: 'crew',
    name: 'Die Crew',
    emoji: '👯',
    description: 'Zeig deine Shake-Gang!',
    slots: [
      { label: 'Gruppenfoto', hint: 'Die Crew von damals' },
      { label: 'Oder heute', hint: 'Die Crew von heute' },
    ],
    layout: 'split',
  },
  {
    id: 'best-night',
    name: 'Die beste Nacht',
    emoji: '🌙',
    description: 'Die eine Nacht die du nie vergisst',
    slots: [
      { label: 'Foto der Nacht', hint: 'Falls du eins hast...' },
    ],
    layout: 'single',
    prompts: ['Was ist passiert?', 'Welches Jahr?', 'Welcher Song lief?'],
  },
  {
    id: 'sunrise',
    name: 'Sunrise Session',
    emoji: '🌅',
    description: 'Die legendären Morgen nach der Nacht',
    slots: [
      { label: 'Sunrise Moment', hint: 'Der Morgen danach' },
    ],
    layout: 'single',
    prompts: ['Wie war der Heimweg?', 'Was hast du am nächsten Tag gemacht?'],
  },
  {
    id: 'love-story',
    name: 'Shake Love Story',
    emoji: '❤️',
    description: 'Hast du die Liebe im Shake gefunden?',
    slots: [
      { label: 'Damals', hint: 'Wie es angefangen hat' },
      { label: 'Heute', hint: 'Wie es heute ist' },
    ],
    layout: 'split',
    prompts: ['Wie habt ihr euch kennengelernt?', 'Welcher Song lief?'],
  },
  {
    id: 'confession',
    name: 'Beichte',
    emoji: '🤫',
    description: 'Was du noch nie jemandem erzählt hast...',
    slots: [],
    layout: 'text-only',
    prompts: ['Was ist im Shake passiert, das niemand weiß?'],
  },
  {
    id: 'playlist',
    name: 'Mein Shake-Song',
    emoji: '🎵',
    description: 'Der Song der dich immer ans Shake erinnert',
    slots: [],
    layout: 'text-only',
    prompts: ['Welcher Song?', 'Warum genau dieser Song?', 'Was passiert wenn du ihn heute hörst?'],
  },
]

export function SpecialTemplates({ onComplete }: SpecialTemplatesProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [images, setImages] = useState<(string | null)[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([])

  const template = TEMPLATES.find((t) => t.id === selected)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setImages((prev) => {
        const next = [...prev]
        next[index] = reader.result as string
        return next
      })
      setFiles((prev) => {
        const next = [...prev]
        next[index] = file
        return next
      })
    }
    reader.readAsDataURL(file)
  }

  const handleComplete = () => {
    if (!template) return
    onComplete({
      type: template.name,
      images: images.filter(Boolean) as string[],
      files: files.filter(Boolean),
    })
  }

  const hasContent = images.some(Boolean) || Object.values(answers).some((v) => v.trim())

  // Template chooser
  if (!selected) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-shake-text-muted">Wähle ein Template</h3>
        <div className="grid grid-cols-2 gap-2">
          {TEMPLATES.map((tmpl) => (
            <motion.button
              key={tmpl.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelected(tmpl.id)
                setImages(new Array(tmpl.slots.length).fill(null))
                setFiles(new Array(tmpl.slots.length).fill(null))
              }}
              className="flex flex-col items-start gap-1.5 rounded-2xl border border-shake-light/20 bg-shake-dark/80 p-3 text-left transition-all hover:border-shake-neon-pink/30"
            >
              <span className="text-2xl">{tmpl.emoji}</span>
              <span className="text-sm font-medium">{tmpl.name}</span>
              <span className="text-xs text-shake-text-muted">{tmpl.description}</span>
            </motion.button>
          ))}
        </div>
      </div>
    )
  }

  // Selected template
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => { setSelected(null); setImages([]); setFiles([]); setAnswers({}) }}
          className="text-shake-text-muted"
        >
          <X className="h-5 w-5" />
        </button>
        <span className="text-2xl">{template?.emoji}</span>
        <div>
          <h3 className="font-medium">{template?.name}</h3>
          <p className="text-xs text-shake-text-muted">{template?.description}</p>
        </div>
      </div>

      {/* Split layout (Damals vs. Heute etc.) */}
      {template?.layout === 'split' && (
        <div className="flex gap-2">
          {template.slots.map((slot, i) => (
            <div key={i} className="flex-1">
              <label className="block">
                <div className="mb-1 text-center text-xs font-medium text-shake-neon-pink">{slot.label}</div>
                {images[i] ? (
                  <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-shake-light/30">
                    <img src={images[i]!} alt="" className="h-full w-full object-cover" />
                    <button
                      onClick={() => {
                        setImages((prev) => { const next = [...prev]; next[i] = null; return next })
                        setFiles((prev) => { const next = [...prev]; next[i] = null as unknown as File; return next })
                      }}
                      className="absolute right-1 top-1 rounded-full bg-black/60 p-1"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="flex aspect-[3/4] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-shake-light/40 bg-shake-dark transition-all hover:border-shake-neon-pink/50">
                    <input
                      ref={(el) => { fileInputRefs.current[i] = el }}
                      type="file"
                      accept="image/*"
                      capture={i === 1 ? 'user' : undefined}
                      onChange={(e) => handleImageUpload(e, i)}
                      className="hidden"
                    />
                    <Camera className="mb-2 h-8 w-8 text-shake-text-muted/50" />
                    <span className="text-xs text-shake-text-muted">{slot.hint}</span>
                    <button
                      onClick={() => fileInputRefs.current[i]?.click()}
                      className="mt-2 rounded-full bg-shake-neon-pink/20 px-3 py-1 text-xs text-shake-neon-pink"
                    >
                      Foto wählen
                    </button>
                  </div>
                )}
              </label>
            </div>
          ))}

          {/* Arrow between images */}
          {template.slots.length === 2 && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              {/* This is decorative, handled by CSS positioning */}
            </div>
          )}
        </div>
      )}

      {/* Single image layout */}
      {template?.layout === 'single' && template.slots.length > 0 && (
        <div>
          {images[0] ? (
            <div className="relative mx-auto aspect-square max-w-xs overflow-hidden rounded-2xl border border-shake-light/30">
              <img src={images[0]} alt="" className="h-full w-full object-cover" />
              <button
                onClick={() => { setImages([null]); setFiles([null as unknown as File]) }}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          ) : (
            <label className="flex aspect-square mx-auto max-w-xs cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-shake-light/40 bg-shake-dark transition-all hover:border-shake-neon-pink/50">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 0)}
                className="hidden"
              />
              <ImagePlus className="mb-2 h-10 w-10 text-shake-text-muted/50" />
              <span className="text-sm text-shake-text-muted">{template.slots[0].hint}</span>
            </label>
          )}
        </div>
      )}

      {/* Prompts */}
      {template?.prompts && (
        <div className="space-y-3">
          {template.prompts.map((prompt) => (
            <div key={prompt}>
              <label className="mb-1 block text-sm text-shake-neon-blue">{prompt}</label>
              <input
                value={answers[prompt] || ''}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [prompt]: e.target.value }))}
                placeholder="..."
                className="w-full rounded-xl border border-shake-light/30 bg-shake-dark px-4 py-2.5 text-sm text-shake-text placeholder:text-shake-text-muted/30 focus:border-shake-neon-pink/50 focus:outline-none"
              />
            </div>
          ))}
        </div>
      )}

      {/* Complete button */}
      {hasContent && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleComplete}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-shake-neon-green/20 px-4 py-2.5 text-sm font-medium text-shake-neon-green transition-all hover:bg-shake-neon-green/30"
        >
          ✓ Template fertig
        </motion.button>
      )}
    </div>
  )
}
