'use client'

interface ScoreRingProps {
  score: number
  size?: number
  label?: string
  color?: string
}

export function ScoreRing({ score, size = 80, label, color = '#00d4ff' }: ScoreRingProps) {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const getColor = (s: number) => {
    if (s >= 70) return '#00ff88'
    if (s >= 50) return '#00d4ff'
    return '#ff6b35'
  }

  const ringColor = color === '#00d4ff' ? getColor(score) : color

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox="0 0 80 80">
        {/* Track */}
        <circle
          cx="40" cy="40" r={radius}
          fill="none"
          stroke="#1e2d3d"
          strokeWidth="4"
        />
        {/* Fill */}
        <circle
          cx="40" cy="40" r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="score-ring"
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '40px 40px',
            transition: 'stroke-dashoffset 1s ease',
            filter: `drop-shadow(0 0 6px ${ringColor}60)`,
          }}
        />
        {/* Value */}
        <text
          x="40" y="44"
          textAnchor="middle"
          fill={ringColor}
          fontSize="16"
          fontFamily="Space Mono, monospace"
          fontWeight="700"
        >
          {score}
        </text>
      </svg>
      {label && (
        <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>
          {label}
        </span>
      )}
    </div>
  )
}
