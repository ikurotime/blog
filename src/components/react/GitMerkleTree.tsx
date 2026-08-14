import { useEffect, useRef, useState } from 'react'
import { OBJ } from './gitColors'

type Lang = 'es' | 'en'

interface Props {
  lang?: Lang
}

const COPY = {
  es: {
    intro: 'Un commit apunta a un tree, y un tree apunta a los blobs. Edita un archivo y mira cómo el cambio sube en cascada hasta un commit nuevo.',
    edit: 'editar',
    reset: 'reiniciar',
    commit: 'commit',
    tree: 'tree (raíz)',
    blobs: 'blobs (contenido)',
    legend: 'Los blobs que no cambian conservan su hash: Git no los vuelve a guardar.',
    changed: 'cambió'
  },
  en: {
    intro: 'A commit points to a tree, and a tree points to the blobs. Edit a file and watch the change ripple up into a brand-new commit.',
    edit: 'edit',
    reset: 'reset',
    commit: 'commit',
    tree: 'tree (root)',
    blobs: 'blobs (content)',
    legend: 'Blobs that do not change keep their hash — Git does not store them again.',
    changed: 'changed'
  }
} as const

interface FileEntry {
  name: string
  content: string
  blob: string
}

const INITIAL = [
  { name: 'README.md', content: '# my project\n' },
  { name: 'app.js', content: "console.log('hi')\n" },
  { name: 'style.css', content: 'body { margin: 0 }\n' }
]

async function sha1Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-1', bytes)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function blobHash(content: string): Promise<string> {
  const body = new TextEncoder().encode(content)
  return sha1Hex(`blob ${body.length}\0${content}`)
}

export default function GitMerkleTree({ lang = 'en' }: Props) {
  const t = COPY[lang]
  const [files, setFiles] = useState<FileEntry[]>(
    INITIAL.map((f) => ({ ...f, blob: '' }))
  )
  const [tree, setTree] = useState('')
  const [commit, setCommit] = useState('')
  const [flash, setFlash] = useState<Set<string>>(new Set())
  const commitCount = useRef(1)
  const flashTimer = useRef<ReturnType<typeof setTimeout>>()

  // Recompute the whole merkle tree whenever file contents change.
  const recompute = async (next: FileEntry[], flashIds: string[]) => {
    const withBlobs = await Promise.all(
      next.map(async (f) => ({ ...f, blob: (await blobHash(f.content)).slice(0, 7) }))
    )
    const treeInput = withBlobs.map((f) => `100644 ${f.name}\0${f.blob}`).join('')
    const treeId = (await sha1Hex(treeInput)).slice(0, 7)
    const commitId = (
      await sha1Hex(`tree ${treeId}\ncommit ${commitCount.current}`)
    ).slice(0, 7)
    setFiles(withBlobs)
    setTree(treeId)
    setCommit(commitId)
    if (flashIds.length) {
      setFlash(new Set([...flashIds, 'tree', 'commit']))
      if (flashTimer.current) clearTimeout(flashTimer.current)
      flashTimer.current = setTimeout(() => setFlash(new Set()), 900)
    }
  }

  useEffect(() => {
    recompute(files, [])
    return () => {
      if (flashTimer.current) clearTimeout(flashTimer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const editFile = (name: string) => {
    commitCount.current += 1
    const suffixes = ['// tweak\n', '// fix\n', '// wip\n', '// v2\n']
    const next = files.map((f) =>
      f.name === name
        ? { ...f, content: f.content + suffixes[commitCount.current % suffixes.length] }
        : f
    )
    recompute(next, [name])
  }

  const reset = () => {
    commitCount.current = 1
    recompute(INITIAL.map((f) => ({ ...f, blob: '' })), [])
  }

  const flashRing = (id: string) =>
    flash.has(id) ? 'ring-2 ring-offset-2 ring-offset-bg ring-current' : ''

  const connector = 'mx-auto h-5 w-px bg-line'

  return (
    <div className='not-prose my-8 rounded-lg border border-line bg-bg p-4 sm:p-5'>
      <p className='mb-5 text-[13px] leading-relaxed text-muted'>{t.intro}</p>

      {/* commit */}
      <div className='flex flex-col items-center'>
        <div
          className={`rounded-lg border px-4 py-2 text-center transition-all duration-300 ${OBJ.commit.node} ${OBJ.commit.text} ${flashRing('commit')}`}
        >
          <div className='font-mono text-[10px] uppercase tracking-wide opacity-70'>
            {t.commit}
          </div>
          <div className='font-mono text-sm font-semibold'>● {commit}</div>
        </div>

        <div className={connector} />

        {/* tree */}
        <div
          className={`rounded-lg border px-4 py-2 text-center transition-all duration-300 ${OBJ.tree.node} ${OBJ.tree.text} ${flashRing('tree')}`}
        >
          <div className='font-mono text-[10px] uppercase tracking-wide opacity-70'>
            {t.tree}
          </div>
          <div className='font-mono text-sm font-semibold'>▤ {tree}</div>
        </div>

        <div className={connector} />

        {/* blobs */}
        <div className='grid w-full gap-2 sm:grid-cols-3'>
          {files.map((f) => (
            <div
              key={f.name}
              className={`flex flex-col gap-1 rounded-lg border p-3 transition-all duration-300 ${OBJ.blob.node} ${flashRing(f.name)}`}
            >
              <div className='flex items-center justify-between gap-2'>
                <span className={`font-mono text-[13px] ${OBJ.blob.text}`}>
                  {f.name}
                </span>
                <button
                  onClick={() => editFile(f.name)}
                  className='rounded border border-emerald-500/40 px-1.5 py-0.5 font-mono text-[10px] text-emerald-700 transition-colors hover:bg-emerald-500/20 dark:text-emerald-300'
                >
                  {t.edit}
                </button>
              </div>
              <code className={`font-mono text-[12px] ${OBJ.blob.text}`}>
                ◆ {f.blob}
              </code>
              {flash.has(f.name) && (
                <span className='font-mono text-[10px] text-emerald-600 dark:text-emerald-400'>
                  {t.changed} ↑
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* legend */}
      <div className='mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-3 text-[12px] text-muted'>
        <span className='flex items-center gap-1.5'>
          <span className={`h-2.5 w-2.5 rounded-full ${OBJ.commit.dot}`} />
          {OBJ.commit.label}
        </span>
        <span className='flex items-center gap-1.5'>
          <span className={`h-2.5 w-2.5 rounded-full ${OBJ.tree.dot}`} />
          {OBJ.tree.label}
        </span>
        <span className='flex items-center gap-1.5'>
          <span className={`h-2.5 w-2.5 rounded-full ${OBJ.blob.dot}`} />
          {OBJ.blob.label}
        </span>
        <button
          onClick={reset}
          className='ml-auto font-mono text-[12px] text-muted underline-offset-2 hover:text-ink hover:underline'
        >
          {t.reset}
        </button>
      </div>
      <p className='mt-2 text-[12px] leading-relaxed text-muted'>{t.legend}</p>
    </div>
  )
}
