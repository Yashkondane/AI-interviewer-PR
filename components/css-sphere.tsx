"use client"

export default function CssSphere() {
  const count = 32
  const half = count / 2
  const d = 320

  const rings = Array.from({ length: count }, (_, idx) => {
    const item = idx + 1
    const angle = (360 / count) * item
    const transform = item <= half ? `rotateY(${angle}deg)` : `rotateX(${angle}deg)`
    return { transform }
  })

  return (
    <div className="sphere-wrapper" aria-hidden>
      {/* Outer ambient glow layers */}
      <div className="glow-outer" />
      <div className="glow-mid" />

      <div className="sphere">
        {rings.map((r, i) => (
          <i key={i} style={{ transform: r.transform }} />
        ))}
        {/* Inner specular highlight overlay */}
        <div className="sphere-sheen" />
      </div>

      <style>{`
        .sphere-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 520px;
          perspective: 900px;
          position: relative;
        }

        /* Outer soft glow */
        .glow-outer {
          position: absolute;
          width: ${d + 220}px;
          height: ${d + 220}px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(37, 99, 235, 0.18) 0%, rgba(37, 99, 235, 0.06) 50%, transparent 72%);
          pointer-events: none;
          animation: pulse 4s ease-in-out infinite;
        }

        /* Mid glow ring */
        .glow-mid {
          position: absolute;
          width: ${d + 80}px;
          height: ${d + 80}px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(96, 165, 250, 0.22) 0%, rgba(59, 130, 246, 0.10) 55%, transparent 75%);
          pointer-events: none;
          animation: pulse 4s ease-in-out infinite 0.5s;
        }

        .sphere {
          width: ${d}px;
          height: ${d}px;
          border-radius: 50%;
          transform-style: preserve-3d;
          animation: sphere-rot 14s linear infinite;
          position: relative;
        }

        .sphere i {
          position: absolute;
          width: ${d}px;
          height: ${d}px;
          border-radius: 50%;
          transform-style: preserve-3d;
          border: 1px solid rgba(147, 197, 253, 0.30);
          box-shadow:
            0 0 6px 0 rgba(59, 130, 246, 0.20),
            inset 0 0 6px 0 rgba(96, 165, 250, 0.12);
        }

        /* Specular highlight — makes it look like a solid glossy sphere */
        .sphere-sheen {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background:
            radial-gradient(ellipse at 35% 28%, rgba(255,255,255,0.18) 0%, transparent 55%),
            radial-gradient(ellipse at 65% 72%, rgba(59, 130, 246, 0.10) 0%, transparent 50%);
          pointer-events: none;
          z-index: 10;
          transform: translateZ(1px);
        }

        @keyframes sphere-rot {
          0%   { transform: rotateY(0deg)   rotateX(15deg); }
          100% { transform: rotateY(360deg) rotateX(15deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.8; transform: scale(1);    }
          50%       { opacity: 1;   transform: scale(1.06); }
        }
      `}</style>
    </div>
  )
}
