import { useState } from 'react'

type Lang = 'es' | 'en'

interface Props {
  lang?: Lang
}

type Tone = 'emerald' | 'sky' | 'rose' | 'amber' | 'violet' | 'slate'

interface ToneStyle {
  dot: string
  active: string
  label: string
}

const TONES: Record<Tone, ToneStyle> = {
  emerald: {
    dot: 'bg-emerald-500',
    active: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    label: 'text-emerald-600 dark:text-emerald-400'
  },
  sky: {
    dot: 'bg-sky-500',
    active: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
    label: 'text-sky-600 dark:text-sky-400'
  },
  rose: {
    dot: 'bg-rose-500',
    active: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
    label: 'text-rose-600 dark:text-rose-400'
  },
  amber: {
    dot: 'bg-amber-500',
    active: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    label: 'text-amber-600 dark:text-amber-400'
  },
  violet: {
    dot: 'bg-violet-500',
    active: 'bg-violet-500/10 text-violet-700 dark:text-violet-300',
    label: 'text-violet-600 dark:text-violet-400'
  },
  slate: {
    dot: 'bg-slate-400',
    active: 'bg-ink/[0.06] text-ink dark:bg-ink/[0.1]',
    label: 'text-muted'
  }
}

interface Entry {
  name: string
  kind: 'dir' | 'file'
  tone: Tone
  title: { es: string; en: string }
  body: { es: string; en: string }
}

const ENTRIES: Entry[] = [
  {
    name: 'objects/',
    kind: 'dir',
    tone: 'emerald',
    title: { es: 'La base de datos', en: 'The database' },
    body: {
      es: 'Aquí viven físicamente los snapshots. Git guarda tres tipos de objetos: blobs (el contenido de tus archivos), trees (las carpetas) y commits (quién, cuándo y qué tree congela). Cada objeto se identifica por el hash de su contenido: ese encadenamiento de hashes es, literalmente, el merkle tree.',
      en: 'This is where the snapshots physically live. Git stores three object types: blobs (your files’ content), trees (the folders) and commits (who, when, and which tree it freezes). Each object is identified by the hash of its content — that chain of hashes is, literally, the merkle tree.'
    }
  },
  {
    name: 'refs/',
    kind: 'dir',
    tone: 'sky',
    title: { es: 'Las etiquetas', en: 'The labels' },
    body: {
      es: 'Un hash como a3f9c21… no hay quien lo recuerde. refs/ guarda punteros con nombres humanos: tus ramas (refs/heads/main), tus tags (refs/tags/v1.0) y las ramas remotas. Una rama, por dentro, es solo un archivo de texto con el hash del último commit. Nada más.',
      en: 'A hash like a3f9c21… is impossible to remember. refs/ holds pointers with human names: your branches (refs/heads/main), your tags (refs/tags/v1.0) and remote branches. A branch, inside, is just a text file with the hash of the latest commit. Nothing more.'
    }
  },
  {
    name: 'HEAD',
    kind: 'file',
    tone: 'rose',
    title: { es: 'Dónde estás tú', en: 'Where you are' },
    body: {
      es: 'No es una carpeta, es un archivo de una sola línea, pero es clave: apunta a la rama en la que estás trabajando ahora mismo. Cuando haces git checkout, lo único que cambia es esta línea.',
      en: 'Not a folder — a one-line file, but a crucial one: it points to the branch you are working on right now. When you run git checkout, the only thing that changes is this line.'
    }
  },
  {
    name: 'index',
    kind: 'file',
    tone: 'amber',
    title: { es: 'El staging area', en: 'The staging area' },
    body: {
      es: '¿Alguna vez te has preguntado dónde van los archivos cuando haces git add? Van aquí. El index es la "sala de espera" de tu próximo commit: la lista de lo que va a entrar en el siguiente snapshot.',
      en: 'Ever wondered where files go when you run git add? Here. The index is the "waiting room" for your next commit: the list of what will go into the next snapshot.'
    }
  },
  {
    name: 'logs/',
    kind: 'dir',
    tone: 'violet',
    title: { es: 'El diario', en: 'The journal' },
    body: {
      es: 'Registra cada movimiento de HEAD y de tus ramas: cada commit, cada checkout, cada reset. Es lo que consulta git reflog, y la razón por la que "perder" un commit casi nunca es perderlo de verdad.',
      en: 'It records every move of HEAD and your branches: every commit, checkout and reset. It is what git reflog reads, and the reason "losing" a commit is almost never really losing it.'
    }
  },
  {
    name: 'config',
    kind: 'file',
    tone: 'slate',
    title: { es: 'Los ajustes', en: 'The settings' },
    body: {
      es: 'La configuración de este repositorio en concreto: la URL del remoto (tu repo de GitHub), qué ramas siguen a cuáles, tu nombre y email si los defines a nivel local. Cuando haces git remote add origin…, se escribe aquí.',
      en: 'This specific repository’s configuration: the remote URL (your GitHub repo), which branches track which, your name and email if set locally. When you run git remote add origin…, it is written here.'
    }
  },
  {
    name: 'hooks/',
    kind: 'dir',
    tone: 'slate',
    title: { es: 'Los automatismos', en: 'The automations' },
    body: {
      es: 'Scripts que Git ejecuta automáticamente en momentos clave: antes de un commit, antes de un push… Aquí viven cosas como los linters que te bloquean el commit si el código no pasa las reglas. Por defecto solo trae ejemplos desactivados.',
      en: 'Scripts Git runs automatically at key moments: before a commit, before a push… This is where linters that block your commit if the code fails the rules live. By default it only ships disabled examples.'
    }
  },
  {
    name: 'info/',
    kind: 'dir',
    tone: 'slate',
    title: { es: 'Exclusiones locales', en: 'Local excludes' },
    body: {
      es: 'Contiene info/exclude, que funciona como un .gitignore privado: ignora archivos solo en tu máquina, sin compartirlo con el resto del equipo.',
      en: 'Contains info/exclude, which works like a private .gitignore: it ignores files only on your machine, without sharing it with the rest of the team.'
    }
  },
  {
    name: 'description',
    kind: 'file',
    tone: 'slate',
    title: { es: 'description', en: 'description' },
    body: {
      es: 'Un archivo menor: solo lo usan herramientas web antiguas como GitWeb para mostrar el nombre del repositorio.',
      en: 'A minor file: only old web tools like GitWeb use it to show the repository name.'
    }
  },
  {
    name: 'COMMIT_EDITMSG',
    kind: 'file',
    tone: 'slate',
    title: { es: 'COMMIT_EDITMSG', en: 'COMMIT_EDITMSG' },
    body: {
      es: 'Guarda el texto del último mensaje de commit que escribiste. Git lo reutiliza como borrador para el editor.',
      en: 'Stores the text of the last commit message you wrote. Git reuses it as the editor draft.'
    }
  }
]

export default function GitFolderExplorer({ lang = 'en' }: Props) {
  const [active, setActive] = useState(0)
  const entry = ENTRIES[active]
  const tone = TONES[entry.tone]

  return (
    <div className='not-prose my-8 grid gap-3 rounded-lg border border-line bg-bg p-4 sm:grid-cols-[minmax(0,220px)_1fr] sm:p-5'>
      <div>
        <div className='mb-2 font-mono text-[13px] text-ink'>.git/</div>
        <ul className='flex flex-col'>
          {ENTRIES.map((e, i) => {
            const selected = i === active
            const et = TONES[e.tone]
            return (
              <li key={e.name}>
                <button
                  onClick={() => setActive(i)}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left font-mono text-[13px] transition-colors ${
                    selected ? et.active : 'text-muted hover:text-ink'
                  }`}
                  aria-pressed={selected}
                >
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${et.dot}`}
                    style={{ opacity: selected ? 1 : 0.55 }}
                  />
                  <span>{e.name}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <div
        className={`rounded-md border border-line bg-ink/[0.02] p-4 dark:bg-ink/[0.04]`}
      >
        <div className='mb-1 flex items-center gap-2'>
          <span className={`h-2.5 w-2.5 rounded-full ${tone.dot}`} />
          <span className='font-mono text-[12px] text-muted'>
            .git/{entry.name}
          </span>
        </div>
        <h4 className={`mb-2 text-base font-semibold ${tone.label}`}>
          {entry.title[lang]}
        </h4>
        <p className='text-[14px] leading-relaxed text-muted'>
          {entry.body[lang]}
        </p>
      </div>
    </div>
  )
}
