import { useEffect, useRef } from 'react'

interface Props {
  name?: string
  role?: string
  event?: string
  className?: string
}

interface Point {
  x: number
  y: number
  ox: number
  oy: number
  pinned: boolean
}

const N_ROPE = 14 // rope points, index 0 is the pin, last is the clip
const ROPE_LEN = 110
const BADGE_W = 168
const BADGE_H = 224
const STRAP = 14
const GRAVITY = 0.75
const FRICTION = 0.985
const ITER = 18

export default function LanyardBadge({
  name = 'David Huertas',
  role = 'Software Engineer',
  event = 'Launch Week',
  className = ''
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const ropeRef = useRef<SVGPathElement>(null)
  const grommetRef = useRef<SVGCircleElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const rope = ropeRef.current
    const badge = badgeRef.current
    const grommet = grommetRef.current
    if (!wrap || !rope || !badge || !grommet) return

    const W = wrap.clientWidth || 320
    const cx = W / 2
    const topY = 6
    const segLen = ROPE_LEN / (N_ROPE - 1)
    const cordLen = STRAP + BADGE_H / 2

    // Build the point chain: pin -> rope -> clip -> badge centre of mass.
    const pts: Point[] = []
    for (let i = 0; i < N_ROPE; i++) {
      const y = topY + i * segLen
      pts.push({ x: cx, y, ox: cx, oy: y, pinned: i === 0 })
    }
    const clipIndex = N_ROPE - 1
    const comY = pts[clipIndex].y + cordLen
    const com: Point = { x: cx, y: comY, ox: cx, oy: comY, pinned: false }
    pts.push(com)

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const drag = { active: false, x: 0, y: 0, dx: 0, dy: 0 }

    const constrain = (a: Point, b: Point, len: number) => {
      const dx = b.x - a.x
      const dy = b.y - a.y
      const d = Math.hypot(dx, dy) || 0.0001
      const diff = (len - d) / d
      const mx = dx * diff
      const my = dy * diff
      const aw = a.pinned ? 0 : b.pinned ? 1 : 0.5
      const bw = b.pinned ? 0 : a.pinned ? 1 : 0.5
      a.x -= mx * aw
      a.y -= my * aw
      b.x += mx * bw
      b.y += my * bw
    }

    const render = () => {
      const clip = pts[clipIndex]
      let ux = clip.x - com.x
      let uy = clip.y - com.y
      const ul = Math.hypot(ux, uy) || 0.0001
      ux /= ul
      uy /= ul
      const topX = com.x + ux * (BADGE_H / 2)
      const topYb = com.y + uy * (BADGE_H / 2)

      let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
      for (let i = 1; i < N_ROPE; i++) {
        d += ` L ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}`
      }
      d += ` L ${topX.toFixed(1)} ${topYb.toFixed(1)}`
      rope.setAttribute('d', d)
      grommet.setAttribute('cx', topX.toFixed(1))
      grommet.setAttribute('cy', topYb.toFixed(1))

      const deg = (Math.atan2(ux, -uy) * 180) / Math.PI
      badge.style.transform = `translate(${(com.x - BADGE_W / 2).toFixed(
        1
      )}px, ${(com.y - BADGE_H / 2).toFixed(1)}px) rotate(${deg.toFixed(2)}deg)`
    }

    let raf = 0
    const frame = () => {
      for (const p of pts) {
        if (p.pinned) continue
        const vx = (p.x - p.ox) * FRICTION
        const vy = (p.y - p.oy) * FRICTION
        p.ox = p.x
        p.oy = p.y
        p.x += vx
        p.y += vy + GRAVITY
      }
      if (drag.active) {
        com.x = drag.x + drag.dx
        com.y = drag.y + drag.dy
        com.ox = com.x
        com.oy = com.y
      }
      for (let k = 0; k < ITER; k++) {
        for (let i = 0; i < clipIndex; i++) constrain(pts[i], pts[i + 1], segLen)
        constrain(pts[clipIndex], com, cordLen)
        pts[0].x = cx
        pts[0].y = topY
        if (drag.active) {
          com.x = drag.x + drag.dx
          com.y = drag.y + drag.dy
        }
      }
      render()
      raf = requestAnimationFrame(frame)
    }

    render()
    wrap.style.opacity = '1'
    if (!reduce) raf = requestAnimationFrame(frame)

    // Pointer dragging.
    const toLocal = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onDown = (e: PointerEvent) => {
      if (reduce) return
      const l = toLocal(e)
      drag.active = true
      drag.dx = com.x - l.x
      drag.dy = com.y - l.y
      drag.x = l.x
      drag.y = l.y
      com.pinned = true
      badge.setPointerCapture(e.pointerId)
      badge.style.cursor = 'grabbing'
    }
    const onMove = (e: PointerEvent) => {
      if (!drag.active) return
      const l = toLocal(e)
      drag.x = l.x
      drag.y = l.y
    }
    const onUp = (e: PointerEvent) => {
      if (!drag.active) return
      drag.active = false
      com.pinned = false
      // Preserve the throw velocity by keeping the last delta.
      try {
        badge.releasePointerCapture(e.pointerId)
      } catch (_) {}
      badge.style.cursor = 'grab'
    }

    badge.addEventListener('pointerdown', onDown)
    badge.addEventListener('pointermove', onMove)
    badge.addEventListener('pointerup', onUp)
    badge.addEventListener('pointercancel', onUp)

    return () => {
      cancelAnimationFrame(raf)
      badge.removeEventListener('pointerdown', onDown)
      badge.removeEventListener('pointermove', onMove)
      badge.removeEventListener('pointerup', onUp)
      badge.removeEventListener('pointercancel', onUp)
    }
  }, [])

  return (
    <div
      ref={wrapRef}
      className={`relative h-[360px] w-full select-none opacity-0 transition-opacity duration-300 ${className}`}
    >
      {/* Pin / hook */}
      <div className='absolute left-1/2 top-1 h-2 w-10 -translate-x-1/2 rounded-full bg-ink/70' />

      {/* Lanyard cord */}
      <svg
        ref={svgRef}
        className='pointer-events-none absolute inset-0 h-full w-full overflow-visible'
      >
        <path
          ref={ropeRef}
          fill='none'
          stroke='url(#lanyard-grad)'
          strokeWidth='7'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
        <circle ref={grommetRef} r='4' className='fill-ink/60' />
        <defs>
          <linearGradient
            id='lanyard-grad'
            gradientUnits='userSpaceOnUse'
            x1='0'
            y1='0'
            x2='0'
            y2='360'
          >
            <stop offset='0' stopColor='#6366f1' />
            <stop offset='1' stopColor='#0ea5e9' />
          </linearGradient>
        </defs>
      </svg>

      {/* Badge */}
      <div
        ref={badgeRef}
        className='absolute left-0 top-0 cursor-grab touch-none'
        style={{ width: BADGE_W, height: BADGE_H, transformOrigin: '50% 50%' }}
      >
        <div className='flex h-full w-full flex-col overflow-hidden rounded-xl border border-black/10 bg-white text-neutral-900 shadow-xl'>
          {/* Punch hole */}
          <div className='mx-auto mt-2 h-1.5 w-10 rounded-full bg-black/15' />

          {/* Header band */}
          <div className='mt-2 flex items-center justify-between bg-gradient-to-r from-indigo-500 to-sky-500 px-3 py-1.5 text-white'>
            <span className='font-mono text-[9px] uppercase tracking-[0.2em]'>
              {event}
            </span>
            <span className='text-[11px]'>🚀</span>
          </div>

          {/* Body */}
          <div className='flex flex-1 flex-col items-center justify-center gap-2 px-3 text-center'>
            <div className='grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 text-lg font-semibold text-white'>
              {name
                .split(' ')
                .map((w) => w[0])
                .join('')
                .slice(0, 2)}
            </div>
            <div>
              <p className='text-sm font-semibold leading-tight'>{name}</p>
              <p className='font-mono text-[10px] text-neutral-500'>{role}</p>
            </div>
          </div>

          {/* Footer barcode */}
          <div className='flex items-center justify-between gap-2 border-t border-black/10 px-3 py-2'>
            <div
              className='h-5 flex-1'
              style={{
                backgroundImage:
                  'repeating-linear-gradient(90deg, #171717 0 1px, transparent 1px 3px, #171717 3px 4px, transparent 4px 7px)'
              }}
            />
            <span className='font-mono text-[8px] uppercase tracking-widest text-neutral-500'>
              Attendee
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
