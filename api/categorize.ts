import type { VercelRequest, VercelResponse } from '@vercel/node'

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

  const groqApiKey = process.env.GROQ_API_KEY

  if (!groqApiKey) {
    return res.status(200).json({ category: 'other' })
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
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
        max_tokens: 10,
        temperature: 0,
      }),
    })

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`)
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>
    }

    const raw = data.choices?.[0]?.message?.content?.trim().toLowerCase() ?? 'other'
    const category = (VALID_CATEGORIES as readonly string[]).includes(raw) ? raw : 'other'

    return res.status(200).json({ category })
  } catch (error) {
    console.error('Groq categorization error:', error)
    return res.status(200).json({ category: 'other' })
  }
}
