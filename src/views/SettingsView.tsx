import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Badge,
  Icon,
  Spinner,
  Separator,
  Heading,
} from "@chakra-ui/react"
import { LuServer, LuBot, LuRefreshCw, LuCircleCheckBig, LuCircleAlert, LuUser, LuGraduationCap, LuVolume2 } from "react-icons/lu"
import { useState, useEffect } from "react"
import { useAppStore } from "../store/appStore"
import { fetchAvailableModels } from "../lib/lmstudio"
import { CEFRLevelSelector } from "../components/CEFRBadge"
import { Field } from "@/components/ui/field"
import { Slider } from "@/components/ui/slider"
import type { LMStudioModel } from "../lib/lmstudio"
import type { CEFRLevel } from "../lib/supabase"

export function SettingsView() {
  const {
    lmStudioUrl, setLmStudioUrl,
    selectedModel, setSelectedModel,
    voiceSpeed, setVoiceSpeed,
    currentLevel, setCurrentLevel,
    currentMode, setCurrentMode,
    profile, setProfile,
  } = useAppStore()

  const [models, setModels] = useState<LMStudioModel[]>([])
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"unknown" | "connected" | "error">("unknown")
  const [urlInput, setUrlInput] = useState(lmStudioUrl)
  const [nameInput, setNameInput] = useState(profile.name ?? "")

  const handleCheckConnection = async () => {
    setIsLoadingModels(true)
    setConnectionStatus("unknown")
    try {
      const found = await fetchAvailableModels(urlInput)
      setModels(found)
      setConnectionStatus(found.length > 0 ? "connected" : "error")
      setLmStudioUrl(urlInput)
    } catch {
      setConnectionStatus("error")
    }
    setIsLoadingModels(false)
  }

  useEffect(() => {
    if (lmStudioUrl) {
      fetchAvailableModels(lmStudioUrl).then(m => {
        setModels(m)
        setConnectionStatus(m.length > 0 ? "connected" : "error")
      })
    }
  }, [])

  return (
    <Box h="full" overflowY="auto" p={{ base: "4", md: "6" }}>
      <VStack gap="6" align="stretch" maxW="2xl">

        {/* Profile */}
        <SectionCard
          icon={<LuUser />}
          title="Profil"
          description="Ihr Name und Lernziel"
        >
          <VStack gap="4" align="stretch">
            <Field label="Ihr Name">
              <Input
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onBlur={() => setProfile({ name: nameInput })}
                placeholder="z.B. Maria"
                size="sm"
              />
            </Field>
          </VStack>
        </SectionCard>

        {/* CEFR Level */}
        <SectionCard
          icon={<LuGraduationCap />}
          title="Sprachniveau (CEFR)"
          description="Wählen Sie Ihr aktuelles Deutschniveau"
        >
          <CEFRLevelSelector
            value={currentLevel}
            onChange={(level: CEFRLevel) => setCurrentLevel(level)}
          />
        </SectionCard>

        {/* LM Studio Connection */}
        <SectionCard
          icon={<LuServer />}
          title="LM Studio Verbindung"
          description="Verbinden Sie sich mit Ihrem lokalen LM Studio Server"
        >
          <VStack gap="4" align="stretch">
            <Field label="Server URL">
              <HStack gap="2">
                <Input
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  placeholder="http://localhost:1234"
                  size="sm"
                  fontFamily="mono"
                />
                <Button
                  size="sm"
                  colorPalette="green"
                  variant="surface"
                  onClick={handleCheckConnection}
                  loading={isLoadingModels}
                  loadingText="..."
                  flexShrink={0}
                >
                  <Icon><LuRefreshCw /></Icon>
                </Button>
              </HStack>
            </Field>

            {/* Connection status */}
            {connectionStatus !== "unknown" && (
              <HStack gap="2" p="3" rounded="lg" bg={connectionStatus === "connected" ? "green.500/10" : "red.500/10"} border="1px solid" borderColor={connectionStatus === "connected" ? "green.500/30" : "red.500/30"}>
                <Icon color={connectionStatus === "connected" ? "green.400" : "red.400"}>
                  {connectionStatus === "connected" ? <LuCircleCheckBig /> : <LuCircleAlert />}
                </Icon>
                <Text textStyle="sm" color={connectionStatus === "connected" ? "green.300" : "red.300"}>
                  {connectionStatus === "connected"
                    ? `${models.length} Modell${models.length !== 1 ? "e" : ""} gefunden`
                    : "Verbindung fehlgeschlagen. Ist LM Studio gestartet?"}
                </Text>
              </HStack>
            )}

            {/* Setup instructions */}
            <Box bg="bg.subtle" rounded="lg" p="3" border="1px solid" borderColor="border.subtle">
              <Text textStyle="xs" fontWeight="semibold" color="fg.muted" mb="2">
                LM Studio einrichten:
              </Text>
              <VStack gap="1" align="start">
                {[
                  "1. LM Studio herunterladen und installieren",
                  "2. Ein Modell herunterladen (z.B. Gemma 3 4B Q4)",
                  "3. 'Local Server' Tab öffnen",
                  "4. Server starten (Port 1234)",
                  "5. Hier verbinden und Modell auswählen",
                ].map((step, i) => (
                  <Text key={i} textStyle="xs" color="fg.muted">
                    {step}
                  </Text>
                ))}
              </VStack>
            </Box>
          </VStack>
        </SectionCard>

        {/* Model Selection */}
        <SectionCard
          icon={<LuBot />}
          title="Modell auswählen"
          description="Installierte LM Studio Modelle"
        >
          <VStack gap="2" align="stretch">
            {models.length === 0 ? (
              <Text textStyle="sm" color="fg.muted" textAlign="center" py="4">
                Keine Modelle gefunden — bitte zuerst verbinden
              </Text>
            ) : (
              models.map(model => (
                <ModelCard
                  key={model.id}
                  model={model}
                  isSelected={selectedModel === model.id}
                  onSelect={() => setSelectedModel(model.id)}
                />
              ))
            )}

            {/* Recommended models hint */}
            <Box bg="blue.500/5" rounded="lg" p="3" border="1px solid" borderColor="blue.500/20">
              <Text textStyle="xs" fontWeight="semibold" color="blue.400" mb="1.5">
                Empfohlene Modelle für M1 (4-bit GGUF):
              </Text>
              <VStack gap="0.5" align="start">
                {[
                  "Gemma-3-4B-Instruct-Q4_K_M",
                  "Qwen2.5-7B-Instruct-Q4_K_M",
                  "Mistral-7B-Instruct-v0.3-Q4_K_M",
                  "Phi-4-mini-instruct-Q4_K_M",
                ].map(m => (
                  <Text key={m} textStyle="xs" color="fg.muted" fontFamily="mono">
                    • {m}
                  </Text>
                ))}
              </VStack>
            </Box>
          </VStack>
        </SectionCard>

        {/* Voice Speed */}
        <SectionCard
          icon={<LuVolume2 />}
          title="Sprachausgabe"
          description="Geschwindigkeit der KI-Sprachausgabe"
        >
          <VStack gap="4" align="stretch">
            <Field label={`Geschwindigkeit: ${voiceSpeed.toFixed(1)}x`}>
              <Slider
                value={[voiceSpeed]}
                min={0.5}
                max={1.5}
                step={0.1}
                onValueChange={({ value }) => setVoiceSpeed(value[0])}
                colorPalette="green"
                marks={[
                  { value: 0.5, label: "Langsam" },
                  { value: 1.0, label: "Normal" },
                  { value: 1.5, label: "Schnell" },
                ]}
              />
            </Field>
          </VStack>
        </SectionCard>

      </VStack>
    </Box>
  )
}

interface SectionCardProps {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
}

function SectionCard({ icon, title, description, children }: SectionCardProps) {
  return (
    <Box
      bg="bg.panel"
      border="1px solid"
      borderColor="border.subtle"
      rounded="xl"
      overflow="hidden"
    >
      <Box px="5" py="4" borderBottom="1px solid" borderColor="border.subtle">
        <HStack gap="3">
          <Box
            w="8"
            h="8"
            rounded="lg"
            bg="green.500/15"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="green.400"
          >
            <Icon size="sm">{icon}</Icon>
          </Box>
          <VStack gap="0" align="start">
            <Text textStyle="sm" fontWeight="semibold" color="fg">
              {title}
            </Text>
            <Text textStyle="xs" color="fg.muted">
              {description}
            </Text>
          </VStack>
        </HStack>
      </Box>
      <Box p="5">{children}</Box>
    </Box>
  )
}

function ModelCard({
  model,
  isSelected,
  onSelect,
}: {
  model: LMStudioModel
  isSelected: boolean
  onSelect: () => void
}) {
  const shortId = model.id.split("/").pop() ?? model.id
  const isRecommended = shortId.toLowerCase().includes("gemma") || shortId.toLowerCase().includes("qwen")

  return (
    <Box
      as="button"
      onClick={onSelect}
      textAlign="left"
      p="3"
      rounded="lg"
      border="1.5px solid"
      borderColor={isSelected ? "green.500" : "border.subtle"}
      bg={isSelected ? "green.500/10" : "bg.subtle"}
      cursor="pointer"
      transition="all 0.15s"
      _hover={{ borderColor: "green.400", bg: isSelected ? "green.500/15" : "bg.muted" }}
    >
      <HStack gap="3" justify="space-between">
        <VStack gap="0.5" align="start" overflow="hidden">
          <HStack gap="2" flexWrap="wrap">
            <Text textStyle="xs" fontWeight="semibold" color={isSelected ? "green.300" : "fg"} truncate fontFamily="mono">
              {shortId}
            </Text>
            {isRecommended && (
              <Badge colorPalette="green" variant="subtle" size="sm">
                Empfohlen
              </Badge>
            )}
          </HStack>
          <Text textStyle="2xs" color="fg.muted">
            {model.owned_by ?? "LM Studio"}
          </Text>
        </VStack>
        {isSelected && (
          <Icon color="green.400" flexShrink={0} size="sm">
            <LuCircleCheckBig />
          </Icon>
        )}
      </HStack>
    </Box>
  )
}
