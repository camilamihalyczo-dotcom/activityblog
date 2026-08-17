import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { formatPostDate } from '../data/blog.js'
import { renderMarkdown } from '../lib/markdown.js'
import TicketHeader from '../components/TicketHeader.jsx'

export default function AdultosBlogPage() {
  const [posts, setPosts] = useState([])
  const [status, setStatus] = useState('loading') // loading | error | ready

  useEffect(() => {
    let active = true
    supabase
      .from('blog_posts')
      .select('*')
      .eq('audience', 'adultos')
      .order('date', { ascending: false })
      .then(({ data, error }) => {
        if (!active) return
        if (error) {
          setStatus('error')
          return
        }
        setPosts(data)
        setStatus('ready')
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="min-h-screen">
      <TicketHeader crumbs={['Adultos', 'Blog']} backTo="/adultos" />
      <div className="max-w-2xl mx-auto px-5 py-12 sm:py-16">
        <span className="inline-block font-mono text-[10px] uppercase tracking-widest border rounded-full px-3 py-1 mb-3 text-brand border-brand">
          Blog
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink mb-2">Novedades y reflexiones</h1>
        <p className="text-ink/60 mb-10">
          Un espacio aparte de las clases: novedades del curso, tips para practicar y alguna reflexión sobre aprender inglés.
        </p>

        {status === 'loading' && <p className="text-ink/50 text-sm">Cargando…</p>}
        {status === 'error' && (
          <p className="text-stamp text-sm">No pudimos cargar el blog ahora mismo. Probá de nuevo en un rato.</p>
        )}
        {status === 'ready' && posts.length === 0 && (
          <p className="text-ink/50 text-sm">Todavía no hay posts publicados.</p>
        )}

        <div className="flex flex-col gap-8">
          {posts.map((post) => (
            <article key={post.id} className="texture-card rounded-2xl border-t-4 border-t-brand p-6 sm:p-8">
              {post.image_url && (
                <img
                  src={post.image_url}
                  alt=""
                  className="w-full aspect-video object-cover rounded-xl mb-5"
                  loading="lazy"
                />
              )}
              <p className="font-mono text-xs text-ink/40 mb-2 uppercase tracking-wider">{formatPostDate(post.date)}</p>
              <h2 className="font-display text-xl sm:text-2xl font-semibold text-ink mb-3">{post.title}</h2>
              <div
                className="post-body text-ink/80 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }}
              />
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
