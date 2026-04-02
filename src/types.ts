export type Category = 'dev' | 'personal' | 'work' | 'prefs' | 'life' | 'other'

export type SortOrder = 'votes' | 'new'

export interface Submission {
  id: number
  text: string
  category: Category
  votes: number
  created_at: string
}

export interface SubmissionInsert {
  text: string
  category: Category
}

export const CATEGORIES: { value: Category | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'personal', label: 'Personal' },
  { value: 'dev', label: 'Dev' },
  { value: 'prefs', label: 'Prefs' },
  { value: 'work', label: 'Work' },
  { value: 'life', label: 'Life' },
  { value: 'other', label: 'Other' },
]

export const CATEGORY_LABEL: Record<Category, string> = {
  dev: 'DEV CONTEXT',
  personal: 'PERSONAL',
  work: 'WORK CONTEXT',
  prefs: 'PREFERENCES',
  life: 'LIFE CONTEXT',
  other: 'OTHER',
}
