import { useEffect, useRef, useState } from 'react'

interface Props {
  /** How many days back from today are selectable. */
  logDays?: number
  className?: string
}

interface DayInfo {
  date: Date
  selectable: boolean
  future: boolean
}

const SLOT = 10 // px width of each day slot
const GAP = 3 // px gap between slots
const PITCH = SLOT + GAP
const BASE_H = 24
const PEAK_H = 64
const SIGMA = 4.5

const PAST = 46 // days rendered before today
const FUTURE = 40 // days rendered after today

export default function DateSelector({ logDays = 38, className = '' }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [days, setDays] = useState<DayInfo[]>([])
  const [sel, setSel] = useState(0)
  const [width, setWidth] = useState(0)
  const bounds = useRef({ min: 0, max: 0 })

  // Build day list on the client (avoids SSR/CSR date mismatch).
  useEffect(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const list: DayInfo[] = []
    for (let o = -PAST; o <= FUTURE; o++) {
      const d = new Date(today)
      d.setDate(d.getDate() + o)
      list.push({ date: d, future: o > 0, selectable: o <= 0 && o >= -logDays })
    }
    const todayIndex = PAST
    bounds.current = { min: PAST - logDays, max: todayIndex }
    setDays(list)
    setSel(todayIndex)
  }, [logDays])

  // Track viewport width so we can centre the selected bar.
  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const update = () => setWidth(el.clientWidth)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const ready = days.length > 0 && width > 0
  const heightAt = (i: number) =>
    BASE_H + (PEAK_H - BASE_H) * Math.exp(-((i - sel) ** 2) / (2 * SIGMA * SIGMA))
  const translateX = width / 2 - (sel * PITCH + SLOT / 2)

  const label = days[sel]
    ? days[sel].date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : ''

  const go = (i: number) => {
    if (days[i]?.selectable) setSel(i)
  }

  return (
    <div className={`flex w-full flex-col gap-3 ${className}`}>
      {/* Header: prev / date / next */}
      <div className='flex w-full items-center justify-between px-1'>
        <button
          type='button'
          title='Previous day'
          aria-label='Previous day'
          disabled={sel <= bounds.current.min}
          onClick={() => go(sel - 1)}
          className='shrink-0 cursor-pointer rounded-xl border border-neutral-200 p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 disabled:cursor-default disabled:opacity-30 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='h-4 w-4'
            aria-hidden='true'
          >
            <path d='m12 19-7-7 7-7' />
            <path d='M19 12H5' />
          </svg>
        </button>

        <div className='flex h-5 items-center justify-center font-mono'>
          <div
            key={sel}
            className='animate-fade-in text-center text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400'
          >
            {label || ' '}
          </div>
        </div>

        <button
          type='button'
          title='Next day'
          aria-label='Next day'
          disabled={sel >= bounds.current.max}
          onClick={() => go(sel + 1)}
          className='shrink-0 cursor-pointer rounded-xl border border-neutral-200 p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 disabled:cursor-default disabled:opacity-30 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='h-4 w-4'
            aria-hidden='true'
          >
            <path d='M5 12h14' />
            <path d='m12 5 7 7-7 7' />
          </svg>
        </button>
      </div>

      {/* Bell-curve timeline */}
      <div
        ref={viewportRef}
        className='relative flex h-20 w-full select-none items-end justify-start overflow-hidden transition-opacity duration-300'
        style={{
          opacity: ready ? 1 : 0,
          WebkitMaskImage:
            'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
          maskImage:
            'linear-gradient(to right, transparent, black 20%, black 80%, transparent)'
        }}
      >
        <div
          className='absolute left-0 flex items-end'
          style={{
            gap: `${GAP}px`,
            transform: `translateX(${translateX}px)`,
            transition: 'transform 500ms cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {days.map((day, i) => {
            const h = heightAt(i)
            const selected = i === sel
            const dateLabel = day.date.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })
            return (
              <div
                key={i}
                className='relative flex h-20 w-[10px] shrink-0 flex-col items-center justify-end'
              >
                <button
                  type='button'
                  disabled={!day.selectable}
                  aria-label={`Go to log for ${dateLabel}`}
                  aria-current={selected ? 'location' : undefined}
                  title={dateLabel}
                  onClick={() => go(i)}
                  className={`group flex h-20 w-[10px] shrink-0 items-end justify-center border-0 bg-transparent p-0 outline-none ${
                    day.selectable ? 'cursor-pointer' : 'cursor-default'
                  }`}
                >
                  {day.future ? (
                    <span
                      className='block border-l-[4px] border-dotted border-neutral-300/40 bg-transparent transition-[height] duration-500 ease-out dark:border-neutral-700/30'
                      style={{ width: 0, height: `${h}px` }}
                    />
                  ) : (
                    <span
                      className={`block rounded-t-full transition-[height,background-color] duration-500 ease-out ${
                        selected
                          ? 'bg-red-500 dark:bg-red-400'
                          : day.selectable
                            ? 'bg-neutral-300 group-hover:bg-neutral-500 dark:bg-neutral-700 dark:group-hover:bg-neutral-400'
                            : 'bg-neutral-300/40 dark:bg-neutral-700/30'
                      }`}
                      style={{ width: 4, height: `${h}px` }}
                    />
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
