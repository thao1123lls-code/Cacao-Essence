'use client'
import { useEffect, useRef } from 'react'

/** Lưới lục giác bazan phản ứng theo con trỏ / ngón tay, vẽ trên canvas. */
export default function HexField() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current!
    const hero = cv.parentElement!
    const ctx = cv.getContext('2d')!
    const R = 30
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0, h = 0, mx = -999, my = -999, vis = true, raf = 0

    const size = () => {
      w = hero.clientWidth; h = hero.clientHeight
      cv.width = w * dpr; cv.height = h * dpr
      cv.style.width = w + 'px'; cv.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const move = (e: PointerEvent | TouchEvent) => {
      const r = hero.getBoundingClientRect()
      const q = 'touches' in e ? e.touches[0] : e
      mx = q.clientX - r.left; my = q.clientY - r.top
    }
    const leave = () => { mx = my = -999 }
    const hex = (x: number, y: number, r: number) => {
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i + Math.PI / 6
        ctx.lineTo(x + r * Math.cos(a), y + r * Math.sin(a))
      }
      ctx.closePath()
    }
    const draw = (t: number) => {
      if (vis) {
        ctx.clearRect(0, 0, w, h)
        const dx = R * Math.sqrt(3), dy = R * 1.5
        for (let row = 0; row * dy < h + R; row++)
          for (let col = -1; col * dx < w + dx; col++) {
            const x = col * dx + (row % 2 ? dx / 2 : 0), y = row * dy
            const n = Math.max(0, 1 - Math.hypot(x - mx, y - my) / 200)
            const a = n * 0.8 + ((Math.sin(x * 0.011 + y * 0.008 + t * 0.0011) + 1) / 2) * 0.1
            if (a < 0.03) continue
            hex(x, y, R - 2)
            if (n > 0.05) { ctx.fillStyle = `rgba(180,86,43,${n * 0.35})`; ctx.fill() }
            ctx.strokeStyle = `rgba(180,86,43,${Math.min(a, 0.65)})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
      }
      if (!reduce) raf = requestAnimationFrame(draw)
    }
    size()
    const io = new IntersectionObserver((es) => { vis = es[0].isIntersecting })
    io.observe(hero)
    window.addEventListener('resize', size)
    hero.addEventListener('pointermove', move)
    hero.addEventListener('touchmove', move, { passive: true })
    hero.addEventListener('pointerleave', leave)
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf); io.disconnect()
      window.removeEventListener('resize', size)
      hero.removeEventListener('pointermove', move)
      hero.removeEventListener('touchmove', move)
      hero.removeEventListener('pointerleave', leave)
    }
  }, [])
  return <canvas id="hexcv" ref={ref} aria-hidden="true" />
}
