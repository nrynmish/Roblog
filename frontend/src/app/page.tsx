'use client'

import { useState } from 'react'
import { Blog } from '@/lib/api'
import { useBlogs } from '@/hooks/useBlogs'
import { GeneratePanel } from '@/components/dashboard/GeneratePanel'
import { BlogCard } from '@/components/dashboard/BlogCard'
import { BlogDetail } from '@/components/dashboard/BlogDetail'
import { MetricsSummary } from '@/components/dashboard/MetricsSummary'
import { SeoChart } from '@/components/dashboard/SeoChart'
import { RefreshCw, Cpu, Database, AlertCircle } from 'lucide-react'

export default function DashboardPage() {
  const { blogs, loading, error, refetch, deleteBlog } = useBlogs()
  const [selected, setSelected] = useState<Blog | null>(null)
  const [search, setSearch] = useState('')

  const filtered = blogs.filter(
    b =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.keyword.toLowerCase().includes(search.toLowerCase())
  )

  const handleGenerated = async (blog: Blog) => {
    await refetch()
    setSelected(blog)
  }

  return (
    <div className="min-h-screen grid-bg relative">
      {/* Scanline overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,212,255,0.5) 2px, rgba(0,212,255,0.5) 4px)',
          backgroundSize: '100% 4px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-6">

        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }}
              />
              <span
                className="text-2xl font-bold tracking-tight"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)', textShadow: '0 0 20px rgba(0,212,255,0.4)' }}
              >
                ROBLOG
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded uppercase tracking-widest"
                style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(0,212,255,0.3)' }}
              >
                v1.0
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
              AI-powered SEO blog generation · FastAPI · TinyLlama · MongoDB
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-dim)' }}>
              <Cpu size={12} style={{ color: 'var(--accent-green)' }} />
              <span style={{ color: 'var(--accent-green)' }}>model online</span>
            </div>
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-dim)' }}>
              <Database size={12} style={{ color: 'var(--accent-green)' }} />
              <span style={{ color: 'var(--accent-green)' }}>db connected</span>
            </div>
            <button
              onClick={refetch}
              className="p-2 rounded transition-colors"
              style={{ color: 'var(--muted)', border: '1px solid var(--border)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </header>

        {/* Generate panel */}
        <div className="mb-6">
          <GeneratePanel onGenerated={handleGenerated} />
        </div>

        {/* Metrics summary */}
        <div className="mb-6 stagger">
          <MetricsSummary blogs={blogs} />
        </div>

        {/* Chart */}
        {blogs.length > 1 && (
          <div className="mb-6">
            <SeoChart blogs={blogs} />
          </div>
        )}

        {/* Blog list */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
              Generated Blogs <span style={{ color: 'var(--muted)' }}>({filtered.length})</span>
            </span>
            {blogs.length > 0 && (
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="search..."
                className="text-xs px-3 py-1.5 rounded outline-none"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  fontFamily: 'var(--font-mono)',
                  width: 180,
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
            )}
          </div>

          {error && (
            <div
              className="flex items-center gap-2 text-xs p-3 rounded mb-4"
              style={{ background: 'rgba(255,107,53,0.1)', color: 'var(--accent-orange)', border: '1px solid rgba(255,107,53,0.3)' }}
            >
              <AlertCircle size={13} />
              {error} — Is the backend running on port 8000?
            </div>
          )}

          {loading && blogs.length === 0 ? (
            <div className="text-xs text-center py-16" style={{ color: 'var(--text-dim)' }}>
              <div className="mb-2">
                <span className="cursor-blink">_</span>
              </div>
              connecting to backend...
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="text-xs text-center py-16 rounded-lg"
              style={{ color: 'var(--text-dim)', border: '1px dashed var(--border)' }}
            >
              {search ? `no results for "${search}"` : 'no blogs yet — generate your first one above'}
            </div>
          ) : (
            <div className="grid gap-3 stagger">
              {filtered.map(blog => (
                <BlogCard
                  key={blog.id}
                  blog={blog}
                  onDelete={deleteBlog}
                  onClick={setSelected}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Blog detail panel */}
      {selected && (
        <BlogDetail blog={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
