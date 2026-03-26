'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  ArrowLeft,
  Loader2,
  CheckCircle,
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
  { emoji: '\u{1F973}', label: 'Party' },
  { emoji: '\u{1F972}', label: 'Emotional' },
  { emoji: '\u{1F602}', label: 'Lustig' },
  { emoji: '\u{2764}\u{FE0F}', label: 'Liebe' },
  { emoji: '\u{1F92B}', label: 'Geheim' },
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
  const [templateSelected, setTemplateSelected] = useState(false)
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

  const charProgress = text.length / MAX_CHARS
  const circumference = 2 * Math.PI * 18

  // --- Mode chooser (unified dark surface, pink accent only) ---
  if (mode === 'choose' && step === 'create') {
    return (
      <div className="min-h-dvh bg-shake-black pb-24">
        <div className="space-y-3 px-5 pt-6">
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-shake-text">Erzähla</h1>
            <p className="mt-1 text-sm text-shake-text-muted">Wähle din Stil</p>
          </div>

          {/* === SPEZIAL-TEMPLATES === */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setMode('template')}
            className="relative w-full overflow-hidden rounded-2xl"
            style={{ height: '160px' }}
          >
            <div className="absolute inset-0 bg-shake-surface" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,45,120,0.12),transparent_60%)]" />
            <div className="relative flex h-full flex-col justify-between p-5">
              <div>
                <div className="text-2xl font-bold text-shake-text">Story Templates</div>
                <div className="mt-1 text-sm text-shake-text-muted">Damals vs. Hüt, Love Story, Beichte &amp; mehr</div>
              </div>
              <div className="flex gap-2">
                {['Damals vs Hüt', 'Love Story', 'Beichte', '+5'].map((tag) => (
                  <span key={tag} className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-shake-text-muted">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.button>

          {/* === VISUAL STORY === */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setMode('visual')}
            className="relative w-full overflow-hidden rounded-2xl"
            style={{ height: '120px' }}
          >
            <div className="absolute inset-0 bg-shake-surface" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,45,120,0.1),transparent_50%)]" />
            <div className="relative flex h-full items-center p-5">
              <div>
                <div className="text-xl font-bold text-shake-text">Visual Story</div>
                <div className="mt-1 text-sm text-shake-text-muted">Filter, Sticker, Text, Hintergrund</div>
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
              className="relative overflow-hidden rounded-2xl"
              style={{ height: '120px' }}
            >
              <div className="absolute inset-0 bg-shake-surface" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_80%,rgba(255,45,120,0.06),transparent_60%)]" />
              <div className="relative flex h-full flex-col justify-end p-4">
                <div className="text-lg font-bold text-shake-text">Text</div>
                <div className="mt-0.5 text-xs text-shake-text-muted">Dini Gschicht</div>
              </div>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setMode('voice')}
              className="relative overflow-hidden rounded-2xl"
              style={{ height: '120px' }}
            >
              <div className="absolute inset-0 bg-shake-surface" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_80%,rgba(255,45,120,0.06),transparent_60%)]" />
              <div className="relative flex h-full flex-col justify-end p-4">
                <div className="text-lg font-bold text-shake-text">Audio</div>
                <div className="mt-0.5 text-xs text-shake-text-muted">Sprachnachricht</div>
              </div>
            </motion.button>
          </div>

          {/* === VIDEO === */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setMode('video')}
            className="relative w-full overflow-hidden rounded-2xl"
            style={{ height: '100px' }}
          >
            <div className="absolute inset-0 bg-shake-surface" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(255,45,120,0.08),transparent_50%)]" />
            <div className="relative flex h-full items-center p-5">
              <div>
                <div className="text-xl font-bold text-shake-text">Video</div>
                <div className="mt-0.5 text-sm text-shake-text-muted">Kamera oder Upload</div>
              </div>
            </div>
          </motion.button>
        </div>
      </div>
    )
  }

  // Unified theme — always pink accent, dark base
  const pageBg = 'linear-gradient(180deg, #12081a 0%, #0d0a10 40%, #0a0a0f 100%)'
  const pageGlow = 'radial-gradient(circle at 50% 0%, rgba(255,45,120,0.08), transparent 60%)'

  const modeLabels: Record<string, string> = {
    visual: 'Visual',
    text: 'Text',
    voice: 'Audio',
    video: 'Video',
    template: 'Spezial',
  }

  return (
    <div
      className="min-h-dvh pb-24"
      style={{ background: pageBg }}
    >
      {/* Atmospheric glow */}
      <div className="pointer-events-none fixed inset-0 z-0" style={{ background: pageGlow }} />

      <div className="relative z-10 px-5 pt-6">
      {/* Header — hidden when inside a specific template */}
      {!(mode === 'template' && templateSelected) && (
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => {
              if (step === 'details') setStep('create')
              else if (step === 'create') setMode('choose')
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 active:scale-95 transition-transform"
          >
            <ArrowLeft className="h-5 w-5 text-shake-text" />
          </button>
          <h1 className="text-lg font-semibold text-shake-text">
            {modeLabels[mode] || 'Erzähla'}
          </h1>
        </div>
      )}

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
                  placeholder="Erzähl die Geschichte hinter deinem Bild... (optional)"
                  className="h-24 w-full resize-none rounded-xl border border-white/10 bg-white/5 p-4 text-base text-shake-text placeholder:text-shake-text-muted/50 focus:border-shake-neon-pink/40 focus:outline-none"
                />
              </div>
            )}

            {/* Text mode */}
            {mode === 'text' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-5"
              >
                {/* Mood selector — neutral surface, emoji only */}
                <div>
                  <p className="mb-3 text-xs font-medium uppercase tracking-widest text-shake-text-muted">Stimmung</p>
                  <div className="flex gap-2">
                    {MOODS.map((mood, i) => (
                      <motion.button
                        key={mood.label}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedMood(selectedMood === i ? null : i)}
                        className={cn(
                          'flex flex-1 flex-col items-center gap-1.5 rounded-2xl py-3 transition-all border',
                          selectedMood === i
                            ? 'border-shake-neon-pink/40 bg-shake-neon-pink/10 scale-105'
                            : 'border-white/5 bg-white/[0.03]'
                        )}
                      >
                        <span className="text-2xl">{mood.emoji}</span>
                        <span className={cn(
                          'text-xs',
                          selectedMood === i ? 'text-shake-text' : 'text-shake-text-muted/60'
                        )}>
                          {mood.label}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Journal textarea */}
                <div className="relative">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
                    placeholder="Es war diese eine Nacht im Shake..."
                    className="h-80 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] p-5 pt-6 text-lg leading-8 text-shake-text placeholder:text-shake-text-muted/30 focus:border-shake-neon-pink/30 focus:outline-none transition-colors"
                    autoFocus
                  />

                  {/* Circular progress */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <svg className="circular-progress h-10 w-10" viewBox="0 0 40 40">
                      <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2.5" />
                      <circle
                        cx="20" cy="20" r="18" fill="none"
                        stroke={charProgress > 0.9 ? '#ff2d78' : charProgress > 0 ? 'rgba(255,255,255,0.2)' : 'transparent'}
                        strokeWidth="2.5"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference * (1 - charProgress)}
                        strokeLinecap="round"
                        className="transition-all duration-300"
                      />
                    </svg>
                    {text.length > MAX_CHARS * 0.8 && (
                      <span className={cn(
                        'text-xs font-mono',
                        text.length > MAX_CHARS * 0.9 ? 'text-shake-neon-pink' : 'text-shake-text-muted/50'
                      )}>
                        {MAX_CHARS - text.length}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-center text-xs italic text-shake-text-muted/40">
                  Was macht däs Shake für dich besonders?
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
                <SpecialTemplates
                  onComplete={handleTemplateComplete}
                  onSelectionChange={setTemplateSelected}
                  onBack={() => setMode('choose')}
                />
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
                  placeholder="Erzähl die Geschichte dazu... (optional)"
                  className="h-24 w-full resize-none rounded-xl border border-white/10 bg-white/5 p-4 text-base text-shake-text placeholder:text-shake-text-muted/50 focus:border-shake-neon-pink/40 focus:outline-none"
                />
              </div>
            )}

            {/* Continue button — always pink */}
            <div className="sticky bottom-20 pt-4 pb-2">
              <button
                onClick={() => setStep('details')}
                disabled={!canProceed}
                className="w-full rounded-full bg-shake-neon-pink px-6 py-3.5 font-semibold text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                Weiter
              </button>
            </div>
          </motion.div>
        )}

        {/* Details step */}
        {step === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="mx-auto max-w-lg space-y-6"
          >
            {/* Avatar picker */}
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-widest text-shake-text-muted">Dein Avatar</p>
              <div className="flex gap-2.5 justify-center">
                {AVATARS.map((av, i) => (
                  <motion.button
                    key={av}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => setSelectedAvatar(i)}
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-full text-xl transition-all border',
                      selectedAvatar === i
                        ? 'scale-110 border-shake-neon-pink/50 bg-shake-neon-pink/15'
                        : 'border-white/6 bg-white/[0.03] active:bg-white/10'
                    )}
                  >
                    {av}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Name input */}
            <div>
              <label className="mb-2 block text-sm text-shake-text-muted">
                Dein Name (optional &ndash; bleib gern anonym)
              </label>
              <input
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Anonym"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-shake-text placeholder:text-shake-text-muted/50 focus:border-shake-neon-pink/40 focus:outline-none"
              />
            </div>

            {/* Instagram */}
            <div>
              <label className="mb-2 block text-sm text-shake-text-muted">
                Instagram Handle (optional)
              </label>
              <div className="flex items-center rounded-xl border border-white/10 bg-white/5">
                <span className="pl-4 text-shake-text-muted">@</span>
                <input
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value.replace(/^@/, ''))}
                  placeholder="dein_handle"
                  className="w-full bg-transparent px-2 py-3 text-base text-shake-text placeholder:text-shake-text-muted/50 focus:outline-none"
                />
              </div>
            </div>

            {/* Preview card */}
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-widest text-shake-text-muted">Vorschau</p>
              <div
                className="rounded-2xl p-4"
                style={{
                  background: 'rgba(20, 20, 24, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-shake-neon-pink/20 text-lg">
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
                  <div className="ml-auto text-xs text-shake-text-muted/50">gerade eben</div>
                </div>
                <p className="text-sm text-shake-text/80 line-clamp-3">
                  {text.trim() || (templateData ? `[${templateData.type}]` : mode === 'visual' ? '[Visual Story]' : recordedBlob ? (recordedType === 'audio' ? '[Sprachnachricht]' : '[Video]') : '...')}
                </p>
              </div>
            </div>

            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
              >
                <p className="font-medium">Fehler beim Einreichen</p>
                <p className="mt-1 text-xs text-red-400">{submitError}</p>
              </motion.div>
            )}

            {/* Submit — always pink, no icon */}
            <button
              onClick={handleSubmit}
              disabled={createStory.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-shake-neon-pink px-6 py-3.5 text-lg font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {createStory.isPending && <Loader2 className="h-5 w-5 animate-spin" />}
              Absenden
            </button>
            <p className="text-center text-xs text-shake-text-muted">
              Deine Story wird vor der Veröffentlichung geprüft. Good vibes only!
            </p>
          </motion.div>
        )}

        {/* Submitting */}
        {step === 'submitting' && (
          <motion.div key="submitting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-[50dvh] flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-shake-neon-pink" />
            <p className="mt-4 text-base text-shake-text-muted">Wird eingereicht...</p>
          </motion.div>
        )}

        {/* Done */}
        {step === 'done' && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex min-h-[60dvh] flex-col items-center justify-center text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
              <CheckCircle className="h-20 w-20 text-shake-neon-pink" />
            </motion.div>
            <h2 className="mt-6 text-2xl font-bold">Danke!</h2>
            <p className="mt-2 max-w-xs text-base text-shake-text-muted">
              Deine Erinnerung wird geprüft und erscheint bald. Good vibes only!
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
                className="rounded-full border border-white/10 px-6 py-2.5 text-shake-text active:bg-white/5 transition-colors"
              >
                Noch eine Story
              </button>
              <Link href="/feed" className="rounded-full bg-shake-neon-pink px-6 py-2.5 font-medium text-white active:opacity-90 transition-opacity">
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
