'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mic, Video, Square, Upload, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

const VIDEO_FILTERS = [
  { name: 'Normal', value: 'none' },
  { name: 'Neon', value: 'saturate(1.8) contrast(1.3) brightness(1.1)' },
  { name: 'Vintage', value: 'sepia(0.4) contrast(1.1)' },
  { name: 'B&W', value: 'grayscale(1) contrast(1.2)' },
  { name: 'Warm', value: 'sepia(0.2) saturate(1.3)' },
  { name: 'Cool', value: 'hue-rotate(20deg) brightness(1.1)' },
  { name: 'Drama', value: 'contrast(1.5) brightness(0.85)' },
]

const WAVEFORM_BARS = 24

interface MediaRecorderProps {
  type: 'audio' | 'video'
  onRecordingComplete: (blob: Blob, type: 'audio' | 'video') => void
}

export function MediaRecorder({ type, onRecordingComplete }: MediaRecorderProps) {
  const [status, setStatus] = useState<'idle' | 'recording' | 'recorded'>('idle')
  const [duration, setDuration] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFilter, setSelectedFilter] = useState(0)
  const [waveformHeights, setWaveformHeights] = useState<number[]>(new Array(WAVEFORM_BARS).fill(12))
  const mediaRecorderRef = useRef<globalThis.MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const waveformRef = useRef<NodeJS.Timeout | null>(null)
  const videoLiveRef = useRef<HTMLVideoElement>(null)
  const videoPlaybackRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
      if (timerRef.current) clearInterval(timerRef.current)
      if (waveformRef.current) clearInterval(waveformRef.current)
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const startWaveformAnimation = () => {
    waveformRef.current = setInterval(() => {
      setWaveformHeights(
        Array.from({ length: WAVEFORM_BARS }, () => 12 + Math.random() * 68)
      )
    }, 120)
  }

  const stopWaveformAnimation = () => {
    if (waveformRef.current) {
      clearInterval(waveformRef.current)
      waveformRef.current = null
    }
    setWaveformHeights(new Array(WAVEFORM_BARS).fill(12))
  }

  const startRecording = async () => {
    try {
      const constraints = type === 'video'
        ? { video: { facingMode: 'user', width: 720, height: 1280 }, audio: true }
        : { audio: true }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (type === 'video' && videoLiveRef.current) {
        videoLiveRef.current.srcObject = stream
        videoLiveRef.current.play()
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
        stopWaveformAnimation()
        onRecordingComplete(blob, type)
        stream.getTracks().forEach(t => t.stop())
      }

      recorder.start()
      setStatus('recording')
      setDuration(0)
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000)
      if (type === 'audio') startWaveformAnimation()
    } catch {
      alert(type === 'video'
        ? 'Kamera-Zugriff nicht m\u00f6glich. Bitte erlaube den Zugriff.'
        : 'Mikrofon-Zugriff nicht m\u00f6glich. Bitte erlaube den Zugriff.'
      )
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setStatus('idle')
    setDuration(0)
    stopWaveformAnimation()
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPreviewUrl(URL.createObjectURL(file))
    setStatus('recorded')
    onRecordingComplete(file, type)
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
  const currentFilter = VIDEO_FILTERS[selectedFilter].value

  return (
    <div className="space-y-4">
      {/* Preview area */}
      <div className="relative mx-auto aspect-[9/16] w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-shake-dark">
        {type === 'video' && (
          <>
            <video
              ref={videoLiveRef}
              className={cn('h-full w-full object-cover', status !== 'recording' && status !== 'idle' && 'hidden')}
              style={{ filter: currentFilter !== 'none' ? currentFilter : undefined }}
              playsInline
              muted
            />
            {status === 'recorded' && previewUrl && (
              <video
                ref={videoPlaybackRef}
                src={previewUrl}
                className="h-full w-full object-cover"
                style={{ filter: currentFilter !== 'none' ? currentFilter : undefined }}
                controls
                playsInline
              />
            )}
            {status === 'idle' && !streamRef.current && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <Video className="h-12 w-12 text-white/20" />
                <p className="text-sm text-white/30">Dr&uuml;cke den roten Button</p>
              </div>
            )}
          </>
        )}

        {type === 'audio' && (
          <div className="flex h-full flex-col items-center justify-center gap-6 px-6">
            {/* IDLE state */}
            {status === 'idle' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/5 border border-white/10">
                  <Mic className="h-10 w-10 text-white/20" />
                </div>
                <p className="text-sm text-white/30">Bereit zum Aufnehmen</p>
                {/* Flat waveform bars for idle */}
                <div className="flex items-center gap-[3px] h-12">
                  {Array.from({ length: WAVEFORM_BARS }).map((_, i) => (
                    <div
                      key={i}
                      className="w-[5px] rounded-full bg-white/10"
                      style={{ height: '6px' }}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* RECORDING state with animated waveform */}
            {status === 'recording' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-5"
              >
                <div className="text-4xl font-mono font-bold text-red-500">{fmt(duration)}</div>

                {/* Animated waveform visualization */}
                <div className="flex items-center gap-[3px] h-20">
                  {waveformHeights.map((h, i) => (
                    <motion.div
                      key={i}
                      className="w-[5px] rounded-full bg-gradient-to-t from-red-500/60 to-red-400"
                      animate={{ height: `${h}%` }}
                      transition={{ duration: 0.1, ease: 'easeOut' }}
                      style={{ minHeight: '4px' }}
                    />
                  ))}
                </div>

                <p className="text-xs text-red-400/60 uppercase tracking-wider">Aufnahme l&auml;uft...</p>
              </motion.div>
            )}

            {/* RECORDED state */}
            {status === 'recorded' && previewUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-shake-neon-green/10 border border-shake-neon-green/20">
                  <Mic className="h-8 w-8 text-shake-neon-green" />
                </div>
                <p className="text-lg font-mono font-semibold text-shake-neon-green">{fmt(duration)}</p>
                <audio src={previewUrl} controls className="w-64" />
                <p className="text-xs text-shake-text-muted">Aufnahme fertig</p>
              </motion.div>
            )}
          </div>
        )}

        {/* Recording indicator badge */}
        {status === 'recording' && (
          <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 backdrop-blur-sm">
            <motion.div
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="h-2.5 w-2.5 rounded-full bg-red-500"
            />
            <span className="text-xs font-mono text-white">{fmt(duration)}</span>
          </div>
        )}
      </div>

      {/* Video filter strip */}
      {type === 'video' && status !== 'recorded' && (
        <div className="flex gap-2 overflow-x-auto pb-1 px-1">
          {VIDEO_FILTERS.map((f, i) => (
            <button
              key={f.name}
              onClick={() => setSelectedFilter(i)}
              className={cn(
                'shrink-0 rounded-lg px-3 py-1.5 text-xs transition-colors',
                i === selectedFilter
                  ? 'bg-shake-neon-pink text-white'
                  : 'bg-white/10 text-shake-text-muted'
              )}
            >
              {f.name}
            </button>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-8">
        {status === 'idle' && (
          <>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-1.5 text-shake-text-muted"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5">
                <Upload className="h-5 w-5" />
              </div>
              <span className="text-[10px]">Hochladen</span>
            </button>

            {/* Large pulsing red record button (Voice Memos style) */}
            <button
              onClick={startRecording}
              className="pulse-record flex h-20 w-20 items-center justify-center rounded-full bg-red-500 text-white transition-transform active:scale-90"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/30">
                {type === 'video' ? <Video className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
              </div>
            </button>

            <div className="w-11" /> {/* Spacer for centering */}
            <input
              ref={fileInputRef}
              type="file"
              accept={type === 'video' ? 'video/*' : 'audio/*'}
              onChange={handleFileUpload}
              className="hidden"
            />
          </>
        )}

        {status === 'recording' && (
          <button
            onClick={stopRecording}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/90 text-white transition-transform active:scale-90"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/30">
              <Square className="h-7 w-7" />
            </div>
          </button>
        )}

        {status === 'recorded' && (
          <button
            onClick={reset}
            className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm text-shake-text-muted hover:bg-white/10 transition-colors"
          >
            <RotateCcw className="h-4 w-4" /> Nochmal
          </button>
        )}
      </div>

      {status === 'recording' && duration >= 55 && (
        <p className="text-center text-xs text-shake-warm">Max. 60 Sekunden</p>
      )}
    </div>
  )
}
