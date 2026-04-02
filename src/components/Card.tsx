import { useState } from 'react'
import { CATEGORY_LABEL, type Submission } from '../types'
import { hasVoted } from '../lib/fingerprint'

interface CardProps {
  item: Submission
  onVote: (item: Submission) => Promise<void>
  onShare: (item: Submission) => Promise<void>
}

function formatTimeAgo(input: string) {
  const timestamp = new Date(input).getTime()
  const diffMs = Date.now() - timestamp
  const diffMinutes = Math.floor(diffMs / 60000)

  if (diffMinutes < 1) {
    return 'now'
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`
  }

  const diffHours = Math.floor(diffMinutes / 60)

  if (diffHours < 24) {
    return `${diffHours}h ago`
  }

  const diffDays = Math.floor(diffHours / 24)

  if (diffDays < 30) {
    return `${diffDays}d ago`
  }

  const diffMonths = Math.floor(diffDays / 30)

  if (diffMonths < 12) {
    return `${diffMonths}mo ago`
  }

  const diffYears = Math.floor(diffMonths / 12)
  return `${diffYears}y ago`
}

export default function Card({ item, onVote, onShare }: CardProps) {
  const [isVoting, setIsVoting] = useState(false)
  const voted = hasVoted(item.id)

  async function handleVoteClick() {
    if (voted || isVoting) {
      return
    }

    setIsVoting(true)

    try {
      await onVote(item)
    } catch {
      // The app-level toast already communicates the error.
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <article className="card" data-category={item.category}>
      <div className="label">{CATEGORY_LABEL[item.category]}</div>

      <p className="card-text">{item.text}</p>

      <div className="card-footer">
        <div className="card-meta">{formatTimeAgo(item.created_at)}</div>

        <div className="card-actions">
          <button
            type="button"
            className={`vote-button${voted ? ' is-voted' : ''}`}
            onClick={() => void handleVoteClick()}
            disabled={voted || isVoting}
          >
            ▲ {item.votes.toLocaleString()}
          </button>

          <button
            type="button"
            className="share-button"
            aria-label="Share submission"
            onClick={() => void onShare(item)}
          >
            ↗
          </button>
        </div>
      </div>
    </article>
  )
}
