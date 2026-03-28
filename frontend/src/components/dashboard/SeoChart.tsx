'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts'
import { Blog } from '@/lib/api'

interface SeoChartProps {
  blogs: Blog[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div
      className="px-3 py-2 rounded text-xs"
      style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        color: 'var(--text)',
        fontFamily: 'var(--font-mono)',
      }}
    >
      <div style={{ color: 'var(--text-dim)' }}>{label}</div>
      <div style={{ color: 'var(--accent-green)' }}>SEO: {payload[0]?.value}</div>
      {payload[1] && <div style={{ color: 'var(--accent)' }}>Readability: {payload[1]?.value}</div>}
    </div>
  )
}

export function SeoChart({ blogs }: SeoChartProps) {
  if (blogs.length === 0) return null

  const data = blogs.slice(-10).map(b => ({
    name: b.keyword.length > 12 ? b.keyword.slice(0, 12) + '…' : b.keyword,
    seo: b.seo_score,
    readability: Math.round(b.readability_score),
  }))

  return (
    <div
      className="rounded-lg p-5"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
          Score History
        </span>
        <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-dim)' }}>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'var(--accent-green)' }} />
            SEO
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />
            Readability
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barGap={4}>
          <XAxis
            dataKey="name"
            tick={{ fill: 'var(--text-dim)', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: 'var(--text-dim)', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <ReferenceLine y={70} stroke="rgba(0,255,136,0.2)" strokeDasharray="4 4" />
          <Bar dataKey="seo" radius={[2, 2, 0, 0]} maxBarSize={20}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.seo >= 70 ? 'var(--accent-green)' : 'var(--accent-orange)'}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
          <Bar dataKey="readability" radius={[2, 2, 0, 0]} maxBarSize={20} fill="var(--accent)" fillOpacity={0.5} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
