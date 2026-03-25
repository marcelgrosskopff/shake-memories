'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Type,
  ImagePlus,
  Palette,
  Sparkles,
  Sticker,
  Layers,
  RotateCcw,
  Download,
  X,
  Plus,
  Bold,
  Italic,
  MoveVertical,
  ZoomIn,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// --- Types ---
export interface TextOverlay {
  id: string
  text: string
  x: number
  y: number
  fontSize: number
  fontFamily: string
  color: string
  rotation: number
  style: 'normal' | 'bold' | 'italic' | 'wordart'
  wordArtStyle?: string
}

export interface StickerOverlay {
  id: string
  emoji: string
  x: number
  y: number
  size: number
  rotation: number
}

export interface EditorState {
  backgroundType: 'color' | 'gradient' | 'image' | 'template'
  backgroundColor: string
  backgroundGradient: string
  backgroundImage: string | null
  filter: string
  textOverlays: TextOverlay[]
  stickerOverlays: StickerOverlay[]
  collageLayout: string | null
  collageImages: string[]
}

// --- Constants ---
const BACKGROUND_GRADIENTS = [
  { name: 'Neon Night', value: 'linear-gradient(135deg, #0a0a0a 0%, #1a0020 50%, #0a0a0a 100%)' },
  { name: 'Sunrise', value: 'linear-gradient(180deg, #0c0020 0%, #2d1b4e 30%, #ff6b35 70%, #ffd700 100%)' },
  { name: 'Disco', value: 'linear-gradient(135deg, #ff2d78 0%, #b44dff 50%, #00d4ff 100%)' },
  { name: 'Mitternacht', value: 'linear-gradient(180deg, #000428 0%, #004e92 100%)' },
  { name: 'Party', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)' },
  { name: 'Gold Rush', value: 'linear-gradient(135deg, #0a0a0a 0%, #1a1000 50%, #ffd700 100%)' },
  { name: 'Neon Pink', value: 'linear-gradient(135deg, #1a0010 0%, #ff2d78 100%)' },
  { name: 'Ocean', value: 'linear-gradient(135deg, #0a0020 0%, #00d4ff 100%)' },
]

const BACKGROUND_COLORS = [
  '#0a0a0a', '#1a0020', '#0c0028', '#200010', '#001a00',
  '#ff2d78', '#00d4ff', '#b44dff', '#39ff14', '#ffd700',
  '#ff8c42', '#ffffff', '#1e1e1e',
]

const FILTERS = [
  { name: 'Original', value: 'none' },
  { name: 'Vintage', value: 'sepia(0.4) contrast(1.1) brightness(0.9)' },
  { name: 'Neon', value: 'saturate(1.8) contrast(1.3) brightness(1.1)' },
  { name: 'B&W', value: 'grayscale(1) contrast(1.2)' },
  { name: 'Warm', value: 'sepia(0.2) saturate(1.3) brightness(1.05)' },
  { name: 'Cool', value: 'saturate(0.8) hue-rotate(20deg) brightness(1.1)' },
  { name: 'Fade', value: 'brightness(1.1) contrast(0.9) saturate(0.7)' },
  { name: 'Drama', value: 'contrast(1.5) brightness(0.85) saturate(1.2)' },
  { name: 'Glow', value: 'brightness(1.2) saturate(1.4) contrast(1.1)' },
  { name: 'Midnight', value: 'brightness(0.7) contrast(1.3) hue-rotate(-10deg) saturate(1.5)' },
]

const FONTS = [
  { name: 'Modern', value: 'Inter, sans-serif' },
  { name: 'Handschrift', value: 'Georgia, serif' },
  { name: 'Retro', value: 'Courier New, monospace' },
  { name: 'Bold', value: 'Impact, sans-serif' },
  { name: 'Elegant', value: 'Times New Roman, serif' },
]

const TEXT_COLORS = [
  '#ffffff', '#ff2d78', '#00d4ff', '#b44dff', '#39ff14',
  '#ffd700', '#ff8c42', '#000000', '#ff4444', '#44ff44',
]

const WORDART_STYLES = [
  { name: 'Neon Glow', className: 'text-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 40px currentColor' },
  { name: 'Outline', className: '-webkit-text-stroke: 2px currentColor; color: transparent' },
  { name: 'Shadow', className: 'text-shadow: 3px 3px 0 rgba(0,0,0,0.5)' },
  { name: 'Retro', className: 'text-shadow: 2px 2px 0 #ff2d78, 4px 4px 0 #00d4ff' },
  { name: '3D', className: 'text-shadow: 1px 1px 0 #333, 2px 2px 0 #333, 3px 3px 0 #333' },
]

const SHAKE_STICKERS = [
  '🪩', '🎉', '🍺', '🥂', '💃', '🕺', '🎵', '🎶', '❤️', '🔥',
  '✨', '⭐', '🌅', '🌙', '🎸', '🎤', '💜', '🫶', '😂', '🥲',
  '🤘', '🎊', '💫', '🌈', '🍸', '🫧', '💥', '🙌', '🫂', '😎',
]

const COLLAGE_LAYOUTS = [
  { name: 'Single', id: 'single', grid: 'grid-cols-1', count: 1 },
  { name: 'Duo', id: 'duo', grid: 'grid-cols-2', count: 2 },
  { name: 'Trio', id: 'trio', grid: 'grid-cols-2 grid-rows-2', count: 3 },
  { name: 'Quad', id: 'quad', grid: 'grid-cols-2 grid-rows-2', count: 4 },
  { name: 'Story', id: 'story', grid: 'grid-cols-3', count: 3 },
]

const TEMPLATES = [
  {
    name: 'K-Shake Night',
    bg: 'linear-gradient(135deg, #0a0a0a 0%, #1a0020 50%, #0a0a0a 100%)',
    defaultText: '🪩 Meine K-Shake Erinnerung',
    textColor: '#ff2d78',
  },
  {
    name: 'Sunrise Session',
    bg: 'linear-gradient(180deg, #0c0020 0%, #2d1b4e 30%, #ff6b35 70%, #ffd700 100%)',
    defaultText: '🌅 Sunrise Session',
    textColor: '#ffd700',
  },
  {
    name: 'Party Vibes',
    bg: 'linear-gradient(135deg, #ff2d78 0%, #b44dff 50%, #00d4ff 100%)',
    defaultText: '🎉 Party Time!',
    textColor: '#ffffff',
  },
  {
    name: 'Einfach Anders',
    bg: 'linear-gradient(135deg, #000428 0%, #004e92 100%)',
    defaultText: 'Einfach anders.',
    textColor: '#00d4ff',
  },
]

// --- Tool tabs ---
type ToolTab = 'background' | 'text' | 'stickers' | 'filters' | 'collage' | 'templates'

interface CreativeEditorProps {
  onExport: (canvas: HTMLCanvasElement) => void
  onStateChange: (state: EditorState) => void
}

export function CreativeEditor({ onExport, onStateChange }: CreativeEditorProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<ToolTab | null>(null)
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const [state, setState] = useState<EditorState>({
    backgroundType: 'gradient',
    backgroundColor: '#0a0a0a',
    backgroundGradient: BACKGROUND_GRADIENTS[0].value,
    backgroundImage: null,
    filter: 'none',
    textOverlays: [],
    stickerOverlays: [],
    collageLayout: null,
    collageImages: [],
  })

  useEffect(() => {
    onStateChange(state)
  }, [state, onStateChange])

  // --- Background style ---
  const backgroundStyle = state.backgroundType === 'gradient'
    ? { background: state.backgroundGradient }
    : state.backgroundType === 'color'
      ? { backgroundColor: state.backgroundColor }
      : state.backgroundImage
        ? { backgroundImage: `url(${state.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : { background: state.backgroundGradient }

  // --- Add text overlay ---
  const addText = (wordArtStyle?: string) => {
    const newText: TextOverlay = {
      id: crypto.randomUUID(),
      text: 'Tippe hier...',
      x: 50,
      y: 50,
      fontSize: 24,
      fontFamily: FONTS[0].value,
      color: '#ffffff',
      rotation: 0,
      style: wordArtStyle ? 'wordart' : 'normal',
      wordArtStyle,
    }
    setState((prev) => ({ ...prev, textOverlays: [...prev.textOverlays, newText] }))
  }

  // --- Add sticker ---
  const addSticker = (emoji: string) => {
    const newSticker: StickerOverlay = {
      id: crypto.randomUUID(),
      emoji,
      x: 30 + Math.random() * 40,
      y: 30 + Math.random() * 40,
      size: 40,
      rotation: Math.random() * 30 - 15,
    }
    setState((prev) => ({ ...prev, stickerOverlays: [...prev.stickerOverlays, newSticker] }))
  }

  // --- Update text overlay ---
  const updateText = (id: string, updates: Partial<TextOverlay>) => {
    setState((prev) => ({
      ...prev,
      textOverlays: prev.textOverlays.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }))
  }

  // --- Remove overlay ---
  const removeOverlay = (id: string, type: 'text' | 'sticker') => {
    if (type === 'text') {
      setState((prev) => ({ ...prev, textOverlays: prev.textOverlays.filter((t) => t.id !== id) }))
    } else {
      setState((prev) => ({ ...prev, stickerOverlays: prev.stickerOverlays.filter((s) => s.id !== id) }))
    }
  }

  // --- Drag handling ---
  const handleDragStart = (e: React.PointerEvent, id: string) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    setDragging(id)
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleDragMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging || !canvasRef.current) return
      const rect = canvasRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100

      // Check if it's a text or sticker
      const isText = state.textOverlays.some((t) => t.id === dragging)
      if (isText) {
        updateText(dragging, { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) })
      } else {
        setState((prev) => ({
          ...prev,
          stickerOverlays: prev.stickerOverlays.map((s) =>
            s.id === dragging ? { ...s, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) } : s
          ),
        }))
      }
    },
    [dragging, state.textOverlays]
  )

  // --- Image upload ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setState((prev) => ({
        ...prev,
        backgroundType: 'image',
        backgroundImage: reader.result as string,
      }))
    }
    reader.readAsDataURL(file)
  }

  // --- Collage image upload ---
  const handleCollageImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setState((prev) => {
        const images = [...prev.collageImages]
        images[index] = reader.result as string
        return { ...prev, collageImages: images }
      })
    }
    reader.readAsDataURL(file)
  }

  const toolTabs: { id: ToolTab; icon: React.ElementType; label: string }[] = [
    { id: 'templates', icon: Sparkles, label: 'Templates' },
    { id: 'background', icon: Palette, label: 'Hintergrund' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'stickers', icon: Sticker, label: 'Sticker' },
    { id: 'filters', icon: Layers, label: 'Filter' },
    { id: 'collage', icon: ImagePlus, label: 'Collage' },
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* Canvas preview */}
      <div
        ref={canvasRef}
        className="relative mx-auto aspect-[9/16] w-full max-w-sm overflow-hidden rounded-2xl border border-shake-light/30 shadow-2xl"
        style={{
          ...backgroundStyle,
          filter: state.filter !== 'none' ? state.filter : undefined,
        }}
        onPointerMove={handleDragMove}
        onPointerUp={() => setDragging(null)}
        onPointerLeave={() => setDragging(null)}
      >
        {/* Collage grid */}
        {state.collageLayout && state.collageImages.length > 0 && (
          <div className={cn('grid h-full w-full gap-1 p-1', COLLAGE_LAYOUTS.find((l) => l.id === state.collageLayout)?.grid)}>
            {state.collageImages.map((img, i) => (
              <div key={i} className={cn('overflow-hidden rounded-lg', state.collageLayout === 'trio' && i === 0 && 'row-span-2')}>
                {img ? (
                  <img src={img} alt="" className="h-full w-full object-cover" />
                ) : (
                  <label className="flex h-full w-full cursor-pointer items-center justify-center bg-shake-light/20">
                    <input type="file" accept="image/*" onChange={(e) => handleCollageImageUpload(e, i)} className="hidden" />
                    <Plus className="h-8 w-8 text-shake-text-muted" />
                  </label>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Text overlays */}
        {state.textOverlays.map((overlay) => (
          <div
            key={overlay.id}
            className="absolute cursor-move select-none"
            style={{
              left: `${overlay.x}%`,
              top: `${overlay.y}%`,
              transform: `translate(-50%, -50%) rotate(${overlay.rotation}deg)`,
              fontSize: `${overlay.fontSize}px`,
              fontFamily: overlay.fontFamily,
              color: overlay.color,
              fontWeight: overlay.style === 'bold' ? 700 : 400,
              fontStyle: overlay.style === 'italic' ? 'italic' : 'normal',
              ...(overlay.wordArtStyle ? { cssText: overlay.wordArtStyle } : {}),
            }}
            onPointerDown={(e) => handleDragStart(e, overlay.id)}
          >
            {/* Neon glow effect for wordart */}
            <span
              style={
                overlay.wordArtStyle === WORDART_STYLES[0].className
                  ? { textShadow: `0 0 10px ${overlay.color}, 0 0 20px ${overlay.color}, 0 0 40px ${overlay.color}` }
                  : overlay.wordArtStyle === WORDART_STYLES[1].className
                    ? { WebkitTextStroke: `2px ${overlay.color}`, color: 'transparent' }
                    : overlay.wordArtStyle === WORDART_STYLES[3].className
                      ? { textShadow: '2px 2px 0 #ff2d78, 4px 4px 0 #00d4ff' }
                      : overlay.wordArtStyle === WORDART_STYLES[4].className
                        ? { textShadow: '1px 1px 0 #333, 2px 2px 0 #333, 3px 3px 0 #333' }
                        : { textShadow: '3px 3px 0 rgba(0,0,0,0.5)' }
              }
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => updateText(overlay.id, { text: e.currentTarget.textContent || '' })}
              className="outline-none whitespace-pre"
            >
              {overlay.text}
            </span>
            {/* Remove button */}
            <button
              onClick={(e) => { e.stopPropagation(); removeOverlay(overlay.id, 'text') }}
              className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {/* Sticker overlays */}
        {state.stickerOverlays.map((sticker) => (
          <div
            key={sticker.id}
            className="absolute cursor-move select-none"
            style={{
              left: `${sticker.x}%`,
              top: `${sticker.y}%`,
              transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg)`,
              fontSize: `${sticker.size}px`,
            }}
            onPointerDown={(e) => handleDragStart(e, sticker.id)}
          >
            {sticker.emoji}
            <button
              onClick={(e) => { e.stopPropagation(); removeOverlay(sticker.id, 'sticker') }}
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {/* Empty state hint */}
        {state.textOverlays.length === 0 && state.stickerOverlays.length === 0 && !state.collageLayout && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-center text-shake-text-muted/40 text-sm px-8">
              Nutze die Tools unten um deine Story zu gestalten
            </p>
          </div>
        )}
      </div>

      {/* Tool tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 px-1">
        {toolTabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(activeTab === tab.id ? null : tab.id)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-shake-neon-pink text-white'
                  : 'bg-shake-dark border border-shake-light/30 text-shake-text-muted'
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tool panels */}
      <AnimatePresence mode="wait">
        {activeTab && (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="rounded-2xl border border-shake-light/20 bg-shake-dark/80 p-4"
          >
            {/* Templates */}
            {activeTab === 'templates' && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Story Templates</h3>
                <div className="grid grid-cols-2 gap-2">
                  {TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.name}
                      onClick={() => {
                        setState((prev) => ({
                          ...prev,
                          backgroundType: 'gradient',
                          backgroundGradient: tmpl.bg,
                          textOverlays: [
                            {
                              id: crypto.randomUUID(),
                              text: tmpl.defaultText,
                              x: 50,
                              y: 40,
                              fontSize: 28,
                              fontFamily: 'Impact, sans-serif',
                              color: tmpl.textColor,
                              rotation: 0,
                              style: 'wordart',
                              wordArtStyle: WORDART_STYLES[0].className,
                            },
                          ],
                        }))
                      }}
                      className="aspect-[3/4] overflow-hidden rounded-xl border border-shake-light/20 transition-all hover:border-shake-neon-pink/50"
                      style={{ background: tmpl.bg }}
                    >
                      <div className="flex h-full items-center justify-center p-2">
                        <span style={{ color: tmpl.textColor }} className="text-xs font-bold text-center">
                          {tmpl.defaultText}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Background */}
            {activeTab === 'background' && (
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 text-sm font-medium">Gradients</h3>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {BACKGROUND_GRADIENTS.map((grad) => (
                      <button
                        key={grad.name}
                        onClick={() => setState((prev) => ({ ...prev, backgroundType: 'gradient', backgroundGradient: grad.value }))}
                        className={cn(
                          'h-12 w-12 shrink-0 rounded-xl border-2 transition-all',
                          state.backgroundGradient === grad.value ? 'border-shake-neon-pink scale-110' : 'border-shake-light/30'
                        )}
                        style={{ background: grad.value }}
                        title={grad.name}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-medium">Farben</h3>
                  <div className="flex flex-wrap gap-2">
                    {BACKGROUND_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setState((prev) => ({ ...prev, backgroundType: 'color', backgroundColor: color }))}
                        className={cn(
                          'h-8 w-8 rounded-full border-2 transition-all',
                          state.backgroundColor === color && state.backgroundType === 'color' ? 'border-shake-neon-pink scale-110' : 'border-shake-light/30'
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-medium">Eigenes Bild</h3>
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-shake-light/50 p-3 text-sm text-shake-text-muted hover:border-shake-neon-pink/50">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <ImagePlus className="h-5 w-5" />
                    Foto als Hintergrund
                  </label>
                </div>
              </div>
            )}

            {/* Text */}
            {activeTab === 'text' && (
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 text-sm font-medium">Text hinzufügen</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => addText()}
                      className="flex items-center gap-1.5 rounded-xl bg-shake-light px-4 py-2 text-sm transition-all hover:bg-shake-neon-pink/20"
                    >
                      <Type className="h-4 w-4" /> Normal
                    </button>
                    <button
                      onClick={() => addText(WORDART_STYLES[0].className)}
                      className="flex items-center gap-1.5 rounded-xl bg-shake-light px-4 py-2 text-sm neon-glow-pink transition-all hover:bg-shake-neon-pink/20"
                    >
                      <Sparkles className="h-4 w-4" /> Neon
                    </button>
                    <button
                      onClick={() => addText(WORDART_STYLES[1].className)}
                      className="flex items-center gap-1.5 rounded-xl bg-shake-light px-4 py-2 text-sm transition-all hover:bg-shake-neon-pink/20"
                    >
                      Outline
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-medium">Word Art Styles</h3>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {WORDART_STYLES.map((style) => (
                      <button
                        key={style.name}
                        onClick={() => addText(style.className)}
                        className="shrink-0 rounded-xl bg-shake-gray px-3 py-2 text-xs transition-all hover:bg-shake-neon-pink/20"
                      >
                        {style.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text editing for selected overlays */}
                {state.textOverlays.length > 0 && (
                  <div className="space-y-3 border-t border-shake-light/20 pt-3">
                    <h3 className="text-sm font-medium">Text bearbeiten</h3>
                    {state.textOverlays.map((overlay) => (
                      <div key={overlay.id} className="space-y-2 rounded-xl bg-shake-gray/50 p-3">
                        <div className="flex gap-1">
                          {TEXT_COLORS.map((color) => (
                            <button
                              key={color}
                              onClick={() => updateText(overlay.id, { color })}
                              className={cn(
                                'h-6 w-6 rounded-full border',
                                overlay.color === color ? 'border-white scale-110' : 'border-shake-light/30'
                              )}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <div className="flex gap-2">
                          {FONTS.map((font) => (
                            <button
                              key={font.name}
                              onClick={() => updateText(overlay.id, { fontFamily: font.value })}
                              className={cn(
                                'rounded-lg px-2 py-1 text-xs',
                                overlay.fontFamily === font.value ? 'bg-shake-neon-pink text-white' : 'bg-shake-light text-shake-text-muted'
                              )}
                              style={{ fontFamily: font.value }}
                            >
                              {font.name}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-shake-text-muted">Größe</span>
                          <input
                            type="range"
                            min={12}
                            max={64}
                            value={overlay.fontSize}
                            onChange={(e) => updateText(overlay.id, { fontSize: Number(e.target.value) })}
                            className="flex-1 accent-shake-neon-pink"
                          />
                          <span className="text-xs w-8">{overlay.fontSize}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-shake-text-muted">Rotation</span>
                          <input
                            type="range"
                            min={-45}
                            max={45}
                            value={overlay.rotation}
                            onChange={(e) => updateText(overlay.id, { rotation: Number(e.target.value) })}
                            className="flex-1 accent-shake-neon-blue"
                          />
                          <span className="text-xs w-8">{overlay.rotation}°</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Stickers */}
            {activeTab === 'stickers' && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Shake Stickers</h3>
                <div className="grid grid-cols-10 gap-1">
                  {SHAKE_STICKERS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => addSticker(emoji)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-xl transition-transform hover:scale-125 hover:bg-shake-light/30"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Filters */}
            {activeTab === 'filters' && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Foto Filter</h3>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {FILTERS.map((filter) => (
                    <button
                      key={filter.name}
                      onClick={() => setState((prev) => ({ ...prev, filter: filter.value }))}
                      className="shrink-0 text-center"
                    >
                      <div
                        className={cn(
                          'mb-1 h-16 w-16 rounded-xl border-2 transition-all',
                          state.filter === filter.value ? 'border-shake-neon-pink' : 'border-shake-light/30'
                        )}
                        style={{
                          background: state.backgroundType === 'gradient' ? state.backgroundGradient : state.backgroundColor,
                          filter: filter.value !== 'none' ? filter.value : undefined,
                        }}
                      />
                      <span className="text-[10px] text-shake-text-muted">{filter.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Collage */}
            {activeTab === 'collage' && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Collage Layout</h3>
                <div className="flex gap-2">
                  {COLLAGE_LAYOUTS.map((layout) => (
                    <button
                      key={layout.id}
                      onClick={() => {
                        setState((prev) => ({
                          ...prev,
                          collageLayout: layout.id,
                          collageImages: new Array(layout.count).fill(''),
                        }))
                      }}
                      className={cn(
                        'flex h-14 w-14 items-center justify-center rounded-xl border-2 text-xs transition-all',
                        state.collageLayout === layout.id ? 'border-shake-neon-pink bg-shake-neon-pink/10' : 'border-shake-light/30'
                      )}
                    >
                      {layout.name}
                    </button>
                  ))}
                  <button
                    onClick={() => setState((prev) => ({ ...prev, collageLayout: null, collageImages: [] }))}
                    className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-shake-light/30 text-xs text-shake-text-muted"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
