import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { formatPostDate } from '../data/blog.js'
import { renderMarkdown } from '../lib/markdown.js'
import KidsHeader from '../components/KidsHeader.jsx'
import KidsBlobs from '../components/KidsBlobs.jsx'

export default function InfanciasBlogPage() {
  const [posts, setPosts] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let active = true
    supabase
      .from('blog_posts')
      .select('*')
      .eq('audience', 'infancias')
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
    <div className="relative min-h-screen bg-kidsCream">
      <KidsHeader crumbs={['Infancias y adolescentes', 'Blog']} backTo="/infancias" />
      <div className="relative max-w-2xl mx-auto px-5 py-12 sm:py-16 overflow-hidden">
        <KidsBlobs />
        <span className="inline-block font-playful font-semibold text-xs uppercase tracking-wide text-kidsInk bg-kidsPurple px-4 py-1.5 rounded-full mb-5">
          Blog 📰
        </span>
        <h1 className="font-body font-extrabold uppercase tracking-wide text-3xl sm:text-4xl text-kidsInk mb-2 leading-tight">
          Novedades del club
        </h1>
        <p className="font-playful text-kidsInk/70 mb-10 max-w-lg">
          Noticias, ideas para reforzar el inglés en casa y alguna reflexión, para las familias de English Kids Club.
        </p>

        {status === 'loading' && <p className="font-playful text-kidsInk/70 text-sm">Cargando…</p>}
        {status === 'error' && (
          <p className="font-playful text-kidsRed text-sm">No pudimos cargar el blog ahora mismo. Probá de nuevo en un rato.</p>
        )}
        {status === 'ready' && posts.length === 0 && (
          <p className="font-playful text-kidsInk/70 text-sm">Todavía no hay posts publicados.</p>
        )}

        <div className="relative flex flex-col gap-6">
          {posts.map((post) => (
            <article key={post.id} className="bg-white rounded-[22px] shadow-kids border-t-8 border-kidsPurpleDeep p-6 sm:p-8">
              {post.image_url && (
                <img
                  src={post.image_url}
                  alt=""
                  className="w-full aspect-video object-cover rounded-2xl mb-5"
                  loading="lazy"
                />
              )}
              <p className="font-playful text-xs text-kidsInk/70 mb-2 font-semibold uppercase tracking-wide">{formatPostDate(post.date)}</p>
              <h2 className="font-body font-extrabold uppercase tracking-wide text-lg sm:text-xl text-kidsInk mb-3">{post.title}</h2>
              <div
                className="post-body font-playful text-kidsInk/80 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }}
              />
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
