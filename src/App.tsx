#import all the necessary packages
import { Box, HStack, Text, Badge } from "@chakra-ui/react"
import { useAppStore } from "./store/appStore"
import { Sidebar } from "./components/Sidebar"
import { ConversationView } from "./views/ConversationView"
import { SettingsView } from "./views/SettingsView"
import { ProgressView } from "./views/ProgressView"
import { HistoryView } from "./views/HistoryView"
import { ConversationSetupPanel } from "./components/ConversationSetupPanel"
import { ModeSelector } from "./components/ModeSelector"
import { ColorModeButton } from "@/components/ui/color-mode"

function App() {
  const { activeTab, currentMode, setCurrentMode } = useAppStore()

  return (
    <Box
      minH="100dvh"
      h="100dvh"
      bg="bg"
      display="flex"
      flexDir="column"
      overflow="hidden"
    >
      {/* Top bar */}
      <Box
        bg="bg.panel"
        borderBottom="1px solid"
        borderColor="border.subtle"
        px="4"
        py="2.5"
        flexShrink={0}
        zIndex="banner"
      >
        <HStack justify="space-between" align="center">
          {/* Brand */}
          <HStack gap="2.5">
            <Box
              w="7"
              h="7"
              rounded="lg"
              bg="green.600"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="white"
              fontSize="sm"
            >
              🇩🇪
            </Box>
            <Text fontWeight="bold" textStyle="sm" color="fg" hideBelow="sm">
              DeutschAI
            </Text>
            <Badge colorPalette="green" variant="subtle" size="sm" hideBelow="md">
              B1 Tutor
            </Badge>
          </HStack>

          {/* Mode selector — compact, visible on large screens */}
          {activeTab === "conversation" && (
            <Box hideBelow="lg">
              <ModeSelector
                value={currentMode}
                onChange={setCurrentMode}
                compact
              />
            </Box>
          )}

          {/* Right actions */}
          <HStack gap="2">
            {activeTab === "conversation" && (
              <ConversationSetupPanel />
            )}
            <ColorModeButton />
          </HStack>
        </HStack>
      </Box>

      {/* Body */}
      <Box flex="1" display="flex" overflow="hidden">
        <Sidebar />

        <Box flex="1" overflow="hidden" display="flex" flexDir="column">
          {activeTab === "conversation" && <ConversationView />}
          {activeTab === "history" && <HistoryView />}
          {activeTab === "progress" && <ProgressView />}
          {activeTab === "settings" && <SettingsView />}
        </Box>
      </Box>
    </Box>
  )
}

export default App
