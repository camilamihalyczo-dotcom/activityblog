import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient.js'

const EMPTY_FORM = { id: null, audience: 'adultos', slug: '', date: '', title: '', body: '' }

export default function AdminBlogPage() {
  const [posts, setPosts] = useState([])
  const [status, setStatus] = useState('loading') // loading | error | ready
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loadPosts = () => {
    setStatus('loading')
    supabase
      .from('blog_posts')
      .select('*')
      .order('date', { ascending: false })
      .then(({ data, error: loadError }) => {
        if (loadError) {
          setStatus('error')
          return
        }
        setPosts(data)
        setStatus('ready')
      })
  }

  useEffect(loadPosts, [])

  const startEdit = (post) => {
    setForm(post)
    setError('')
  }

  const startNew = () => {
    setForm(EMPTY_FORM)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      audience: form.audience,
      slug: form.slug.trim(),
      date: form.date,
      title: form.title.trim(),
      body: form.body,
    }

    const { error: saveError } = form.id
      ? await supabase.from('blog_posts').update(payload).eq('id', form.id)
      : await supabase.from('blog_posts').insert(payload)

    setSaving(false)

    if (saveError) {
      setError(
        saveError.code === '23505'
          ? 'Ya existe un post con ese slug para ese público — usá otro.'
          : saveError.message
      )
      return
    }

    setForm(EMPTY_FORM)
    loadPosts()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Borrar este post? No se puede deshacer.')) return
    await supabase.from('blog_posts').delete().eq('id', id)
    loadPosts()
  }

  return (
    <div>
      <Link to="/admin" className="text-ink/50 hover:text-ink text-sm font-medium mb-4 inline-block">
        ← Volver al panel
      </Link>
      <h1 className="font-display text-3xl font-semibold text-ink mb-2">Blog</h1>
      <p className="text-ink/60 mb-8">Un post por fila. La fecha define el orden (más nueva arriba).</p>

      <form onSubmit={handleSubmit} className="texture-card rounded-2xl p-6 mb-10 flex flex-col gap-4">
        <p className="font-mono text-xs uppercase tracking-widest text-ink/50">
          {form.id ? 'Editar post' : 'Nuevo post'}
        </p>

        <div className="flex gap-4 flex-wrap">
          <label className="flex-1 min-w-[160px]">
            <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">Público</span>
            <select
              value={form.audience}
              onChange={(e) => setForm({ ...form, audience: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm"
            >
              <option value="adultos">Adultos</option>
              <option value="infancias">Infancias</option>
            </select>
          </label>
          <label className="flex-1 min-w-[160px]">
            <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">Fecha</span>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm"
            />
          </label>
        </div>

        <label>
          <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">
            Slug (identificador único, sin espacios ni tildes)
          </span>
          <input
            required
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="ej: bienvenida-al-blog"
            className="w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm"
          />
        </label>

        <label>
          <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">Título</span>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm"
          />
        </label>

        <label>
          <span className="block text-xs font-mono uppercase tracking-wide text-ink/50 mb-1">Texto</span>
          <textarea
            required
            rows={6}
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm resize-y"
          />
        </label>

        {error && <p className="text-stamp text-sm">{error}</p>}

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-ink text-cream font-semibold px-5 py-2.5 rounded-lg hover:bg-brand transition-colors disabled:opacity-50"
          >
            {saving ? 'Guardando…' : form.id ? 'Guardar cambios' : 'Publicar'}
          </button>
          {form.id && (
            <button type="button" onClick={startNew} className="text-ink/60 hover:text-ink text-sm font-medium underline">
              Cancelar edición
            </button>
          )}
        </div>
      </form>

      {status === 'loading' && <p className="text-ink/50 text-sm">Cargando…</p>}
      {status === 'error' && <p className="text-stamp text-sm">No pudimos cargar los posts.</p>}

      <div className="flex flex-col gap-3">
        {posts.map((post) => (
          <div key={post.id} className="texture-card rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink/40">
                {post.audience} · {post.date}
              </p>
              <p className="font-display font-semibold text-ink truncate">{post.title}</p>
            </div>
            <div className="flex gap-3 shrink-0">
              <button onClick={() => startEdit(post)} className="text-brand hover:underline text-sm font-medium">
                Editar
              </button>
              <button onClick={() => handleDelete(post.id)} className="text-stamp hover:underline text-sm font-medium">
                Borrar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
