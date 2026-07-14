import { useEffect, useState } from 'react'

interface Props {
  className?: string
}

interface Day {
  date: Date
  count: number
  level: number
  future: boolean
}

interface Tooltip {
  show: boolean
  text: string
  x: number
  y: number
}

const LEVEL_CLASS = [
  'bg-ink/[0.06] dark:bg-ink/[0.09]',
  'bg-emerald-200 dark:bg-emerald-900',
  'bg-emerald-300 dark:bg-emerald-700',
  'bg-emerald-400 dark:bg-emerald-600',
  'bg-emerald-500 dark:bg-emerald-400'
]

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

const levelOf = (c: number) =>
  c === 0 ? 0 : c < 3 ? 1 : c < 6 ? 2 : c < 10 ? 3 : 4

export default function ContributionGrid({ className = '' }: Props) {
  const [weeks, setWeeks] = useState<Day[][]>([])
  const [total, setTotal] = useState(0)
  const [tip, setTip] = useState<Tooltip>({ show: false, text: '', x: 0, y: 0 })

  // Build the data on the client to avoid SSR/CSR date & random mismatches.
  useEffect(() => {
    const end = new Date()
    end.setHours(0, 0, 0, 0)
    const start = new Date(end)
    start.setDate(start.getDate() - 364)
    start.setDate(start.getDate() - start.getDay()) // align to Sunday

    const result: Day[][] = []
    let sum = 0
    const cur = new Date(start)
    while (cur <= end) {
      const week: Day[] = []
      for (let d = 0; d < 7; d++) {
        if (cur > end) {
          week.push({ date: new Date(cur), count: 0, level: 0, future: true })
        } else {
          const r = Math.random()
          const count = r < 0.4 ? 0 : Math.floor(Math.pow(Math.random(), 1.8) * 16)
          sum += count
          week.push({ date: new Date(cur), count, level: levelOf(count), future: false })
        }
        cur.setDate(cur.getDate() + 1)
      }
      result.push(week)
    }
    setWeeks(result)
    setTotal(sum)
  }, [])

  const monthLabels = weeks.map((week, i) => {
    const month = week[0].date.getMonth()
    const prev = i > 0 ? weeks[i - 1][0].date.getMonth() : -1
    return month !== prev ? MONTHS[month] : ''
  })

  const enter = (day: Day, e: React.MouseEvent) => {
    if (day.future) return
    const label = day.date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
    const text =
      day.count === 0
        ? `No contributions · ${label}`
        : `${day.count} contribution${day.count !== 1 ? 's' : ''} · ${label}`
    setTip({ show: true, text, x: e.clientX, y: e.clientY })
  }

  return (
    <div className={`w-full ${className}`}>
      <p className='mb-3 font-mono text-xs text-muted'>
        {total.toLocaleString()} contributions in the last year
      </p>

      <div className='overflow-x-auto pb-1'>
        <div className='inline-flex flex-col gap-2'>
          {/* Month labels */}
          <div className='flex gap-1 pl-8'>
            <div
              className='grid gap-1'
              style={{ gridTemplateColumns: `repeat(${weeks.length}, 0.75rem)` }}
            >
              {monthLabels.map((m, i) => (
                <div key={i} className='relative h-3'>
                  {m && (
                    <span className='absolute left-0 top-0 whitespace-nowrap font-mono text-[10px] text-muted'>
                      {m}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Day labels + grid */}
          <div className='flex gap-1'>
            <div className='grid w-7 grid-rows-7 gap-1'>
              {DAY_LABELS.map((d, i) => (
                <div
                  key={i}
                  className='flex h-3 items-center font-mono text-[9px] text-muted'
                >
                  {d}
                </div>
              ))}
            </div>

            <div
              className='grid grid-flow-col grid-rows-7 gap-1'
              onMouseLeave={() => setTip((t) => ({ ...t, show: false }))}
            >
              {weeks.map((week, w) =>
                week.map((day, d) => (
                  <div
                    key={`${w}-${d}`}
                    onMouseEnter={(e) => enter(day, e)}
                    onMouseMove={(e) => enter(day, e)}
                    className={`h-3 w-3 rounded-sm ${
                      day.future ? 'invisible' : LEVEL_CLASS[day.level]
                    }`}
                  />
                ))
              )}
            </div>
          </div>

          {/* Legend */}
          <div className='flex items-center justify-end gap-1 pt-1 font-mono text-[10px] text-muted'>
            <span>Less</span>
            {LEVEL_CLASS.map((c, i) => (
              <span key={i} className={`h-3 w-3 rounded-sm ${c}`} />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tip.show && (
        <div
          className='pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-[140%] whitespace-nowrap rounded-md bg-ink px-2 py-1 font-mono text-[11px] text-bg shadow-lg'
          style={{ left: tip.x, top: tip.y }}
        >
          {tip.text}
        </div>
      )}
    </div>
  )
}
