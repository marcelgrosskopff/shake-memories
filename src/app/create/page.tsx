'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Send, X, ImagePlus, AtSign, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCreateStory } from '@/hooks/use-stories'
import Link from 'next/link'

const MAX_CHARS = 2000
const MAX_FILES = 5

type Step = 'write' | 'media' | 'details' | 'submitting' | 'done'

export default function CreatePage() {
  const [step, setStep] = useState<Step>('write')
  const [text, setText] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [authorName, setAuthorName] = useState('')
  const [instagramHandle, setInstagramHandle] = useState('')
  const createStory = useCreateStory()

  const handleFileAdd = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newFiles = Array.from(e.target.files || [])
      const remaining = MAX_FILES - files.length
      const toAdd = newFiles.slice(0, remaining)

      setFiles((prev) => [...prev, ...toAdd])
      toAdd.forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreviews((prev) => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    },
    [files.length]
  )

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!text.trim()) return
    setStep('submitting')

    try {
      await createStory.mutateAsync({
        content_text: text.trim(),
        author_name: authorName.trim() || undefined,
        instagram_handle: instagramHandle.trim() || undefined,
        media_files: files.length > 0 ? files : undefined,
      })
      setStep('done')
    } catch {
      setStep('details')
    }
  }

  return (
    <div className="min-h-dvh bg-shake-black px-4 pt-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        {step !== 'write' && step !== 'done' && step !== 'submitting' ? (
          <button
            onClick={() => {
              if (step === 'media') setStep('write')
              else if (step === 'details') setStep('media')
            }}
            className="flex items-center gap-1 text-shake-text-muted"
          >
            <ArrowLeft className="h-5 w-5" />
            Zurück
          </button>
        ) : (
          <div />
        )}
        <h1 className="text-lg font-semibold">
          {step === 'done' ? '' : 'Deine Geschichte'}
        </h1>
        <div className="w-16" />
      </div>

      {/* Progress dots */}
      {step !== 'done' && step !== 'submitting' && (
        <div className="mb-8 flex justify-center gap-2">
          {['write', 'media', 'details'].map((s) => (
            <div
              key={s}
              className={cn(
                'h-1.5 w-8 rounded-full transition-colors',
                s === step ? 'bg-shake-neon-pink' : 'bg-shake-light'
              )}
            />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Step 1: Write */}
        {step === 'write' && (
          <motion.div
            key="write"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="mx-auto max-w-lg"
          >
            <p className="mb-4 text-sm text-shake-text-muted">
              Erzähl uns von deiner Lieblingserinnerung im Shake. Was macht diesen Ort für
              dich besonders?
            </p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
              placeholder="Es war diese eine Nacht im K-Shake..."
              className="h-64 w-full resize-none rounded-2xl border border-shake-light/30 bg-shake-dark p-4 text-shake-text placeholder:text-shake-text-muted/50 focus:border-shake-neon-pink/50 focus:outline-none focus:ring-1 focus:ring-shake-neon-pink/30"
              autoFocus
            />
            <div className="mt-2 flex items-center justify-between">
              <span
                className={cn(
                  'text-xs',
                  text.length > MAX_CHARS * 0.9 ? 'text-shake-warm' : 'text-shake-text-muted'
                )}
              >
                {text.length}/{MAX_CHARS}
              </span>
              <button
                onClick={() => setStep('media')}
                disabled={!text.trim()}
                className="rounded-full bg-shake-neon-pink px-6 py-2.5 font-medium text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-shake-neon-pink/90"
              >
                Weiter
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Media */}
        {step === 'media' && (
          <motion.div
            key="media"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="mx-auto max-w-lg"
          >
            <p className="mb-4 text-sm text-shake-text-muted">
              Hast du Fotos oder Videos? (optional, max {MAX_FILES})
            </p>

            {/* Preview grid */}
            <div className="mb-4 grid grid-cols-3 gap-2">
              {previews.map((preview, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-xl">
                  <img
                    src={preview}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <button
                    onClick={() => removeFile(i)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {files.length < MAX_FILES && (
                <label className="flex aspect-square cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-shake-light/50 transition-colors hover:border-shake-neon-pink/50">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFileAdd}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-1 text-shake-text-muted">
                    <ImagePlus className="h-6 w-6" />
                    <span className="text-xs">Hinzufügen</span>
                  </div>
                </label>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('details')}
                className="flex-1 rounded-full border border-shake-light px-6 py-2.5 text-shake-text transition-all hover:border-shake-neon-blue"
              >
                Überspringen
              </button>
              <button
                onClick={() => setStep('details')}
                className="flex-1 rounded-full bg-shake-neon-pink px-6 py-2.5 font-medium text-white transition-all hover:bg-shake-neon-pink/90"
              >
                Weiter
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Details */}
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
                Dein Name (optional - du kannst auch anonym bleiben)
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

            {/* Preview */}
            <div className="rounded-2xl border border-shake-light/20 bg-shake-gray/50 p-4">
              <div className="mb-2 text-xs uppercase tracking-wider text-shake-text-muted">
                Vorschau
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-shake-neon-pink/20 text-lg">
                  🪩
                </div>
                <div>
                  <div className="text-sm font-medium">
                    {authorName || 'Anonym'}
                    {instagramHandle && (
                      <span className="ml-1 text-shake-neon-blue">@{instagramHandle}</span>
                    )}
                  </div>
                  <div className="mt-1 text-sm text-shake-text-muted line-clamp-3">
                    {text}
                  </div>
                  {previews.length > 0 && (
                    <div className="mt-2 flex gap-1">
                      {previews.slice(0, 3).map((p, i) => (
                        <div
                          key={i}
                          className="h-12 w-12 overflow-hidden rounded-lg"
                        >
                          <img src={p} alt="" className="h-full w-full object-cover" />
                        </div>
                      ))}
                      {previews.length > 3 && (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-shake-light text-xs">
                          +{previews.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-shake-neon-pink to-shake-neon-purple px-6 py-3.5 text-lg font-semibold text-white transition-all hover:opacity-90"
            >
              <Send className="h-5 w-5" />
              Absenden
            </button>
            <p className="text-center text-xs text-shake-text-muted">
              Deine Story wird vor der Veröffentlichung geprüft. Good vibes only! ✨
            </p>
          </motion.div>
        )}

        {/* Submitting */}
        {step === 'submitting' && (
          <motion.div
            key="submitting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex min-h-[50dvh] flex-col items-center justify-center"
          >
            <Loader2 className="h-12 w-12 animate-spin text-shake-neon-pink" />
            <p className="mt-4 text-shake-text-muted">Wird eingereicht...</p>
          </motion.div>
        )}

        {/* Done */}
        {step === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex min-h-[60dvh] flex-col items-center justify-center text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              <CheckCircle className="h-20 w-20 text-shake-neon-green" />
            </motion.div>
            <h2 className="mt-6 text-2xl font-bold">Danke! 🎉</h2>
            <p className="mt-2 max-w-xs text-shake-text-muted">
              Deine Erinnerung wird geprüft und erscheint bald auf dem Canvas.
              Good vibes only! 🪩
            </p>
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => {
                  setText('')
                  setFiles([])
                  setPreviews([])
                  setAuthorName('')
                  setInstagramHandle('')
                  setStep('write')
                }}
                className="rounded-full border border-shake-light px-6 py-2.5 text-shake-text"
              >
                Noch eine Story
              </button>
              <Link
                href="/feed"
                className="rounded-full bg-shake-neon-pink px-6 py-2.5 font-medium text-white"
              >
                Stories ansehen
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
