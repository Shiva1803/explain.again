import type { CSSProperties } from 'react'
import { useEffect, useRef, useState } from 'react'

interface StatsStripProps {
  count: number
  totalVotes: number
}

const DURATION = 1200

function easeOutCubic(progress: number) {
  return 1 - Math.pow(1 - progress, 3)
}

export default function StatsStrip({ count, totalVotes }: StatsStripProps) {
  const [displayed, setDisplayed] = useState({ count: 0, totalVotes: 0 })
  const previousRef = useRef({ count: 0, totalVotes: 0 })

  useEffect(() => {
    let frameId = 0
    const startedAt = performance.now()
    const from = previousRef.current

    const tick = (now: number) => {
      const elapsed = now - startedAt
      const progress = Math.min(elapsed / DURATION, 1)
      const eased = easeOutCubic(progress)

      const nextValues = {
        count: Math.round(from.count + (count - from.count) * eased),
        totalVotes: Math.round(from.totalVotes + (totalVotes - from.totalVotes) * eased),
      }

      setDisplayed(nextValues)

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick)
      } else {
        previousRef.current = { count, totalVotes }
      }
    }

    frameId = window.requestAnimationFrame(tick)

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [count, totalVotes])

  if (count === 0 && totalVotes === 0) {
    return null
  }

  return (
    <div className="stats-strip fade-up" style={{ '--delay': '0.9s' } as CSSProperties}>
      <div className="stat-cluster">
        <span className="stat-number">{displayed.count.toLocaleString()}</span>
        <span className="stats-separator">·</span>
        <span className="stat-label-inline">confessions logged</span>
      </div>

      <span className="stats-dot-divider">·</span>

      <div className="stat-cluster">
        <span className="stat-number">{displayed.totalVotes.toLocaleString()}</span>
        <span className="stats-separator">·</span>
        <span className="stat-label-inline">same here votes</span>
      </div>

      <span className="stats-dot-divider">·</span>

      <div className="stat-cluster">
        <span className="stat-number">∞</span>
        <span className="stats-separator">·</span>
        <span className="stat-label-inline">hours wasted</span>
      </div>
    </div>
  )
}
