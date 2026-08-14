import { useEffect, useMemo, useState } from 'react'
import { OBJ } from './gitColors'

type Lang = 'es' | 'en'

interface Props {
  lang?: Lang
}

const COPY = {
  es: {
    label: 'Contenido del archivo',
    placeholder: 'Escribe algo... cada carácter cambia el hash',
    header: 'Git envuelve el contenido así antes de calcular el hash:',
    id: 'ID del objeto (SHA-1)',
    stored: 'Se guarda en',
    hint: 'Cambia una sola letra y el ID entero cambia. Escribe lo mismo dos veces y obtienes el mismo ID: por eso es una base de datos por contenido.',
    computing: 'calculando…'
  },
  en: {
    label: 'File content',
    placeholder: 'Type something... every character changes the hash',
    header: 'Git wraps the content like this before hashing:',
    id: 'Object ID (SHA-1)',
    stored: 'Stored at',
    hint: 'Change a single letter and the whole ID changes. Type the same thing twice and you get the same ID — that is why it is a content-addressed database.',
    computing: 'computing…'
  }
} as const

async function gitBlobHash(content: string): Promise<string> {
  // Git hashes "blob <byteLength>\0<content>" with SHA-1.
  const body = new TextEncoder().encode(content)
  const header = new TextEncoder().encode(`blob ${body.length}\0`)
  const bytes = new Uint8Array(header.length + body.length)
  bytes.set(header, 0)
  bytes.set(body, header.length)
  const digest = await crypto.subtle.digest('SHA-1', bytes)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export default function GitObjectHasher({ lang = 'en' }: Props) {
  const t = COPY[lang]
  const [content, setContent] = useState('Hello, git')
  const [hash, setHash] = useState('')

  const byteLen = useMemo(
    () => new TextEncoder().encode(content).length,
    [content]
  )

  useEffect(() => {
    let alive = true
    gitBlobHash(content).then((h) => {
      if (alive) setHash(h)
    })
    return () => {
      alive = false
    }
  }, [content])

  return (
    <div className='not-prose my-8 rounded-lg border border-line bg-bg p-4 sm:p-5'>
      <label className='mb-2 block font-mono text-[11px] uppercase tracking-wide text-muted'>
        {t.label}
      </label>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        spellCheck={false}
        placeholder={t.placeholder}
        className='w-full resize-none rounded-md border border-line bg-transparent p-3 font-mono text-sm text-ink outline-none focus:border-ink/40'
      />

      <p className='mt-4 mb-1 text-[13px] text-muted'>{t.header}</p>
      <div
        className={`overflow-x-auto rounded-md border p-3 font-mono text-[13px] ${OBJ.blob.node}`}
      >
        <span className={`font-semibold ${OBJ.blob.text}`}>blob {byteLen}</span>
        <span className='text-muted/50'>\0</span>
        <span className='text-ink'>{content || ' '}</span>
      </div>

      <div className='mt-4 flex flex-col gap-1'>
        <span className='font-mono text-[11px] uppercase tracking-wide text-muted'>
          {t.id}
        </span>
        <code
          className={`block break-all font-mono text-sm font-semibold transition-opacity duration-150 ${OBJ.blob.text}`}
          style={{ opacity: hash ? 1 : 0.4 }}
        >
          {hash || t.computing}
        </code>
      </div>

      {hash && (
        <p className='mt-3 font-mono text-[12px] text-muted'>
          {t.stored}{' '}
          <span className='text-ink'>
            .git/objects/
            <span className={OBJ.blob.text}>{hash.slice(0, 2)}</span>/
            <span className={OBJ.blob.text}>{hash.slice(2)}</span>
          </span>
        </p>
      )}

      <p className='mt-4 border-t border-line pt-3 text-[13px] leading-relaxed text-muted'>
        {t.hint}
      </p>
    </div>
  )
}
