'use client'

import { useState } from 'react'
import { Trash2, ChevronRight, FileText } from 'lucide-react'
import { Blog } from '@/lib/api'
import { ScoreRing } from '@/components/ui/ScoreRing'

interface BlogCardProps {
  blog: Blog
  onDelete: (id: string) => void
  onClick: (blog: Blog) => void
}

export function BlogCard({ blog, onDelete, onClick }: BlogCardProps) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Delete this blog?')) return
    setDeleting(true)
    await onDelete(blog.id)
  }

  const date = new Date(blog.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <div
      onClick={() => onClick(blog)}
      className={`group relative cursor-pointer rounded-lg p-4 transition-all duration-200 ${deleting ? 'opacity-40' : ''}`}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'
        ;(e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
        ;(e.currentTarget as HTMLElement).style.background = 'var(--surface)'
      }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <FileText size={12} style={{ color: 'var(--accent)' }} />
            <span
              className="text-xs uppercase tracking-widest px-2 py-0.5 rounded"
              style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
            >
              {blog.keyword}
            </span>
          </div>
          <h3
            className="text-sm font-bold leading-snug truncate"
            style={{ color: 'var(--text)', fontFamily: 'var(--font-display)' }}
          >
            {blog.title}
          </h3>
        </div>
        <ScoreRing score={blog.seo_score} size={56} />
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-dim)' }}>
        <span>{blog.word_count?.toLocaleString() ?? '—'} words</span>
        <span style={{ color: 'var(--border)' }}>|</span>
        <span>readability {blog.readability_score?.toFixed(0) ?? 'N/A'}</span>
        <span style={{ color: 'var(--border)' }}>|</span>
        <span>{date}</span>
      </div>

      {/* Actions */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleDelete}
          className="p-1.5 rounded transition-colors"
          style={{ color: 'var(--muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-orange)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
        >
          <Trash2 size={13} />
        </button>
        <ChevronRight size={13} style={{ color: 'var(--accent)' }} />
      </div>
    </div>
  )
}
