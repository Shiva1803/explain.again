import { createClient } from '@supabase/supabase-js'
import type { Category, SortOrder, Submission } from '../types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase =
  supabaseUrl && supabaseAnon ? createClient(supabaseUrl, supabaseAnon) : null

function getClient() {
  if (!supabase) {
    throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.')
  }

  return supabase
}

export async function fetchSubmissions(
  sort: SortOrder = 'votes',
  category: Category | 'all' = 'all',
): Promise<Submission[]> {
  let query = getClient()
    .from('submissions')
    .select('*')
    .order(sort === 'votes' ? 'votes' : 'created_at', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(300)

  if (category !== 'all') {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  return (data ?? []) as Submission[]
}

export async function insertSubmission(text: string, category: Category): Promise<Submission> {
  const { data, error } = await getClient()
    .from('submissions')
    .insert({ text, category })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as Submission
}

export async function voteForSubmission(id: number): Promise<void> {
  const { error } = await getClient().rpc('increment_votes', { row_id: id })

  if (error) {
    throw error
  }
}

export async function fetchStats(): Promise<{ count: number; totalVotes: number }> {
  const { data, error } = await getClient().from('submissions').select('votes')

  if (error) {
    throw error
  }

  const rows = (data ?? []) as { votes: number }[]

  return {
    count: rows.length,
    totalVotes: rows.reduce((sum, row) => sum + row.votes, 0),
  }
}
