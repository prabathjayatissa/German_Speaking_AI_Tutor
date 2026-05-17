import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  Button,
  Spinner,
} from "@chakra-ui/react"
import {
  LuMessageCircle,
  LuClock,
  LuTrash2,
  LuCirclePlay,
  LuHistory,
} from "react-icons/lu"
import { useEffect, useState } from "react"
import { useAppStore } from "../store/appStore"
import { supabase } from "../lib/supabase"
import { CEFRBadge } from "../components/CEFRBadge"
import type { Conversation } from "../lib/supabase"

const MODE_LABELS: Record<string, string> = {
  free: "Freies Gespräch",
  scenario: "Szenario",
  pronunciation: "Aussprache",
  grammar: "Grammatik",
  fluency: "Flüssigkeit",
}
// Keep MODE_LABELS as-is (already German)

const MODE_COLORS: Record<string, string> = {
  free: "blue",
  scenario: "teal",
  pronunciation: "pink",
  grammar: "orange",
  fluency: "green",
}

export function HistoryView() {
  const { profile, setActiveTab, setCurrentMode, setCurrentScenario, setActiveConversation, setMessages } = useAppStore()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!profile.id) {
      setIsLoading(false)
      return
    }
    supabase
      .from("conversations")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setConversations(data ?? [])
        setIsLoading(false)
      })
  }, [profile.id])

  const handleResume = async (convo: Conversation) => {
    const { data: msgs } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", convo.id)
      .order("created_at", { ascending: true })

    setMessages(msgs ?? [])
    setCurrentMode(convo.mode)
    setCurrentScenario(convo.scenario ?? null)
    setActiveConversation(convo.id)
    setActiveTab("conversation")
  }

  const handleDelete = async (id: string) => {
    await supabase.from("conversations").delete().eq("id", id)
    setConversations(prev => prev.filter(c => c.id !== id))
  }

  if (isLoading) {
    return (
      <Box h="full" display="flex" alignItems="center" justifyContent="center">
        <Spinner colorPalette="green" />
      </Box>
    )
  }

  if (!profile.id) {
    return (
      <Box h="full" display="flex" alignItems="center" justifyContent="center" p="6">
        <VStack gap="3" textAlign="center">
          <Icon color="fg.muted" fontSize="3xl"><LuHistory /></Icon>
          <Text color="fg.muted" textStyle="sm">
            Melden Sie sich an, um den Gesprächsverlauf zu speichern
          </Text>
        </VStack>
      </Box>
    )
  }

  if (conversations.length === 0) {
    return (
      <Box h="full" display="flex" alignItems="center" justifyContent="center" p="6">
        <VStack gap="3" textAlign="center">
          <Box fontSize="3xl">📖</Box>
          <Text textStyle="sm" color="fg.muted">
            Noch keine Gespräche — starten Sie Ihr erstes!
          </Text>
          <Button
            size="sm"
            colorPalette="green"
            variant="surface"
            onClick={() => setActiveTab("conversation")}
          >
            Gespräch beginnen
          </Button>
        </VStack>
      </Box>
    )
  }

  return (
    <Box h="full" overflowY="auto" p={{ base: "4", md: "5" }}>
      <VStack gap="3" align="stretch">
        <HStack justify="space-between">
          <Text textStyle="sm" color="fg.muted">
            {conversations.length} Gespräch{conversations.length !== 1 ? "e" : ""}
          </Text>
        </HStack>

        {conversations.map(convo => (
          <ConversationCard
            key={convo.id}
            conversation={convo}
            onResume={() => handleResume(convo)}
            onDelete={() => handleDelete(convo.id)}
          />
        ))}
      </VStack>
    </Box>
  )
}

interface ConversationCardProps {
  conversation: Conversation
  onResume: () => void
  onDelete: () => void
}

function ConversationCard({ conversation: convo, onResume, onDelete }: ConversationCardProps) {
  const color = MODE_COLORS[convo.mode] ?? "gray"
  const date = new Date(convo.created_at)
  const isToday = date.toDateString() === new Date().toDateString()
  const dateStr = isToday
    ? date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString("de-DE", { month: "short", day: "numeric" })

  return (
    <Box
      bg="bg.panel"
      border="1px solid"
      borderColor="border.subtle"
      rounded="xl"
      overflow="hidden"
      transition="all 0.15s"
      _hover={{ shadow: "sm", borderColor: "border.muted" }}
    >
      <Box px="4" py="3">
        <HStack justify="space-between" align="start" gap="3">
          <HStack gap="3" flex="1" overflow="hidden">
            <Box
              w="9"
              h="9"
              rounded="lg"
              bg={`${color}.500/15`}
              display="flex"
              alignItems="center"
              justifyContent="center"
              color={`${color}.400`}
              flexShrink={0}
            >
              <Icon size="sm"><LuMessageCircle /></Icon>
            </Box>

            <VStack gap="1" align="start" overflow="hidden">
              <Text textStyle="sm" fontWeight="medium" color="fg" truncate>
                {convo.title}
              </Text>
              <HStack gap="2" flexWrap="wrap">
                <Badge colorPalette={color} variant="subtle" size="sm">
                  {MODE_LABELS[convo.mode] ?? convo.mode}
                </Badge>
                <CEFRBadge level={convo.level as "A1" | "A2" | "B1"} size="sm" />
              </HStack>
            </VStack>
          </HStack>

          <VStack gap="1" align="end" flexShrink={0}>
            <Text textStyle="xs" color="fg.subtle">
              {dateStr}
            </Text>
            <HStack gap="1">
              <Icon color="fg.subtle" size="xs"><LuMessageCircle /></Icon>
              <Text textStyle="xs" color="fg.subtle">
                {convo.message_count}
              </Text>
            </HStack>
          </VStack>
        </HStack>
      </Box>

      <HStack
        gap="0"
        borderTop="1px solid"
        borderColor="border.subtle"
        divideX="1px"
        divideColor="border.subtle"
      >
        <Button
          variant="ghost"
          size="xs"
          flex="1"
          rounded="none"
          colorPalette="green"
          onClick={onResume}
          py="2"
        >
          <Icon size="xs"><LuCirclePlay /></Icon>
          <Text textStyle="xs">Fortsetzen</Text>
        </Button>
        <Button
          variant="ghost"
          size="xs"
          colorPalette="red"
          rounded="none"
          px="4"
          py="2"
          onClick={onDelete}
        >
          <Icon size="xs"><LuTrash2 /></Icon>
        </Button>
      </HStack>
    </Box>
  )
}
