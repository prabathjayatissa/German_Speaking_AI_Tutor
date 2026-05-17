import type { CEFRLevel, TutorMode } from "./supabase"

export interface Scenario {
  id: string
  title: string
  titleDe: string
  description: string
  level: CEFRLevel
  icon: string
  systemPromptHint: string
}

export interface CEFRLevelInfo {
  level: CEFRLevel
  label: string
  description: string
  speakingGoals: string[]
  grammarTargets: string[]
  vocabularyDomains: string[]
  color: string
  nextLevel?: CEFRLevel
}

export const CEFR_LEVELS: CEFRLevelInfo[] = [
  {
    level: "A1",
    label: "Anfänger",
    description: "Grundlegende Ausdrücke, Vorstellungen, einfacher Austausch",
    speakingGoals: [
      "Sich und andere vorstellen",
      "Einfache persönliche Fragen stellen und beantworten",
      "Auf einfache Art interagieren, wenn langsam gesprochen wird",
      "Grundlegende Begrüßungen und Verabschiedungen verwenden",
    ],
    grammarTargets: [
      "Präsens",
      "Grundlegende Verbkonjugation (sein, haben, werden)",
      "Artikel (der, die, das)",
      "Personalpronomen",
      "Einfache Fragen (W-Fragen)",
      "Verneinung (nicht, kein)",
    ],
    vocabularyDomains: [
      "Begrüßungen & Verabschiedungen",
      "Zahlen 1–100",
      "Tage, Monate, Jahreszeiten",
      "Farben und einfache Adjektive",
      "Familienmitglieder",
      "Essen und Trinken",
      "Alltagsgegenstände",
    ],
    color: "green",
  },
  {
    level: "A2",
    label: "Grundkenntnisse",
    description: "Vertraute Themen, Alltagsroutinen, einfache Kommunikation",
    speakingGoals: [
      "Persönlichen Hintergrund und Routinen beschreiben",
      "Über einfache Aufgaben kommunizieren",
      "Kurze soziale Gespräche führen",
      "Einfache Einkäufe und Transaktionen tätigen",
    ],
    grammarTargets: [
      "Vergangenheit (Perfekt)",
      "Modalverben (können, müssen, wollen, dürfen, sollen)",
      "Akkusativ und Dativ",
      "Präpositionen mit Fällen",
      "Adjektivendungen",
      "Komparativ und Superlativ",
    ],
    vocabularyDomains: [
      "Einkaufen und Dienstleistungen",
      "Reisen und Transport",
      "Gesundheit und Körper",
      "Alltagsroutinen",
      "Wetter",
      "Hobbys und Freizeit",
      "Wohnen und Nachbarschaft",
    ],
    color: "blue",
  },
  {
    level: "B1",
    label: "Mittelstufe",
    description: "Hauptpunkte klarer Standardeingaben, häufige Situationen",
    speakingGoals: [
      "Die meisten Reisesituationen bewältigen",
      "Einfache zusammenhängende Texte zu vertrauten Themen verfassen",
      "Erfahrungen, Ereignisse, Träume und Ziele beschreiben",
      "Kurz Gründe und Erklärungen für Meinungen nennen",
    ],
    grammarTargets: [
      "Präteritum",
      "Nebensätze (weil, dass, wenn, obwohl)",
      "Genitiv",
      "Passiv",
      "Konjunktiv II (würden, könnte, sollte)",
      "Relativsätze",
      "Infinitivkonstruktionen (zu + Infinitiv)",
    ],
    vocabularyDomains: [
      "Arbeit und Beruf",
      "Bildung und Lernen",
      "Medien und Technologie",
      "Kultur und Kunst",
      "Umwelt und Natur",
      "Aktuelle Ereignisse",
      "Beziehungen und soziales Leben",
    ],
    color: "orange",
  },
]

export const SCENARIOS: Scenario[] = [
  {
    id: "restaurant",
    title: "At the Restaurant",
    titleDe: "Im Restaurant",
    description: "Order food and drinks, ask about the menu, handle the bill",
    level: "A1",
    icon: "utensils",
    systemPromptHint: "You are a friendly German waiter/waitress at a typical German restaurant. The student is ordering food. Use vocabulary appropriate for A1 level. Ask what they would like to order, answer questions about the menu, and handle payment.",
  },
  {
    id: "train-station",
    title: "At the Train Station",
    titleDe: "Am Bahnhof",
    description: "Buy tickets, ask about platforms and departure times",
    level: "A1",
    icon: "train",
    systemPromptHint: "You are a ticket seller at a German train station. Help the student buy tickets, find platforms, and understand schedules. Use A1/A2 vocabulary.",
  },
  {
    id: "meeting-friends",
    title: "Meeting Friends",
    titleDe: "Freunde treffen",
    description: "Make plans, suggest activities, arrange meeting times",
    level: "A2",
    icon: "users",
    systemPromptHint: "You are a German friend making plans to meet up. Discuss what to do, where to go, and when to meet. Use A2 level conversational German.",
  },
  {
    id: "shopping",
    title: "Shopping",
    titleDe: "Einkaufen",
    description: "Ask about items, prices, sizes and make purchases",
    level: "A2",
    icon: "shopping-bag",
    systemPromptHint: "You are a shop assistant in a German clothing store. Help the customer find what they need, discuss sizes and prices. Use A2 vocabulary.",
  },
  {
    id: "doctor",
    title: "Doctor Appointment",
    titleDe: "Beim Arzt",
    description: "Describe symptoms, understand medical advice",
    level: "A2",
    icon: "stethoscope",
    systemPromptHint: "You are a German doctor. The patient needs to explain their symptoms and understand your advice. Use clear, simple German appropriate for A2 level patients.",
  },
  {
    id: "job-interview",
    title: "Job Interview",
    titleDe: "Das Vorstellungsgespräch",
    description: "Discuss your experience, skills and career goals",
    level: "B1",
    icon: "briefcase",
    systemPromptHint: "You are a German HR manager conducting a job interview. Ask about qualifications, experience, strengths and weaknesses. Use B1 level professional German.",
  },
  {
    id: "apartment",
    title: "Apartment Rental",
    titleDe: "Wohnung mieten",
    description: "Inquire about apartments, discuss terms and move-in details",
    level: "B1",
    icon: "home",
    systemPromptHint: "You are a German landlord showing an apartment. Discuss rent, utilities, house rules, neighborhood. Use B1 level German.",
  },
  {
    id: "opinions",
    title: "Expressing Opinions",
    titleDe: "Meinungen äußern",
    description: "Debate current topics, share your views, agree and disagree",
    level: "B1",
    icon: "message-square",
    systemPromptHint: "You are having a debate with a German friend about a current social topic (environment, technology, education). Encourage them to express and defend opinions. Use B1 vocabulary.",
  },
  {
    id: "workplace",
    title: "Workplace Communication",
    titleDe: "Am Arbeitsplatz",
    description: "Discuss tasks, meetings, deadlines and colleagues",
    level: "B1",
    icon: "building",
    systemPromptHint: "You are a German colleague in an office setting. Discuss ongoing projects, schedule meetings, resolve work issues. Use professional B1 German.",
  },
  {
    id: "travel-problem",
    title: "Travel Problems",
    titleDe: "Reiseprobleme",
    description: "Handle lost luggage, missed connections, hotel issues",
    level: "B1",
    icon: "plane",
    systemPromptHint: "You are a travel service representative dealing with a customer who has a travel problem. Help resolve the issue using B1 German.",
  },
]

export const TUTOR_MODES: { id: TutorMode; label: string; labelDe: string; description: string; descriptionDe: string; icon: string }[] = [
  {
    id: "free",
    label: "Free Conversation",
    labelDe: "Freies Gespräch",
    description: "Open-ended natural dialogue on any topic",
    descriptionDe: "Offener Dialog zu jedem Thema",
    icon: "messages",
  },
  {
    id: "scenario",
    label: "Guided Scenario",
    labelDe: "Szenario",
    description: "Roleplay real-life situations",
    descriptionDe: "Alltagssituationen üben",
    icon: "theater",
  },
  {
    id: "pronunciation",
    label: "Pronunciation Practice",
    description: "Repeat and compare German sounds",
    descriptionDe: "Deutsche Laute üben",
    labelDe: "Aussprache",
    icon: "mic",
  },
  {
    id: "grammar",
    label: "Grammar Focus",
    labelDe: "Grammatik",
    description: "Practice with detailed corrections",
    descriptionDe: "Detaillierte Korrekturen erhalten",
    icon: "book",
  },
  {
    id: "fluency",
    label: "Fluency Training",
    labelDe: "Flüssigkeit",
    description: "Timed speaking challenges",
    descriptionDe: "Zeitgesteuerte Sprechübungen",
    icon: "timer",
  },
]

export const SUPPORTED_MODELS = [
  { id: "gemma-3-4b", label: "Gemma 3 4B (Recommended)", description: "Fast, M1 optimized" },
  { id: "gemma-3-12b", label: "Gemma 3 12B", description: "Better quality, more RAM" },
  { id: "qwen2.5-7b-instruct", label: "Qwen 2.5 7B Instruct", description: "Strong instruction following" },
  { id: "mistral-7b-instruct", label: "Mistral 7B Instruct", description: "Classic instruct model" },
  { id: "phi-4-mini-instruct", label: "Phi-4 Mini Instruct", description: "Compact & efficient" },
  { id: "deepseek-r1-distill-qwen-7b", label: "DeepSeek R1 Distill 7B", description: "Reasoning enhanced" },
]

export function buildSystemPrompt(
  mode: TutorMode,
  level: CEFRLevel,
  studentName: string,
  scenario?: string,
  weakAreas?: string[]
): string {
  const levelInfo = CEFR_LEVELS.find(l => l.level === level)!
  const weakAreasText = weakAreas?.length
    ? `\n\nThe student has shown weakness in: ${weakAreas.join(", ")}. Gently practice these areas.`
    : ""

  const scenarioInfo = scenario
    ? SCENARIOS.find(s => s.id === scenario)
    : null

  const basePersonality = `You are a patient, encouraging German language tutor named "Lena".
You are helping ${studentName || "the student"} improve their spoken German.
The student is at ${level} (${levelInfo.label}) CEFR level.

CORE RULES:
- Always respond in German, but keep it natural and appropriate for ${level} level
- Keep your responses CONCISE (2-4 sentences max unless explaining grammar)
- Be warm, encouraging, and conversational
- Never lecture or give long grammar explanations
- If the student makes a mistake, gently note it and move on - do NOT repeat the correction multiple times
- Ask follow-up questions to keep the conversation flowing
- Adapt your vocabulary complexity to ${level} level
- Speak naturally as a conversation partner, not a teacher${weakAreasText}`

  const modeInstructions: Record<TutorMode, string> = {
    free: `\n\nMODE: Free Conversation
Have a natural conversation on any topic the student chooses or suggest interesting topics.
Encourage longer responses. Ask open questions.`,

    scenario: scenarioInfo
      ? `\n\nMODE: Scenario Roleplay - "${scenarioInfo.title}"
${scenarioInfo.systemPromptHint}
Stay in character. React naturally to what the student says. If they make a serious error, gently correct it in character.`
      : `\n\nMODE: Guided Scenario
Roleplay a realistic German situation appropriate for ${level} level.`,

    pronunciation: `\n\nMODE: Pronunciation Practice
Focus on helping the student with German pronunciation.
- Suggest specific words or phrases to practice
- Give phonetic hints when needed (e.g., "the 'ch' in 'ich' sounds like...")
- Be encouraging about progress
- Keep exercises short and achievable`,

    grammar: `\n\nMODE: Grammar Focus
After each student message, provide:
1. A natural conversational response
2. A brief grammar correction if needed (format: "✓ Correction: ...")
Focus on the grammar targets for ${level}: ${levelInfo.grammarTargets.slice(0, 3).join(", ")}`,

    fluency: `\n\nMODE: Fluency Training
Give the student speaking prompts to respond to within 30-60 seconds.
After their response, evaluate: Was it fluent? Were there pauses? Was the grammar consistent?
Give brief, encouraging feedback and a new prompt.`,
  }

  return basePersonality + modeInstructions[mode]
}
