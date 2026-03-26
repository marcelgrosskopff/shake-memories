'use client'

import { cn } from '@/lib/utils'

const sizes = {
  sm: { ball: 48, viewBox: 64 },
  md: { ball: 80, viewBox: 100 },
  lg: { ball: 100, viewBox: 130 },
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
            <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>

          {/* Clip for facets */}
          <clipPath id={`ballClip-${size}`}>
            <circle cx={cx} cy={cy} r={r} />
          </clipPath>
        </defs>

        {/* Main ball body */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill={`url(#ballGrad-${size})`}
        />

        {/* Facet grid */}
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
                stroke="rgba(255,255,255,0.12)"
                strokeWidth={0.5}
              />
            )
          })}
          {/* Vertical lines */}
          {Array.from({ length: 11 }).map((_, i) => {
            const x = cx - r + (i + 1) * (ball / 12)
            return (
              <line
                key={`v-${i}`}
                x1={x}
                y1={cy - r}
                x2={x}
                y2={cy + r}
                stroke="rgba(255,255,255,0.09)"
                strokeWidth={0.5}
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
          opacity={0.5}
        />

        {/* Hanging wire */}
        <line
          x1={cx}
          y1={0}
          x2={cx}
          y2={cy - r}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={1}
        />
      </svg>

      <style jsx>{`
        .disco-ball-svg {
          filter: drop-shadow(0 0 8px rgba(255,255,255,0.1));
        }

        .disco-facets {
          animation: disco-rotate 30s linear infinite;
          transform-origin: ${cx}px ${cy}px;
        }

        @keyframes disco-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
