'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Type, ImagePlus, Sticker, X, Palette, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'

// --- Types ---
export interface TextOverlay {
  id: string
  text: string
  x: number
  y: number
  fontSize: number
  color: string
  style: 'normal' | 'neon' | 'outline' | 'shadow'
}

export interface StickerOverlay {
  id: string
  emoji: string
  x: number
  y: number
  size: number
}

export interface EditorState {
  backgroundType: 'color' | 'gradient' | 'image'
  backgroundColor: string
  backgroundGradient: string
  backgroundImage: string | null
  filter: string
  textOverlays: TextOverlay[]
  stickerOverlays: StickerOverlay[]
  collageLayout: string | null
  collageImages: string[]
}

// --- Filter presets ---
const FILTERS = [
  { name: 'Normal', value: 'none', preview: '#1a1a2e' },
  { name: 'Neon', value: 'saturate(1.8) contrast(1.3) brightness(1.1)', preview: '#2d1b69' },
  { name: 'Vintage', value: 'sepia(0.4) contrast(1.1) brightness(0.9)', preview: '#3d2b1f' },
  { name: 'B&W', value: 'grayscale(1) contrast(1.2)', preview: '#333' },
  { name: 'Warm', value: 'sepia(0.2) saturate(1.3) brightness(1.05)', preview: '#3b2507' },
  { name: 'Cool', value: 'saturate(0.8) hue-rotate(20deg) brightness(1.1)', preview: '#0a2540' },
  { name: 'Fade', value: 'brightness(1.1) contrast(0.9) saturate(0.7)', preview: '#2a2a3a' },
  { name: 'Drama', value: 'contrast(1.5) brightness(0.85) saturate(1.2)', preview: '#0d0d1a' },
  { name: 'Glow', value: 'brightness(1.2) saturate(1.4) contrast(1.1)', preview: '#1a0030' },
]

const GRADIENT_BACKGROUNDS = [
  { name: 'Neon Night', value: 'linear-gradient(135deg, #0a0a0a 0%, #1a0020 50%, #0a0a0a 100%)' },
  { name: 'Sunrise', value: 'linear-gradient(180deg, #0c0020 0%, #2d1b4e 30%, #ff6b35 70%, #ffd700 100%)' },
  { name: 'Disco', value: 'linear-gradient(135deg, #ff2d78 0%, #b44dff 50%, #00d4ff 100%)' },
  { name: 'Midnight', value: 'linear-gradient(180deg, #000428 0%, #004e92 100%)' },
  { name: 'Party', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)' },
  { name: 'Gold', value: 'linear-gradient(135deg, #0a0a0a 0%, #1a1000 50%, #ffd700 100%)' },
  { name: 'Pink', value: 'linear-gradient(135deg, #1a0010 0%, #ff2d78 100%)' },
  { name: 'Ocean', value: 'linear-gradient(135deg, #0a0020 0%, #00d4ff 100%)' },
]

const SOLID_BACKGROUNDS = [
  { name: 'Black', value: '#0a0a0a' },
  { name: 'Dark Purple', value: '#1a0030' },
  { name: 'Deep Blue', value: '#0a1628' },
  { name: 'Dark Green', value: '#0a1a0a' },
  { name: 'Charcoal', value: '#1a1a1a' },
  { name: 'Wine', value: '#2a0a1a' },
  { name: 'Navy', value: '#0a0a2a' },
  { name: 'Espresso', value: '#1a1008' },
]

const STICKERS = [
  '\u{1FA69}', '\u{1F389}', '\u{1F37A}', '\u{1F942}', '\u{1F483}', '\u{1F57A}', '\u{1F3B5}', '\u{2764}\u{FE0F}', '\u{1F525}', '\u{2728}',
  '\u{1F305}', '\u{1F3B8}', '\u{1F3A4}', '\u{1F49C}', '\u{1F602}', '\u{1F972}', '\u{1F918}', '\u{1F4AB}', '\u{1F378}', '\u{1F60E}',
]

const TEXT_STYLES: { name: string; value: TextOverlay['style'] }[] = [
  { name: 'Normal', value: 'normal' },
  { name: 'Neon', value: 'neon' },
  { name: 'Outline', value: 'outline' },
  { name: 'Shadow', value: 'shadow' },
]

const TEXT_COLORS = [
  '#ffffff', '#ff2d78', '#00d4ff', '#b44dff', '#39ff14',
  '#ffd700', '#ff8c42', '#000000',
]

type ActiveTool = null | 'text' | 'stickers' | 'bg' | 'draw'

interface CreativeEditorProps {
  onExport: (canvas: HTMLCanvasElement) => void
  onStateChange: (state: EditorState) => void
}

export function CreativeEditor({ onStateChange }: CreativeEditorProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [activeTool, setActiveTool] = useState<ActiveTool>(null)
  const [dragging, setDragging] = useState<string | null>(null)
  const [selectedFilter, setSelectedFilter] = useState(0)
  const [selectedBg, setSelectedBg] = useState(0)
  const [bgType, setBgType] = useState<'gradient' | 'solid'>('gradient')
  const [selectedSolidBg, setSelectedSolidBg] = useState(0)
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([])
  const [stickerOverlays, setStickerOverlays] = useState<StickerOverlay[]>([])
  const [editingText, setEditingText] = useState<string | null>(null)

  const currentBg = bgType === 'gradient' ? GRADIENT_BACKGROUNDS[selectedBg].value : SOLID_BACKGROUNDS[selectedSolidBg].value

  // Sync state to parent
  const syncState = useCallback(() => {
    onStateChange({
      backgroundType: backgroundImage ? 'image' : bgType === 'gradient' ? 'gradient' : 'color',
      backgroundColor: bgType === 'solid' ? SOLID_BACKGROUNDS[selectedSolidBg].value : '#0a0a0a',
      backgroundGradient: bgType === 'gradient' ? GRADIENT_BACKGROUNDS[selectedBg].value : '',
      backgroundImage,
      filter: FILTERS[selectedFilter].value,
      textOverlays,
      stickerOverlays,
      collageLayout: null,
      collageImages: [],
    })
  }, [backgroundImage, bgType, selectedBg, selectedSolidBg, selectedFilter, textOverlays, stickerOverlays, onStateChange])

  // --- Actions ---
  const addText = () => {
    const t: TextOverlay = {
      id: crypto.randomUUID(),
      text: 'Tippe hier',
      x: 50, y: 50,
      fontSize: 28,
      color: '#ffffff',
      style: 'neon',
    }
    setTextOverlays(prev => [...prev, t])
    setEditingText(t.id)
    setActiveTool('text')
    syncState()
  }

  const addSticker = (emoji: string) => {
    setStickerOverlays(prev => [...prev, {
      id: crypto.randomUUID(),
      emoji,
      x: 25 + Math.random() * 50,
      y: 25 + Math.random() * 50,
      size: 36,
    }])
    syncState()
  }

  const removeOverlay = (id: string) => {
    setTextOverlays(prev => prev.filter(t => t.id !== id))
    setStickerOverlays(prev => prev.filter(s => s.id !== id))
    syncState()
  }

  // --- Drag ---
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100))
    const y = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100))

    setTextOverlays(prev => prev.map(t => t.id === dragging ? { ...t, x, y } : t))
    setStickerOverlays(prev => prev.map(s => s.id === dragging ? { ...s, x, y } : s))
  }, [dragging])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setBackgroundImage(reader.result as string)
      syncState()
    }
    reader.readAsDataURL(file)
  }

  const getTextStyle = (overlay: TextOverlay): React.CSSProperties => {
    const base: React.CSSProperties = {
      left: `${overlay.x}%`,
      top: `${overlay.y}%`,
      transform: 'translate(-50%, -50%)',
      fontSize: `${overlay.fontSize}px`,
      color: overlay.color,
      fontFamily: 'var(--font-outfit), sans-serif',
      fontWeight: 700,
    }
    switch (overlay.style) {
      case 'neon':
        return { ...base, textShadow: `0 0 10px ${overlay.color}, 0 0 20px ${overlay.color}, 0 0 40px ${overlay.color}` }
      case 'outline':
        return { ...base, WebkitTextStroke: `2px ${overlay.color}`, color: 'transparent' }
      case 'shadow':
        return { ...base, textShadow: '3px 3px 6px rgba(0,0,0,0.8)' }
      default:
        return base
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* === CANVAS (9:16, larger) with atmospheric glow === */}
      <div className="relative">
        {/* Subtle glow behind canvas */}
        <div
          className="absolute -inset-3 rounded-3xl opacity-50 blur-2xl"
          style={{ background: 'radial-gradient(ellipse at center, rgba(255,45,120,0.12), rgba(180,77,255,0.08), transparent 70%)' }}
        />
        <div
          ref={canvasRef}
          className="relative mx-auto aspect-[9/16] w-full overflow-hidden rounded-2xl"
          style={{
            background: backgroundImage ? `url(${backgroundImage}) center/cover` : currentBg,
            filter: FILTERS[selectedFilter].value !== 'none' ? FILTERS[selectedFilter].value : undefined,
            border: '1px solid rgba(255,45,120,0.15)',
            boxShadow: '0 0 30px rgba(255,45,120,0.08), 0 8px 40px rgba(0,0,0,0.4)',
          }}
          onPointerMove={handlePointerMove}
          onPointerUp={() => setDragging(null)}
          onPointerLeave={() => setDragging(null)}
        >
        {/* Text overlays */}
        {textOverlays.map(overlay => (
          <div
            key={overlay.id}
            className="absolute cursor-move select-none"
            style={getTextStyle(overlay)}
            onPointerDown={() => setDragging(overlay.id)}
          >
            <span
              contentEditable
              suppressContentEditableWarning
              onFocus={() => setEditingText(overlay.id)}
              onBlur={(e) => {
                setTextOverlays(prev => prev.map(t =>
                  t.id === overlay.id ? { ...t, text: e.currentTarget.textContent || '' } : t
                ))
                setEditingText(null)
                syncState()
              }}
              className="outline-none whitespace-pre"
            >
              {overlay.text}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); removeOverlay(overlay.id) }}
              className="absolute -right-3 -top-3 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {/* Sticker overlays */}
        {stickerOverlays.map(sticker => (
          <div
            key={sticker.id}
            className="absolute cursor-move select-none"
            style={{
              left: `${sticker.x}%`, top: `${sticker.y}%`,
              transform: 'translate(-50%, -50%)',
              fontSize: `${sticker.size}px`,
            }}
            onPointerDown={() => setDragging(sticker.id)}
          >
            {sticker.emoji}
            <button
              onClick={(e) => { e.stopPropagation(); removeOverlay(sticker.id) }}
              className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white text-[10px]"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {/* Empty state */}
        {textOverlays.length === 0 && stickerOverlays.length === 0 && !backgroundImage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white/20 text-sm text-center px-8">
              W&auml;hle einen Filter, f&uuml;g Text oder Sticker hinzu
            </p>
          </div>
        )}

        {/* Photo upload button (top right) */}
        <label className="absolute right-3 top-3 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-black/50 backdrop-blur-sm text-white">
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          <ImagePlus className="h-5 w-5" />
        </label>
        </div>
      </div>

      {/* === FILTER STRIP === */}
      <div className="flex gap-3 overflow-x-auto pb-1 px-1 snap-x">
        {FILTERS.map((filter, i) => (
          <button
            key={filter.name}
            onClick={() => { setSelectedFilter(i); syncState() }}
            className="shrink-0 snap-center text-center"
          >
            <div
              className={cn(
                'mb-1 h-16 w-16 rounded-xl border-2 transition-all',
                i === selectedFilter ? 'border-shake-neon-pink scale-105' : 'border-transparent opacity-70'
              )}
              style={{
                background: backgroundImage
                  ? `url(${backgroundImage}) center/cover`
                  : currentBg,
                filter: filter.value !== 'none' ? filter.value : undefined,
              }}
            />
            <span className={cn(
              'text-[10px]',
              i === selectedFilter ? 'text-shake-neon-pink font-medium' : 'text-shake-text-muted'
            )}>
              {filter.name}
            </span>
          </button>
        ))}
      </div>

      {/* === TOOL BAR (circular buttons with pink/purple accent) === */}
      <div
        className="flex justify-center gap-5 rounded-2xl py-3 px-4"
        style={{
          background: 'linear-gradient(135deg, rgba(255,45,120,0.04), rgba(180,77,255,0.03))',
          border: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        {[
          { tool: 'text' as const, icon: Type, label: 'Text', action: () => addText() },
          { tool: 'stickers' as const, icon: Sticker, label: 'Sticker', action: () => setActiveTool(activeTool === 'stickers' ? null : 'stickers') },
          { tool: 'bg' as const, icon: Palette, label: 'Hintergrund', action: () => setActiveTool(activeTool === 'bg' ? null : 'bg') },
          { tool: 'draw' as const, icon: Pencil, label: 'Zeichnen', action: () => setActiveTool(activeTool === 'draw' ? null : 'draw') },
        ].map((item) => (
          <button
            key={item.tool}
            onClick={item.action}
            className={cn(
              'flex flex-col items-center gap-1.5 transition-colors',
              activeTool === item.tool ? 'text-shake-neon-pink' : 'text-shake-text-muted hover:text-shake-text'
            )}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full transition-all"
              style={activeTool === item.tool ? {
                border: '2px solid rgba(255,45,120,0.6)',
                background: 'rgba(255,45,120,0.1)',
                boxShadow: '0 0 15px rgba(255,45,120,0.15)',
              } : {
                border: '2px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.03)',
              }}
            >
              <item.icon className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      {/* === TOOL PANELS === */}
      <AnimatePresence mode="wait">
        {activeTool === 'stickers' && (
          <motion.div
            key="stickers"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-10 gap-1 rounded-xl bg-shake-dark/80 p-3">
              {STICKERS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => addSticker(emoji)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-xl hover:bg-white/10 transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {activeTool === 'text' && editingText && (
          <motion.div
            key="text-edit"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 rounded-xl bg-shake-dark/80 p-3">
              {/* Style picker */}
              <div className="flex gap-2">
                {TEXT_STYLES.map(s => {
                  const overlay = textOverlays.find(t => t.id === editingText)
                  return (
                    <button
                      key={s.value}
                      onClick={() => {
                        setTextOverlays(prev => prev.map(t =>
                          t.id === editingText ? { ...t, style: s.value } : t
                        ))
                        syncState()
                      }}
                      className={cn(
                        'rounded-lg px-3 py-1.5 text-xs transition-colors',
                        overlay?.style === s.value ? 'bg-shake-neon-pink text-white' : 'bg-white/10 text-shake-text-muted'
                      )}
                    >
                      {s.name}
                    </button>
                  )
                })}
              </div>
              {/* Color picker */}
              <div className="flex gap-2">
                {TEXT_COLORS.map(color => {
                  const overlay = textOverlays.find(t => t.id === editingText)
                  return (
                    <button
                      key={color}
                      onClick={() => {
                        setTextOverlays(prev => prev.map(t =>
                          t.id === editingText ? { ...t, color } : t
                        ))
                        syncState()
                      }}
                      className={cn(
                        'h-7 w-7 rounded-full border-2 transition-all',
                        overlay?.color === color ? 'border-white scale-110' : 'border-transparent'
                      )}
                      style={{ backgroundColor: color }}
                    />
                  )
                })}
              </div>
              {/* Size slider */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-shake-text-muted w-6">Aa</span>
                <input
                  type="range" min={16} max={56}
                  value={textOverlays.find(t => t.id === editingText)?.fontSize || 28}
                  onChange={(e) => {
                    setTextOverlays(prev => prev.map(t =>
                      t.id === editingText ? { ...t, fontSize: Number(e.target.value) } : t
                    ))
                  }}
                  className="flex-1 accent-shake-neon-pink"
                />
                <span className="text-[10px] text-shake-text-muted w-6">AA</span>
              </div>
            </div>
          </motion.div>
        )}

        {activeTool === 'bg' && (
          <motion.div
            key="bg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 rounded-xl bg-shake-dark/80 p-3">
              {/* Tabs: Gradients vs Solid */}
              <div className="flex gap-2 mb-1">
                <button
                  onClick={() => setBgType('gradient')}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                    bgType === 'gradient' ? 'bg-shake-neon-pink text-white' : 'bg-white/10 text-shake-text-muted'
                  )}
                >
                  Gradients
                </button>
                <button
                  onClick={() => setBgType('solid')}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                    bgType === 'solid' ? 'bg-shake-neon-pink text-white' : 'bg-white/10 text-shake-text-muted'
                  )}
                >
                  Farben
                </button>
              </div>

              {bgType === 'gradient' ? (
                <div className="flex gap-2 overflow-x-auto">
                  {GRADIENT_BACKGROUNDS.map((bg, i) => (
                    <button
                      key={bg.name}
                      onClick={() => { setSelectedBg(i); setBackgroundImage(null); syncState() }}
                      className="shrink-0 text-center"
                    >
                      <div
                        className={cn(
                          'h-14 w-14 rounded-xl border-2 transition-all',
                          i === selectedBg && !backgroundImage && bgType === 'gradient' ? 'border-shake-neon-pink' : 'border-transparent'
                        )}
                        style={{ background: bg.value }}
                      />
                      <span className="text-[9px] text-shake-text-muted">{bg.name}</span>
                    </button>
                  ))}
                  <label className="flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-white/20 text-white/40 hover:border-white/40">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <ImagePlus className="h-5 w-5" />
                  </label>
                </div>
              ) : (
                <div className="flex gap-2 overflow-x-auto">
                  {SOLID_BACKGROUNDS.map((bg, i) => (
                    <button
                      key={bg.name}
                      onClick={() => { setSelectedSolidBg(i); setBackgroundImage(null); syncState() }}
                      className="shrink-0 text-center"
                    >
                      <div
                        className={cn(
                          'h-14 w-14 rounded-xl border-2 transition-all',
                          i === selectedSolidBg && !backgroundImage && bgType === 'solid' ? 'border-shake-neon-pink' : 'border-transparent'
                        )}
                        style={{ background: bg.value }}
                      />
                      <span className="text-[9px] text-shake-text-muted">{bg.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTool === 'draw' && (
          <motion.div
            key="draw"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-center gap-2 rounded-xl bg-shake-dark/80 p-4 text-center">
              <Pencil className="h-5 w-5 text-shake-text-muted" />
              <span className="text-sm text-shake-text-muted">Zeichnen kommt bald!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
