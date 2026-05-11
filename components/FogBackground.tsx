'use client'
import { useEffect, useRef } from 'react'

interface P {
  x: number; y: number
  vx: number; vy: number
  r: number
  a: number; aLo: number; aHi: number
  aSpd: number; aDir: number
}

function makeParticle(w: number, h: number): P {
  const rng = Math.random()
  let r: number, aHi: number, spd: number

  if (rng < 0.55) {
    // Tier 1 — dust: barely visible, almost still
    r    = 0.15 + Math.random() * 0.35
    aHi  = 0.04 + Math.random() * 0.10
    spd  = 0.012 + Math.random() * 0.055
  } else if (rng < 0.88) {
    // Tier 2 — float: clearly drifting
    r    = 0.5  + Math.random() * 0.85
    aHi  = 0.10 + Math.random() * 0.20
    spd  = 0.07 + Math.random() * 0.18
  } else {
    // Tier 3 — drift: visibly moving specks
    r    = 1.1  + Math.random() * 1.1
    aHi  = 0.18 + Math.random() * 0.22
    spd  = 0.24 + Math.random() * 0.38
  }

  const ang = Math.random() * Math.PI * 2
  const aLo = aHi * 0.12

  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: Math.cos(ang) * spd,
    vy: Math.sin(ang) * spd - spd * 0.12, // slight upward bias
    r,
    a: aLo + Math.random() * (aHi - aLo),
    aLo, aHi,
    aSpd: 0.0006 + Math.random() * 0.004,
    aDir: Math.random() > 0.5 ? 1 : -1,
  }
}

export function FogBackground() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ctx = el.getContext('2d')
    if (!ctx) return

    let raf: number
    let pts: P[] = []

    const init = () => {
      el.width  = window.innerWidth
      el.height = window.innerHeight
      const n = Math.min(220, Math.floor(el.width * el.height / 5200))
      pts = Array.from({ length: n }, () => makeParticle(el.width, el.height))
    }

    const tick = () => {
      ctx.clearRect(0, 0, el.width, el.height)
      for (const p of pts) {
        p.x += p.vx
        p.y += p.vy
        p.a += p.aSpd * p.aDir
        if (p.a >= p.aHi) { p.a = p.aHi; p.aDir = -1 }
        if (p.a <= p.aLo) { p.a = p.aLo; p.aDir =  1 }
        if (p.x < -6) p.x = el.width  + 6
        if (p.x > el.width  + 6) p.x = -6
        if (p.y < -6) p.y = el.height + 6
        if (p.y > el.height + 6) p.y = -6

        ctx.globalAlpha = p.a
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = '#fff'
        ctx.fill()
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(tick)
    }

    init()
    tick()
    window.addEventListener('resize', init)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', init) }
  }, [])

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  )
}
