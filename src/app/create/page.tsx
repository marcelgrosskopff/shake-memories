'use client'

import { useState, useCallback, useRef } from 'react'
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

  // --- Mode chooser ---
  if (mode === 'choose' && step === 'create') {
    return (
      <div className="min-h-dvh bg-shake-black px-4 pt-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-lg"
        >
          <h1 className="mb-1 text-center text-2xl font-bold">
            Dini <span className="gradient-text">Story</span>
          </h1>
          <p className="mb-5 text-center text-xs text-shake-text-muted">
            Wie wottsch dini Shake-Erinnerung teila?
          </p>

          {/* === SPEZIAL-TEMPLATES — prominent at top === */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setMode('template')}
            className="mb-4 w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-shake-gold/20 via-shake-warm/10 to-shake-neon-pink/20 p-4"
          >
            <div className="flex items-center gap-4">
              <div className="flex gap-1 text-3xl">
                <span>📸</span>
              </div>
              <div className="flex-1 text-left">
                <div className="font-bold text-shake-text">Spezial-Templates</div>
                <div className="text-xs text-shake-text-muted">
                  Damals vs. Hüt &bull; Love Story &bull; Beichte &bull; und meh
                </div>
              </div>
              <div className="text-shake-text-muted">›</div>
            </div>
          </motion.button>

          {/* === OTHER MODES — 2x2 grid === */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { mode: 'visual' as const, icon: Brush, title: 'Visual', desc: 'Filter & Sticker', color: 'from-shake-neon-pink to-shake-neon-purple', emoji: '🎨' },
              { mode: 'text' as const, icon: Type, title: 'Text', desc: 'Gschicht schrieba', color: 'from-shake-neon-blue to-shake-neon-purple', emoji: '✍️' },
              { mode: 'voice' as const, icon: Mic, title: 'Audio', desc: 'Sprachnachricht', color: 'from-shake-neon-green to-shake-neon-blue', emoji: '🎙️' },
              { mode: 'video' as const, icon: Video, title: 'Video', desc: 'Aufnehmen / hochladen', color: 'from-shake-warm to-shake-neon-pink', emoji: '🎬' },
            ].map((item) => (
              <motion.button
                key={item.mode}
                whileTap={{ scale: 0.97 }}
                onClick={() => setMode(item.mode)}
                className="glass-card flex items-center gap-3 rounded-2xl p-3.5 text-left"
              >
                <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br', item.color)}>
                  <item.icon className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-shake-text">{item.title} {item.emoji}</div>
                  <div className="text-[11px] text-shake-text-muted truncate">{item.desc}</div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-shake-black px-4 pt-6 pb-24">
      {/* Header - mobile native style */}
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => {
            if (step === 'details') setStep('create')
            else if (step === 'create') setMode('choose')
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 active:bg-white/20"
        >
          <ArrowLeft className="h-5 w-5 text-shake-text" />
        </button>
        <h1 className="text-lg font-semibold">
          {mode === 'visual' && 'Visual'}
          {mode === 'text' && 'Text'}
          {mode === 'voice' && 'Audio'}
          {mode === 'video' && 'Video'}
          {mode === 'template' && 'Spezial'}
        </h1>
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
                  placeholder="Erzähl die Geschichte hinter deinem Bild... (optional)"
                  className="h-24 w-full resize-none rounded-xl border border-shake-light/30 bg-shake-dark p-3 text-sm text-shake-text placeholder:text-shake-text-muted/50 focus:border-shake-neon-pink/50 focus:outline-none"
                />
              </div>
            )}

            {/* Text mode */}
            {mode === 'text' && (
              <div className="space-y-4">
                <p className="text-sm text-shake-text-muted">
                  Erzähl uns von deiner Lieblingserinnerung im Shake. Was macht diesen Ort für dich besonders?
                </p>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
                  placeholder="Es war diese eine Nacht im K-Shake..."
                  className="h-64 w-full resize-none rounded-2xl border border-shake-light/30 bg-shake-dark p-4 text-shake-text placeholder:text-shake-text-muted/50 focus:border-shake-neon-pink/50 focus:outline-none focus:ring-1 focus:ring-shake-neon-pink/30"
                  autoFocus
                />
                <div className="flex items-center justify-between">
                  <span className={cn('text-xs', text.length > MAX_CHARS * 0.9 ? 'text-shake-warm' : 'text-shake-text-muted')}>
                    {text.length}/{MAX_CHARS}
                  </span>
                </div>
              </div>
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
                  placeholder="Erzähl die Geschichte dazu... (optional)"
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

        {/* Details step */}
        {step === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="mx-auto max-w-lg space-y-4"
          >
            <p className="text-sm text-shake-text-muted">
              Fast fertig! Noch ein paar optionale Details.
            </p>

            <div>
              <label className="mb-1 block text-sm text-shake-text-muted">
                Dein Name (optional - bleib gern anonym)
              </label>
              <input
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Anonym"
                className="w-full rounded-xl border border-shake-light/30 bg-shake-dark px-4 py-3 text-shake-text placeholder:text-shake-text-muted/50 focus:border-shake-neon-pink/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 flex items-center gap-1 text-sm text-shake-text-muted">
                <AtSign className="h-4 w-4" />
                Instagram Handle (optional)
              </label>
              <div className="flex items-center rounded-xl border border-shake-light/30 bg-shake-dark">
                <span className="pl-4 text-shake-text-muted">@</span>
                <input
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value.replace(/^@/, ''))}
                  placeholder="dein_handle"
                  className="w-full bg-transparent px-2 py-3 text-shake-text placeholder:text-shake-text-muted/50 focus:outline-none"
                />
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
              Deine Story wird vor der Veröffentlichung geprüft. Good vibes only!
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
            <h2 className="mt-6 text-2xl font-bold">Danke! 🎉</h2>
            <p className="mt-2 max-w-xs text-shake-text-muted">
              Deine Erinnerung wird geprüft und erscheint bald. Good vibes only! 🪩
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
  )
}
