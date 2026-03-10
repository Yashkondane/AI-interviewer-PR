"use client"

import { useEffect, useRef } from "react"

interface Particle {
  angle: number
  speed: number
  radius: number
  radiusOffset: number
  y: number
  ySpeed: number
  yRange: number
  yCenter: number
  alpha: number
  size: number
  hue: number
  trail: { x: number; y: number }[]
}

export default function ParticleFlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId: number
    let W = 0
    let H = 0

    const particles: Particle[] = []
    const NUM = 220
    const TRAIL = 18

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      W = parent.clientWidth
      H = parent.clientHeight
      canvas.width = W * window.devicePixelRatio
      canvas.height = H * window.devicePixelRatio
      canvas.style.width = W + "px"
      canvas.style.height = H + "px"
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    resize()
    window.addEventListener("resize", resize)

    // Build particles
    for (let i = 0; i < NUM; i++) {
      const layer = Math.random()
      // layered rings from center out
      const ringIdx = Math.floor(layer * 5)
      const baseRadius = 30 + ringIdx * 28
      particles.push({
        angle: Math.random() * Math.PI * 2,
        speed: (0.004 + Math.random() * 0.008) * (Math.random() < 0.5 ? 1 : -1),
        radius: baseRadius,
        radiusOffset: (Math.random() - 0.5) * 16,
        y: 0,
        ySpeed: 0.3 + Math.random() * 0.6,
        yRange: 40 + Math.random() * 80,
        yCenter: (Math.random() - 0.5) * 60,
        alpha: 0.4 + Math.random() * 0.55,
        size: 1.2 + Math.random() * 2.2,
        hue: 200 + Math.random() * 40, // 200–240 = blue spectrum
        trail: [],
      })
    }

    let t = 0

    const draw = () => {
      animId = requestAnimationFrame(draw)
      if (W === 0 || H === 0) return

      const cx = W / 2
      const cy = H / 2

      // Fade background
      ctx.fillStyle = "rgba(4, 13, 26, 0.18)"
      ctx.fillRect(0, 0, W, H)

      t += 0.016

      // Central glow
      const glowR = 55 + Math.sin(t * 1.2) * 6
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR)
      grd.addColorStop(0, `rgba(59, 130, 246, ${0.22 + Math.sin(t * 1.8) * 0.06})`)
      grd.addColorStop(0.5, `rgba(37, 99, 235, 0.10)`)
      grd.addColorStop(1, "transparent")
      ctx.beginPath()
      ctx.arc(cx, cy, glowR, 0, Math.PI * 2)
      ctx.fillStyle = grd
      ctx.fill()

      // Outer ring glow
      const outerGrd = ctx.createRadialGradient(cx, cy, 100, cx, cy, 180)
      outerGrd.addColorStop(0, "transparent")
      outerGrd.addColorStop(0.5, `rgba(99, 179, 237, ${0.04 + Math.sin(t * 0.7) * 0.02})`)
      outerGrd.addColorStop(1, "transparent")
      ctx.beginPath()
      ctx.arc(cx, cy, 180, 0, Math.PI * 2)
      ctx.fillStyle = outerGrd
      ctx.fill()

      for (const p of particles) {
        p.angle += p.speed
        const r = p.radius + p.radiusOffset + Math.sin(t * 0.8 + p.angle * 2) * 12
        // vertical oscillation gives a "flow" feel
        p.y = p.yCenter + Math.sin(t * p.ySpeed + p.angle * 3) * p.yRange * 0.5

        const x = cx + Math.cos(p.angle) * r
        const y = cy + p.y + Math.sin(p.angle * 2 + t * 0.4) * 18

        // push trail
        p.trail.push({ x, y })
        if (p.trail.length > TRAIL) p.trail.shift()

        // draw trail
        if (p.trail.length > 2) {
          for (let ti = 1; ti < p.trail.length; ti++) {
            const prog = ti / p.trail.length
            ctx.beginPath()
            ctx.moveTo(p.trail[ti - 1].x, p.trail[ti - 1].y)
            ctx.lineTo(p.trail[ti].x, p.trail[ti].y)
            ctx.strokeStyle = `hsla(${p.hue}, 80%, 65%, ${prog * p.alpha * 0.5})`
            ctx.lineWidth = p.size * prog * 0.7
            ctx.stroke()
          }
        }

        // draw particle dot
        const ptGrd = ctx.createRadialGradient(x, y, 0, x, y, p.size * 2.5)
        ptGrd.addColorStop(0, `hsla(${p.hue}, 90%, 80%, ${p.alpha})`)
        ptGrd.addColorStop(1, `hsla(${p.hue}, 80%, 55%, 0)`)
        ctx.beginPath()
        ctx.arc(x, y, p.size * 2.5, 0, Math.PI * 2)
        ctx.fillStyle = ptGrd
        ctx.fill()
      }

      // Bright core dot
      const coreSize = 8 + Math.sin(t * 2.2) * 2
      const coreGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreSize * 3)
      coreGrd.addColorStop(0, `rgba(219, 234, 254, ${0.9 + Math.sin(t * 2.5) * 0.1})`)
      coreGrd.addColorStop(0.3, `rgba(96, 165, 250, 0.6)`)
      coreGrd.addColorStop(1, "transparent")
      ctx.beginPath()
      ctx.arc(cx, cy, coreSize * 3, 0, Math.PI * 2)
      ctx.fillStyle = coreGrd
      ctx.fill()

      // Axis rings (subtle)
      for (let ri = 0; ri < 3; ri++) {
        const rr = 55 + ri * 45
        const ringAlpha = 0.07 - ri * 0.015
        ctx.beginPath()
        ctx.arc(cx, cy, rr, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(96, 165, 250, ${ringAlpha + Math.sin(t * 0.5 + ri) * 0.02})`
        ctx.lineWidth = 1
        ctx.stroke()
      }
    }

    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <div
      className="w-full rounded-2xl overflow-hidden relative"
      style={{ height: "520px", background: "#040d1a" }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  )
}
