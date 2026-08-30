import { useState, useEffect, useRef, useCallback } from 'react';

// Web Speech API interface definitions
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: any) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => ISpeechRecognition;
    webkitSpeechRecognition?: new () => ISpeechRecognition;
  }
}

export interface VoiceControlOptions {
  onSendMessage: (text: string, forcePlan?: boolean) => void;
  onTriggerGenerate?: () => void;
  onViewPlanTab?: () => void;
  onViewChatTab?: () => void;
  onToggleInStoreMode?: () => void;
  onOpenPresets?: () => void;
  onReset?: () => void;
}

export const useVoiceControl = ({
  onSendMessage,
  onTriggerGenerate,
  onViewPlanTab,
  onViewChatTab,
  onToggleInStoreMode,
  onOpenPresets,
  onReset
}: VoiceControlOptions) => {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isHandsFree, setIsHandsFree] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState<boolean>(true);
  const [voiceStatus, setVoiceStatus] = useState<string>('Ready');

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const isHandsFreeRef = useRef<boolean>(isHandsFree);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  isHandsFreeRef.current = isHandsFree;

  // Initialize Speech Recognition on mount
  useEffect(() => {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionClass) {
      setIsSupported(true);
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceStatus('Listening...');
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition event/error:', event?.error);
        if (event?.error === 'not-allowed') {
          setVoiceStatus('Microphone permission blocked');
          setIsListening(false);
          setIsHandsFree(false);
        } else if (event?.error === 'no-speech') {
          setVoiceStatus('Listening (no speech detected)...');
        } else {
          setVoiceStatus(`Status: ${event?.error || 'idle'}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        // If in hands-free mode, auto-restart unless intentionally stopped
        if (isHandsFreeRef.current) {
          try {
            recognition.start();
          } catch (e) {
            // Already started or restarting
          }
        } else {
          setVoiceStatus('Ready');
        }
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTrans = '';
        let interimTrans = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            finalTrans += res[0].transcript;
          } else {
            interimTrans += res[0].transcript;
          }
        }

        if (interimTrans) {
          setInterimTranscript(interimTrans);
        }

        if (finalTrans) {
          const cleaned = finalTrans.trim();
          setTranscript(cleaned);
          setInterimTranscript('');
          handleProcessVoiceInput(cleaned);
        }
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      setVoiceStatus('Speech Recognition not supported in this browser');
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore
        }
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Process and route voice commands vs natural chat
  const handleProcessVoiceInput = useCallback((spokenText: string) => {
    const lower = spokenText.toLowerCase().trim();
    if (!lower) return;

    setVoiceStatus(`Heard: "${spokenText}"`);

    // Check for hands-free navigational & action voice triggers
    if (lower.includes('generate plan') || lower.includes('create shopping list') || lower.includes('make my list') || lower.includes('generate list')) {
      if (onTriggerGenerate) {
        speakResponse("Generating your customized party shopping list now.");
        onTriggerGenerate();
        return;
      }
    }

    if (lower.includes('show shopping list') || lower.includes('view list') || lower.includes('open plan') || lower.includes('show plan') || lower.includes('go to list')) {
      if (onViewPlanTab) {
        speakResponse("Switching to your shopping list view.");
        onViewPlanTab();
        return;
      }
    }

    if (lower.includes('show chat') || lower.includes('open chat') || lower.includes('view chat') || lower.includes('go to chat')) {
      if (onViewChatTab) {
        speakResponse("Switching to party concierge chat.");
        onViewChatTab();
        return;
      }
    }

    if (lower.includes('in store mode') || lower.includes('in-store mode') || lower.includes('store walk') || lower.includes('walk the aisles')) {
      if (onToggleInStoreMode) {
        speakResponse("Opening in-store shopping mode organized by aisle.");
        onToggleInStoreMode();
        return;
      }
    }

    if (lower.includes('browse templates') || lower.includes('show themes') || lower.includes('party templates')) {
      if (onOpenPresets) {
        speakResponse("Opening curated party theme presets.");
        onOpenPresets();
        return;
      }
    }

    if (lower === 'stop listening' || lower === 'turn off mic' || lower === 'mute microphone') {
      stopListening();
      setIsHandsFree(false);
      speakResponse("Microphone paused. Click to speak again whenever you're ready.");
      return;
    }

    // Otherwise, treat as natural conversational input to the Party Planner Agent
    onSendMessage(spokenText);
  }, [onSendMessage, onTriggerGenerate, onViewPlanTab, onViewChatTab, onToggleInStoreMode, onOpenPresets]);

  // Clean Markdown & Emojis before Text-To-Speech
  const cleanTextForSpeech = (raw: string): string => {
    return raw
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Remove emojis
      .replace(/[\u{2600}-\u{26FF}]/gu, '')
      .replace(/[\u{2700}-\u{27BF}]/gu, '')
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
      .replace(/\*(.*?)\*/g, '$1')     // Remove markdown italics
      .replace(/#{1,6}\s+/g, '')       // Remove headers
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
      .replace(/`{1,3}.*?`{1,3}/gs, '') // Remove code blocks
      .replace(/\$/g, ' dollars ')
      .replace(/\n+/g, '. ')
      .trim();
  };

  // Text-To-Speech functionality
  const speakResponse = useCallback((textToSpeak: string) => {
    if (!isTtsEnabled || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const cleaned = cleanTextForSpeech(textToSpeak);
      if (!cleaned) return;

      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.lang = 'en-US';

      // Pick a high quality English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => (v.lang === 'en-US' || v.lang === 'en_US') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Karen')));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Speech synthesis error:", err);
      setIsSpeaking(false);
    }
  }, [isTtsEnabled]);

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const startListening = () => {
    if (!recognitionRef.current) return;
    try {
      stopSpeaking();
      recognitionRef.current.start();
      setIsListening(true);
      setVoiceStatus('Listening...');
    } catch (e) {
      // Already running
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
      setIsListening(false);
      setVoiceStatus('Ready');
    } catch (e) {
      // Ignore
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
      setIsHandsFree(false);
    } else {
      startListening();
    }
  };

  const toggleHandsFree = () => {
    const nextState = !isHandsFree;
    setIsHandsFree(nextState);
    isHandsFreeRef.current = nextState;
    if (nextState) {
      startListening();
      speakResponse("Hands-free voice mode active. You can speak your party details or say voice commands anytime.");
    } else {
      stopListening();
    }
  };

  const toggleTts = () => {
    if (isTtsEnabled) {
      stopSpeaking();
      setIsTtsEnabled(false);
    } else {
      setIsTtsEnabled(true);
      speakResponse("Voice audio responses enabled.");
    }
  };

  return {
    isSupported,
    isListening,
    isHandsFree,
    transcript,
    interimTranscript,
    isSpeaking,
    isTtsEnabled,
    voiceStatus,
    startListening,
    stopListening,
    toggleListening,
    toggleHandsFree,
    toggleTts,
    speakResponse,
    stopSpeaking,
  };
};
