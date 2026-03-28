'use client'

import { useState, useEffect } from 'react'
import { X, Hash, AlignLeft, BarChart2, FileText, Loader2 } from 'lucide-react'
import { api, Blog } from '@/lib/api'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { StatBar } from '@/components/ui/StatBar'

interface BlogDetailProps {
  blog: Blog
  onClose: () => void
}

export function BlogDetail({ blog, onClose }: BlogDetailProps) {
  const [full, setFull] = useState<Blog>(blog)
  const [loadingFull, setLoadingFull] = useState(true)

  useEffect(() => {
    setLoadingFull(true)
    api.getBlog(blog.id)
      .then(data => setFull({ ...data, id: (data as any).id ?? (data as any)._id }))
      .catch(() => setFull(blog))
      .finally(() => setLoadingFull(false))
  }, [blog.id])

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end"
      style={{ background: 'rgba(8,11,15,0.8)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="h-full w-full max-w-2xl overflow-y-auto animate-fade-in"
        style={{ background: 'var(--surface)', borderLeft: '1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between p-5"
          style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
        >
          <div>
            <span
              className="text-xs uppercase tracking-widest px-2 py-0.5 rounded"
              style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
            >
              {full.keyword}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded transition-colors"
            style={{ color: 'var(--muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Title */}
          <h2
            className="text-xl font-bold leading-snug"
            style={{ color: 'var(--text)', fontFamily: 'var(--font-display)' }}
          >
            {full.title}
          </h2>

          {/* Score rings */}
          <div
            className="grid grid-cols-2 gap-4 p-4 rounded-lg"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-4">
              <ScoreRing score={full.seo_score ?? 0} size={72} label="SEO Score" />
              <ScoreRing score={Math.round(full.readability_score ?? 0)} size={72} label="Readability" />
            </div>
            <div className="flex flex-col justify-center gap-2">
              <div className="flex items-center gap-2">
                <FileText size={12} style={{ color: 'var(--text-dim)' }} />
                <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
                  {full.word_count?.toLocaleString() ?? '—'} words
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Hash size={12} style={{ color: 'var(--text-dim)' }} />
                <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
                  {full.keyword_density?.toFixed(2) ?? 'N/A'}% keyword density
                </span>
              </div>
              <div className="flex items-center gap-2">
                <AlignLeft size={12} style={{ color: 'var(--text-dim)' }} />
                <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
                  H1: {full.heading_structure?.h1 ?? 0} · H2: {full.heading_structure?.h2 ?? 0} · H3: {full.heading_structure?.h3 ?? 0}
                </span>
              </div>
            </div>
          </div>

          {/* SEO Metrics */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 size={13} style={{ color: 'var(--accent)' }} />
              <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
                SEO Metrics
              </span>
            </div>
            <div className="space-y-4">
              <StatBar label="SEO Score" value={full.seo_score ?? 0} ideal={[70, 100]} />
              <StatBar label="Readability (Flesch)" value={full.readability_score ?? 0} ideal={[60, 80]} />
              <StatBar label="Keyword Density" value={full.keyword_density ?? 0} max={5} unit="%" ideal={[1.0, 2.5]} />
              <StatBar label="Word Count" value={full.word_count ?? 0} max={2000} ideal={[1200, 2000]} />
            </div>
          </div>

          {/* Heading structure */}
          <div
            className="p-4 rounded-lg"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <AlignLeft size={13} style={{ color: 'var(--accent)' }} />
              <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
                Heading Structure
              </span>
              {full.heading_structure?.has_proper_structure && (
                <span
                  className="text-xs px-2 py-0.5 rounded ml-auto"
                  style={{ background: 'rgba(0,255,136,0.1)', color: 'var(--accent-green)' }}
                >
                  ✓ proper
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(['h1', 'h2', 'h3'] as const).map(h => (
                <div
                  key={h}
                  className="text-center p-3 rounded"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <div
                    className="text-2xl font-bold"
                    style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}
                  >
                    {full.heading_structure?.[h] ?? 0}
                  </div>
                  <div className="text-xs uppercase tracking-widest mt-1" style={{ color: 'var(--text-dim)' }}>
                    {h.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText size={13} style={{ color: 'var(--accent)' }} />
              <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
                Content
              </span>
              {loadingFull && <Loader2 size={12} className="animate-spin ml-1" style={{ color: 'var(--muted)' }} />}
            </div>
            <div
              className="p-4 rounded-lg text-sm leading-relaxed whitespace-pre-wrap"
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                color: 'var(--text-dim)',
                fontFamily: 'var(--font-mono)',
                minHeight: 80,
              }}
            >
              {loadingFull ? (
                <span style={{ color: 'var(--muted)' }}>loading content...</span>
              ) : full.content || (
                <span style={{ color: 'var(--muted)' }}>no content available</span>
              )}
            </div>
          </div>

          <div className="text-xs pb-4" style={{ color: 'var(--muted)' }}>
            Generated: {new Date(full.created_at).toLocaleString()} · ID: {full.id}
          </div>
        </div>
      </div>
    </div>
  )
}