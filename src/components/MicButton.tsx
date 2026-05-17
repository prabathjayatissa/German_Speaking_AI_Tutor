import { Box, IconButton, Text, VStack } from "@chakra-ui/react"
import { LuMic, LuMicOff, LuLoader } from "react-icons/lu"
import { keyframes } from "@emotion/react"
import { useEffect, useRef } from "react"
import type { RecognitionState } from "../lib/speech"

interface MicButtonProps {
  state: RecognitionState
  isAISpeaking: boolean
  onPress: () => void
  onRelease: () => void
  pushToTalk?: boolean
}

const pulseRing = keyframes`
  0% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.35); opacity: 0.2; }
  100% { transform: scale(1.6); opacity: 0; }
`

const breathe = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`

export function MicButton({ state, isAISpeaking, onPress, onRelease, pushToTalk }: MicButtonProps) {
  const holdRef = useRef(false)

  const isListening = state === "listening"
  const isProcessing = state === "processing"
  const isError = state === "error"

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && pushToTalk && !holdRef.current) {
        e.preventDefault()
        holdRef.current = true
        onPress()
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" && pushToTalk && holdRef.current) {
        holdRef.current = false
        onRelease()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [pushToTalk, onPress, onRelease])

  const getColor = () => {
    if (isError) return "red"
    if (isListening) return "green"
    if (isAISpeaking) return "blue"
    if (isProcessing) return "orange"
    return "gray"
  }

  const color = getColor()

  const getLabel = () => {
    if (isListening) return "Sprechen Sie..."
    if (isProcessing) return "Verarbeitung..."
    if (isAISpeaking) return "KI spricht..."
    if (isError) return "Fehler - erneut versuchen"
    return pushToTalk ? "Leertaste halten" : "Tippen zum Sprechen"
  }

  return (
    <VStack gap="3" align="center">
      <Box position="relative" display="flex" alignItems="center" justifyContent="center">
        {/* Pulse rings when listening */}
        {isListening && (
          <>
            <Box
              position="absolute"
              w="120px"
              h="120px"
              rounded="full"
              bg={`${color}.500`}
              opacity={0.3}
              css={{
                animation: `${pulseRing} 1.5s ease-out infinite`,
              }}
            />
            <Box
              position="absolute"
              w="120px"
              h="120px"
              rounded="full"
              bg={`${color}.500`}
              opacity={0.15}
              css={{
                animation: `${pulseRing} 1.5s ease-out 0.5s infinite`,
              }}
            />
          </>
        )}

        {/* AI speaking indicator */}
        {isAISpeaking && (
          <Box
            position="absolute"
            w="100px"
            h="100px"
            rounded="full"
            border="2px solid"
            borderColor={`${color}.400`}
            css={{
              animation: `${breathe} 1.2s ease-in-out infinite`,
            }}
          />
        )}

        {/* Main button */}
        <IconButton
          size="2xl"
          rounded="full"
          w="80px"
          h="80px"
          colorPalette={color}
          variant={isListening ? "solid" : isAISpeaking ? "subtle" : "surface"}
          aria-label="Toggle microphone"
          onClick={pushToTalk ? undefined : (isListening ? onRelease : onPress)}
          onMouseDown={pushToTalk ? onPress : undefined}
          onMouseUp={pushToTalk ? onRelease : undefined}
          onTouchStart={pushToTalk ? onPress : undefined}
          onTouchEnd={pushToTalk ? onRelease : undefined}
          disabled={isAISpeaking}
          css={{
            transition: "all 0.2s ease",
            boxShadow: isListening
              ? `0 0 0 4px var(--chakra-colors-${color}-200)`
              : "none",
            "&:active": { transform: "scale(0.95)" },
          }}
        >
          {isProcessing ? (
            <Box css={{ animation: "spin 1s linear infinite" }}>
              <LuLoader size={28} />
            </Box>
          ) : isListening ? (
            <LuMic size={28} />
          ) : (
            <LuMicOff size={28} />
          )}
        </IconButton>
      </Box>

      <Text
        textStyle="sm"
        color="fg.muted"
        fontWeight="medium"
        textAlign="center"
        transition="all 0.2s"
      >
        {getLabel()}
      </Text>
    </VStack>
  )
}
