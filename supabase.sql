-- TABLE
CREATE TABLE submissions (
  id          BIGSERIAL PRIMARY KEY,
  text        TEXT NOT NULL
              CHECK (char_length(text) BETWEEN 10 AND 240),
  category    TEXT NOT NULL DEFAULT 'other'
              CHECK (category IN ('dev','personal','work','prefs','life','other')),
  votes       INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX submissions_votes_idx ON submissions (votes DESC, created_at DESC);
CREATE INDEX submissions_new_idx   ON submissions (created_at DESC);
CREATE INDEX submissions_cat_idx   ON submissions (category);

-- ATOMIC VOTE INCREMENT (prevents race conditions on concurrent votes)
CREATE OR REPLACE FUNCTION increment_votes(row_id BIGINT)
RETURNS VOID LANGUAGE SQL SECURITY DEFINER AS $$
  UPDATE submissions SET votes = votes + 1 WHERE id = row_id;
$$;

-- ROW LEVEL SECURITY
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read"
  ON submissions FOR SELECT TO anon USING (true);

CREATE POLICY "Public insert"
  ON submissions FOR INSERT TO anon
  WITH CHECK (char_length(text) >= 10 AND char_length(text) <= 240);

CREATE POLICY "RPC vote update"
  ON submissions FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- SEED DATA
INSERT INTO submissions (text, category, votes) VALUES
  ('Gemini keeps forgetting that I am lactose intolerant.', 'personal', 4),
  ('That I prefer concise answers and not a freaking paragraph', 'prefs', 3),
  ('My entire project structure because there is no memory between sessions.', 'dev', 1),
  ('Am a senior developer, pls stop explaining what a for loop is.', 'prefs', 0),
  ('My relationship situation when asking for advice. 6 months of context which i have to re-paste in every chat.', 'personal', 0),
  ('The tone I write in, I have a voice of my own. Gpt keeps defaulting to corporate slop', 'prefs', 334),
  ('My kids names and ages when asking for parenting advice.', 'personal', 0),
  ('That I use React, not NextJs.', 'dev', 0);
