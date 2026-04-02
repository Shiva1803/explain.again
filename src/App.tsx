import { useEffect, useMemo, useRef, useState } from 'react'
import Hero from './components/Hero'
import Filters from './components/Filters'
import Nav from './components/Nav'
import Wall from './components/Wall'
import { fetchStats, fetchSubmissions, voteForSubmission } from './lib/supabase'
import { getFingerprint, hasVoted, markVoted } from './lib/fingerprint'
import type { Category, SortOrder, Submission } from './types'

interface ToastState {
  message: string
  visible: boolean
  shareItem: Submission | null
}

const TOAST_DURATION = 2200

export default function App() {
  const [items, setItems] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all')
  const [activeSort, setActiveSort] = useState<SortOrder>('votes')
  const [stats, setStats] = useState({ count: 0, totalVotes: 0 })
  const [toast, setToast] = useState<ToastState>({
    message: '',
    visible: false,
    shareItem: null,
  })

  const toastTimerRef = useRef<number | null>(null)
  const itemIdsRef = useRef<Set<number>>(new Set())

  const displayed = useMemo(() => {
    const filtered =
      activeCategory === 'all' ? items : items.filter((item) => item.category === activeCategory)

    return [...filtered].sort((left, right) =>
      activeSort === 'votes'
        ? right.votes - left.votes ||
          new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
        : new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
    )
  }, [items, activeCategory, activeSort])

  useEffect(() => {
    getFingerprint()

    let isCancelled = false

    async function load() {
      try {
        const [initialItems, initialStats] = await Promise.all([
          fetchSubmissions(),
          fetchStats(),
        ])

        if (isCancelled) {
          return
        }

        itemIdsRef.current = new Set(initialItems.map((item) => item.id))
        setItems(initialItems)
        setStats(initialStats)
      } catch (error) {
        console.error('Failed to load submissions:', error)

        if (!isCancelled) {
          showToast('connect Supabase in .env to bring the wall live')
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      isCancelled = true
    }
  }, [])

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current)
      }
    }
  }, [])

  function showToast(message: string, shareItem: Submission | null = null) {
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current)
    }

    setToast({
      message,
      visible: true,
      shareItem,
    })

    toastTimerRef.current = window.setTimeout(() => {
      setToast((current) => ({
        ...current,
        visible: false,
        shareItem: null,
      }))
    }, TOAST_DURATION)
  }

  function insertIntoWall(item: Submission) {
    if (itemIdsRef.current.has(item.id)) {
      return
    }

    itemIdsRef.current.add(item.id)
    setItems((current) => [item, ...current])
    setStats((current) => ({
      count: current.count + 1,
      totalVotes: current.totalVotes + item.votes,
    }))
  }

  function handleSubmissionCreated(item: Submission) {
    insertIntoWall(item)
    showToast('added to the wall ✓', item)
  }

  async function handleVote(item: Submission) {
    if (hasVoted(item.id)) {
      return
    }

    try {
      await voteForSubmission(item.id)
      markVoted(item.id)

      setItems((current) =>
        current.map((entry) =>
          entry.id === item.id ? { ...entry, votes: entry.votes + 1 } : entry,
        ),
      )
      setStats((current) => ({
        count: current.count,
        totalVotes: current.totalVotes + 1,
      }))
    } catch (error) {
      console.error('Failed to vote:', error)
      showToast('vote failed. try again in a second')
      throw error
    }
  }

  async function handleShare(item: Submission) {
    const tweet = `"${item.text}"

same as ${item.votes.toLocaleString()} others re-explaining this to AI, every single day.

→ explain-again.vercel.app`

    try {
      await navigator.clipboard.writeText(tweet)
    } catch (error) {
      console.error('Failed to copy share text:', error)
    }

    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`,
      '_blank',
      'noopener,noreferrer',
    )

    showToast('tweet copied + opened ↗')
  }

  return (
    <>
      <Nav count={stats.count} />
      <main className="app-shell">
        <Hero stats={stats} onSubmitted={handleSubmissionCreated} onError={showToast} />

        <section className="wall-section">
          <div className="wall-section-inner">
            <div className="wall-intro">
              <div className="wall-intro-copyblock">
                <div className="label">The Wall</div>
                <h2 className="title">Read what people keep re-explaining to AI.</h2>
              </div>
            </div>

            <Filters
              activeCategory={activeCategory}
              activeSort={activeSort}
              onCategoryChange={setActiveCategory}
              onSortChange={setActiveSort}
            />

            <Wall
              items={displayed}
              loading={loading}
              onRealtimeInsert={insertIntoWall}
              onShare={handleShare}
              onVote={handleVote}
            />
          </div>
        </section>
      </main>

      <div className={`toast${toast.visible ? ' visible' : ''}`} aria-live="polite">
        <span>{toast.message}</span>
        {toast.visible && toast.shareItem ? (
          <button
            type="button"
            className="toast-button"
            onClick={() => void handleShare(toast.shareItem as Submission)}
          >
            share
          </button>
        ) : null}
      </div>
    </>
  )
}
