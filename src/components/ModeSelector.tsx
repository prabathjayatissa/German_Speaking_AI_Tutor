import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  Badge,
} from "@chakra-ui/react"
import {
  LuMessagesSquare,
  LuTheater,
  LuMic,
  LuBookOpen,
  LuTimer,
} from "react-icons/lu"
import { TUTOR_MODES } from "../lib/curriculum"
import type { TutorMode } from "../lib/supabase"

const ICON_MAP: Record<TutorMode, React.ReactNode> = {
  free: <LuMessagesSquare />,
  scenario: <LuTheater />,
  pronunciation: <LuMic />,
  grammar: <LuBookOpen />,
  fluency: <LuTimer />,
}

const MODE_COLORS: Record<TutorMode, string> = {
  free: "blue",
  scenario: "teal",
  pronunciation: "pink",
  grammar: "orange",
  fluency: "green",
}

interface ModeSelectorProps {
  value: TutorMode
  onChange: (mode: TutorMode) => void
  compact?: boolean
}

export function ModeSelector({ value, onChange, compact }: ModeSelectorProps) {
  if (compact) {
    return (
      <HStack gap="1.5" flexWrap="wrap">
        {TUTOR_MODES.map(mode => {
          const color = MODE_COLORS[mode.id]
          const isSelected = value === mode.id
          return (
            <Box
              key={mode.id}
              as="button"
              onClick={() => onChange(mode.id)}
              px="2.5"
              py="1.5"
              rounded="lg"
              border="1.5px solid"
              borderColor={isSelected ? `${color}.500` : "border.subtle"}
              bg={isSelected ? `${color}.500/15` : "transparent"}
              cursor="pointer"
              transition="all 0.15s"
              _hover={{ borderColor: `${color}.400`, bg: `${color}.500/10` }}
            >
              <HStack gap="1.5">
                <Icon color={isSelected ? `${color}.400` : "fg.muted"} size="xs">
                  {ICON_MAP[mode.id]}
                </Icon>
                <Text
                  textStyle="xs"
                  fontWeight={isSelected ? "semibold" : "normal"}
                  color={isSelected ? `${color}.300` : "fg.muted"}
                >
                  {mode.labelDe}
                </Text>
              </HStack>
            </Box>
          )
        })}
      </HStack>
    )
  }

  return (
    <VStack gap="2" align="stretch">
      {TUTOR_MODES.map(mode => {
        const color = MODE_COLORS[mode.id]
        const isSelected = value === mode.id
        return (
          <Box
            key={mode.id}
            as="button"
            onClick={() => onChange(mode.id)}
            textAlign="left"
            p="3"
            rounded="xl"
            border="1.5px solid"
            borderColor={isSelected ? `${color}.500` : "border.subtle"}
            bg={isSelected ? `${color}.500/10` : "bg.subtle"}
            cursor="pointer"
            transition="all 0.2s"
            _hover={{
              borderColor: `${color}.400`,
              bg: `${color}.500/8`,
              transform: "translateY(-1px)",
            }}
            _active={{ transform: "translateY(0)" }}
          >
            <HStack gap="3">
              <Box
                w="9"
                h="9"
                rounded="lg"
                bg={isSelected ? `${color}.500` : `${color}.500/15`}
                display="flex"
                alignItems="center"
                justifyContent="center"
                color={isSelected ? "white" : `${color}.400`}
                transition="all 0.2s"
              >
                <Icon>{ICON_MAP[mode.id]}</Icon>
              </Box>
              <VStack gap="0.5" align="start" flex="1">
                <Text
                  textStyle="sm"
                  fontWeight="semibold"
                  color={isSelected ? `${color}.300` : "fg"}
                >
                  {mode.labelDe}
                </Text>
                <Text textStyle="xs" color="fg.muted">
                  {mode.descriptionDe}
                </Text>
              </VStack>
              {isSelected && (
                <Badge colorPalette={color} variant="solid" size="sm">
                  Aktiv
                </Badge>
              )}
            </HStack>
          </Box>
        )
      })}
    </VStack>
  )
}
