/*
  # German Tutor App — Initial Schema

  1. New Tables
    - `profiles` — student profile, name, level, preferences
    - `conversations` — session logs with title, mode, level
    - `messages` — individual turns in a conversation (role, content, corrections)
    - `grammar_mistakes` — tracked weak areas per student
    - `vocabulary_items` — encountered words per session
    - `progress_snapshots` — periodic CEFR level assessments

  2. Security
    - RLS enabled on all tables
    - Authenticated users can only access their own data

  3. Notes
    - `corrections` in messages is JSONB: {original, corrected, explanation}[]
    - `mode` in conversations: 'free' | 'scenario' | 'pronunciation' | 'grammar' | 'fluency'
    - `level` uses CEFR: 'A1' | 'A2' | 'B1'
*/

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  current_level text NOT NULL DEFAULT 'A1',
  native_language text NOT NULL DEFAULT 'English',
  preferred_mode text NOT NULL DEFAULT 'free',
  lm_studio_url text NOT NULL DEFAULT 'http://localhost:1234',
  selected_model text NOT NULL DEFAULT '',
  voice_speed real NOT NULL DEFAULT 1.0,
  dark_mode boolean NOT NULL DEFAULT true,
  total_speaking_time_seconds integer NOT NULL DEFAULT 0,
  sessions_completed integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Conversations
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Neue Unterhaltung',
  mode text NOT NULL DEFAULT 'free',
  scenario text,
  level text NOT NULL DEFAULT 'A1',
  duration_seconds integer NOT NULL DEFAULT 0,
  message_count integer NOT NULL DEFAULT 0,
  summary text,
  created_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user',
  content text NOT NULL DEFAULT '',
  original_content text,
  corrections jsonb,
  audio_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Grammar mistakes
CREATE TABLE IF NOT EXISTS grammar_mistakes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category text NOT NULL DEFAULT '',
  example_original text NOT NULL DEFAULT '',
  example_corrected text NOT NULL DEFAULT '',
  explanation text NOT NULL DEFAULT '',
  occurrence_count integer NOT NULL DEFAULT 1,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE grammar_mistakes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own grammar mistakes"
  ON grammar_mistakes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own grammar mistakes"
  ON grammar_mistakes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own grammar mistakes"
  ON grammar_mistakes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Progress snapshots
CREATE TABLE IF NOT EXISTS progress_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  level text NOT NULL DEFAULT 'A1',
  fluency_score integer NOT NULL DEFAULT 0,
  grammar_score integer NOT NULL DEFAULT 0,
  vocabulary_score integer NOT NULL DEFAULT 0,
  pronunciation_score integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE progress_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON progress_snapshots FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON progress_snapshots FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_grammar_mistakes_user_id ON grammar_mistakes(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_snapshots_user_id ON progress_snapshots(user_id);
