'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mic, MicOff, Video, VideoOff, Square, Play, Pause, Upload, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MediaRecorderProps {
  type: 'audio' | 'video'
  onRecordingComplete: (blob: Blob, type: 'audio' | 'video') => void
}

export function MediaRecorder({ type, onRecordingComplete }: MediaRecorderProps) {
  const [status, setStatus] = useState<'idle' | 'recording' | 'recorded' | 'uploading'>('idle')
  const [duration, setDuration] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const mediaRecorderRef = useRef<globalThis.MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const videoPreviewRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (timerRef.current) clearInterval(timerRef.current)
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const startRecording = async () => {
    try {
      const constraints = type === 'video'
        ? { video: { facingMode: 'user', width: 720, height: 1280 }, audio: true }
        : { audio: true }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (type === 'video' && videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream
        videoPreviewRef.current.play()
      }

      const recorder = new globalThis.MediaRecorder(stream, {
        mimeType: type === 'video' ? 'video/webm' : 'audio/webm',
      })
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: type === 'video' ? 'video/webm' : 'audio/webm',
        })
        const url = URL.createObjectURL(blob)
        setPreviewUrl(url)
        setStatus('recorded')
        onRecordingComplete(blob, type)

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop())
      }

      recorder.start()
      setStatus('recording')
      setDuration(0)
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000)
    } catch (err) {
      console.error('Recording error:', err)
      alert(type === 'video'
        ? 'Kamera-Zugriff nicht möglich. Bitte erlaube den Zugriff in deinen Browser-Einstellungen.'
        : 'Mikrofon-Zugriff nicht möglich. Bitte erlaube den Zugriff in deinen Browser-Einstellungen.'
      )
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setStatus('idle')
    setDuration(0)
    chunksRef.current = []
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setStatus('recorded')

    const blob = file as Blob
    onRecordingComplete(blob, type)
  }

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-4">
      {/* Video preview / Audio visualizer */}
      <div className="relative mx-auto aspect-[9/16] w-full max-w-sm overflow-hidden rounded-2xl border border-shake-light/30 bg-shake-dark">
        {type === 'video' && (
          <video
            ref={videoPreviewRef}
            className="h-full w-full object-cover"
            playsInline
            muted={status === 'recording'}
            src={status === 'recorded' ? previewUrl || undefined : undefined}
            controls={status === 'recorded'}
          />
        )}

        {type === 'audio' && (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            {status === 'recording' && (
              <>
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="flex h-24 w-24 items-center justify-center rounded-full bg-shake-neon-pink/20"
                >
                  <Mic className="h-12 w-12 text-shake-neon-pink" />
                </motion.div>
                <div className="text-2xl font-mono text-shake-neon-pink">{formatDuration(duration)}</div>
                <p className="text-sm text-shake-text-muted">Aufnahme läuft...</p>
              </>
            )}

            {status === 'idle' && (
              <>
                <Mic className="h-16 w-16 text-shake-text-muted/30" />
                <p className="text-sm text-shake-text-muted">Drücke den Button um aufzunehmen</p>
              </>
            )}

            {status === 'recorded' && previewUrl && (
              <>
                <div className="text-5xl">🎙️</div>
                <audio src={previewUrl} controls className="w-64" />
                <p className="text-sm text-shake-neon-green">Aufnahme fertig! ({formatDuration(duration)})</p>
              </>
            )}
          </div>
        )}

        {/* Recording indicator */}
        {status === 'recording' && (
          <div className="absolute left-4 top-4 flex items-center gap-2">
            <motion.div
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="h-3 w-3 rounded-full bg-red-500"
            />
            <span className="text-sm font-mono text-white">{formatDuration(duration)}</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        {status === 'idle' && (
          <>
            <button
              onClick={startRecording}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-shake-neon-pink text-white shadow-lg transition-transform hover:scale-105"
            >
              {type === 'video' ? <Video className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
            </button>
            <div className="text-center">
              <p className="text-xs text-shake-text-muted">oder</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-1 flex items-center gap-1 text-sm text-shake-neon-blue hover:underline"
              >
                <Upload className="h-4 w-4" /> Datei hochladen
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept={type === 'video' ? 'video/*' : 'audio/*'}
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </>
        )}

        {status === 'recording' && (
          <button
            onClick={stopRecording}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-transform hover:scale-105"
          >
            <Square className="h-6 w-6" />
          </button>
        )}

        {status === 'recorded' && (
          <button
            onClick={reset}
            className="flex items-center gap-2 rounded-full border border-shake-light px-4 py-2 text-sm text-shake-text-muted"
          >
            <RotateCcw className="h-4 w-4" /> Nochmal
          </button>
        )}
      </div>

      {/* Max duration hint */}
      {status === 'recording' && duration >= 55 && (
        <p className="text-center text-xs text-shake-warm">Max. 60 Sekunden</p>
      )}
    </div>
  )
}
