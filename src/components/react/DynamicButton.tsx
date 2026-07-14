import { useEffect, useLayoutEffect, useRef, useState } from 'react'

interface Props {
  className?: string
}

type State = 'idle' | 'loading' | 'done'

const LABELS: Record<State, string> = {
  idle: 'Deploy',
  loading: 'Deploying',
  done: 'Deployed'
}

// Run layout effects on the client, plain effects on the server (no SSR warning).
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

function Icon({ state }: { state: State }) {
  if (state === 'loading') {
    return (
      <svg
        width='14'
        height='14'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        className='animate-spin'
      >
        <path d='M21 12a9 9 0 1 1-6.219-8.56' />
      </svg>
    )
  }
  if (state === 'done') {
    return (
      <svg
        width='14'
        height='14'
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth='2.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path d='M20 6 9 17l-5-5' />
      </svg>
    )
  }
  return (
    <svg
      width='14'
      height='14'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M5 12h14' />
      <path d='m12 5 7 7-7 7' />
    </svg>
  )
}

export default function DynamicButton({ className = '' }: Props) {
  const btnRef = useRef<HTMLButtonElement>(null)
  const prevWidth = useRef<number | null>(null)
  const timers = useRef<number[]>([])
  const [state, setState] = useState<State>('idle')

  // Animate the width between states: measure natural end width, snap to the
  // previous width, force a reflow, then transition to the new width.
  useIsomorphicLayoutEffect(() => {
    const btn = btnRef.current
    if (!btn) return
    btn.style.width = 'auto'
    const endW = btn.offsetWidth
    const startW = prevWidth.current ?? endW
    btn.style.width = `${startW}px`
    void btn.getBoundingClientRect()
    btn.style.width = `${endW}px`
    prevWidth.current = endW
  }, [state])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const onClick = () => {
    if (state !== 'idle') return
    setState('loading')
    timers.current.push(
      window.setTimeout(() => {
        setState('done')
        timers.current.push(
          window.setTimeout(() => setState('idle'), 1400)
        )
      }, 1500)
    )
  }

  return (
    <button
      ref={btnRef}
      type='button'
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md bg-ink px-4 py-2 text-sm font-medium text-bg outline-none transition-[width,background-color,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:ring-2 focus-visible:ring-ink/30 ${className}`}
    >
      <span className='grid shrink-0 place-items-center'>
        <Icon state={state} />
      </span>
      <span>{LABELS[state]}</span>
    </button>
  )
}
