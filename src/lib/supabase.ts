import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type CEFRLevel = "A1" | "A2" | "B1"
export type TutorMode = "free" | "scenario" | "pronunciation" | "grammar" | "fluency"
export type MessageRole = "user" | "assistant" | "system"

export interface Profile {
  id: string
  name: string
  current_level: CEFRLevel
  native_language: string
  preferred_mode: TutorMode
  lm_studio_url: string
  selected_model: string
  voice_speed: number
  dark_mode: boolean
  total_speaking_time_seconds: number
  sessions_completed: number
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  user_id: string
  title: string
  mode: TutorMode
  scenario?: string
  level: CEFRLevel
  duration_seconds: number
  message_count: number
  summary?: string
  created_at: string
  ended_at?: string
}

export interface Message {
  id: string
  conversation_id: string
  user_id: string
  role: MessageRole
  content: string
  original_content?: string
  corrections?: Correction[]
  audio_url?: string
  created_at: string
}

export interface Correction {
  original: string
  corrected: string
  explanation: string
  type: "grammar" | "vocabulary" | "pronunciation" | "word_order"
}

export interface GrammarMistake {
  id: string
  user_id: string
  category: string
  example_original: string
  example_corrected: string
  explanation: string
  occurrence_count: number
  last_seen_at: string
  created_at: string
}

export interface ProgressSnapshot {
  id: string
  user_id: string
  level: CEFRLevel
  fluency_score: number
  grammar_score: number
  vocabulary_score: number
  pronunciation_score: number
  notes?: string
  created_at: string
}
