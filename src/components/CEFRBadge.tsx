import { Badge, Box, HStack, Text, VStack, Progress } from "@chakra-ui/react"
import type { CEFRLevel } from "../lib/supabase"
import { CEFR_LEVELS } from "../lib/curriculum"

interface CEFRBadgeProps {
  level: CEFRLevel
  size?: "sm" | "md" | "lg"
}

export function CEFRBadge({ level, size = "md" }: CEFRBadgeProps) {
  const info = CEFR_LEVELS.find(l => l.level === level)!

  return (
    <Badge
      colorPalette={info.color}
      variant="surface"
      size={size === "lg" ? "lg" : size === "sm" ? "sm" : "md"}
      fontWeight="bold"
    >
      {level}
    </Badge>
  )
}

interface CEFRProgressBarProps {
  level: CEFRLevel
  score: number
}

export function CEFRProgressBar({ level, score }: CEFRProgressBarProps) {
  const info = CEFR_LEVELS.find(l => l.level === level)!

  return (
    <VStack gap="1" align="stretch" w="full">
      <HStack justify="space-between">
        <HStack gap="2">
          <CEFRBadge level={level} size="sm" />
          <Text textStyle="sm" fontWeight="medium">
            {info.label}
          </Text>
        </HStack>
        <Text textStyle="sm" color="fg.muted">
          {score}%
        </Text>
      </HStack>
      <Progress.Root value={score} max={100} colorPalette={info.color} size="sm" rounded="full">
        <Progress.Track rounded="full">
          <Progress.Range rounded="full" />
        </Progress.Track>
      </Progress.Root>
    </VStack>
  )
}

interface CEFRLevelSelectorProps {
  value: CEFRLevel
  onChange: (level: CEFRLevel) => void
}

export function CEFRLevelSelector({ value, onChange }: CEFRLevelSelectorProps) {
  return (
    <HStack gap="2">
      {CEFR_LEVELS.map(info => (
        <Box
          key={info.level}
          as="button"
          onClick={() => onChange(info.level)}
          px="4"
          py="2"
          rounded="lg"
          border="2px solid"
          borderColor={value === info.level ? `${info.color}.500` : "border.subtle"}
          bg={value === info.level ? `${info.color}.500/10` : "transparent"}
          cursor="pointer"
          transition="all 0.2s"
          _hover={{
            borderColor: `${info.color}.400`,
            bg: `${info.color}.500/5`,
          }}
          flex="1"
        >
          <VStack gap="0.5">
            <Text
              textStyle="lg"
              fontWeight="bold"
              color={value === info.level ? `${info.color}.400` : "fg.muted"}
            >
              {info.level}
            </Text>
            <Text
              textStyle="xs"
              color={value === info.level ? `${info.color}.300` : "fg.subtle"}
            >
              {info.label}
            </Text>
          </VStack>
        </Box>
      ))}
    </HStack>
  )
}
