import { useState } from 'react'
import { OBJ } from './gitColors'

type Lang = 'es' | 'en'

interface Props {
  lang?: Lang
}

type Zone = 'working' | 'staged'

interface FileState {
  name: string
  zone: Zone
}

const INITIAL: FileState[] = [
  { name: 'index.html', zone: 'working' },
  { name: 'styles.css', zone: 'working' },
  { name: 'app.js', zone: 'working' }
]

interface Commit {
  id: string
  files: string[]
}

const COPY = {
  es: {
    working: 'Directorio de trabajo',
    staged: 'Staging (index)',
    repo: 'Repositorio (objects)',
    add: 'git add',
    addAll: 'git add .',
    commit: 'git commit',
    reset: 'reiniciar',
    emptyWorking: 'Todo preparado',
    emptyStaged: 'Nada en la sala de espera',
    emptyRepo: 'Aún no hay snapshots',
    commitMsg: 'snapshot',
    hint: 'git add mueve archivos a la sala de espera (index). git commit congela lo que hay en la sala de espera en un snapshot inmutable dentro de objects/.'
  },
  en: {
    working: 'Working directory',
    staged: 'Staging (index)',
    repo: 'Repository (objects)',
    add: 'git add',
    addAll: 'git add .',
    commit: 'git commit',
    reset: 'reset',
    emptyWorking: 'All staged',
    emptyStaged: 'Waiting room is empty',
    emptyRepo: 'No snapshots yet',
    commitMsg: 'snapshot',
    hint: 'git add moves files into the waiting room (index). git commit freezes whatever is in the waiting room into an immutable snapshot inside objects/.'
  }
} as const

const HASHES = ['a3f9c21', 'b71d0e4', 'c92f5a8', 'd04e1b7', 'e58c3f2']

export default function GitStagingArea({ lang = 'en' }: Props) {
  const t = COPY[lang]
  const [files, setFiles] = useState<FileState[]>(INITIAL)
  const [commits, setCommits] = useState<Commit[]>([])

  const working = files.filter((f) => f.zone === 'working')
  const staged = files.filter((f) => f.zone === 'staged')

  const stage = (name: string) =>
    setFiles((prev) =>
      prev.map((f) => (f.name === name ? { ...f, zone: 'staged' } : f))
    )

  const unstage = (name: string) =>
    setFiles((prev) =>
      prev.map((f) => (f.name === name ? { ...f, zone: 'working' } : f))
    )

  const stageAll = () =>
    setFiles((prev) => prev.map((f) => ({ ...f, zone: 'staged' })))

  const commit = () => {
    if (!staged.length) return
    const id = HASHES[commits.length % HASHES.length]
    setCommits((prev) => [...prev, { id, files: staged.map((f) => f.name) }])
    setFiles((prev) => prev.filter((f) => f.zone !== 'staged'))
  }

  const reset = () => {
    setFiles(INITIAL)
    setCommits([])
  }

  const chip =
    'flex items-center justify-between gap-2 rounded-md border border-line px-2.5 py-1.5 font-mono text-[13px] text-ink'
  const btn =
    'rounded px-1.5 py-0.5 font-mono text-[11px] text-muted transition-colors hover:bg-ink/[0.06] hover:text-ink dark:hover:bg-ink/[0.1]'
  const col =
    'flex min-h-[150px] flex-col gap-2 rounded-md border border-line bg-ink/[0.02] p-3 dark:bg-ink/[0.04]'
  const colHead =
    'font-mono text-[11px] uppercase tracking-wide text-muted'
  const empty = 'mt-2 text-center font-mono text-[12px] text-muted/60'

  return (
    <div className='not-prose my-8 rounded-lg border border-line bg-bg p-4 sm:p-5'>
      <div className='grid gap-3 sm:grid-cols-3'>
        <div className={col}>
          <div className='flex items-center justify-between'>
            <span className={colHead}>{t.working}</span>
            {working.length > 0 && (
              <button className={btn} onClick={stageAll}>
                {t.addAll}
              </button>
            )}
          </div>
          {working.length ? (
            working.map((f) => (
              <div key={f.name} className={chip}>
                <span>{f.name}</span>
                <button className={btn} onClick={() => stage(f.name)}>
                  {t.add} →
                </button>
              </div>
            ))
          ) : (
            <p className={empty}>{t.emptyWorking}</p>
          )}
        </div>

        <div className='flex min-h-[150px] flex-col gap-2 rounded-md border border-amber-500/30 bg-amber-500/[0.06] p-3'>
          <div className='flex items-center justify-between'>
            <span className='font-mono text-[11px] uppercase tracking-wide text-amber-600 dark:text-amber-400'>
              {t.staged}
            </span>
            {staged.length > 0 && (
              <button
                className='rounded px-1.5 py-0.5 font-mono text-[11px] text-violet-600 transition-colors hover:bg-violet-500/15 dark:text-violet-400'
                onClick={commit}
              >
                {t.commit} ✓
              </button>
            )}
          </div>
          {staged.length ? (
            staged.map((f) => (
              <div
                key={f.name}
                className='flex items-center justify-between gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 font-mono text-[13px] text-amber-700 dark:text-amber-300'
              >
                <button className={btn} onClick={() => unstage(f.name)}>
                  ←
                </button>
                <span className='flex-1'>{f.name}</span>
              </div>
            ))
          ) : (
            <p className={empty}>{t.emptyStaged}</p>
          )}
        </div>

        <div className={col}>
          <span className='font-mono text-[11px] uppercase tracking-wide text-violet-600 dark:text-violet-400'>
            {t.repo}
          </span>
          {commits.length ? (
            [...commits].reverse().map((c) => (
              <div
                key={c.id}
                className={`rounded-md border p-2 ${OBJ.commit.node}`}
              >
                <div className={`font-mono text-[12px] font-semibold ${OBJ.commit.text}`}>
                  ● {c.id}{' '}
                  <span className='font-normal opacity-70'>({t.commitMsg})</span>
                </div>
                <div className='mt-1 font-mono text-[11px]'>
                  <span className={OBJ.blob.text}>{c.files.length} blobs</span>
                  <span className='text-muted'> · </span>
                  <span className={OBJ.tree.text}>1 tree</span>
                </div>
              </div>
            ))
          ) : (
            <p className={empty}>{t.emptyRepo}</p>
          )}
        </div>
      </div>

      <div className='mt-4 flex items-center justify-between gap-3 border-t border-line pt-3'>
        <p className='text-[13px] leading-relaxed text-muted'>{t.hint}</p>
        <button
          className='shrink-0 font-mono text-[12px] text-muted underline-offset-2 hover:text-ink hover:underline'
          onClick={reset}
        >
          {t.reset}
        </button>
      </div>
    </div>
  )
}
