import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  Separator,
} from "@chakra-ui/react"
import { LuCircleCheckBig, LuArrowRight, LuX, LuSparkles } from "react-icons/lu"
import type { Correction } from "../lib/supabase"

const CORRECTION_COLORS: Record<string, string> = {
  grammar: "orange",
  vocabulary: "blue",
  word_order: "teal",
  pronunciation: "pink",
}

const CORRECTION_LABELS: Record<string, string> = {
  grammar: "Grammatik",
  vocabulary: "Vokabular",
  word_order: "Wortstellung",
  pronunciation: "Aussprache",
}

interface CorrectionPanelProps {
  corrections: Correction[]
  onClose: () => void
}

export function CorrectionPanel({ corrections, onClose }: CorrectionPanelProps) {
  if (!corrections.length) return null

  return (
    <Box
      bg="bg.panel"
      border="1px solid"
      borderColor="border.muted"
      rounded="xl"
      overflow="hidden"
      shadow="md"
      w="full"
    >
      {/* Header */}
      <HStack
        px="4"
        py="3"
        bg="orange.500/10"
        borderBottom="1px solid"
        borderColor="border.muted"
        justify="space-between"
      >
        <HStack gap="2">
          <Icon color="orange.400">
            <LuSparkles />
          </Icon>
          <Text textStyle="sm" fontWeight="semibold" color="orange.400">
            Korrekturen
          </Text>
          <Badge colorPalette="orange" variant="subtle" size="sm">
            {corrections.length}
          </Badge>
        </HStack>
        <Box
          as="button"
          onClick={onClose}
          color="fg.muted"
          _hover={{ color: "fg" }}
          transition="color 0.15s"
          cursor="pointer"
        >
          <Icon size="sm">
            <LuX />
          </Icon>
        </Box>
      </HStack>

      {/* Corrections list */}
      <VStack gap="0" align="stretch" divideY="1px" divideColor="border.subtle">
        {corrections.map((correction, i) => (
          <CorrectionItem key={i} correction={correction} />
        ))}
      </VStack>

      {/* Footer tip */}
      <Box px="4" py="2" bg="bg.subtle" borderTop="1px solid" borderColor="border.subtle">
        <Text textStyle="2xs" color="fg.subtle">
          Fehler machen ist normal — so lernt man! 💪
        </Text>
      </Box>
    </Box>
  )
}

function CorrectionItem({ correction }: { correction: Correction }) {
  const color = CORRECTION_COLORS[correction.type] ?? "gray"
  const label = CORRECTION_LABELS[correction.type] ?? correction.type

  return (
    <Box px="4" py="3">
      <VStack gap="2" align="stretch">
        <HStack gap="2" flexWrap="wrap">
          <Badge colorPalette={color} variant="subtle" size="sm">
            {label}
          </Badge>
        </HStack>

        {/* Before/after */}
        <HStack gap="2" flexWrap="wrap" alignItems="center">
          <Box
            bg="red.500/10"
            border="1px solid"
            borderColor="red.500/30"
            rounded="md"
            px="2.5"
            py="1"
            flex="1"
            minW="0"
          >
            <Text textStyle="sm" color="red.400" textDecoration="line-through" fontWeight="medium">
              {correction.original}
            </Text>
          </Box>

          <Icon color="fg.muted" flexShrink={0}>
            <LuArrowRight />
          </Icon>

          <Box
            bg="green.500/10"
            border="1px solid"
            borderColor="green.500/30"
            rounded="md"
            px="2.5"
            py="1"
            flex="1"
            minW="0"
          >
            <HStack gap="1.5">
              <Icon color="green.400" size="xs">
                <LuCircleCheckBig />
              </Icon>
              <Text textStyle="sm" color="green.400" fontWeight="semibold">
                {correction.corrected}
              </Text>
            </HStack>
          </Box>
        </HStack>

        {/* Explanation */}
        {correction.explanation && (
          <Text textStyle="xs" color="fg.muted" lineHeight="moderate">
            {correction.explanation}
          </Text>
        )}
      </VStack>
    </Box>
  )
}

interface InlineCorrectionBadgeProps {
  count: number
  onClick: () => void
}

export function InlineCorrectionBadge({ count, onClick }: InlineCorrectionBadgeProps) {
  return (
    <HStack
      gap="1.5"
      cursor="pointer"
      onClick={onClick}
      bg="orange.500/10"
      border="1px solid"
      borderColor="orange.500/30"
      rounded="full"
      px="3"
      py="1"
      _hover={{ bg: "orange.500/20" }}
      transition="all 0.15s"
    >
      <Icon color="orange.400" size="xs">
        <LuSparkles />
      </Icon>
      <Text textStyle="xs" color="orange.400" fontWeight="medium">
        {count} Korrektur{count !== 1 ? "en" : ""}
      </Text>
    </HStack>
  )
}
