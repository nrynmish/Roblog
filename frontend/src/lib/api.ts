const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface HeadingStructure {
  h1: number
  h2: number
  h3: number
  has_proper_structure: boolean
}

export interface Blog {
  id: string
  keyword: string
  title: string
  content: string
  seo_score: number
  readability_score: number
  keyword_density: number
  word_count: number
  heading_structure: HeadingStructure
  status: string
  created_at: string
}

export interface GenerateRequest {
  keyword: string
}

export interface HealthStatus {
  status: string
  model_loaded: boolean
  db_connected: boolean
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || `Request failed: ${res.status}`)
  }
  return res.json()
}

export const api = {
  health: () => request<HealthStatus>('/api/v1/health/model'),

  generateBlog: (keyword: string) =>
    request<Blog>('/api/v1/generate-blog', {
      method: 'POST',
      body: JSON.stringify({ keyword }),
    }),

  getBlogs: async (): Promise<Blog[]> => {
    const res = await request<{ count: number; blogs: any[] }>('/api/v1/blogs')
    return (res.blogs || []).map(b => ({
      ...b,
      id: b.id ?? b._id,
      seo_score: b.seo_score ?? 0,
      readability_score: b.readability_score ?? 0,
      keyword_density: b.keyword_density ?? 0,
      word_count: b.word_count ?? 0,
      heading_structure: b.heading_structure ?? { h1: 0, h2: 0, h3: 0, has_proper_structure: false },
      content: b.content ?? '',
      status: b.status ?? 'unknown',
    }))
  },

  getBlog: (id: string) => request<Blog>(`/api/v1/blogs/${id}`),

  deleteBlog: (id: string) =>
    request<void>(`/api/v1/blogs/${id}`, { method: 'DELETE' }),
}