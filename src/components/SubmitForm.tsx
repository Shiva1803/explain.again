import type { CSSProperties, FormEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { insertSubmission } from '../lib/supabase'
import type { Category, Submission } from '../types'

interface SubmitFormProps {
  onSubmitted: (item: Submission) => void
  onError: (message: string) => void
}

const PLACEHOLDERS = [
  'My dietary restrictions. Every. Single. Chat.',
  'That I prefer short answers, not essays.',
  'My relationship situation when I ask for advice.',
  'My health conditions when asking about symptoms.',
  'Which city I live in — it affects every recommendation.',
  'My project structure. There is no memory between sessions.',
]

const VALID_CATEGORIES: Category[] = ['dev', 'personal', 'work', 'prefs', 'life', 'other']

function inferCategory(text: string): Category {
  const normalized = text.toLowerCase()

  if (
    /(code|repo|repository|git|branch|stack|framework|typescript|react|supabase|node|bun|api|database|deploy|project structure)/.test(
      normalized,
    )
  ) {
    return 'dev'
  }

  if (
    /(diet|health|medical|relationship|partner|wife|husband|kids|child|family|vegetarian|allergy|symptom|therapy)/.test(
      normalized,
    )
  ) {
    return 'personal'
  }

  if (
    /(job|company|team|manager|meeting|colleague|client|business|feature|product|work)/.test(
      normalized,
    )
  ) {
    return 'work'
  }

  if (
    /(tone|style|concise|verbose|short answers|essay|format|response length|voice|writing voice|beginner|senior)/.test(
      normalized,
    )
  ) {
    return 'prefs'
  }

  if (
    /(city|country|timezone|budget|travel|location|live in|workout|fitness|hobby|goal|finances)/.test(
      normalized,
    )
  ) {
    return 'life'
  }

  return 'other'
}

async function categorizeText(text: string): Promise<Category> {
  try {
    const response = await fetch('/api/categorize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    })

    if (!response.ok) {
      throw new Error(`Categorization failed with status ${response.status}`)
    }

    const data = (await response.json()) as { category?: string }
    return VALID_CATEGORIES.includes(data.category as Category)
      ? (data.category as Category)
      : inferCategory(text)
  } catch (error) {
    console.error('Falling back to local categorization:', error)
    return inferCategory(text)
  }
}

export default function SubmitForm({ onSubmitted, onError }: SubmitFormProps) {
  const [value, setValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [placeholderVisible, setPlaceholderVisible] = useState(true)
  const rotationTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    if (value) {
      return
    }

    const intervalId = window.setInterval(() => {
      setPlaceholderVisible(false)

      rotationTimeoutRef.current = window.setTimeout(() => {
        setPlaceholderIndex((current) => (current + 1) % PLACEHOLDERS.length)
        setPlaceholderVisible(true)
      }, 180)
    }, 3000)

    return () => {
      window.clearInterval(intervalId)

      if (rotationTimeoutRef.current !== null) {
        window.clearTimeout(rotationTimeoutRef.current)
      }
    }
  }, [value])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const text = value.trim()
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length

    if (text.length < 10 || wordCount < 4 || isSubmitting) {
      return
    }

    setIsSubmitting(true)

    const startedAt = performance.now()

    try {
      const category = await categorizeText(text)
      const submission = await insertSubmission(text, category)
      const remainingDelay = Math.max(0, 200 - (performance.now() - startedAt))

      if (remainingDelay > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, remainingDelay))
      }

      onSubmitted(submission)
      setValue('')
      setPlaceholderVisible(true)
    } catch (error) {
      console.error('Failed to add submission:', error)
      onError('could not add that right now')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="submit-wrap fade-up" style={{ '--delay': '0.65s' } as CSSProperties}>
      <form className="submit-form" onSubmit={handleSubmit}>
        <div className="submit-box">
          <div className="submit-topbar">
            <span>› What do you re-explain every session?</span>
          </div>

          <div className="submit-field">
            <div className="submit-field-art" aria-hidden="true">
              <span className="submit-field-curve" />
              <span className="submit-field-dot submit-field-dot-a" />
              <span className="submit-field-dot submit-field-dot-b" />
            </div>

            {!value ? (
              <div className={`submit-placeholder${placeholderVisible ? ' visible' : ''}`}>
                {PLACEHOLDERS[placeholderIndex]}
              </div>
            ) : null}

            <textarea
              className="submit-textarea"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              maxLength={240}
              aria-label="Add your re-explanation"
            />
          </div>

          <div className="submit-footer">
            <div className="char-count">{value.length} / 240</div>
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting || value.trim().length < 10 || value.trim().split(/\s+/).filter(word => word.length > 0).length < 4}
            >
              {isSubmitting ? 'categorizing...' : 'add to the wall →'}
            </button>
          </div>
        </div>
      </form>

      <p className="submit-meta">anonymous · no account needed · your frustration is valid</p>
    </div>
  )
}
