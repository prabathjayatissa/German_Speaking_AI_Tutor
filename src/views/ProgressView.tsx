import {
  Box,
  VStack,
  HStack,
  Text,
  Grid,
  Badge,
  Icon,
  Separator,
} from "@chakra-ui/react"
import {
  LuTrendingUp,
  LuMessageCircle,
  LuClock,
  LuAward,
  LuBrainCircuit,
  LuTarget,
  LuCircleCheckBig,
} from "react-icons/lu"
import { useEffect, useState } from "react"
import { useAppStore } from "../store/appStore"
import { supabase } from "../lib/supabase"
import { CEFR_LEVELS } from "../lib/curriculum"
import { CEFRBadge, CEFRProgressBar } from "../components/CEFRBadge"
import type { GrammarMistake, ProgressSnapshot } from "../lib/supabase"

export function ProgressView() {
  const { currentLevel, profile, recentConversations } = useAppStore()
  const [mistakes, setMistakes] = useState<GrammarMistake[]>([])
  const [snapshots, setSnapshots] = useState<ProgressSnapshot[]>([])

  useEffect(() => {
    if (!profile.id) return
    supabase.from("grammar_mistakes").select("*").eq("user_id", profile.id)
      .order("occurrence_count", { ascending: false }).limit(10)
      .then(({ data }) => setMistakes(data ?? []))
    supabase.from("progress_snapshots").select("*").eq("user_id", profile.id)
      .order("created_at", { ascending: false }).limit(5)
      .then(({ data }) => setSnapshots(data ?? []))
  }, [profile.id])

  const totalSpeakingMins = Math.floor((profile.total_speaking_time_seconds ?? 0) / 60)
  const sessionsCompleted = profile.sessions_completed ?? recentConversations.length

  const currentLevelInfo = CEFR_LEVELS.find(l => l.level === currentLevel)!
  const latestSnapshot = snapshots[0]

  return (
    <Box h="full" overflowY="auto" p={{ base: "4", md: "6" }}>
      <VStack gap="6" align="stretch" maxW="3xl">

        {/* Overview stats */}
        <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }} gap="3">
          {[
            { label: "Sitzungen", value: sessionsCompleted, icon: <LuMessageCircle />, color: "blue" },
            { label: "Minuten gesprochen", value: totalSpeakingMins, icon: <LuClock />, color: "green" },
            { label: "Korrekturen", value: mistakes.reduce((sum, m) => sum + m.occurrence_count, 0), icon: <LuBrainCircuit />, color: "orange" },
            { label: "Stufe", value: currentLevel, icon: <LuAward />, color: "teal" },
          ].map(stat => (
            <Box
              key={stat.label}
              bg="bg.panel"
              border="1px solid"
              borderColor="border.subtle"
              rounded="xl"
              p="4"
              textAlign="center"
            >
              <VStack gap="2">
                <Box
                  w="10"
                  h="10"
                  rounded="xl"
                  bg={`${stat.color}.500/15`}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color={`${stat.color}.400`}
                  mx="auto"
                >
                  <Icon>{stat.icon}</Icon>
                </Box>
                <Text textStyle="2xl" fontWeight="bold" color="fg">
                  {stat.value}
                </Text>
                <Text textStyle="xs" color="fg.muted">
                  {stat.label}
                </Text>
              </VStack>
            </Box>
          ))}
        </Grid>

        {/* CEFR Progress */}
        <Box bg="bg.panel" border="1px solid" borderColor="border.subtle" rounded="xl" overflow="hidden">
          <Box px="5" py="4" borderBottom="1px solid" borderColor="border.subtle">
            <HStack gap="2">
              <Icon color="teal.400"><LuTarget /></Icon>
              <Text textStyle="sm" fontWeight="semibold">CEFR Fortschritt</Text>
            </HStack>
          </Box>
          <Box p="5">
            <VStack gap="6" align="stretch">
              {CEFR_LEVELS.map(levelInfo => {
                const isCurrentOrPast = levelInfo.level <= currentLevel
                const isCurrent = levelInfo.level === currentLevel
                const score = isCurrent && latestSnapshot
                  ? Math.round((latestSnapshot.fluency_score + latestSnapshot.grammar_score) / 2)
                  : levelInfo.level < currentLevel ? 100 : 0

                return (
                  <Box key={levelInfo.level} opacity={isCurrentOrPast ? 1 : 0.4}>
                    <CEFRProgressBar level={levelInfo.level} score={score} />
                    {isCurrent && (
                      <VStack gap="2" align="stretch" mt="3">
                        <Text textStyle="xs" fontWeight="medium" color="fg.muted">
                          Aktuelle Ziele:
                        </Text>
                        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="1.5">
                          {currentLevelInfo.speakingGoals.slice(0, 4).map((goal, i) => (
                            <HStack key={i} gap="2">
                              <Icon color="green.400" size="xs"><LuCircleCheckBig /></Icon>
                              <Text textStyle="xs" color="fg.muted">{goal}</Text>
                            </HStack>
                          ))}
                        </Grid>
                      </VStack>
                    )}
                  </Box>
                )
              })}
            </VStack>
          </Box>
        </Box>

        {/* Grammar targets */}
        <Box bg="bg.panel" border="1px solid" borderColor="border.subtle" rounded="xl" overflow="hidden">
          <Box px="5" py="4" borderBottom="1px solid" borderColor="border.subtle">
            <HStack gap="2">
              <Icon color="orange.400"><LuBrainCircuit /></Icon>
              <Text textStyle="sm" fontWeight="semibold">
                Grammatikziele für {currentLevel}
              </Text>
            </HStack>
          </Box>
          <Box p="5">
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="2">
              {currentLevelInfo.grammarTargets.map((target, i) => (
                <HStack
                  key={i}
                  gap="2.5"
                  p="2.5"
                  rounded="lg"
                  bg="bg.subtle"
                  border="1px solid"
                  borderColor="border.subtle"
                >
                  <Box
                    w="5"
                    h="5"
                    rounded="full"
                    bg="orange.500/15"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                  >
                    <Text textStyle="2xs" color="orange.400" fontWeight="bold">
                      {i + 1}
                    </Text>
                  </Box>
                  <Text textStyle="xs" color="fg">{target}</Text>
                </HStack>
              ))}
            </Grid>
          </Box>
        </Box>

        {/* Common mistakes */}
        {mistakes.length > 0 && (
          <Box bg="bg.panel" border="1px solid" borderColor="border.subtle" rounded="xl" overflow="hidden">
            <Box px="5" py="4" borderBottom="1px solid" borderColor="border.subtle">
              <HStack gap="2" justify="space-between">
                <HStack gap="2">
                  <Icon color="red.400"><LuTrendingUp /></Icon>
                  <Text textStyle="sm" fontWeight="semibold">Häufige Fehler</Text>
                </HStack>
                <Text textStyle="xs" color="fg.muted">Zum Verbessern</Text>
              </HStack>
            </Box>
            <VStack gap="0" align="stretch" divideY="1px" divideColor="border.subtle">
              {mistakes.slice(0, 5).map(mistake => (
                <Box key={mistake.id} px="5" py="3">
                  <VStack gap="1.5" align="stretch">
                    <HStack gap="2" justify="space-between">
                      <Badge colorPalette="orange" variant="subtle" size="sm">
                        {mistake.category}
                      </Badge>
                      <Text textStyle="xs" color="fg.subtle">
                        {mistake.occurrence_count}× gesehen
                      </Text>
                    </HStack>
                    <HStack gap="2">
                      <Text textStyle="xs" color="red.400" textDecoration="line-through">
                        {mistake.example_original}
                      </Text>
                      <Text textStyle="xs" color="fg.muted">→</Text>
                      <Text textStyle="xs" color="green.400" fontWeight="medium">
                        {mistake.example_corrected}
                      </Text>
                    </HStack>
                    <Text textStyle="xs" color="fg.muted">{mistake.explanation}</Text>
                  </VStack>
                </Box>
              ))}
            </VStack>
          </Box>
        )}

        {/* Vocabulary domains */}
        <Box bg="bg.panel" border="1px solid" borderColor="border.subtle" rounded="xl" overflow="hidden">
          <Box px="5" py="4" borderBottom="1px solid" borderColor="border.subtle">
            <Text textStyle="sm" fontWeight="semibold">Vokabular-Bereiche für {currentLevel}</Text>
          </Box>
          <Box p="5">
            <HStack gap="2" flexWrap="wrap">
              {currentLevelInfo.vocabularyDomains.map(domain => (
                <Badge
                  key={domain}
                  colorPalette={currentLevelInfo.color}
                  variant="subtle"
                  size="md"
                >
                  {domain}
                </Badge>
              ))}
            </HStack>
          </Box>
        </Box>

      </VStack>
    </Box>
  )
}
