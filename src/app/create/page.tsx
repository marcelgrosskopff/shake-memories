'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  X,
  AtSign,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Mic,
  Video,
  Camera,
  Type,
  Brush,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCreateStory } from '@/hooks/use-stories'
import Link from 'next/link'
import { CreativeEditor, type EditorState } from '@/components/create/creative-editor'
import { MediaRecorder as MediaRecorderComponent } from '@/components/create/media-recorder'
import { SpecialTemplates } from '@/components/create/special-templates'

const MAX_CHARS = 2000

type CreationMode = 'choose' | 'visual' | 'text' | 'voice' | 'video' | 'template'
type Step = 'create' | 'details' | 'submitting' | 'done'

const MOODS = [
  { emoji: '\u{1F973}', label: 'Party', color: 'shake-neon-pink' },
  { emoji: '\u{1F972}', label: 'Emotional', color: 'shake-neon-blue' },
  { emoji: '\u{1F602}', label: 'Lustig', color: 'shake-neon-green' },
  { emoji: '\u{2764}\u{FE0F}', label: 'Liebe', color: 'shake-neon-purple' },
  { emoji: '\u{1F92B}', label: 'Geheim', color: 'shake-warm' },
]

const AVATARS = ['\u{1F57A}', '\u{1F483}', '\u{1F3B8}', '\u{1F3A4}', '\u{1F37A}', '\u{1F942}', '\u{1FA69}', '\u{1F60E}']

export default function CreatePage() {
  const [mode, setMode] = useState<CreationMode>('choose')
  const [step, setStep] = useState<Step>('create')
  const [text, setText] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [instagramHandle, setInstagramHandle] = useState('')
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [editorState, setEditorState] = useState<EditorState | null>(null)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordedType, setRecordedType] = useState<'audio' | 'video' | null>(null)
  const [templateData, setTemplateData] = useState<{ type: string; images: string[]; files: File[] } | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [selectedAvatar, setSelectedAvatar] = useState<number>(0)
  const createStory = useCreateStory()

  const handleEditorStateChange = useCallback((state: EditorState) => {
    setEditorState(state)
  }, [])

  const handleRecordingComplete = useCallback((blob: Blob, type: 'audio' | 'video') => {
    setRecordedBlob(blob)
    setRecordedType(type)
    const file = new File([blob], `recording.${type === 'audio' ? 'webm' : 'mp4'}`, {
      type: blob.type,
    })
    setMediaFiles((prev) => [...prev, file])
  }, [])

  const handleTemplateComplete = useCallback((data: { type: string; images: string[]; files: File[] }) => {
    setTemplateData(data)
    setMediaFiles(data.files)
  }, [])

  const handleSubmit = async () => {
    if (!text.trim() && !recordedBlob && !templateData && (!editorState || editorState.textOverlays.length === 0)) return
    setStep('submitting')
    setSubmitError(null)

    try {
      await createStory.mutateAsync({
        content_text: text.trim() || (templateData ? `[${templateData.type}]` : '[Visual Story]'),
        author_name: authorName.trim() || undefined,
        instagram_handle: instagramHandle.trim() || undefined,
        media_files: mediaFiles.length > 0 ? mediaFiles : undefined,
      })
      setStep('done')
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Etwas ist schiefgelaufen'
      setSubmitError(message)
      setStep('details')
    }
  }

  const canProceed =
    text.trim().length > 0 ||
    (editorState && (editorState.textOverlays.length > 0 || editorState.stickerOverlays.length > 0 || editorState.backgroundImage)) ||
    recordedBlob ||
    templateData

  const moodColor = selectedMood !== null ? MOODS[selectedMood].color : 'shake-neon-pink'
  const charProgress = text.length / MAX_CHARS
  const circumference = 2 * Math.PI * 18

  // --- Mode chooser (graphic design system) ---
  if (mode === 'choose' && step === 'create') {
    return (
      <div className="min-h-dvh bg-shake-black pb-24">
        {/* Full-bleed scrollable mode cards */}
        <div className="space-y-3 px-4 pt-4">
          {/* Header */}
          <div className="mb-2 flex items-center justify-between">
            <h1 className="text-xl font-bold">Erzähla</h1>
            <span className="text-xs text-shake-text-muted">Wähle din Stil</span>
          </div>

          {/* === SPEZIAL-TEMPLATES — full visual card === */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setMode('template')}
            className="relative w-full overflow-hidden rounded-3xl"
            style={{ height: '180px' }}
          >
            {/* Atmospheric background */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-900/80 via-orange-900/60 to-pink-900/80" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,215,0,0.3),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,45,120,0.2),transparent_60%)]" />
            {/* Content */}
            <div className="relative flex h-full flex-col justify-between p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-amber-300/70 mb-1">Spezial</div>
                  <div className="text-2xl font-bold text-white leading-tight">Story<br/>Templates</div>
                </div>
                <div className="flex -space-x-1 text-2xl">
                  <span className="drop-shadow-lg">📸</span>
                  <span className="drop-shadow-lg">❤️</span>
                  <span className="drop-shadow-lg">🤫</span>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div className="flex gap-2">
                  {['Damals vs Hüt', 'Love Story', 'Beichte', '+5'].map((tag) => (
                    <span key={tag} className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] text-white/70 backdrop-blur-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.button>

          {/* === VISUAL STORY — atmospheric card === */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setMode('visual')}
            className="relative w-full overflow-hidden rounded-3xl"
            style={{ height: '140px' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-900/90 via-purple-900/80 to-indigo-900/90" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,45,120,0.4),transparent_50%)]" />
            <div className="relative flex h-full items-center justify-between p-5">
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-pink-300/60 mb-1">Gestalten</div>
                <div className="text-2xl font-bold text-white">Visual Story</div>
                <div className="mt-1 text-xs text-white/50">Filter, Sticker, Text, Hintergrund</div>
              </div>
              <div className="flex flex-col items-center gap-1 opacity-30">
                <div className="h-16 w-12 rounded-lg border-2 border-white/40 bg-gradient-to-b from-pink-500/20 to-purple-500/20" />
                <div className="h-1 w-6 rounded-full bg-white/30" />
              </div>
            </div>
          </motion.button>

          {/* === TEXT + AUDIO row === */}
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setMode('text')}
              className="relative overflow-hidden rounded-3xl"
              style={{ height: '130px' }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-blue-900/80 to-indigo-950/90" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_80%,rgba(0,212,255,0.15),transparent_60%)]" />
              <div className="relative flex h-full flex-col justify-between p-4">
                <div className="text-[10px] uppercase tracking-[0.2em] text-blue-300/50">Schreiben</div>
                <div>
                  <div className="text-lg font-bold text-white">Text</div>
                  <div className="mt-0.5 text-[11px] text-white/40">Dini Gschicht</div>
                </div>
                {/* Decorative lines like a notebook */}
                <div className="absolute right-3 top-3 flex flex-col gap-1.5 opacity-15">
                  <div className="h-px w-10 bg-white" />
                  <div className="h-px w-8 bg-white" />
                  <div className="h-px w-12 bg-white" />
                  <div className="h-px w-6 bg-white" />
                </div>
              </div>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setMode('voice')}
              className="relative overflow-hidden rounded-3xl"
              style={{ height: '130px' }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/80 to-teal-950/90" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_80%,rgba(57,255,20,0.1),transparent_60%)]" />
              <div className="relative flex h-full flex-col justify-between p-4">
                <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-300/50">Aufnehmen</div>
                <div>
                  <div className="text-lg font-bold text-white">Audio</div>
                  <div className="mt-0.5 text-[11px] text-white/40">Sprach&shy;nachricht</div>
                </div>
                {/* Decorative waveform */}
                <div className="absolute right-3 top-3 flex items-end gap-[2px] opacity-20">
                  {[3, 8, 5, 12, 7, 14, 4, 10, 6, 11, 3, 8].map((h, i) => (
                    <div key={i} className="w-[3px] rounded-full bg-white" style={{ height: `${h}px` }} />
                  ))}
                </div>
              </div>
            </motion.button>
          </div>

          {/* === VIDEO — wide card === */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setMode('video')}
            className="relative w-full overflow-hidden rounded-3xl"
            style={{ height: '110px' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-900/80 via-red-900/70 to-pink-900/80" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(255,140,66,0.25),transparent_50%)]" />
            <div className="relative flex h-full items-center justify-between p-5">
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-orange-300/60 mb-1">Aufnehmen</div>
                <div className="text-xl font-bold text-white">Video</div>
                <div className="mt-0.5 text-xs text-white/40">Kamera oder Upload</div>
              </div>
              {/* Decorative play button */}
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/20 bg-white/5">
                <div className="ml-1 h-0 w-0 border-l-[14px] border-t-[9px] border-b-[9px] border-l-white/40 border-t-transparent border-b-transparent" />
              </div>
            </div>
          </motion.button>
        </div>
      </div>
    )
  }

  // Mode-specific theme config
  const modeTheme = {
    visual: {
      bg: 'linear-gradient(180deg, #1a0020 0%, #0d0015 40%, #0a0a0a 100%)',
      accent: '#ff2d78',
      accentGlow: 'radial-gradient(circle at 50% 0%, rgba(255,45,120,0.15), transparent 60%)',
      label: 'Visual',
      icon: <Brush className="h-4 w-4" />,
    },
    text: {
      bg: 'linear-gradient(180deg, #0a1a3a 0%, #0a1028 40%, #0a0a0a 100%)',
      accent: '#00d4ff',
      accentGlow: 'radial-gradient(circle at 50% 0%, rgba(0,212,255,0.12), transparent 60%)',
      label: 'Text',
      icon: <Type className="h-4 w-4" />,
    },
    voice: {
      bg: 'linear-gradient(180deg, #0a2a1a 0%, #061a12 40%, #0a0a0a 100%)',
      accent: '#39ff14',
      accentGlow: 'radial-gradient(circle at 50% 0%, rgba(57,255,20,0.1), transparent 60%)',
      label: 'Audio',
      icon: <Mic className="h-4 w-4" />,
    },
    video: {
      bg: 'linear-gradient(180deg, #2a1000 0%, #1a0800 40%, #0a0a0a 100%)',
      accent: '#ff8c42',
      accentGlow: 'radial-gradient(circle at 50% 0%, rgba(255,140,66,0.15), transparent 60%)',
      label: 'Video',
      icon: <Video className="h-4 w-4" />,
    },
    template: {
      bg: 'linear-gradient(180deg, #1a1000 0%, #120a00 40%, #0a0a0a 100%)',
      accent: '#ffd700',
      accentGlow: 'radial-gradient(circle at 50% 0%, rgba(255,215,0,0.1), transparent 60%)',
      label: 'Spezial',
      icon: <Camera className="h-4 w-4" />,
    },
  }

  const theme = modeTheme[mode as keyof typeof modeTheme] || modeTheme.text

  // Details step gets a warm atmospheric background
  const detailsBg = step === 'details'
    ? 'linear-gradient(180deg, #1a0a10 0%, #120810 40%, #0a0a0a 100%)'
    : theme.bg
  const detailsGlow = step === 'details'
    ? 'radial-gradient(circle at 50% 0%, rgba(255,45,120,0.1), transparent 60%)'
    : theme.accentGlow

  return (
    <div
      className="min-h-dvh pb-24"
      style={{ background: detailsBg }}
    >
      {/* Atmospheric glow overlay */}
      <div className="pointer-events-none fixed inset-0 z-0" style={{ background: detailsGlow }} />

      <div className="relative z-10 px-4 pt-6">
      {/* Header with mode identity */}
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => {
            if (step === 'details') setStep('create')
            else if (step === 'create') setMode('choose')
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full transition-colors"
          style={{
            backgroundColor: `${theme.accent}15`,
            border: `1px solid ${theme.accent}30`,
          }}
        >
          <ArrowLeft className="h-5 w-5 text-shake-text" />
        </button>
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}
          >
            {theme.icon}
          </div>
          <h1 className="text-lg font-semibold" style={{ color: theme.accent }}>
            {theme.label}
          </h1>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Create step */}
        {step === 'create' && (
          <motion.div
            key="create"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="mx-auto max-w-lg"
          >
            {/* Visual mode */}
            {mode === 'visual' && (
              <div className="space-y-4">
                <CreativeEditor
                  onExport={() => {}}
                  onStateChange={handleEditorStateChange}
                />
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
                  placeholder="Erz&auml;hl die Geschichte hinter deinem Bild... (optional)"
                  className="h-24 w-full resize-none rounded-xl border border-shake-light/30 bg-shake-dark p-3 text-sm text-shake-text placeholder:text-shake-text-muted/50 focus:border-shake-neon-pink/50 focus:outline-none"
                />
              </div>
            )}

            {/* Text mode - Atmospheric blue/indigo journal */}
            {mode === 'text' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative space-y-5"
              >
                {/* Decorative background quote mark */}
                <div
                  className="pointer-events-none absolute -right-4 -top-8 select-none text-[180px] font-serif leading-none"
                  style={{ color: 'rgba(0,212,255,0.04)' }}
                >
                  &ldquo;
                </div>

                {/* Mood selector - larger visual cards with gradient backgrounds */}
                <div>
                  <p className="mb-2.5 text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(0,212,255,0.5)' }}>Stimmung</p>
                  <div className="flex gap-2">
                    {MOODS.map((mood, i) => {
                      const moodGradients = [
                        'linear-gradient(135deg, rgba(255,45,120,0.25), rgba(255,45,120,0.05))',
                        'linear-gradient(135deg, rgba(0,150,255,0.25), rgba(0,100,200,0.05))',
                        'linear-gradient(135deg, rgba(57,255,20,0.2), rgba(57,200,20,0.05))',
                        'linear-gradient(135deg, rgba(180,77,255,0.25), rgba(140,50,200,0.05))',
                        'linear-gradient(135deg, rgba(255,140,66,0.25), rgba(200,100,40,0.05))',
                      ]
                      return (
                        <motion.button
                          key={mood.label}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setSelectedMood(selectedMood === i ? null : i)}
                          className={cn(
                            'flex flex-1 flex-col items-center gap-1.5 rounded-2xl py-3 transition-all',
                            selectedMood === i
                              ? 'ring-1 scale-105'
                              : 'border border-white/5'
                          )}
                          style={{
                            background: selectedMood === i ? moodGradients[i] : 'rgba(255,255,255,0.03)',
                            ...(selectedMood === i ? {
                              borderColor: `var(--color-${mood.color})`,
                              ringColor: `var(--color-${mood.color})`,
                              boxShadow: `0 0 20px ${moodGradients[i]}`,
                            } : {}),
                          }}
                        >
                          <span className="text-2xl">{mood.emoji}</span>
                          <span className={cn(
                            'text-[9px] font-medium',
                            selectedMood === i ? 'text-shake-text' : 'text-shake-text-muted/60'
                          )}>
                            {mood.label}
                          </span>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>

                {/* Journal textarea area - dark surface with depth */}
                <div className="relative">
                  {/* Subtle inner glow */}
                  <div
                    className="absolute -inset-1 rounded-3xl opacity-40 blur-xl"
                    style={{ background: 'radial-gradient(ellipse at center, rgba(0,100,200,0.15), transparent 70%)' }}
                  />
                  {/* Paper texture background */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-[0.03]"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(255,255,255,0.1) 31px, rgba(255,255,255,0.1) 32px)',
                    }}
                  />
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
                    placeholder="Es war diese eine Nacht im Shake..."
                    className={cn(
                      'relative h-80 w-full resize-none rounded-2xl border-2 p-5 pt-6 text-lg leading-8 text-shake-text placeholder:text-shake-text-muted/30 focus:outline-none transition-colors',
                      selectedMood !== null
                        ? 'focus:ring-1'
                        : 'border-blue-900/30 focus:border-blue-400/30'
                    )}
                    style={{
                      backgroundColor: 'rgba(5,10,25,0.8)',
                      boxShadow: 'inset 0 2px 20px rgba(0,0,0,0.3), 0 0 40px rgba(0,50,100,0.05)',
                      ...(selectedMood !== null ? {
                        borderColor: `color-mix(in srgb, var(--color-${moodColor}) 30%, transparent)`,
                      } : {}),
                    }}
                    autoFocus
                  />

                  {/* Circular progress indicator */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <svg className="circular-progress h-10 w-10" viewBox="0 0 40 40">
                      <circle
                        cx="20" cy="20" r="18"
                        fill="none"
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth="2.5"
                      />
                      <circle
                        cx="20" cy="20" r="18"
                        fill="none"
                        stroke={charProgress > 0.9 ? '#ff8c42' : charProgress > 0 ? '#00d4ff' : 'transparent'}
                        strokeWidth="2.5"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference * (1 - charProgress)}
                        strokeLinecap="round"
                        className="transition-all duration-300"
                      />
                    </svg>
                    {text.length > MAX_CHARS * 0.8 && (
                      <span className={cn(
                        'text-[10px] font-mono',
                        text.length > MAX_CHARS * 0.9 ? 'text-shake-warm' : 'text-shake-text-muted/50'
                      )}>
                        {MAX_CHARS - text.length}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-center text-[11px] italic" style={{ color: 'rgba(0,212,255,0.3)' }}>
                  Was macht d&auml;s Shake f&uuml;r dich besonders?
                </p>
              </motion.div>
            )}

            {/* Voice mode */}
            {mode === 'voice' && (
              <MediaRecorderComponent
                type="audio"
                onRecordingComplete={handleRecordingComplete}
              />
            )}

            {/* Video mode */}
            {mode === 'video' && (
              <MediaRecorderComponent
                type="video"
                onRecordingComplete={handleRecordingComplete}
              />
            )}

            {/* Template mode */}
            {mode === 'template' && (
              <div className="space-y-4">
                <SpecialTemplates onComplete={handleTemplateComplete} />
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
                  placeholder="Erz&auml;hl die Geschichte dazu... (optional)"
                  className="h-24 w-full resize-none rounded-xl border border-shake-light/30 bg-shake-dark p-3 text-sm text-shake-text placeholder:text-shake-text-muted/50 focus:border-shake-neon-pink/50 focus:outline-none"
                />
              </div>
            )}

            {/* Continue button */}
            <button
              onClick={() => setStep('details')}
              disabled={!canProceed}
              className="mt-4 w-full rounded-full bg-shake-neon-pink px-6 py-3 font-medium text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-shake-neon-pink/90"
            >
              Weiter
            </button>
          </motion.div>
        )}

        {/* Details step - Warm atmospheric design */}
        {step === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="mx-auto max-w-lg space-y-5"
          >
            {/* Avatar picker - more visual with gradient hover */}
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,45,120,0.5)' }}>Dein Avatar</p>
              <div className="flex gap-2.5 justify-center">
                {AVATARS.map((av, i) => (
                  <motion.button
                    key={av}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => setSelectedAvatar(i)}
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-full text-xl transition-all',
                      selectedAvatar === i
                        ? 'scale-110'
                        : 'hover:bg-white/10'
                    )}
                    style={selectedAvatar === i ? {
                      background: 'linear-gradient(135deg, rgba(255,45,120,0.25), rgba(180,77,255,0.2))',
                      boxShadow: '0 0 20px rgba(255,45,120,0.2), inset 0 0 15px rgba(255,45,120,0.1)',
                      border: '2px solid rgba(255,45,120,0.5)',
                    } : {
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    {av}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Name + Instagram - styled inputs */}
            <div>
              <label className="mb-1 block text-sm text-shake-text-muted">
                Dein Name (optional &ndash; bleib gern anonym)
              </label>
              <input
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Anonym"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-shake-text placeholder:text-shake-text-muted/50 focus:border-shake-neon-pink/40 focus:outline-none"
                style={{ boxShadow: 'inset 0 1px 10px rgba(0,0,0,0.2)' }}
              />
            </div>

            <div>
              <label className="mb-1 flex items-center gap-1 text-sm text-shake-text-muted">
                <AtSign className="h-4 w-4" />
                Instagram Handle (optional)
              </label>
              <div className="flex items-center rounded-xl border border-white/10 bg-white/5" style={{ boxShadow: 'inset 0 1px 10px rgba(0,0,0,0.2)' }}>
                <span className="pl-4 text-shake-text-muted">@</span>
                <input
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value.replace(/^@/, ''))}
                  placeholder="dein_handle"
                  className="w-full bg-transparent px-2 py-3 text-shake-text placeholder:text-shake-text-muted/50 focus:outline-none"
                />
              </div>
            </div>

            {/* Preview card with depth */}
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,45,120,0.5)' }}>Vorschau</p>
              <div className="relative">
                {/* Glow behind card */}
                <div
                  className="absolute -inset-2 rounded-3xl opacity-30 blur-xl"
                  style={{ background: 'radial-gradient(ellipse at center, rgba(255,45,120,0.15), rgba(180,77,255,0.1), transparent 70%)' }}
                />
                <div
                  className="relative rounded-2xl p-4"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
                    border: '1px solid rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-shake-neon-pink to-shake-neon-purple text-lg">
                      {AVATARS[selectedAvatar]}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-shake-text">
                        {authorName.trim() || 'Anonym'}
                      </div>
                      {instagramHandle.trim() && (
                        <div className="text-xs text-shake-text-muted">@{instagramHandle}</div>
                      )}
                    </div>
                    <div className="ml-auto text-[10px] text-shake-text-muted/50">gerade eben</div>
                  </div>
                  <p className="text-sm text-shake-text/80 line-clamp-3">
                    {text.trim() || (templateData ? `[${templateData.type}]` : mode === 'visual' ? '[Visual Story]' : recordedBlob ? (recordedType === 'audio' ? '[Sprachnachricht]' : '[Video]') : '...')}
                  </p>
                </div>
              </div>
            </div>

            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
              >
                <p className="font-medium">Fehler beim Einreichen</p>
                <p className="mt-0.5 text-xs text-red-400">{submitError}</p>
              </motion.div>
            )}

            <button
              onClick={handleSubmit}
              disabled={createStory.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-shake-neon-pink to-shake-neon-purple px-6 py-3.5 text-lg font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
            >
              {createStory.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
              Absenden
            </button>
            <p className="text-center text-xs text-shake-text-muted">
              Deine Story wird vor der Ver&ouml;ffentlichung gepr&uuml;ft. Good vibes only!
            </p>
          </motion.div>
        )}

        {/* Submitting */}
        {step === 'submitting' && (
          <motion.div key="submitting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-[50dvh] flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-shake-neon-pink" />
            <p className="mt-4 text-shake-text-muted">Wird eingereicht...</p>
          </motion.div>
        )}

        {/* Done */}
        {step === 'done' && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex min-h-[60dvh] flex-col items-center justify-center text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
              <CheckCircle className="h-20 w-20 text-shake-neon-green" />
            </motion.div>
            <h2 className="mt-6 text-2xl font-bold">Danke!</h2>
            <p className="mt-2 max-w-xs text-shake-text-muted">
              Deine Erinnerung wird gepr&uuml;ft und erscheint bald. Good vibes only!
            </p>
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => {
                  setText('')
                  setMediaFiles([])
                  setRecordedBlob(null)
                  setTemplateData(null)
                  setMode('choose')
                  setStep('create')
                }}
                className="rounded-full border border-shake-light px-6 py-2.5 text-shake-text"
              >
                Noch eine Story
              </button>
              <Link href="/feed" className="rounded-full bg-shake-neon-pink px-6 py-2.5 font-medium text-white">
                Stories ansehen
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  )
}
