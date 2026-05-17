import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Icon,
  Drawer,
} from "@chakra-ui/react"
import {
  LuSlidersHorizontal,
  LuX,
  LuPlay,
} from "react-icons/lu"
import { useState } from "react"
import { useAppStore } from "../store/appStore"
import { ModeSelector } from "./ModeSelector"
import { ScenarioSelector } from "./ScenarioSelector"
import { CEFRLevelSelector } from "./CEFRBadge"
import { DrawerRoot, DrawerContent, DrawerHeader, DrawerBody, DrawerCloseTrigger, DrawerTitle, DrawerFooter } from "@/components/ui/drawer"
import type { CEFRLevel, TutorMode } from "../lib/supabase"

export function ConversationSetupPanel() {
  const {
    currentMode, setCurrentMode,
    currentLevel, setCurrentLevel,
    currentScenario, setCurrentScenario,
    clearConversation,
  } = useAppStore()

  const [isOpen, setIsOpen] = useState(false)

  const handleApply = () => {
    clearConversation()
    setIsOpen(false)
  }

  return (
    <>
      <Button
        size="sm"
        variant="surface"
        colorPalette="gray"
        onClick={() => setIsOpen(true)}
      >
        <Icon><LuSlidersHorizontal /></Icon>
        Einrichten
      </Button>

      <DrawerRoot open={isOpen} onOpenChange={e => setIsOpen(e.open)} placement="end" size="md">
        <DrawerContent>
          <DrawerHeader borderBottom="1px solid" borderColor="border.subtle">
            <DrawerTitle>Gesprächseinstellungen</DrawerTitle>
            <DrawerCloseTrigger />
          </DrawerHeader>

          <DrawerBody py="6">
            <VStack gap="6" align="stretch">
              {/* Level */}
              <VStack gap="3" align="stretch">
                <Text textStyle="sm" fontWeight="semibold" color="fg">
                  Sprachniveau
                </Text>
                <CEFRLevelSelector
                  value={currentLevel}
                  onChange={(l: CEFRLevel) => setCurrentLevel(l)}
                />
              </VStack>

              {/* Mode */}
              <VStack gap="3" align="stretch">
                <Text textStyle="sm" fontWeight="semibold" color="fg">
                  Gesprächsmodus
                </Text>
                <ModeSelector
                  value={currentMode}
                  onChange={(m: TutorMode) => {
                    setCurrentMode(m)
                    if (m !== "scenario") setCurrentScenario(null)
                  }}
                />
              </VStack>

              {/* Scenarios (only for scenario mode) */}
              {currentMode === "scenario" && (
                <VStack gap="3" align="stretch">
                  <Text textStyle="sm" fontWeight="semibold" color="fg">
                    Szenario auswählen
                  </Text>
                  <ScenarioSelector
                    selectedId={currentScenario}
                    onSelect={setCurrentScenario}
                  />
                </VStack>
              )}
            </VStack>
          </DrawerBody>

          <DrawerFooter borderTop="1px solid" borderColor="border.subtle">
            <HStack gap="3" w="full">
              <Button variant="outline" flex="1" onClick={() => setIsOpen(false)}>
                Abbrechen
              </Button>
              <Button colorPalette="green" flex="1" onClick={handleApply}>
                <Icon><LuPlay /></Icon>
                Anwenden & Neu starten
              </Button>
            </HStack>
          </DrawerFooter>
        </DrawerContent>
      </DrawerRoot>
    </>
  )
}
