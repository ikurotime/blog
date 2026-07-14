import { useRef, useState } from 'react'

interface Props {
  name?: string
  handle?: string
  ticketNumber?: number
  eventName?: string
  className?: string
}

interface Pointer {
  x: number
  y: number
  active: boolean
}

export default function TicketCard({
  name = 'David Huertas',
  handle = '@ikurotime',
  ticketNumber = 1337,
  eventName = 'Launch Week',
  className = ''
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [p, setP] = useState<Pointer>({ x: 50, y: 50, active: false })

  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduce || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    setP({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      active: true
    })
  }

  const onLeave = () => setP({ x: 50, y: 50, active: false })

  const rotateX = ((50 - p.y) / 50) * 12
  const rotateY = ((p.x - 50) / 50) * 16
  const transform = p.active
    ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`
    : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)'

  const ticket = String(ticketNumber).padStart(6, '0')

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`group relative aspect-[1.6/1] w-full max-w-[340px] select-none rounded-2xl ${className}`}
      style={{
        transform,
        transition: p.active
          ? 'transform 120ms ease-out'
          : 'transform 600ms cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Gradient border glow */}
      <div
        aria-hidden='true'
        className='absolute -inset-px rounded-2xl opacity-70'
        style={{
          background:
            'linear-gradient(140deg, rgba(56,189,248,.5), rgba(168,85,247,.4) 40%, rgba(16,185,129,.4) 70%, rgba(255,255,255,.1))'
        }}
      />

      {/* Card body */}
      <div className='absolute inset-0 overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 p-5 text-neutral-100'>
        {/* Base sheen */}
        <div
          aria-hidden='true'
          className='pointer-events-none absolute inset-0'
          style={{
            background:
              'radial-gradient(120% 120% at 0% 0%, rgba(56,189,248,.14), transparent 45%), radial-gradient(120% 120% at 100% 100%, rgba(168,85,247,.16), transparent 45%)'
          }}
        />
        {/* Holographic foil */}
        <div
          aria-hidden='true'
          className='pointer-events-none absolute inset-0'
          style={{
            backgroundImage:
              'linear-gradient(115deg, transparent 25%, rgba(236,72,153,.45) 40%, rgba(56,189,248,.45) 50%, rgba(16,185,129,.45) 60%, transparent 75%)',
            backgroundSize: '220% 220%',
            backgroundPosition: `${p.x}% ${p.y}%`,
            mixBlendMode: 'color-dodge',
            opacity: p.active ? 0.55 : 0.2,
            transition: p.active ? 'none' : 'opacity 600ms ease'
          }}
        />
        {/* Specular glare */}
        <div
          aria-hidden='true'
          className='pointer-events-none absolute inset-0'
          style={{
            background: `radial-gradient(circle at ${p.x}% ${p.y}%, rgba(255,255,255,.35), transparent 42%)`,
            opacity: p.active ? 1 : 0,
            transition: p.active ? 'none' : 'opacity 600ms ease'
          }}
        />

        {/* Content */}
        <div className='relative flex h-full flex-col justify-between'>
          <div className='flex items-center justify-between'>
            <span className='font-mono text-[11px] uppercase tracking-[0.2em] text-white/60'>
              {eventName}
            </span>
            <span className='inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/10 text-[13px]'>
              🚀
            </span>
          </div>

          <div>
            <p className='text-lg font-semibold tracking-tight'>{name}</p>
            <p className='font-mono text-xs text-white/50'>{handle}</p>
          </div>

          <div className='flex items-end justify-between'>
            <span className='font-mono text-[10px] uppercase tracking-[0.18em] text-white/40'>
              Admit one
            </span>
            <span className='font-mono text-sm text-white/80'>No. {ticket}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
