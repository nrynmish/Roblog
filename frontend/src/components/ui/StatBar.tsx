'use client'

interface StatBarProps {
  label: string
  value: number
  max?: number
  unit?: string
  ideal?: [number, number]
}

export function StatBar({ label, value, max = 100, unit = '', ideal }: StatBarProps) {
  const pct = Math.min((value / max) * 100, 100)

  const isIdeal = ideal ? value >= ideal[0] && value <= ideal[1] : true
  const barColor = isIdeal ? 'var(--accent-green)' : 'var(--accent-orange)'

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>
          {label}
        </span>
        <span className="text-sm font-bold" style={{ color: barColor }}>
          {typeof value === 'number' && !Number.isInteger(value)
            ? value.toFixed(2)
            : value}
          {unit}
        </span>
      </div>
      <div
        className="h-1 rounded-full overflow-hidden"
        style={{ background: 'var(--border)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${pct}%`,
            background: barColor,
            boxShadow: `0 0 8px ${barColor}80`,
          }}
        />
      </div>
      {ideal && (
        <span className="text-xs" style={{ color: 'var(--muted)' }}>
          ideal: {ideal[0]}–{ideal[1]}{unit}
        </span>
      )}
    </div>
  )
}
