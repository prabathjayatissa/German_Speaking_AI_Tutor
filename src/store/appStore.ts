import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CEFRLevel, TutorMode, Message, Conversation, Profile, Correction } from "../lib/supabase"

interface ConversationState {
  activeConversationId: string | null
  messages: Message[]
  isStreaming: boolean
  streamingContent: string
  currentCorrections: Correction[]
  showCorrections: boolean
}

interface AppState {
  // Profile (local mirror)
  profile: Partial<Profile>
  setProfile: (p: Partial<Profile>) => void

  // Settings
  lmStudioUrl: string
  selectedModel: string
  voiceSpeed: number
  setLmStudioUrl: (url: string) => void
  setSelectedModel: (model: string) => void
  setVoiceSpeed: (speed: number) => void

  // Session
  currentLevel: CEFRLevel
  currentMode: TutorMode
  currentScenario: string | null
  setCurrentLevel: (level: CEFRLevel) => void
  setCurrentMode: (mode: TutorMode) => void
  setCurrentScenario: (scenario: string | null) => void

  // Conversation
  conversation: ConversationState
  setActiveConversation: (id: string | null) => void
  addMessage: (message: Message) => void
  setMessages: (messages: Message[]) => void
  setStreaming: (streaming: boolean) => void
  setStreamingContent: (content: string) => void
  appendStreamingContent: (token: string) => void
  setCurrentCorrections: (corrections: Correction[]) => void
  setShowCorrections: (show: boolean) => void
  clearConversation: () => void

  // UI
  activeTab: "conversation" | "history" | "progress" | "settings"
  setActiveTab: (tab: "conversation" | "history" | "progress" | "settings") => void
  isSettingsOpen: boolean
  setIsSettingsOpen: (open: boolean) => void
  isSidebarOpen: boolean
  setIsSidebarOpen: (open: boolean) => void

  // Speech
  isMicActive: boolean
  isAISpeaking: boolean
  recognizedText: string
  setMicActive: (active: boolean) => void
  setAISpeaking: (speaking: boolean) => void
  setRecognizedText: (text: string) => void

  // History
  recentConversations: Conversation[]
  setRecentConversations: (convos: Conversation[]) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Profile
      profile: {},
      setProfile: (p) => set(s => ({ profile: { ...s.profile, ...p } })),

      // Settings
      lmStudioUrl: "http://localhost:1234",
      selectedModel: "",
      voiceSpeed: 0.9,
      setLmStudioUrl: (url) => set({ lmStudioUrl: url }),
      setSelectedModel: (model) => set({ selectedModel: model }),
      setVoiceSpeed: (speed) => set({ voiceSpeed: speed }),

      // Session
      currentLevel: "A1",
      currentMode: "free",
      currentScenario: null,
      setCurrentLevel: (level) => set({ currentLevel: level }),
      setCurrentMode: (mode) => set({ currentMode: mode }),
      setCurrentScenario: (scenario) => set({ currentScenario: scenario }),

      // Conversation
      conversation: {
        activeConversationId: null,
        messages: [],
        isStreaming: false,
        streamingContent: "",
        currentCorrections: [],
        showCorrections: false,
      },
      setActiveConversation: (id) =>
        set(s => ({ conversation: { ...s.conversation, activeConversationId: id } })),
      addMessage: (message) =>
        set(s => ({
          conversation: {
            ...s.conversation,
            messages: [...s.conversation.messages, message],
          },
        })),
      setMessages: (messages) =>
        set(s => ({ conversation: { ...s.conversation, messages } })),
      setStreaming: (streaming) =>
        set(s => ({ conversation: { ...s.conversation, isStreaming: streaming } })),
      setStreamingContent: (content) =>
        set(s => ({ conversation: { ...s.conversation, streamingContent: content } })),
      appendStreamingContent: (token) =>
        set(s => ({
          conversation: {
            ...s.conversation,
            streamingContent: s.conversation.streamingContent + token,
          },
        })),
      setCurrentCorrections: (corrections) =>
        set(s => ({ conversation: { ...s.conversation, currentCorrections: corrections } })),
      setShowCorrections: (show) =>
        set(s => ({ conversation: { ...s.conversation, showCorrections: show } })),
      clearConversation: () =>
        set(s => ({
          conversation: {
            ...s.conversation,
            messages: [],
            activeConversationId: null,
            streamingContent: "",
            currentCorrections: [],
            showCorrections: false,
          },
        })),

      // UI
      activeTab: "conversation",
      setActiveTab: (tab) => set({ activeTab: tab }),
      isSettingsOpen: false,
      setIsSettingsOpen: (open) => set({ isSettingsOpen: open }),
      isSidebarOpen: true,
      setIsSidebarOpen: (open) => set({ isSidebarOpen: open }),

      // Speech
      isMicActive: false,
      isAISpeaking: false,
      recognizedText: "",
      setMicActive: (active) => set({ isMicActive: active }),
      setAISpeaking: (speaking) => set({ isAISpeaking: speaking }),
      setRecognizedText: (text) => set({ recognizedText: text }),

      // History
      recentConversations: [],
      setRecentConversations: (convos) => set({ recentConversations: convos }),
    }),
    {
      name: "german-tutor-store",
      partialize: (state) => ({
        lmStudioUrl: state.lmStudioUrl,
        selectedModel: state.selectedModel,
        voiceSpeed: state.voiceSpeed,
        currentLevel: state.currentLevel,
        currentMode: state.currentMode,
        profile: state.profile,
        isSidebarOpen: state.isSidebarOpen,
      }),
    }
  )
)
