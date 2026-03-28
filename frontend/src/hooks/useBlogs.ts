'use client'

import { useState, useEffect, useCallback } from 'react'
import { api, Blog } from '@/lib/api'

export function useBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getBlogs()
      setBlogs(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch blogs')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBlogs()
  }, [fetchBlogs])

  const deleteBlog = async (id: string) => {
    await api.deleteBlog(id)
    setBlogs(prev => prev.filter(b => b.id !== id))
  }

  return { blogs, loading, error, refetch: fetchBlogs, deleteBlog }
}

export function useGenerate() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = async (keyword: string): Promise<Blog | null> => {
    try {
      setLoading(true)
      setError(null)
      const blog = await api.generateBlog(keyword)
      return blog
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { generate, loading, error }
}
