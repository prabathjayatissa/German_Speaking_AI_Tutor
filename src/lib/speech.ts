// Speech API wrapper — uses Web Speech API for browser-based STT/TTS
// In production, replace with faster-whisper (STT) and Piper TTS (via local backend)

export type RecognitionState = "idle" | "listening" | "processing" | "error"

export interface SpeechRecognitionResult {
  transcript: string
  confidence: number
  isFinal: boolean
}

let recognition: SpeechRecognition | null = null

export function isSpeechRecognitionSupported(): boolean {
  return "webkitSpeechRecognition" in window || "SpeechRecognition" in window
}

export function createSpeechRecognition(
  onResult: (result: SpeechRecognitionResult) => void,
  onStateChange: (state: RecognitionState) => void,
  onError: (error: string) => void
): { start: () => void; stop: () => void; abort: () => void } {
  const SpeechRecognitionAPI =
    (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition })
      .webkitSpeechRecognition ||
    window.SpeechRecognition

  if (!SpeechRecognitionAPI) {
    return {
      start: () => onError("Speech recognition not supported in this browser"),
      stop: () => {},
      abort: () => {},
    }
  }

  recognition = new SpeechRecognitionAPI()
  recognition.lang = "de-DE"
  recognition.continuous = false
  recognition.interimResults = true
  recognition.maxAlternatives = 1

  recognition.onstart = () => onStateChange("listening")

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    const last = event.results[event.results.length - 1]
    const result = last[0]
    onResult({
      transcript: result.transcript,
      confidence: result.confidence,
      isFinal: last.isFinal,
    })
    if (last.isFinal) onStateChange("processing")
  }

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    onStateChange("error")
    onError(event.error)
  }

  recognition.onend = () => {
    onStateChange("idle")
  }

  return {
    start: () => {
      try {
        recognition?.start()
      } catch {
        // already running
      }
    },
    stop: () => recognition?.stop(),
    abort: () => recognition?.abort(),
  }
}

// Text-to-speech using Web Speech API
// In production: POST text to local Piper TTS server and play audio
let currentUtterance: SpeechSynthesisUtterance | null = null

export function speak(
  text: string,
  rate = 0.9,
  onStart?: () => void,
  onEnd?: () => void
): void {
  if (!window.speechSynthesis) return

  if (currentUtterance) {
    window.speechSynthesis.cancel()
  }

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = "de-DE"
  utterance.rate = rate
  utterance.pitch = 1.0
  utterance.volume = 1.0

  // Try to use a German voice
  const voices = window.speechSynthesis.getVoices()
  const germanVoice = voices.find(
    v => v.lang.startsWith("de") && !v.name.includes("Google") // prefer native
  ) || voices.find(v => v.lang.startsWith("de"))

  if (germanVoice) utterance.voice = germanVoice

  utterance.onstart = () => onStart?.()
  utterance.onend = () => {
    currentUtterance = null
    onEnd?.()
  }
  utterance.onerror = () => {
    currentUtterance = null
    onEnd?.()
  }

  currentUtterance = utterance
  window.speechSynthesis.speak(utterance)
}

export function stopSpeaking(): void {
  window.speechSynthesis?.cancel()
  currentUtterance = null
}

export function isSpeaking(): boolean {
  return window.speechSynthesis?.speaking ?? false
}

// Audio visualizer data (mock waveform for UI)
export function getAudioLevel(): number {
  return Math.random() * 0.8 + 0.1
}
