'use client'
import { useEffect, useRef, useState } from 'react'
import { createScene } from '@/lib/cacao3d'

/** Túi bột cacao 3D (ảnh thật) lắc/xoay + hạt cacao bay quanh (WebGL). Không hỗ trợ WebGL thì hiện lại logo tĩnh. */
export default function Cacao3D() {
  const ref = useRef<HTMLCanvasElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const cv = ref.current!
    const scene = createScene(cv, { front: '/images/pouch-front.webp', back: '/images/pouch-back.webp' })
    if (!scene) { setFailed(true); return }
    const stage = cv.parentElement!
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0, vis = true, t0 = performance.now()

    const loop = (now: number) => {
      if (vis) { scene.scroll = window.scrollY; scene.frame(now - t0) }
      raf = requestAnimationFrame(loop)
    }
    const move = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect()
      scene.pointer.x = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2))
      scene.pointer.y = Math.max(-1, Math.min(1, (0.5 - (e.clientY - r.top) / r.height) * 2))
    }
    const leave = () => { scene.pointer.x = 0; scene.pointer.y = 0 }
    const ro = new ResizeObserver(() => { scene.resize(); if (reduce) scene.frame(2500) })
    const io = new IntersectionObserver((es) => { vis = es[0].isIntersecting })
    ro.observe(cv); io.observe(cv)
    stage.addEventListener('pointermove', move); stage.addEventListener('pointerleave', leave)
    // Giảm chuyển động: vẽ một khung tĩnh, vẽ lại khi ảnh túi tải xong
    const still = reduce ? [200, 800, 2500].map((ms) => window.setTimeout(() => scene.frame(2500), ms)) : []
    if (reduce) scene.frame(2500)
    else raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf); still.forEach(window.clearTimeout); ro.disconnect(); io.disconnect()
      stage.removeEventListener('pointermove', move); stage.removeEventListener('pointerleave', leave)
      scene.dispose()
    }
  }, [])

  if (failed) return <img src="/images/logo.webp" alt="Trọng Đức Cacao – Tinh hoa từ đất Việt" />
  return <canvas className="cv3d" ref={ref} role="img" aria-label="Túi bột cacao Trọng Đức 3D xoay cùng những hạt cacao" />
}
