import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient.js'
import { renderMarkdown } from '../../lib/markdown.js'
import { uploadImage, deleteImage } from '../../lib/media.js'

const EMPTY_FORM = { id: null, audience: 'adultos', slug: '', date: '', title: '', body: '', image_url: null }

export default function AdminBlogPage() {
  const [posts, setPosts] = useState([])
  const [status, setStatus] = useState('loading') // loading | error | ready
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageError, setImageError] = useState('')
  const bodyRef = useRef(null)

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
    setPreview(false)
  }

  const startNew = () => {
    setForm(EMPTY_FORM)
    setError('')
    setPreview(false)
  }

  // ─── Herramientas de formato para el textarea ──────────────────────

  const wrapSelection = (before, after = before) => {
    const el = bodyRef.current
    if (!el) return
    const { selectionStart, selectionEnd, value } = el
    const selected = value.slice(selectionStart, selectionEnd)
    const next = value.slice(0, selectionStart) + before + selected + after + value.slice(selectionEnd)
    setForm((f) => ({ ...f, body: next }))
    requestAnimationFrame(() => {
      el.focus()
      el.selectionStart = selectionStart + before.length
      el.selectionEnd = selectionStart + before.length + selected.length
    })
  }

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setImageError('')
    setUploadingImage(true)
    try {
      const url = await uploadImage(file, 'blog')
      setForm((f) => ({ ...f, image_url: url }))
    } catch (err) {
      setImageError(err.message || 'No pudimos subir la imagen.')
    } finally {
      setUploadingImage(false)
    }
  }

  const removeImage = () => {
    deleteImage(form.image_url)
    setForm((f) => ({ ...f, image_url: null }))
  }

  const insertLink = () => {
    const el = bodyRef.current
    if (!el) return
    const { selectionStart, selectionEnd, value } = el
    const selected = value.slice(selectionStart, selectionEnd) || 'texto del link'
    const url = window.prompt('¿A qué URL apunta el link?', 'https://')
    if (!url) return
    const before = value.slice(0, selectionStart)
    const after = value.slice(selectionEnd)
    const inserted = `[${selected}](${url})`
    setForm((f) => ({ ...f, body: before + inserted + after }))
    requestAnimationFrame(() => {
      el.focus()
      const pos = before.length + inserted.length
      el.selectionStart = el.selectionEnd = pos
    })
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
      image_url: form.image_url || null,
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
    setPreview(false)
    loadPosts()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Borrar este post? No se puede deshacer.')) return
    await supabase.from('blog_posts').delete().eq('id', id)
    loadPosts()
  }

  return (
    <div>
      <Link to="/notas-profe" className="text-ink/60 hover:text-ink text-sm font-medium mb-4 inline-block">
        ← Volver al panel
      </Link>
      <h1 className="font-display text-3xl font-semibold text-ink mb-2">Blog</h1>
      <p className="text-ink/60 mb-8">Un post por fila. La fecha define el orden (más nueva arriba).</p>

      <form onSubmit={handleSubmit} className="texture-card rounded-2xl p-6 mb-10 flex flex-col gap-4">
        <p className="font-mono text-xs uppercase tracking-widest text-ink/60">
          {form.id ? 'Editar post' : 'Nuevo post'}
        </p>

        <div className="flex gap-4 flex-wrap">
          <label className="flex-1 min-w-[160px]">
            <span className="block text-xs font-mono uppercase tracking-wide text-ink/60 mb-1">Público</span>
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
            <span className="block text-xs font-mono uppercase tracking-wide text-ink/60 mb-1">Fecha</span>
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
          <span className="block text-xs font-mono uppercase tracking-wide text-ink/60 mb-1">
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
          <span className="block text-xs font-mono uppercase tracking-wide text-ink/60 mb-1">Título</span>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm"
          />
        </label>

        <div>
          <span className="block text-xs font-mono uppercase tracking-wide text-ink/60 mb-1">
            Imagen de portada (opcional)
          </span>
          {form.image_url ? (
            <div className="flex items-center gap-3">
              <img src={form.image_url} alt="" className="w-24 h-16 object-cover rounded-lg border-2 border-ink/15" />
              <button type="button" onClick={removeImage} className="text-stamp hover:underline text-sm font-medium">
                Quitar imagen
              </button>
            </div>
          ) : (
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={uploadingImage}
              className="text-sm text-ink/70"
            />
          )}
          {uploadingImage && <p className="text-ink/60 text-xs mt-1">Subiendo…</p>}
          {imageError && <p className="text-stamp text-xs mt-1">{imageError}</p>}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono uppercase tracking-wide text-ink/60 mr-1">Texto</span>
            <button
              type="button"
              disabled={preview}
              onClick={() => wrapSelection('**')}
              title="Negrita"
              className="px-2 py-1 rounded border-2 border-ink/15 text-xs font-bold hover:border-ink transition-colors disabled:opacity-30 disabled:hover:border-ink/15"
            >
              N
            </button>
            <button
              type="button"
              disabled={preview}
              onClick={() => wrapSelection('*')}
              title="Cursiva"
              className="px-2 py-1 rounded border-2 border-ink/15 text-xs italic hover:border-ink transition-colors disabled:opacity-30 disabled:hover:border-ink/15"
            >
              I
            </button>
            <button
              type="button"
              disabled={preview}
              onClick={insertLink}
              title="Link"
              className="px-2 py-1 rounded border-2 border-ink/15 text-xs hover:border-ink transition-colors disabled:opacity-30 disabled:hover:border-ink/15"
            >
              Link
            </button>
            <button
              type="button"
              onClick={() => setPreview((p) => !p)}
              className="ml-auto text-brand hover:underline text-xs font-medium"
            >
              {preview ? '← Volver a editar' : 'Vista previa →'}
            </button>
          </div>

          {preview ? (
            <div
              className="post-body w-full min-h-[150px] px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm text-ink/80"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(form.body) || '<p class="text-ink/60">Nada para mostrar todavía.</p>' }}
            />
          ) : (
            <textarea
              ref={bodyRef}
              required
              rows={8}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border-2 border-ink/15 bg-paper text-sm resize-y font-mono"
            />
          )}
          <p className="text-ink/60 text-xs mt-1.5">
            Seleccioná texto y usá los botones, o escribí directo: **negrita**, *cursiva*, una línea que empiece con
            "- " para hacer una lista.
          </p>
        </div>

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

      {status === 'loading' && <p className="text-ink/60 text-sm">Cargando…</p>}
      {status === 'error' && <p className="text-stamp text-sm">No pudimos cargar los posts.</p>}

      <div className="flex flex-col gap-3">
        {posts.map((post) => (
          <div key={post.id} className="texture-card rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink/60">
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
