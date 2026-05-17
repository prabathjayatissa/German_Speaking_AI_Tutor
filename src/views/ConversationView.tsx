import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Icon,
  Input,
  Badge,
  Spinner,
} from "@chakra-ui/react"
import {
  LuSend,
  LuRefreshCw,
  LuZap,
  LuVolume2,
  LuVolumeX,
  LuChevronDown,
} from "react-icons/lu"
import { useRef, useEffect, useState, useCallback } from "react"
import { useAppStore } from "../store/appStore"
import { MicButton } from "../components/MicButton"
import { ChatBubble, StreamingBubble } from "../components/ChatBubble"
import { CorrectionPanel } from "../components/CorrectionPanel"
import { CEFRBadge } from "../components/CEFRBadge"
import { buildSystemPrompt, SCENARIOS, TUTOR_MODES } from "../lib/curriculum"
import { streamChat, extractCorrections, messagesToChatHistory } from "../lib/lmstudio"
import { createSpeechRecognition, speak, stopSpeaking } from "../lib/speech"
import { supabase } from "../lib/supabase"
import type { Message, Correction } from "../lib/supabase"
import type { RecognitionState } from "../lib/speech"

export function ConversationView() {
  const {
    lmStudioUrl,
    selectedModel,
    currentLevel,
    currentMode,
    currentScenario,
    voiceSpeed,
    profile,
    conversation,
    addMessage,
    setMessages,
    setStreaming,
    setStreamingContent,
    appendStreamingContent,
    setCurrentCorrections,
    setShowCorrections,
    clearConversation,
    setActiveConversation,
    isMicActive,
    isAISpeaking,
    recognizedText,
    setMicActive,
    setAISpeaking,
    setRecognizedText,
  } = useAppStore()

  const [micState, setMicState] = useState<RecognitionState>("idle")
  const [textInput, setTextInput] = useState("")
  const [isTTSEnabled, setIsTTSEnabled] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [selectedCorrections, setSelectedCorrections] = useState<Correction[] | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const speechRef = useRef<ReturnType<typeof createSpeechRecognition> | null>(null)
  const conversationIdRef = useRef<string | null>(null)

  const scenario = currentScenario ? SCENARIOS.find(s => s.id === currentScenario) : null
  const modeInfo = TUTOR_MODES.find(m => m.id === currentMode)

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [conversation.messages, conversation.streamingContent])

  // Check LM Studio connection
  useEffect(() => {
    if (!lmStudioUrl || !selectedModel) {
      setIsConnected(false)
      return
    }
    fetch(`${lmStudioUrl}/v1/models`, { signal: AbortSignal.timeout(3000) })
      .then(r => setIsConnected(r.ok))
      .catch(() => setIsConnected(false))
  }, [lmStudioUrl, selectedModel])

  // Init speech recognition
  useEffect(() => {
    speechRef.current = createSpeechRecognition(
      (result) => {
        setRecognizedText(result.transcript)
        if (result.isFinal && result.transcript.trim()) {
          handleSendMessage(result.transcript.trim())
          setRecognizedText("")
        }
      },
      (state) => {
        setMicState(state)
        setMicActive(state === "listening")
      },
      (error) => {
        console.error("Speech error:", error)
        setMicState("error")
      }
    )
  }, [])

  const handleMicPress = useCallback(() => {
    if (isAISpeaking) {
      stopSpeaking()
      setAISpeaking(false)
    }
    speechRef.current?.start()
  }, [isAISpeaking])

  const handleMicRelease = useCallback(() => {
    speechRef.current?.stop()
  }, [])

  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !selectedModel || !lmStudioUrl) return

    const userId = profile.id ?? "local"

    // Ensure conversation exists
    if (!conversationIdRef.current) {
      const { data } = await supabase
        .from("conversations")
        .insert({
          user_id: userId,
          title: scenario?.titleDe ?? "Freies Gespräch",
          mode: currentMode,
          scenario: currentScenario ?? undefined,
          level: currentLevel,
        })
        .select()
        .maybeSingle()
      if (data) {
        conversationIdRef.current = data.id
        setActiveConversation(data.id)
      }
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      conversation_id: conversationIdRef.current ?? "local",
      user_id: userId,
      role: "user",
      content,
      created_at: new Date().toISOString(),
    }

    addMessage(userMessage)
    setTextInput("")

    // Extract corrections async (non-blocking)
    extractCorrections(lmStudioUrl, selectedModel, content).then(corrections => {
      if (corrections.length > 0) {
        const updatedMsg = { ...userMessage, corrections }
        useAppStore.setState(s => ({
          conversation: {
            ...s.conversation,
            messages: s.conversation.messages.map(m =>
              m.id === userMessage.id ? updatedMsg : m
            ),
          },
        }))
        setCurrentCorrections(corrections)
        setShowCorrections(true)
      }
    })

    // Build chat history for LLM
    const systemPrompt = buildSystemPrompt(
      currentMode,
      currentLevel,
      profile.name ?? "Lernender",
      currentScenario ?? undefined,
    )

    const history = messagesToChatHistory([
      ...conversation.messages.slice(-20), // keep last 20 for context
      userMessage,
    ])

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...history,
    ]

    // Stream response
    setStreaming(true)
    setStreamingContent("")

    let fullResponse = ""

    for await (const chunk of streamChat(lmStudioUrl, selectedModel, messages, 0.75, 512)) {
      if (chunk.type === "token") {
        appendStreamingContent(chunk.token!)
        fullResponse = chunk.fullText!
      } else if (chunk.type === "done") {
        fullResponse = chunk.fullText ?? fullResponse
        break
      } else if (chunk.type === "error") {
        console.error("[ConversationView] LM Studio error:", chunk.error)
        fullResponse = `Fehler: ${chunk.error || "Verbindung fehlgeschlagen"}`
        break
      }
    }

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      conversation_id: conversationIdRef.current ?? "local",
      user_id: userId,
      role: "assistant",
      content: fullResponse,
      created_at: new Date().toISOString(),
    }

    setStreaming(false)
    setStreamingContent("")
    addMessage(assistantMessage)

    // TTS
    if (isTTSEnabled && fullResponse) {
      setAISpeaking(true)
      speak(fullResponse, voiceSpeed, undefined, () => setAISpeaking(false))
    }

    // Save to DB (fire-and-forget)
    if (conversationIdRef.current && profile.id) {
      supabase.from("messages").insert([
        { ...userMessage, id: undefined },
        { ...assistantMessage, id: undefined },
      ]).then(() => {})
    }
  }, [
    selectedModel, lmStudioUrl, profile, currentMode, currentLevel,
    currentScenario, conversation.messages, isTTSEnabled, voiceSpeed, scenario,
  ])

  const handleTextSubmit = () => {
    if (textInput.trim()) handleSendMessage(textInput.trim())
  }

  const handleNewConversation = () => {
    stopSpeaking()
    setAISpeaking(false)
    clearConversation()
    conversationIdRef.current = null
    setSelectedCorrections(null)
  }

  const isReady = !!selectedModel && !!lmStudioUrl

  return (
    <Box h="full" display="flex" flexDir="column" bg="bg" overflow="hidden">
      {/* Header */}
      <Box
        px="5"
        py="3"
        bg="bg.panel"
        borderBottom="1px solid"
        borderColor="border.subtle"
        flexShrink={0}
      >
        <HStack justify="space-between" align="center">
          <HStack gap="3">
            <VStack gap="0.5" align="start">
              <HStack gap="2">
                <Text textStyle="sm" fontWeight="semibold" color="fg">
                  {scenario ? scenario.titleDe : (modeInfo?.labelDe ?? "Gespräch")}
                </Text>
                {scenario && (
                  <CEFRBadge level={scenario.level} size="sm" />
                )}
              </HStack>
              <HStack gap="2">
                <CEFRBadge level={currentLevel} size="sm" />
                <Text textStyle="xs" color="fg.muted">
                  {modeInfo?.descriptionDe ?? modeInfo?.description}
                </Text>
              </HStack>
            </VStack>
          </HStack>

          <HStack gap="2">
            {/* Connection status */}
            <HStack gap="1.5">
              <Box
                w="2"
                h="2"
                rounded="full"
                bg={isConnected ? "green.400" : selectedModel ? "red.400" : "gray.400"}
                css={isConnected ? { animation: "pulse 2s ease-in-out infinite" } : {}}
              />
              <Text textStyle="xs" color="fg.muted" hideBelow="md">
                {isConnected ? "Verbunden" : selectedModel ? "Getrennt" : "Kein Modell"}
              </Text>
            </HStack>

            <Button
              size="xs"
              variant="ghost"
              colorPalette="gray"
              onClick={() => setIsTTSEnabled(!isTTSEnabled)}
              aria-label="Toggle TTS"
            >
              <Icon>
                {isTTSEnabled ? <LuVolume2 /> : <LuVolumeX />}
              </Icon>
            </Button>

            <Button
              size="xs"
              variant="ghost"
              colorPalette="gray"
              onClick={handleNewConversation}
              aria-label="New conversation"
            >
              <Icon>
                <LuRefreshCw />
              </Icon>
            </Button>
          </HStack>
        </HStack>
      </Box>

      {/* Messages */}
      <Box flex="1" overflow="hidden" position="relative">
        <Box
          ref={scrollRef}
          h="full"
          overflowY="auto"
          px={{ base: "4", md: "6" }}
          py="4"
          display="flex"
          flexDir="column"
          gap="4"
          css={{
            "&::-webkit-scrollbar": { width: "4px" },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": { background: "var(--chakra-colors-border-muted)", borderRadius: "2px" },
          }}
        >
          {conversation.messages.length === 0 && !conversation.isStreaming && (
            <EmptyState isReady={isReady} scenario={scenario} />
          )}

          {conversation.messages.map(msg => (
            <ChatBubble
              key={msg.id}
              message={msg}
              onShowCorrections={corrections => setSelectedCorrections(corrections)}
            />
          ))}

          {conversation.isStreaming && (
            <StreamingBubble content={conversation.streamingContent} />
          )}
        </Box>

        {/* Scroll to bottom button */}
        {conversation.messages.length > 5 && (
          <Box
            position="absolute"
            bottom="4"
            right="6"
            as="button"
            bg="bg.panel"
            border="1px solid"
            borderColor="border.subtle"
            rounded="full"
            p="2"
            shadow="md"
            onClick={() => scrollRef.current && (scrollRef.current.scrollTop = scrollRef.current.scrollHeight)}
            _hover={{ bg: "bg.muted" }}
            transition="all 0.15s"
            cursor="pointer"
          >
            <Icon size="sm" color="fg.muted">
              <LuChevronDown />
            </Icon>
          </Box>
        )}
      </Box>

      {/* Corrections panel */}
      {(conversation.showCorrections && conversation.currentCorrections.length > 0) || selectedCorrections ? (
        <Box px="4" pb="2" flexShrink={0}>
          <CorrectionPanel
            corrections={selectedCorrections ?? conversation.currentCorrections}
            onClose={() => {
              setShowCorrections(false)
              setSelectedCorrections(null)
            }}
          />
        </Box>
      ) : null}

      {/* Live transcript */}
      {recognizedText && (
        <Box
          px="4"
          py="2"
          bg="blue.500/10"
          borderTop="1px solid"
          borderColor="blue.500/30"
          flexShrink={0}
        >
          <HStack gap="2">
            <Box
              w="1.5"
              h="1.5"
              rounded="full"
              bg="blue.400"
              css={{ animation: "pulse 1s ease-in-out infinite" }}
            />
            <Text textStyle="sm" color="blue.300" fontStyle="italic">
              {recognizedText}
            </Text>
          </HStack>
        </Box>
      )}

      {/* Input area */}
      <Box
        px={{ base: "4", md: "6" }}
        py="4"
        bg="bg.panel"
        borderTop="1px solid"
        borderColor="border.subtle"
        flexShrink={0}
      >
        <VStack gap="4">
          {/* Mic button */}
          <MicButton
            state={micState}
            isAISpeaking={isAISpeaking}
            onPress={handleMicPress}
            onRelease={handleMicRelease}
            pushToTalk={false}
          />

          {/* Text input fallback */}
          <HStack w="full" gap="2">
            <Input
              placeholder="Oder tippen Sie auf Deutsch..."
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleTextSubmit()}
              disabled={conversation.isStreaming || !isReady}
              size="sm"
              variant="outline"
              rounded="xl"
            />
            <Button
              size="sm"
              colorPalette="green"
              onClick={handleTextSubmit}
              disabled={!textInput.trim() || conversation.isStreaming || !isReady}
              rounded="xl"
            >
              {conversation.isStreaming ? (
                <Spinner size="xs" />
              ) : (
                <Icon><LuSend /></Icon>
              )}
            </Button>
          </HStack>

          {!isReady && (
            <HStack gap="2">
              <Icon color="orange.400" size="sm"><LuZap /></Icon>
              <Text textStyle="xs" color="fg.muted">
                Bitte konfigurieren Sie LM Studio in den Einstellungen
              </Text>
            </HStack>
          )}
        </VStack>
      </Box>
    </Box>
  )
}

function EmptyState({
  isReady,
  scenario,
}: {
  isReady: boolean
  scenario: typeof SCENARIOS[0] | undefined
}) {
  return (
    <Box
      flex="1"
      display="flex"
      alignItems="center"
      justifyContent="center"
      py="12"
    >
      <VStack gap="4" textAlign="center" maxW="sm">
        <Box
          w="16"
          h="16"
          rounded="2xl"
          bg="green.500/15"
          border="1px solid"
          borderColor="green.500/30"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="2xl"
        >
          🇩🇪
        </Box>
        <VStack gap="1">
          <Text textStyle="lg" fontWeight="semibold" color="fg">
            {scenario ? scenario.titleDe : "Bereit zum Sprechen!"}
          </Text>
          <Text textStyle="sm" color="fg.muted">
            {!isReady
              ? "Konfigurieren Sie zuerst LM Studio in den Einstellungen"
              : scenario
              ? scenario.description
              : "Drücken Sie das Mikrofon und sprechen Sie auf Deutsch"}
          </Text>
        </VStack>
        {isReady && (
          <Badge colorPalette="green" variant="subtle">
            Guten Mut! Machen Sie einfach weiter!
          </Badge>
        )}
      </VStack>
    </Box>
  )
}
