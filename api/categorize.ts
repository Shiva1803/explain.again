import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'

const VALID_CATEGORIES = ['dev', 'personal', 'work', 'prefs', 'life', 'other'] as const

function parseBody(req: VercelRequest): { text?: string } {
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as { text?: string }
    } catch {
      return {}
    }
  }

  return (req.body as { text?: string } | undefined) ?? {}
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { text } = parseBody(req)

  if (!text || text.length < 10 || text.length > 240) {
    return res.status(400).json({ error: 'Invalid text' })
  }

  const anthropic = process.env.CLAUDE_API_KEY
    ? new Anthropic({ apiKey: process.env.CLAUDE_API_KEY })
    : null

  if (!anthropic) {
    return res.status(200).json({ category: 'other' })
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 10,
      messages: [
        {
          role: 'user',
          content: `Categorize the following re-explanation into exactly one category.

Categories:
- dev: code, frameworks, project structure, technical stack, git, repositories, programming
- personal: diet, health, family, relationships, body, medical, personal history
- work: job context, company, team, meetings, business projects, colleagues, manager
- prefs: communication style, tone, format, verbosity, response length, writing style
- life: location, timezone, lifestyle, hobbies, life goals, finances, city, country
- other: anything that does not clearly fit the above

Text: "${text}"

Reply with ONLY the single category word. No punctuation. No explanation.`,
        },
      ],
    })

    const textBlock = message.content.find((block) => block.type === 'text')
    const raw =
      textBlock && 'text' in textBlock && typeof textBlock.text === 'string'
        ? textBlock.text.trim().toLowerCase()
        : 'other'
    const category = (VALID_CATEGORIES as readonly string[]).includes(raw) ? raw : 'other'

    return res.status(200).json({ category })
  } catch (error) {
    console.error('Claude categorization error:', error)
    return res.status(200).json({ category: 'other' })
  }
}
