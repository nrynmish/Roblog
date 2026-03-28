'use client'

import { useState } from 'react'
import { Zap, Loader2, AlertCircle } from 'lucide-react'
import { Blog } from '@/lib/api'
import { useGenerate } from '@/hooks/useBlogs'

interface GeneratePanelProps {
  onGenerated: (blog: Blog) => void
}

export function GeneratePanel({ onGenerated }: GeneratePanelProps) {
  const [keyword, setKeyword] = useState('')
  const { generate, loading, error } = useGenerate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!keyword.trim()) return
    const blog = await generate(keyword.trim())
    if (blog) {
      onGenerated(blog)
      setKeyword('')
    }
  }

  return (
    <div
      className="rounded-lg p-6 relative overflow-hidden"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      {/* Decorative corner accent */}
      <div
        className="absolute top-0 right-0 w-24 h-24 opacity-10"
        style={{
          background: 'radial-gradient(circle at top right, var(--accent), transparent)',
        }}
      />

      <div className="flex items-center gap-2 mb-1">
        <Zap size={14} style={{ color: 'var(--accent)' }} />
        <span
          className="text-xs uppercase tracking-widest"
          style={{ color: 'var(--accent)' }}
        >
          Generate
        </span>
      </div>
      <p className="text-xs mb-5" style={{ color: 'var(--text-dim)' }}>
        Enter a keyword and the LLM will produce a full SEO-optimized post.
      </p>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1 relative">
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-xs select-none"
            style={{ color: 'var(--muted)' }}
          >
            &gt;_
          </span>
          <input
            type="text"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            placeholder="e.g. AI marketing"
            disabled={loading}
            className="w-full pl-9 pr-4 py-2.5 rounded text-sm outline-none transition-all"
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              fontFamily: 'var(--font-mono)',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !keyword.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded text-sm font-bold transition-all disabled:opacity-40"
          style={{
            background: loading ? 'var(--accent-dim)' : 'var(--accent)',
            color: loading ? 'var(--accent)' : 'var(--bg)',
            fontFamily: 'var(--font-display)',
          }}
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>generating...</span>
            </>
          ) : (
            <>
              <Zap size={14} />
              <span>Run</span>
            </>
          )}
        </button>
      </form>

      {loading && (
        <div className="mt-4 flex items-center gap-2 text-xs" style={{ color: 'var(--text-dim)' }}>
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--accent)', animation: 'pulse 1s ease-in-out infinite' }}
          />
          Loading model and generating content — this may take a minute...
        </div>
      )}

      {error && (
        <div
          className="mt-4 flex items-center gap-2 text-xs p-3 rounded"
          style={{ background: 'rgba(255,107,53,0.1)', color: 'var(--accent-orange)', border: '1px solid rgba(255,107,53,0.3)' }}
        >
          <AlertCircle size={13} />
          {error}
        </div>
      )}
    </div>
  )
}
