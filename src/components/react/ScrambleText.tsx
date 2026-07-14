import { useEffect, useRef } from 'react'

interface Props {
  /** Single phrase to reveal. */
  text?: string
  /** Phrases to cycle through on hover. Takes precedence over `text`. */
  phrases?: string[]
  className?: string
}

const CHARS = '!<>-_\\/[]{}=+*^?#§$%'

interface QueueItem {
  from: string
  to: string
  start: number
  end: number
  char?: string
}

export default function ScrambleText({ text, phrases, className = '' }: Props) {
  const list = phrases && phrases.length ? phrases : [text ?? '']
  const elRef = useRef<HTMLSpanElement>(null)
  const frame = useRef(0)
  const raf = useRef<number>()
  const queue = useRef<QueueItem[]>([])
  const index = useRef(0)

  const update = () => {
    const el = elRef.current
    if (!el) return
    let output = ''
    let complete = 0
    for (const item of queue.current) {
      if (frame.current >= item.end) {
        complete++
        output += item.to
      } else if (frame.current >= item.start) {
        if (!item.char || Math.random() < 0.28) {
          item.char = CHARS[Math.floor(Math.random() * CHARS.length)]
        }
        output += `<span class="text-muted/70">${item.char}</span>`
      } else {
        output += item.from
      }
    }
    el.innerHTML = output
    if (complete !== queue.current.length) {
      frame.current++
      raf.current = requestAnimationFrame(update)
    }
  }

  const setText = (newText: string) => {
    const el = elRef.current
    if (!el) return
    const oldText = el.textContent || ''
    const length = Math.max(oldText.length, newText.length)
    const next: QueueItem[] = []
    for (let i = 0; i < length; i++) {
      const start = Math.floor(Math.random() * 30)
      next.push({
        from: oldText[i] || '',
        to: newText[i] || '',
        start,
        end: start + Math.floor(Math.random() * 30)
      })
    }
    queue.current = next
    if (raf.current) cancelAnimationFrame(raf.current)
    frame.current = 0
    update()
  }

  useEffect(() => {
    const el = elRef.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = list[0]
      return
    }
    // Draw in the first time it scrolls into view.
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setText(list[0])
            obs.disconnect()
          }
        })
      },
      { threshold: 0.6 }
    )
    io.observe(el)
    return () => {
      io.disconnect()
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [])

  const onEnter = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    index.current = (index.current + 1) % list.length
    setText(list[index.current])
  }

  return (
    <span
      ref={elRef}
      className={`inline-block select-none ${className}`}
      aria-label={list[0]}
      onMouseEnter={onEnter}
    >
      {list[0]}
    </span>
  )
}
