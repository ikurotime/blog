import { useState } from 'react'
import { OBJ, branchStyle } from './gitColors'

type Lang = 'es' | 'en'

interface Props {
  lang?: Lang
}

interface CommitNode {
  id: string
  parent: string | null
}

const COPY = {
  es: {
    commit: 'commit',
    branch: 'nueva rama',
    reset: 'reiniciar',
    headFile: 'HEAD (una sola línea)',
    refsTitle: 'refs/heads/',
    graph: 'Grafo de commits',
    checkoutHint: 'Haz checkout de una rama para mover HEAD',
    branchName: 'Nombre de la rama:',
    hint: 'Una rama es solo un archivo con un hash. HEAD es un archivo que apunta a una rama. Al hacer commit, la rama actual (y HEAD con ella) avanza al nuevo snapshot. checkout solo reescribe la línea de HEAD.'
  },
  en: {
    commit: 'commit',
    branch: 'new branch',
    reset: 'reset',
    headFile: 'HEAD (a single line)',
    refsTitle: 'refs/heads/',
    graph: 'Commit graph',
    checkoutHint: 'Check out a branch to move HEAD',
    branchName: 'Branch name:',
    hint: 'A branch is just a file with a hash. HEAD is a file pointing to a branch. When you commit, the current branch (and HEAD with it) advances to the new snapshot. checkout only rewrites the HEAD line.'
  }
} as const

const HASHES = ['a3f9c21', 'b71d0e4', 'c92f5a8', 'd04e1b7', 'e58c3f2', 'f16a9c3']

export default function GitRefsHead({ lang = 'en' }: Props) {
  const t = COPY[lang]
  const root = HASHES[0]
  const [commits, setCommits] = useState<CommitNode[]>([
    { id: root, parent: null }
  ])
  const [branches, setBranches] = useState<Record<string, string>>({
    main: root
  })
  const [head, setHead] = useState('main')
  const [step, setStep] = useState(1)

  const branchNames = Object.keys(branches)
  const colorOf = (b: string) => branchStyle(branchNames.indexOf(b))

  const commit = () => {
    if (step >= HASHES.length) return
    const id = HASHES[step]
    const parent = branches[head]
    setCommits((prev) => [...prev, { id, parent }])
    setBranches((prev) => ({ ...prev, [head]: id }))
    setStep((s) => s + 1)
  }

  const newBranch = () => {
    let n = branchNames.length
    let name = `feature-${n}`
    while (branches[name]) name = `feature-${++n}`
    setBranches((prev) => ({ ...prev, [name]: branches[head] }))
    setHead(name)
  }

  const reset = () => {
    setCommits([{ id: root, parent: null }])
    setBranches({ main: root })
    setHead('main')
    setStep(1)
  }

  const btn =
    'rounded-md border border-line px-3 py-1.5 font-mono text-[12px] text-ink transition-colors hover:bg-ink/[0.06] dark:hover:bg-ink/[0.1]'

  return (
    <div className='not-prose my-8 rounded-lg border border-line bg-bg p-4 sm:p-5'>
      <div className='mb-4 flex flex-wrap gap-2'>
        <button className={btn} onClick={commit}>
          git {t.commit}
        </button>
        <button className={btn} onClick={newBranch}>
          git branch ({t.branch})
        </button>
        <button
          className='ml-auto font-mono text-[12px] text-muted underline-offset-2 hover:text-ink hover:underline'
          onClick={reset}
        >
          {t.reset}
        </button>
      </div>

      {/* commit graph */}
      <div className='mb-4'>
        <div className='mb-2 font-mono text-[11px] uppercase tracking-wide text-muted'>
          {t.graph}
        </div>
        <div className='flex flex-wrap items-center gap-1 overflow-x-auto'>
          {commits.map((c, i) => {
            const branchesHere = branchNames.filter(
              (b) => branches[b] === c.id
            )
            return (
              <div key={c.id} className='flex items-center'>
                {i > 0 && <span className='px-1 text-violet-400'>←</span>}
                <div className='flex flex-col items-center gap-1'>
                  <div
                    className={`rounded-full border px-3 py-1 font-mono text-[12px] font-semibold ${OBJ.commit.node} ${OBJ.commit.text}`}
                  >
                    ● {c.id}
                  </div>
                  <div className='flex flex-col items-center gap-0.5'>
                    {branchesHere.map((b) => {
                      const bs = colorOf(b)
                      return (
                        <span
                          key={b}
                          className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${
                            b === head ? bs.activeChip : bs.idleChip
                          }`}
                        >
                          {b}
                          {b === head ? ' ← HEAD' : ''}
                        </span>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* the actual files */}
      <div className='grid gap-3 sm:grid-cols-2'>
        <div className='rounded-md border border-line bg-ink/[0.02] p-3 dark:bg-ink/[0.04]'>
          <div className='mb-2 font-mono text-[11px] uppercase tracking-wide text-muted'>
            {t.headFile}
          </div>
          <code className='font-mono text-[13px] text-ink'>
            ref: refs/heads/
            <span className={`font-semibold ${colorOf(head).text}`}>{head}</span>
          </code>
        </div>

        <div className='rounded-md border border-line bg-ink/[0.02] p-3 dark:bg-ink/[0.04]'>
          <div className='mb-2 font-mono text-[11px] uppercase tracking-wide text-muted'>
            {t.refsTitle}
          </div>
          <div className='flex flex-col gap-1'>
            {branchNames.map((b) => {
              const bs = colorOf(b)
              return (
                <button
                  key={b}
                  onClick={() => setHead(b)}
                  className={`flex items-center justify-between gap-2 rounded px-2 py-1 text-left font-mono text-[12px] transition-colors ${
                    b === head ? bs.idleChip : 'text-muted hover:text-ink'
                  }`}
                  title={t.checkoutHint}
                >
                  <span className='flex items-center gap-1.5'>
                    <span className={`h-2 w-2 rounded-full ${bs.dot}`} />
                    {b}
                  </span>
                  <span className={OBJ.commit.text}>{branches[b]}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <p className='mt-4 border-t border-line pt-3 text-[13px] leading-relaxed text-muted'>
        {t.hint}
      </p>
    </div>
  )
}
