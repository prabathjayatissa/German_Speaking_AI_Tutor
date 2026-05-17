import { Box, HStack, Text, VStack, Badge, Icon } from "@chakra-ui/react"
import { LuBot, LuUser, LuCircleCheck } from "react-icons/lu"
import type { Message, Correction } from "../lib/supabase"

interface ChatBubbleProps {
  message: Message
  onShowCorrections?: (corrections: Correction[]) => void
}

export function ChatBubble({ message, onShowCorrections }: ChatBubbleProps) {
  const isUser = message.role === "user"
  const hasCorrections = message.corrections && message.corrections.length > 0

  return (
    <Box
      display="flex"
      flexDir={isUser ? "row-reverse" : "row"}
      gap="2"
      alignItems="flex-start"
      w="full"
    >
      {/* Avatar */}
      <Box
        w="8"
        h="8"
        rounded="full"
        flexShrink={0}
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg={isUser ? "blue.500" : "green.600"}
        color="white"
        mt="1"
      >
        <Icon size="sm">
          {isUser ? <LuUser /> : <LuBot />}
        </Icon>
      </Box>

      <VStack gap="1" alignItems={isUser ? "flex-end" : "flex-start"} maxW="75%">
        {/* Bubble */}
        <Box
          bg={isUser ? "blue.500" : "bg.panel"}
          color={isUser ? "white" : "fg"}
          px="4"
          py="3"
          rounded={isUser ? "2xl 2xl xs 2xl" : "2xl 2xl 2xl xs"}
          shadow="sm"
          border={isUser ? "none" : "1px solid"}
          borderColor={isUser ? "transparent" : "border.subtle"}
          maxW="full"
        >
          <Text textStyle="sm" lineHeight="tall" whiteSpace="pre-wrap">
            {message.content}
          </Text>
        </Box>

        {/* Corrections indicator */}
        {hasCorrections && isUser && (
          <HStack
            gap="1.5"
            cursor="pointer"
            onClick={() => onShowCorrections?.(message.corrections!)}
            _hover={{ opacity: 0.8 }}
            transition="opacity 0.15s"
          >
            <Icon color="orange.400" size="xs">
              <LuCircleCheck />
            </Icon>
            <Badge
              colorPalette="orange"
              variant="subtle"
              size="sm"
              cursor="pointer"
            >
              {message.corrections!.length} Korrektur{message.corrections!.length !== 1 ? "en" : ""}
            </Badge>
          </HStack>
        )}

        {/* Timestamp */}
        <Text textStyle="2xs" color="fg.subtle">
          {new Date(message.created_at).toLocaleTimeString("de-DE", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </VStack>
    </Box>
  )
}

interface StreamingBubbleProps {
  content: string
}

export function StreamingBubble({ content }: StreamingBubbleProps) {
  return (
    <Box display="flex" flexDir="row" gap="2" alignItems="flex-start" w="full">
      <Box
        w="8"
        h="8"
        rounded="full"
        flexShrink={0}
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="green.600"
        color="white"
        mt="1"
      >
        <Icon size="sm">
          <LuBot />
        </Icon>
      </Box>

      <Box
        bg="bg.panel"
        px="4"
        py="3"
        rounded="2xl 2xl 2xl xs"
        shadow="sm"
        border="1px solid"
        borderColor="border.subtle"
        maxW="75%"
      >
        {content ? (
          <Text textStyle="sm" lineHeight="tall" whiteSpace="pre-wrap">
            {content}
            <Box
              as="span"
              display="inline-block"
              w="2px"
              h="14px"
              bg="green.400"
              ml="0.5"
              verticalAlign="middle"
              css={{
                animation: "pulse 0.8s ease-in-out infinite",
              }}
            />
          </Text>
        ) : (
          <HStack gap="1.5" py="0.5">
            {[0, 1, 2].map(i => (
              <Box
                key={i}
                w="2"
                h="2"
                rounded="full"
                bg="green.400"
                css={{
                  animation: `bounce 0.6s ease-in-out ${i * 0.15}s infinite alternate`,
                }}
              />
            ))}
          </HStack>
        )}
      </Box>
    </Box>
  )
}
