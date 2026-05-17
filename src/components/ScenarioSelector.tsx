import {
  Box,
  Grid,
  HStack,
  VStack,
  Text,
  Badge,
  Icon,
  Heading,
} from "@chakra-ui/react"
import {
  LuUtensils,
  LuTrainFront,
  LuUsers,
  LuShoppingBag,
  LuStethoscope,
  LuBriefcase,
  LuHouse,
  LuMessageSquare,
  LuBuilding2,
  LuPlane,
} from "react-icons/lu"
import { SCENARIOS, CEFR_LEVELS } from "../lib/curriculum"
import type { CEFRLevel } from "../lib/supabase"

const ICON_MAP: Record<string, React.ReactNode> = {
  utensils: <LuUtensils />,
  train: <LuTrainFront />,
  users: <LuUsers />,
  "shopping-bag": <LuShoppingBag />,
  stethoscope: <LuStethoscope />,
  briefcase: <LuBriefcase />,
  home: <LuHouse />,
  "message-square": <LuMessageSquare />,
  building: <LuBuilding2 />,
  plane: <LuPlane />,
}

const LEVEL_COLOR: Record<CEFRLevel, string> = {
  A1: "green",
  A2: "blue",
  B1: "orange",
}

interface ScenarioSelectorProps {
  selectedId: string | null
  onSelect: (id: string) => void
  filterLevel?: CEFRLevel
}

export function ScenarioSelector({ selectedId, onSelect, filterLevel }: ScenarioSelectorProps) {
  const grouped = CEFR_LEVELS.map(levelInfo => ({
    level: levelInfo.level,
    label: levelInfo.label,
    color: levelInfo.color,
    scenarios: SCENARIOS.filter(s =>
      s.level === levelInfo.level && (!filterLevel || filterLevel >= levelInfo.level)
    ),
  })).filter(g => g.scenarios.length > 0)

  return (
    <VStack gap="6" align="stretch">
      {grouped.map(group => (
        <VStack key={group.level} gap="3" align="stretch">
          <HStack gap="2">
            <Badge colorPalette={group.color} variant="surface" fontWeight="bold">
              {group.level}
            </Badge>
            <Text textStyle="sm" color="fg.muted" fontWeight="medium">
              {group.label}
            </Text>
          </HStack>

          <Grid templateColumns="repeat(auto-fill, minmax(160px, 1fr))" gap="2">
            {group.scenarios.map(scenario => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                isSelected={selectedId === scenario.id}
                onSelect={() => onSelect(scenario.id)}
                color={group.color}
              />
            ))}
          </Grid>
        </VStack>
      ))}
    </VStack>
  )
}

interface ScenarioCardProps {
  scenario: typeof SCENARIOS[0]
  isSelected: boolean
  onSelect: () => void
  color: string
}

function ScenarioCard({ scenario, isSelected, onSelect, color }: ScenarioCardProps) {
  return (
    <Box
      as="button"
      onClick={onSelect}
      bg={isSelected ? `${color}.500/15` : "bg.subtle"}
      border="1.5px solid"
      borderColor={isSelected ? `${color}.500` : "border.subtle"}
      rounded="xl"
      p="3"
      cursor="pointer"
      transition="all 0.2s"
      textAlign="left"
      _hover={{
        bg: isSelected ? `${color}.500/20` : "bg.muted",
        borderColor: `${color}.400`,
        transform: "translateY(-1px)",
        shadow: "sm",
      }}
      _active={{ transform: "translateY(0)" }}
    >
      <VStack gap="2" align="start">
        <Box
          w="8"
          h="8"
          rounded="lg"
          bg={isSelected ? `${color}.500` : `${color}.500/20`}
          display="flex"
          alignItems="center"
          justifyContent="center"
          color={isSelected ? "white" : `${color}.400`}
          transition="all 0.2s"
        >
          <Icon size="sm">
            {ICON_MAP[scenario.icon] ?? <LuMessageSquare />}
          </Icon>
        </Box>

        <VStack gap="0.5" align="start">
          <Text
            textStyle="xs"
            fontWeight="semibold"
            color={isSelected ? `${color}.300` : "fg"}
            lineClamp={1}
          >
            {scenario.titleDe}
          </Text>
          <Text textStyle="2xs" color="fg.subtle" lineClamp={2}>
            {scenario.description}
          </Text>
        </VStack>
      </VStack>
    </Box>
  )
}
