import type { CSSProperties } from 'react'
import StatsStrip from './StatsStrip'
import SubmitForm from './SubmitForm'
import type { Submission } from '../types'

interface HeroProps {
  stats: {
    count: number
    totalVotes: number
  }
  onSubmitted: (item: Submission) => void
  onError: (message: string) => void
}

export default function Hero({ stats, onSubmitted, onError }: HeroProps) {
  const ghostCount = stats.count > 0 ? stats.count : 6

  return (
    <section className="hero">
      <div className="hero-scribbles" aria-hidden="true">
        <span className="hero-ring hero-ring-a" />
        <span className="hero-ring hero-ring-b" />
        <span className="hero-ring hero-ring-c" />
        <span className="hero-connector hero-connector-a" />
        <span className="hero-connector hero-connector-b" />
        <span className="hero-pin hero-pin-a" />
        <span className="hero-pin hero-pin-b" />
        <span className="hero-pin hero-pin-c" />
      </div>

      <div className="hero-inner">
        <div className="hero-copy">
          <div className="label fade-up" style={{ '--delay': '0.1s' } as CSSProperties}>
            A Public Wall For Lost Context
          </div>

          <h1 className="display fade-up" style={{ '--delay': '0.25s' } as CSSProperties}>
            The things we re-explain
            <br />
            to AI.
            <br />
            <em>Every. Single. Time.</em>
          </h1>

          <p className="hero-subtitle fade-up" style={{ '--delay': '0.4s' } as CSSProperties}>
            Ever told ChatGPT or Claude something, then you had to explain it again in the next chat?
            <br />
            You're not alone. See what everyone keeps re-typing below. Share yours as well!
          </p>

          <SubmitForm onError={onError} onSubmitted={onSubmitted} />

          <StatsStrip count={stats.count} totalVotes={stats.totalVotes} />
        </div>
      </div>

      <div className="hero-ghost" aria-hidden="true">
        {ghostCount.toLocaleString()}
      </div>
    </section>
  )
}
