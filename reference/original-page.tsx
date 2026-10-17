'use client'

import { useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bot,
  Bug,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Code2,
  Command,
  GitBranch,
  GitCommitHorizontal,
  GitFork,
  History,
  Layers3,
  Lightbulb,
  MessageSquare,
  MoreHorizontal,
  Network,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Terminal,
  TestTube2,
  Upload,
  Users,
  X,
  Zap,
} from 'lucide-react'

const navItems = [
  { label: 'Workspace', icon: Layers3, active: true },
  { label: 'Code explorer', icon: Code2 },
  { label: 'Architecture', icon: Network },
  { label: 'Issues & risks', icon: Bug, count: '8' },
  { label: 'Test coverage', icon: TestTube2 },
]

const files = [
  { name: 'src', type: 'folder', open: true },
  { name: '  api', type: 'folder', open: true },
  { name: '    auth.ts', type: 'ts', active: true },
  { name: '    payments.ts', type: 'ts' },
  { name: '    users.ts', type: 'ts' },
  { name: '  components', type: 'folder' },
  { name: '  lib', type: 'folder' },
  { name: '  middleware.ts', type: 'ts' },
  { name: 'tests', type: 'folder' },
  { name: 'package.json', type: 'json' },
]

const prompts = [
  'Where is authentication implemented?',
  'Find possible bugs in this API',
  'What files change for OAuth?',
]

export default function Page() {
  const [activeNav, setActiveNav] = useState('Workspace')
  const [prompt, setPrompt] = useState('')
  const [sentPrompt, setSentPrompt] = useState('')
  const [showFiles, setShowFiles] = useState(true)
  const [selectedFinding, setSelectedFinding] = useState(0)

  const runPrompt = (value = prompt) => {
    if (!value.trim()) return
    setSentPrompt(value)
    setPrompt('')
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="flex h-16 items-center justify-between border-b border-border/70 bg-background/85 px-5 backdrop-blur-xl">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm"><Command className="size-4" /></div>
            <span className="text-[15px] font-semibold tracking-tight">Relay<span className="text-primary/50">.dev</span></span>
          </div>
          <div className="hidden h-6 w-px bg-border md:block" />
          <button className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium shadow-sm md:flex">
            <GitFork className="size-4" /> acme / storefront <ChevronDown className="ml-1 size-3.5 text-muted-foreground" />
          </button>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground lg:flex"><div className="size-1.5 rounded-full bg-emerald-500" /> Synced 4 min ago</div>
          <button aria-label="Refresh repository" className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"><RefreshCw className="size-4" /></button>
          <button aria-label="Settings" className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"><Settings2 className="size-4" /></button>
          <div className="ml-1 flex size-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">JD</div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside className="hidden w-60 shrink-0 border-r border-border/70 bg-sidebar p-3 lg:block">
          <div className="mb-6 px-2 pt-2"><p className="eyebrow">Project workspace</p><p className="mt-2 truncate text-sm font-medium">acme / storefront</p><p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><GitBranch className="size-3" /> main <span className="text-border">·</span> 2,841 files</p></div>
          <nav className="flex flex-col gap-1">
            {navItems.map(({ label, icon: Icon, count, active }) => (
              <button key={label} onClick={() => setActiveNav(label)} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${activeNav === label || active && activeNav === 'Workspace' ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground' : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground'}`}>
                <Icon className="size-4" /> <span className="flex-1 text-left">{label}</span>{count && <span className="rounded-md bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">{count}</span>}
              </button>
            ))}
          </nav>
          <div className="my-6 h-px bg-border" />
          <div className="px-2"><p className="eyebrow">Recent sessions</p><div className="mt-3 flex flex-col gap-1">
            {['Auth flow investigation', 'Payment service review', 'API architecture'].map((item, i) => <button key={item} className="flex items-center gap-2 rounded-md px-2 py-2 text-left text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"><MessageSquare className="size-3.5" /><span className="truncate">{item}</span>{i === 0 && <span className="ml-auto size-1.5 rounded-full bg-primary" />}</button>)}
          </div></div>
          <div className="mt-auto pt-8"><div className="rounded-xl border border-border bg-card p-3"><div className="flex items-center gap-2 text-xs font-medium"><Zap className="size-3.5 text-primary" /> Index health</div><div className="mt-3 flex items-end justify-between"><span className="text-2xl font-semibold tracking-tight">94%</span><span className="text-[11px] text-muted-foreground">Excellent</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full w-[94%] rounded-full bg-primary" /></div></div></div>
        </aside>

        <section className="min-w-0 flex-1">
          <div className="border-b border-border/70 px-5 py-5 md:px-8">
            <div className="mx-auto flex max-w-[1500px] items-start justify-between gap-4"><div><div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground"><span>Workspace</span><ChevronRight className="size-3" /><span className="text-foreground">Overview</span></div><h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Good morning, Jordan<span className="text-primary">.</span></h1><p className="mt-1.5 text-sm text-muted-foreground">Here&apos;s what&apos;s happening in your codebase.</p></div><button className="hidden items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-transform hover:-translate-y-px sm:flex"><Upload className="size-4" /> Sync repository</button></div>
          </div>

          <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-5 p-5 md:p-8 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[['2,841', 'Files indexed', '↑ 12% this week', Code2], ['68%', 'Test coverage', '↑ 4.2% this month', TestTube2], ['8', 'Potential issues', '2 high priority', AlertTriangle], ['14', 'Open insights', '3 new today', Lightbulb]].map(([value, label, trend, Icon], i) => { const StatIcon = Icon as typeof Code2; return <div key={label as string} className="rounded-xl border border-border bg-card p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">{label as string}</span><StatIcon className={`size-4 ${i === 2 ? 'text-destructive' : 'text-muted-foreground'}`} /></div><div className="mt-3 text-2xl font-semibold tracking-tight">{value as string}</div><div className={`mt-1 text-[11px] ${i === 2 ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'}`}>{trend as string}</div></div> })}
              </div>

              <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(280px,.75fr)]">
                <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"><div className="flex items-center justify-between border-b border-border px-5 py-4"><div><h2 className="text-sm font-semibold">Repository pulse</h2><p className="mt-1 text-xs text-muted-foreground">Activity and codebase health over the last 30 days</p></div><button className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">Last 30 days <ChevronDown className="size-3.5" /></button></div><div className="p-5"><div className="flex h-44 items-end gap-2 border-b border-border/70 pb-0 pt-4">{[38, 46, 42, 58, 52, 67, 61, 78, 68, 82, 74, 91, 86, 72, 88, 94, 82, 79, 88, 96, 84, 90, 86, 100, 88, 94, 91, 96, 90, 98].map((height, i) => <div key={i} className="group relative flex h-full flex-1 items-end"><div className={`w-full rounded-t-sm transition-all group-hover:bg-primary ${i > 20 ? 'bg-primary/80' : 'bg-primary/25'}`} style={{ height: `${height}%` }} /></div>)}</div><div className="mt-3 flex justify-between text-[10px] text-muted-foreground"><span>May 01</span><span>May 15</span><span>May 30</span></div><div className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4"><div><p className="text-[11px] text-muted-foreground">Commits</p><p className="mt-1 text-sm font-semibold">184</p></div><div><p className="text-[11px] text-muted-foreground">Contributors</p><p className="mt-1 text-sm font-semibold">12</p></div><div><p className="text-[11px] text-muted-foreground">Files changed</p><p className="mt-1 text-sm font-semibold">427</p></div></div></div></section>

                <section className="rounded-xl border border-border bg-card p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-sm font-semibold">Architecture map</h2><p className="mt-1 text-xs text-muted-foreground">Detected system boundaries</p></div><button className="rounded-md p-1.5 text-muted-foreground hover:bg-accent"><MoreHorizontal className="size-4" /></button></div><div className="relative mt-5 flex h-48 items-center justify-center overflow-hidden rounded-lg border border-border/70 bg-muted/30"><div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '18px 18px' }} /><svg className="absolute inset-0 size-full" viewBox="0 0 340 190" fill="none" aria-hidden="true"><path d="M78 74 L145 52 M190 54 L252 74 M78 113 L145 137 M191 137 L252 113" stroke="currentColor" strokeOpacity=".22" strokeDasharray="4 4"/><path d="M167 71V118" stroke="currentColor" strokeOpacity=".22" strokeDasharray="4 4"/></svg><div className="relative grid grid-cols-3 gap-x-8 gap-y-7 text-center text-[10px] font-medium"><div className="node border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300">Web app</div><div /><div className="node border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">API</div><div className="node border-primary/30 bg-primary/10 text-primary">Auth</div><div className="node border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300">Database</div><div className="node border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300">Queue</div></div></div><button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2 text-xs font-medium transition-colors hover:bg-accent">Explore architecture <ArrowUpRight className="size-3.5" /></button></section>
              </div>

              <section className="mt-5 overflow-hidden rounded-xl border border-border bg-card shadow-sm"><div className="flex items-center justify-between border-b border-border px-5 py-4"><div><h2 className="text-sm font-semibold">Ask your codebase</h2><p className="mt-1 text-xs text-muted-foreground">Understand, debug, and change your project with context.</p></div><div className="flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-[10px] text-muted-foreground"><Bot className="size-3.5" /> Relay AI</div></div><div className="p-5"><div className="rounded-xl border border-primary/30 bg-primary/[.035] p-3 shadow-inner"><textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) { e.preventDefault(); runPrompt() } }} placeholder="Ask anything about your repository..." className="min-h-20 w-full resize-none bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground/70" /><div className="flex items-center justify-between pt-2"><div className="flex items-center gap-1 text-[11px] text-muted-foreground"><span className="rounded bg-muted px-1.5 py-0.5">⌘ K</span> for commands <span className="mx-1 text-border">·</span> Enter to ask</div><button onClick={() => runPrompt()} aria-label="Send question" className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform hover:scale-105 disabled:opacity-50" disabled={!prompt.trim()}><Send className="size-3.5" /></button></div></div><div className="mt-3 flex flex-wrap gap-2">{prompts.map((item) => <button key={item} onClick={() => runPrompt(item)} className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent hover:text-foreground">{item}</button>)}</div>{sentPrompt && <div className="mt-4 rounded-lg border border-border bg-muted/40 p-3 text-xs"><span className="font-medium">You asked:</span> {sentPrompt}<span className="ml-2 text-muted-foreground">· Relay is analyzing 2,841 files...</span></div>}</div></section>
            </div>

            <aside className="min-w-0"><section className="rounded-xl border border-border bg-card shadow-sm"><div className="flex items-center justify-between border-b border-border px-5 py-4"><div><h2 className="text-sm font-semibold">Priority findings</h2><p className="mt-1 text-xs text-muted-foreground">AI-detected risks to review</p></div><button className="text-xs font-medium text-primary hover:underline">View all</button></div><div className="divide-y divide-border">{[{ icon: AlertTriangle, title: 'Token refresh race condition', file: 'src/api/auth.ts · line 84', severity: 'High', tone: 'text-destructive bg-destructive/10' }, { icon: Bug, title: 'Missing timeout on payment call', file: 'src/api/payments.ts · line 32', severity: 'Medium', tone: 'text-orange-700 bg-orange-500/10 dark:text-orange-300' }, { icon: ShieldCheck, title: 'CORS allows wildcard origin', file: 'src/middleware.ts · line 19', severity: 'Medium', tone: 'text-orange-700 bg-orange-500/10 dark:text-orange-300' }].map(({ icon: Icon, title, file, severity, tone }, i) => <button key={title} onClick={() => setSelectedFinding(i)} className={`flex w-full gap-3 p-4 text-left transition-colors hover:bg-accent/50 ${selectedFinding === i ? 'bg-accent/35' : ''}`}><div className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md ${tone}`}><Icon className="size-3.5" /></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><p className="text-xs font-medium leading-4">{title}</p><span className={`shrink-0 text-[10px] font-semibold ${severity === 'High' ? 'text-destructive' : 'text-orange-600 dark:text-orange-300'}`}>{severity}</span></div><p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">{file}</p></div></button>)}</div><div className="border-t border-border px-5 py-3"><div className="flex items-center justify-between text-[11px]"><span className="text-muted-foreground">Risk score</span><span className="font-semibold text-orange-600 dark:text-orange-300">Needs attention</span></div><div className="mt-2 flex gap-1"><div className="h-1.5 flex-1 rounded-full bg-destructive" /><div className="h-1.5 flex-1 rounded-full bg-orange-400" /><div className="h-1.5 flex-1 rounded-full bg-orange-300" /><div className="h-1.5 flex-1 rounded-full bg-muted" /><div className="h-1.5 flex-1 rounded-full bg-muted" /></div></div></section>

              <section className="mt-5 rounded-xl border border-border bg-card p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-sm font-semibold">Recent activity</h2><p className="mt-1 text-xs text-muted-foreground">From your team</p></div><History className="size-4 text-muted-foreground" /></div><div className="mt-5 flex flex-col gap-4">{[['Maya Chen', 'merged PR #284', '8m ago', 'MC'], ['You', 'ran architecture scan', '42m ago', 'JD'], ['Alex Kim', 'added 12 tests', '2h ago', 'AK']].map(([name, action, time, initials], i) => <div key={name + action} className="flex items-center gap-3"><div className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${i === 1 ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'}`}>{initials}</div><div className="min-w-0 flex-1"><p className="truncate text-xs"><span className="font-medium">{name}</span> <span className="text-muted-foreground">{action}</span></p><p className="mt-0.5 text-[10px] text-muted-foreground">{time}</p></div><Check className="size-3.5 text-emerald-600 dark:text-emerald-400" /></div>)}</div><button className="mt-5 flex w-full items-center justify-center gap-2 border-t border-border pt-4 text-xs font-medium text-muted-foreground hover:text-foreground">View activity log <ArrowUpRight className="size-3.5" /></button></section>

              <section className="mt-5 rounded-xl border border-border bg-card shadow-sm"><button onClick={() => setShowFiles(!showFiles)} className="flex w-full items-center justify-between px-5 py-4 text-left"><div><h2 className="text-sm font-semibold">Repository explorer</h2><p className="mt-1 text-xs text-muted-foreground">Browse indexed source files</p></div>{showFiles ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}</button>{showFiles && <div className="border-t border-border px-2 py-2">{files.map((file) => <button key={file.name} className={`flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left font-mono text-[11px] ${file.active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}><span className="w-3 text-muted-foreground">{file.type === 'folder' ? <ChevronRight className="size-3" /> : <CircleDot className="size-2 fill-current" />}</span><span className={file.type === 'folder' ? 'font-sans font-medium' : ''}>{file.name}</span></button>)}</div>}</section></aside>
          </div>
        </section>
      </div>
    </main>
  )
}


const _unused = { Activity, GitCommitHorizontal, Plus, Search, Terminal, Users, X }

// Tailwind utility classes for the tiny architecture map nodes.
export {}
