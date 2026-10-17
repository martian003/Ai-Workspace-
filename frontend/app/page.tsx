'use client'

import { useEffect, useState } from 'react'
import { Command, Code2, Upload, MessageSquare, LogOut, Plus, Send, Search, FileCode2, Layers3 } from 'lucide-react'

type Project = { id: number; name: string; file_count: number }
type Source = { file_id: number; path: string; start_line: number; end_line: number; excerpt: string }
type Exchange = { id: number; question: string; answer: string; sources: Source[]; mode: string }
type FileEntry = { id: number; path: string }
const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'
const button = 'rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-40 inline-flex items-center justify-center gap-2'
const field = 'w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary/30'

export default function Page() {
  // Keep credentials in memory. A page refresh requires signing in again.
  const [token, setToken] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [registering, setRegistering] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [files, setFiles] = useState<FileEntry[]>([])
  const [history, setHistory] = useState<Exchange[]>([])
  const [source, setSource] = useState<{ path: string; content: string } | null>(null)
  const [question, setQuestion] = useState('')
  const [projectName, setProjectName] = useState('')
  const [filter, setFilter] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const project = projects.find(p => p.id === selected)

  async function api(path: string, options: RequestInit = {}, auth = token) {
    const headers = new Headers(options.headers)
    if (auth) headers.set('Authorization', `Token ${auth}`)
    if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json')
    let response: Response
    try { response = await fetch(`${BASE}${path}`, { ...options, headers }) }
    catch { throw new Error('Cannot reach Django. Start the backend and check NEXT_PUBLIC_API_URL.') }
    if (response.status === 204) return null
    const data = await response.json().catch(() => null)
    if (!response.ok) throw new Error(typeof data?.detail === 'string' ? data.detail : JSON.stringify(data || { error: `Request failed (${response.status})` }))
    return data
  }
  async function perform(action: () => Promise<void>) {
    setBusy(true); setError(''); setNotice('')
    try { await action() } catch (e) { setError(e instanceof Error ? e.message : 'Something went wrong') }
    finally { setBusy(false) }
  }
  async function loadProjects(auth = token) {
    const list: Project[] = await api('/projects/', {}, auth)
    setProjects(list)
    return list
  }
  async function loadProject(id: number) {
    const [entries, exchanges] = await Promise.all([api(`/projects/${id}/files/`), api(`/projects/${id}/questions/`)])
    setFiles(entries); setHistory(exchanges); setSource(null)
  }
  useEffect(() => {
    if (selected === null || !token) return
    let cancelled = false
    setFiles([]); setHistory([]); setSource(null); setError('')
    Promise.all([api(`/projects/${selected}/files/`), api(`/projects/${selected}/questions/`)]).then(([entries, exchanges]) => {
      if (!cancelled) { setFiles(entries); setHistory(exchanges) }
    }).catch(e => { if (!cancelled) setError(e.message) })
    return () => { cancelled = true }
    // The selected project changes only after authentication.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, token])

  async function authenticate(e: React.FormEvent) {
    e.preventDefault()
    await perform(async () => {
      const data = await api(`/auth/${registering ? 'register' : 'login'}/`, { method: 'POST', body: JSON.stringify({ username, password }) }, '')
      const list = await loadProjects(data.token)
      setToken(data.token); setPassword(''); setSelected(list[0]?.id ?? null)
    })
  }
  async function upload(file: File) {
    if (!selected) return
    await perform(async () => {
      const form = new FormData(); form.append('file', file)
      const data = await api(`/projects/${selected}/upload/`, { method: 'POST', body: form })
      await loadProjects(); await loadProject(selected)
      setNotice(`Indexed ${data.indexed} source files. You can now ask questions.`)
    })
  }
  async function ask(value = question) {
    if (!selected || !value.trim()) return
    await perform(async () => {
      const answer: Exchange = await api(`/projects/${selected}/questions/`, { method: 'POST', body: JSON.stringify({ question: value }) })
      setHistory(previous => [...previous, answer]); setQuestion('')
    })
  }

  if (!token) return <main className="grid min-h-screen place-items-center bg-background p-6 text-foreground">
    <form onSubmit={authenticate} className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
      <Command className="mb-5 size-9 text-primary" /><h1 className="text-2xl font-semibold">Your code. In context.</h1>
      <p className="mb-7 mt-2 text-sm text-muted-foreground">Sign in to your AI Software Engineering Workspace.</p>
      <label className="text-sm">Username<input autoComplete="username" required maxLength={150} className={`${field} mb-4 mt-1`} value={username} onChange={e => setUsername(e.target.value)} /></label>
      <label className="text-sm">Password<input type="password" autoComplete={registering ? 'new-password' : 'current-password'} required className={`${field} mb-4 mt-1`} value={password} onChange={e => setPassword(e.target.value)} /></label>
      {registering && <p className="mb-4 text-xs text-muted-foreground">Use a strong password with at least 8 characters.</p>}
      {error && <p role="alert" className="mb-4 break-words text-sm text-destructive">{error}</p>}
      <button disabled={busy} className={`${button} w-full`}>{busy ? 'Connecting…' : registering ? 'Create account' : 'Sign in'}</button>
      <button type="button" disabled={busy} onClick={() => { setRegistering(!registering); setError('') }} className="mt-5 w-full text-sm text-muted-foreground underline">{registering ? 'Already have an account? Sign in' : 'New here? Create an account'}</button>
    </form>
  </main>

  return <main className="min-h-screen bg-background text-foreground">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-6 py-4">
      <div className="flex items-center gap-3"><Command className="size-7" /><span className="font-semibold">Relay.dev</span><span className="hidden text-sm text-muted-foreground sm:block">/ {project?.name || 'Workspace'}</span></div>
      <button disabled={busy} className="flex items-center gap-2 text-sm" onClick={() => perform(async () => { await api('/auth/logout/', { method: 'POST' }); setToken(''); setProjects([]); setSelected(null); setFiles([]); setHistory([]); setSource(null) })}><LogOut className="size-4" />Sign out</button>
    </header>
    <div className="grid min-h-[calc(100vh-70px)] lg:grid-cols-[250px_1fr]">
      <aside className="border-b border-border bg-sidebar p-5 lg:border-b-0 lg:border-r">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Projects</p>
        <div className="space-y-2">{projects.map(p => <button disabled={busy} key={p.id} onClick={() => setSelected(p.id)} className={`flex w-full items-center gap-2 rounded-lg p-3 text-left text-sm ${selected === p.id ? 'bg-accent font-medium' : 'hover:bg-accent/50'}`}><Layers3 className="size-4 shrink-0" /><span className="truncate">{p.name}</span><span className="ml-auto text-xs">{p.file_count}</span></button>)}</div>
        <form className="mt-6 space-y-2" onSubmit={e => { e.preventDefault(); perform(async () => { const p = await api('/projects/', { method: 'POST', body: JSON.stringify({ name: projectName }) }); await loadProjects(); setSelected(p.id); setProjectName('') }) }}>
          <input aria-label="New project name" maxLength={120} required className={field} placeholder="Project name" value={projectName} onChange={e => setProjectName(e.target.value)} /><button disabled={busy || !projectName.trim()} className={`${button} w-full`}><Plus className="size-4" />New project</button>
        </form>
        <p className="mt-6 text-xs leading-5 text-muted-foreground">Upload a repository ZIP to begin. Source code is read as text and never executed.</p>
      </aside>
      <section className="min-w-0 p-5 md:p-8">
        {error && <div role="alert" className="mb-5 break-words rounded-lg border border-destructive/30 p-4 text-sm text-destructive">{error}</div>}
        {notice && <div role="status" className="mb-5 rounded-lg bg-accent p-4 text-sm">{notice}</div>}
        {!project ? <div className="mx-auto max-w-lg py-20 text-center"><Layers3 className="mx-auto mb-5 size-12 text-muted-foreground" /><h1 className="text-2xl font-semibold">Create your first workspace</h1><p className="mt-3 text-muted-foreground">Add a project using the sidebar, then upload its repository.</p></div> : <>
          <div className="mb-7 flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-3xl font-semibold tracking-tight">{project.name}</h1><p className="mt-2 text-sm text-muted-foreground">Explore your repository and ask questions grounded in its source.</p></div>
            <label className={`${button} cursor-pointer ${busy ? 'pointer-events-none opacity-40' : ''}`}><Upload className="size-4" />{busy ? 'Working…' : files.length ? 'Replace repository' : 'Upload repository'}<input aria-label="Upload repository ZIP" type="file" accept=".zip" disabled={busy} className="sr-only" onChange={e => { const f = e.target.files?.[0]; if (f && (!files.length || window.confirm('Replace indexed files and clear this project’s conversation history?'))) upload(f); e.target.value = '' }} /></label>
          </div>
          <div className="mb-6 grid grid-cols-2 gap-4"><div className="rounded-xl border border-border bg-card p-5"><Code2 className="mb-3 size-5 text-muted-foreground" /><p className="text-2xl font-semibold">{files.length}</p><p className="text-sm text-muted-foreground">Files indexed</p></div><div className="rounded-xl border border-border bg-card p-5"><MessageSquare className="mb-3 size-5 text-muted-foreground" /><p className="text-2xl font-semibold">{history.length}</p><p className="text-sm text-muted-foreground">Saved questions</p></div></div>
          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
            <section className="min-w-0 rounded-xl border border-border bg-card p-5"><h2 className="font-semibold">Ask your codebase</h2><p className="mb-4 mt-1 text-xs text-muted-foreground">Answers include the retrieved file excerpts. AI explanations require a backend API key.</p>
              <form onSubmit={e => { e.preventDefault(); ask() }}><textarea aria-label="Repository question" required maxLength={2000} disabled={busy || !files.length} value={question} onChange={e => setQuestion(e.target.value)} className={`${field} min-h-28`} placeholder="Where is authentication implemented?" /><div className="mt-3 flex justify-end"><button disabled={busy || !question.trim() || !files.length} className={button}><Send className="size-4" />{busy ? 'Working…' : 'Ask question'}</button></div></form>
              <div className="mt-4 flex flex-wrap gap-2">{['Where is authentication implemented?', 'Explain the API routes', 'Find possible bugs'].map(q => <button disabled={busy || !files.length} key={q} onClick={() => ask(q)} className="rounded-full border border-border px-3 py-2 text-xs text-muted-foreground disabled:opacity-40">{q}</button>)}</div>
              <div aria-live="polite" className="mt-6 space-y-6">{[...history].reverse().map(item => <article key={item.id} className="border-t border-border pt-5"><h3 className="font-medium">{item.question}</h3><p className="mb-2 mt-2 text-[11px] uppercase tracking-wide text-muted-foreground">{item.mode === 'ai' ? 'AI explanation · verify against source' : 'Source search'}</p><p className="whitespace-pre-wrap break-words text-sm leading-7">{item.answer}</p><div className="mt-4 space-y-2">{item.sources.map((s,i) => <details key={i} className="overflow-hidden rounded-lg border border-border"><summary className="cursor-pointer break-all bg-muted/40 px-3 py-2 font-mono text-xs">{s.path}:{s.start_line}–{s.end_line}</summary><pre className="max-h-80 overflow-auto p-3 text-xs leading-6">{s.excerpt}</pre><button disabled={busy} className="px-3 pb-3 text-xs underline" onClick={() => perform(async () => setSource(await api(`/projects/${selected}/files/${s.file_id}/`)))}>Open full file</button></details>)}</div></article>)}</div>
            </section>
            <aside className="min-w-0 rounded-xl border border-border bg-card p-4"><h2 className="mb-3 font-semibold">Repository explorer</h2><div className="relative"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><input aria-label="Filter file paths" className={`${field} pl-9`} placeholder="Find a file…" value={filter} onChange={e => setFilter(e.target.value)} /></div><div className="mt-3 max-h-[500px] overflow-y-auto">{files.filter(f => f.path.toLowerCase().includes(filter.toLowerCase())).map(f => <button disabled={busy} key={f.id} onClick={() => perform(async () => setSource(await api(`/projects/${selected}/files/${f.id}/`)))} className="flex w-full items-start gap-2 rounded p-2 text-left text-xs hover:bg-accent"><FileCode2 className="size-4 shrink-0" /><span className="break-all font-mono">{f.path}</span></button>)}{!files.length && <p className="py-8 text-center text-sm text-muted-foreground">No source files yet.</p>}</div></aside>
          </div>
          {source && <section className="mt-6 min-w-0 overflow-hidden rounded-xl border border-border bg-card"><div className="flex items-center justify-between gap-4 border-b border-border p-4"><h2 className="break-all font-mono text-sm">{source.path}</h2><button onClick={() => setSource(null)} className="text-xs underline">Close</button></div><pre className="max-h-[600px] overflow-auto p-4 text-xs leading-6">{source.content.split('\n').map((line,i) => <span className="block" key={i}><span className="mr-5 inline-block w-9 select-none text-right text-muted-foreground">{i+1}</span>{line}</span>)}</pre></section>}
        </>}
      </section>
    </div>
  </main>
}
