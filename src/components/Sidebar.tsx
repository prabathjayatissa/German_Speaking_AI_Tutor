import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  Separator,
  Badge,
} from "@chakra-ui/react"
import {
  LuMessageCircle,
  LuHistory,
  LuTrendingUp,
  LuSettings,
  LuGraduationCap,
  LuChevronLeft,
  LuChevronRight,
  LuBot,
} from "react-icons/lu"
import { useAppStore } from "../store/appStore"
import { CEFRBadge } from "./CEFRBadge"

type Tab = "conversation" | "history" | "progress" | "settings"

const NAV_ITEMS: { id: Tab; label: string; icon: React.ReactNode; badge?: string }[] = [
  { id: "conversation", label: "Gespräch", icon: <LuMessageCircle /> },
  { id: "history", label: "Verlauf", icon: <LuHistory /> },
  { id: "progress", label: "Fortschritt", icon: <LuTrendingUp /> },
  { id: "settings", label: "Einstellungen", icon: <LuSettings /> },
]

export function Sidebar() {
  const { activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen, currentLevel, profile } = useAppStore()

  return (
    <Box
      h="full"
      bg="bg.panel"
      borderRight="1px solid"
      borderColor="border.subtle"
      display="flex"
      flexDir="column"
      transition="width 0.25s ease"
      w={isSidebarOpen ? "220px" : "64px"}
      flexShrink={0}
      overflow="hidden"
    >
      {/* Logo */}
      <Box px={isSidebarOpen ? "4" : "2"} py="4" borderBottom="1px solid" borderColor="border.subtle">
        <HStack gap="3" justify={isSidebarOpen ? "start" : "center"}>
          <Box
            w="9"
            h="9"
            rounded="xl"
            bg="green.600"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="white"
            flexShrink={0}
          >
            <Icon>
              <LuGraduationCap />
            </Icon>
          </Box>
          {isSidebarOpen && (
            <VStack gap="0" align="start">
              <Text fontWeight="bold" textStyle="sm" color="fg">
                DeutschAI
              </Text>
              <Text textStyle="2xs" color="fg.muted">
                German Tutor
              </Text>
            </VStack>
          )}
        </HStack>
      </Box>

      {/* Student info */}
      {isSidebarOpen && (
        <Box px="4" py="3" borderBottom="1px solid" borderColor="border.subtle">
          <HStack gap="2">
            <Box
              w="7"
              h="7"
              rounded="full"
              bg="blue.500/20"
              border="1px solid"
              borderColor="blue.500/30"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon size="xs" color="blue.400">
                <LuBot />
              </Icon>
            </Box>
            <VStack gap="0" align="start" overflow="hidden">
              <Text textStyle="xs" fontWeight="medium" color="fg" truncate>
                {profile.name || "Student"}
              </Text>
              <CEFRBadge level={currentLevel} size="sm" />
            </VStack>
          </HStack>
        </Box>
      )}

      {/* Navigation */}
      <VStack gap="1" p="2" flex="1">
        {NAV_ITEMS.map(item => (
          <Box
            key={item.id}
            as="button"
            w="full"
            onClick={() => setActiveTab(item.id)}
            display="flex"
            alignItems="center"
            gap="3"
            px={isSidebarOpen ? "3" : "0"}
            py="2.5"
            rounded="lg"
            justify={isSidebarOpen ? "start" : "center"}
            bg={activeTab === item.id ? "green.500/15" : "transparent"}
            color={activeTab === item.id ? "green.400" : "fg.muted"}
            _hover={{
              bg: activeTab === item.id ? "green.500/20" : "bg.muted",
              color: activeTab === item.id ? "green.400" : "fg",
            }}
            transition="all 0.15s"
            cursor="pointer"
          >
            <Icon flexShrink={0}>
              {item.icon}
            </Icon>
            {isSidebarOpen && (
              <Text textStyle="sm" fontWeight={activeTab === item.id ? "semibold" : "normal"}>
                {item.label}
              </Text>
            )}
            {isSidebarOpen && item.badge && (
              <Badge colorPalette="orange" variant="solid" size="sm" ml="auto">
                {item.badge}
              </Badge>
            )}
          </Box>
        ))}
      </VStack>

      {/* Collapse toggle */}
      <Box
        as="button"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        display="flex"
        alignItems="center"
        justifyContent="center"
        p="3"
        borderTop="1px solid"
        borderColor="border.subtle"
        color="fg.muted"
        _hover={{ color: "fg", bg: "bg.muted" }}
        transition="all 0.15s"
        cursor="pointer"
      >
        <Icon size="sm">
          {isSidebarOpen ? <LuChevronLeft /> : <LuChevronRight />}
        </Icon>
      </Box>
    </Box>
  )
}
