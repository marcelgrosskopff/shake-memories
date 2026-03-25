'use client'

import { cn } from '@/lib/utils'

const sizes = {
  sm: { ball: 48, viewBox: 80 },
  md: { ball: 80, viewBox: 140 },
  lg: { ball: 120, viewBox: 200 },
}

export function DiscoBall({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const { ball, viewBox } = sizes[size]
  const r = ball / 2
  const cx = viewBox / 2
  const cy = viewBox / 2

  return (
    <div className={cn('relative inline-block', className)}>
      <svg
        width={viewBox}
        height={viewBox}
        viewBox={`0 0 ${viewBox} ${viewBox}`}
        className="disco-ball-svg"
      >
        <defs>
          {/* Main ball gradient */}
          <radialGradient id={`ballGrad-${size}`} cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#e8e8e8" />
            <stop offset="40%" stopColor="#b0b0b0" />
            <stop offset="70%" stopColor="#707070" />
            <stop offset="100%" stopColor="#383838" />
          </radialGradient>

          {/* Highlight */}
          <radialGradient id={`highlight-${size}`} cx="30%" cy="25%" r="30%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>

          {/* Clip for facets */}
          <clipPath id={`ballClip-${size}`}>
            <circle cx={cx} cy={cy} r={r} />
          </clipPath>
        </defs>

        {/* Light reflection particles shooting out */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30) * Math.PI / 180
          const startX = cx + Math.cos(angle) * (r + 2)
          const startY = cy + Math.sin(angle) * (r + 2)
          const endX = cx + Math.cos(angle) * (r + 15 + (i % 3) * 8)
          const endY = cy + Math.sin(angle) * (r + 15 + (i % 3) * 8)
          const colors = ['#ff2d78', '#00d4ff', '#ffd700', '#b44dff']
          return (
            <line
              key={`ray-${i}`}
              x1={startX}
              y1={startY}
              x2={endX}
              y2={endY}
              stroke={colors[i % colors.length]}
              strokeWidth={1}
              opacity={0.5}
              className="disco-ray"
              style={{
                animationDelay: `${i * 0.25}s`,
                animationDuration: `${2 + (i % 3) * 0.5}s`,
              }}
            />
          )
        })}

        {/* Sparkle dots around the ball */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 45 + 15) * Math.PI / 180
          const dist = r + 10 + (i % 2) * 12
          const px = cx + Math.cos(angle) * dist
          const py = cy + Math.sin(angle) * dist
          const colors = ['#ff2d78', '#00d4ff', '#ffd700', '#b44dff']
          return (
            <circle
              key={`sparkle-${i}`}
              cx={px}
              cy={py}
              r={1.5}
              fill={colors[i % colors.length]}
              className="disco-sparkle"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          )
        })}

        {/* Main ball body */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill={`url(#ballGrad-${size})`}
        />

        {/* Facet grid - rotating group */}
        <g clipPath={`url(#ballClip-${size})`} className="disco-facets">
          {/* Horizontal lines */}
          {Array.from({ length: 9 }).map((_, i) => {
            const y = cy - r + (i + 1) * (ball / 10)
            return (
              <line
                key={`h-${i}`}
                x1={cx - r}
                y1={y}
                x2={cx + r}
                y2={y}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth={0.5}
              />
            )
          })}
          {/* Vertical lines (curved look via multiple) */}
          {Array.from({ length: 11 }).map((_, i) => {
            const x = cx - r + (i + 1) * (ball / 12)
            return (
              <line
                key={`v-${i}`}
                x1={x}
                y1={cy - r}
                x2={x}
                y2={cy + r}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth={0.5}
              />
            )
          })}

          {/* Shimmer facets that move */}
          {Array.from({ length: 6 }).map((_, i) => {
            const fx = cx - r / 2 + (i % 3) * (r / 2)
            const fy = cy - r / 2 + Math.floor(i / 3) * (r / 2)
            return (
              <rect
                key={`facet-${i}`}
                x={fx}
                y={fy}
                width={r / 3}
                height={r / 4}
                fill="rgba(255,255,255,0.2)"
                rx={1}
                className="disco-facet-shine"
                style={{ animationDelay: `${i * 0.5}s` }}
              />
            )
          })}
        </g>

        {/* Highlight overlay */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill={`url(#highlight-${size})`}
          opacity={0.6}
        />

        {/* Hanging wire */}
        <line
          x1={cx}
          y1={0}
          x2={cx}
          y2={cy - r}
          stroke="rgba(255,255,255,0.3)"
          strokeWidth={1}
        />
      </svg>

      <style jsx>{`
        .disco-ball-svg {
          filter: drop-shadow(0 0 12px rgba(255,45,120,0.3)) drop-shadow(0 0 24px rgba(0,212,255,0.2));
        }

        .disco-facets {
          animation: disco-rotate 20s linear infinite;
          transform-origin: ${cx}px ${cy}px;
        }

        @keyframes disco-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .disco-ray {
          animation: ray-pulse 2s ease-in-out infinite alternate;
        }

        @keyframes ray-pulse {
          0% { opacity: 0.2; stroke-width: 0.5; }
          100% { opacity: 0.7; stroke-width: 1.5; }
        }

        .disco-sparkle {
          animation: sparkle-blink 1.5s ease-in-out infinite alternate;
        }

        @keyframes sparkle-blink {
          0% { opacity: 0.3; r: 1; }
          100% { opacity: 1; r: 2.5; }
        }

        .disco-facet-shine {
          animation: facet-shimmer 3s ease-in-out infinite;
        }

        @keyframes facet-shimmer {
          0%, 100% { opacity: 0.05; }
          50% { opacity: 0.35; }
        }
      `}</style>
    </div>
  )
}
