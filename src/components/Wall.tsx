import { useEffect, useRef } from 'react'
import Card from './Card'
import { supabase } from '../lib/supabase'
import type { Submission } from '../types'

interface WallProps {
  items: Submission[]
  loading: boolean
  onVote: (item: Submission) => Promise<void>
  onShare: (item: Submission) => Promise<void>
  onRealtimeInsert: (item: Submission) => void
}

const SKELETON_COUNT = 8

export default function Wall({
  items,
  loading,
  onVote,
  onShare,
  onRealtimeInsert,
}: WallProps) {
  const insertHandlerRef = useRef(onRealtimeInsert)

  useEffect(() => {
    insertHandlerRef.current = onRealtimeInsert
  }, [onRealtimeInsert])

  useEffect(() => {
    const client = supabase

    if (loading || !client) {
      return
    }

    const channel = client
      .channel('submissions-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'submissions',
        },
        (payload) => {
          insertHandlerRef.current(payload.new as Submission)
        },
      )
      .subscribe()

    return () => {
      void client.removeChannel(channel)
    }
  }, [loading])

  if (loading) {
    return (
      <div className="wall-grid" aria-hidden="true">
        {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
          <div key={index} className="skeleton-card">
            <div className="skeleton-line skeleton-line-label" />
            <div className="skeleton-line skeleton-line-lg" />
            <div className="skeleton-line skeleton-line-md" />
            <div className="skeleton-line skeleton-line-sm" />
            <div className="skeleton-footer">
              <div className="skeleton-line skeleton-line-time" />
              <div className="skeleton-line skeleton-line-vote" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return <div className="wall-empty">Nothing here yet. Be the first line on the wall.</div>
  }

  return (
    <div className="wall-grid">
      {items.map((item) => (
        <div key={item.id} className="wall-card-wrap">
          <Card item={item} onShare={onShare} onVote={onVote} />
        </div>
      ))}
    </div>
  )
}
