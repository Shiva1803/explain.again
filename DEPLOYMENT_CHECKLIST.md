# Deployment Checklist for explain.again

## Must Do (Critical for Launch)

### 1. Supabase Setup
- [x] **Add real Supabase values to `.env`**
  - Get `VITE_SUPABASE_URL` from your Supabase project settings
  - Get `VITE_SUPABASE_ANON_KEY` from your Supabase project settings
  - Update `.env` file with these values

- [x] **Run the database schema**
  - Open Supabase SQL Editor
  - Run the contents of `supabase.sql`
  - Verify the `submissions` table was created

- [x] **Enable Realtime for submissions table**
  - Go to Supabase Dashboard → Database → Publications
  - Click on `supabase_realtime` publication
  - Enable the `submissions` table
  - This makes the live wall updates work in `Wall.tsx`

### 2. Vercel Environment Variables
- [x] **Add environment variables in Vercel**
  - `VITE_SUPABASE_URL` (same as local .env)
  - `VITE_SUPABASE_ANON_KEY` (same as local .env)
  - `GROQ_API_KEY` (for `api/categorize.ts` endpoint)

### 3. Production URL Configuration
- [ ] **Decide final production URL**
  - Current hardcoded URL: `explainagain.xyz`
  - Files to update if using different URL:
    - `index.html` (og:url meta tag)
    - `src/App.tsx` (share tweet text)

### 4. Full Manual QA Pass
- [ ] **Test complete user flow**
  - Submit a new entry (test form validation, min 10 chars)
  - Vote on an entry once (should work)
  - Try voting again on same entry (should be blocked)
  - Test all category filters (all, dev, personal, work, prefs, life, other)
  - Test sort options (top vs new)
  - Test share button (copies tweet + opens Twitter)
  - Open 2 browser tabs and submit in one → confirm it appears live in the other

- [ ] **Mobile testing**
  - Test on actual phone (not just browser DevTools)
  - Check hero section layout
  - Check submit form usability
  - Check wall card density and readability
  - Test voting and filtering on mobile

- [ ] **Test production categorize endpoint**
  - After deploying to Vercel, submit entries
  - Verify categorization is working via Claude API
  - Check Vercel function logs if categories seem wrong

## Nice To Have (Polish)

### 5. Social Preview
- [ ] **Add OG image**
  - Create an og:image (1200x630px recommended)
  - Upload to `/public` or use a CDN
  - Add `<meta property="og:image" content="URL" />` to `index.html`

### 6. Cleanup
- [ ] **Remove prototype file**
  - Delete `index (1).html` if it's just an old prototype
  - Keep repo clean

### 7. Copy Consistency Sweep
- [ ] **Review all user-facing text**
  - Check for consistent terminology:
    - "confessions" vs "submissions" vs "entries"
    - "same here votes" vs "votes"
    - CTA button wording consistency
  - Files to check:
    - `src/components/Nav.tsx`
    - `src/components/Hero.tsx`
    - `src/components/SubmitForm.tsx`
    - `src/components/Card.tsx`
    - `src/App.tsx`

---

## Quick Reference

### Current Hardcoded URLs
- `index.html`: Line with `<meta property="og:url" content="https://explainagain.xyz" />`
- `src/App.tsx`: Share tweet text includes `→ explainagain.xyz`

### Environment Variables Needed
```
# .env (local)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Vercel (production)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
CLAUDE_API_KEY=your-claude-api-key
```

---

## Ready to Ship?
Once all "Must Do" items are checked, you're ready to deploy! 🚀
