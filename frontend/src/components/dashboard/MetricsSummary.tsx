'use client'

import { Blog } from '@/lib/api'
import { TrendingUp, FileText, BarChart2, BookOpen } from 'lucide-react'

interface MetricsSummaryProps {
  blogs: Blog[]
}

export function MetricsSummary({ blogs }: MetricsSummaryProps) {
  if (blogs.length === 0) return null

  const avg = (fn: (b: Blog) => number) =>
    Math.round(blogs.reduce((s, b) => s + fn(b), 0) / blogs.length)

  const avgSeo = avg(b => b.seo_score)
  const avgRead = avg(b => b.readability_score)
  const totalWords = blogs.reduce((s, b) => s + b.word_count, 0)
  const total = blogs.length

  const stats = [
    { label: 'Blogs Generated', value: total, unit: '', icon: FileText, color: 'var(--accent)' },
    { label: 'Avg SEO Score', value: avgSeo, unit: '/100', icon: TrendingUp, color: 'var(--accent-green)' },
    { label: 'Avg Readability', value: avgRead, unit: '', icon: BookOpen, color: 'var(--accent)' },
    { label: 'Total Words', value: totalWords.toLocaleString(), unit: '', icon: BarChart2, color: 'var(--accent-green)' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map(({ label, value, unit, icon: Icon, color }) => (
        <div
          key={label}
          className="rounded-lg p-4"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>
              {label}
            </span>
            <Icon size={12} style={{ color }} />
          </div>
          <div
            className="text-2xl font-bold"
            style={{ color, fontFamily: 'var(--font-display)' }}
          >
            {value}{unit}
          </div>
        </div>
      ))}
    </div>
  )
}
