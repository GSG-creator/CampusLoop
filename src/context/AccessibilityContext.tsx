import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

export interface LiveTranscriptItem {
  id: string;
  text: string;
  speaker: string;
  timestamp: string;
}

export interface MuteHandoverConfig {
  bookTitle?: string;
  bookId?: string;
  otp?: string;
  partnerName?: string;
  mode: 'handover' | 'mentoring' | 'canteen' | 'general';
  customNote?: string;
}

interface AccessibilityContextType {
  // Mode toggles
  isDeafMode: boolean;
  setIsDeafMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  isMuteMode: boolean;
  setIsMuteMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean | ((prev: boolean) => boolean)) => void;
  largeText: boolean;
  setLargeText: (val: boolean | ((prev: boolean) => boolean)) => void;
  visualAlertFlash: boolean;
  setVisualAlertFlash: (val: boolean | ((prev: boolean) => boolean)) => void;

  // Active visual notification for deaf users
  activeAlertPulse: { type: 'success' | 'warning' | 'info'; message: string; timestamp: number } | null;
  triggerVisualAlert: (type: 'success' | 'warning' | 'info', message: string) => void;
  dismissAlertPulse: () => void;

  // Text-to-Speech (AAC Speak Out for Mute Students)
  speakText: (text: string) => void;
  isSpeaking: boolean;
  stopSpeaking: () => void;

  // Live Speech Recognition (Captions for Deaf Students)
  isCaptionsActive: boolean;
  captionStatus: 'idle' | 'starting' | 'listening' | 'unavailable' | 'error';
  captionMessage: string;
  startCaptions: () => void;
  stopCaptions: () => void;
  liveTranscripts: LiveTranscriptItem[];
  addTranscriptItem: (text: string, speaker?: string) => void;
  clearTranscripts: () => void;

  // Modals & Panels
  isA11yModalOpen: boolean;
  setIsA11yModalOpen: (open: boolean) => void;
  isSignLanguageModalOpen: boolean;
  signLanguageInitialWord: string;
  openSignLanguageModal: (initialWord?: string) => void;
  closeSignLanguageModal: () => void;
  isMuteHandoverModalOpen: boolean;
  muteHandoverConfig: MuteHandoverConfig | null;
  openMuteHandoverModal: (config?: Partial<MuteHandoverConfig>) => void;
  closeMuteHandoverModal: () => void;
  isTranslatorModalOpen: boolean;
  setIsTranslatorModalOpen: (open: boolean) => void;
}

const STORAGE_A11Y_KEY = 'CAMPUSLOOP_A11Y_SETTINGS_V1';

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode; sessionKey?: string }> = ({ children, sessionKey = 'default' }) => {
  const [isDeafMode, setIsDeafMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_A11Y_KEY}_DEAF`);
      return saved ? JSON.parse(saved) : true; // Enabled by default for easy discovery
    } catch {}
    return true;
  });

  const [isMuteMode, setIsMuteMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_A11Y_KEY}_MUTE`);
      return saved ? JSON.parse(saved) : true; // Enabled by default for easy discovery
    } catch {}
    return true;
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_A11Y_KEY}_CONTRAST`);
      return saved ? JSON.parse(saved) : false;
    } catch {}
    return false;
  });

  const [largeText, setLargeText] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_A11Y_KEY}_LARGE_TEXT`);
      return saved ? JSON.parse(saved) : false;
    } catch {}
    return false;
  });

  const [visualAlertFlash, setVisualAlertFlash] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_A11Y_KEY}_FLASH`);
      return saved ? JSON.parse(saved) : true;
    } catch {}
    return true;
  });

  // Visual edge glow notification state
  const [activeAlertPulse, setActiveAlertPulse] = useState<{
    type: 'success' | 'warning' | 'info';
    message: string;
    timestamp: number;
  } | null>(null);

  // Text to Speech
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Live captions
  const [isCaptionsActive, setIsCaptionsActive] = useState<boolean>(false);
  const [liveTranscripts, setLiveTranscripts] = useState<LiveTranscriptItem[]>([]);
  const [captionStatus, setCaptionStatus] = useState<AccessibilityContextType['captionStatus']>('idle');
  const [captionMessage, setCaptionMessage] = useState('');

  const speechRecognitionRef = useRef<any>(null);
  const alertTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const releaseSpeech = useCallback(() => {
    const recognition = speechRecognitionRef.current;
    speechRecognitionRef.current = null;
    if (recognition) {
      recognition.onstart = recognition.onresult = recognition.onerror = recognition.onend = null;
      try { if (recognition.abort) recognition.abort(); else recognition.stop(); } catch {}
    }
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
    if (alertTimer.current) clearTimeout(alertTimer.current);
  }, []);

  // Modals state
  const [isA11yModalOpen, setIsA11yModalOpen] = useState<boolean>(false);
  const [isSignLanguageModalOpen, setIsSignLanguageModalOpen] = useState<boolean>(false);
  const [signLanguageInitialWord, setSignLanguageInitialWord] = useState<string>('BOOK');
  const [isMuteHandoverModalOpen, setIsMuteHandoverModalOpen] = useState<boolean>(false);
  const [muteHandoverConfig, setMuteHandoverConfig] = useState<MuteHandoverConfig | null>(null);
  const [isTranslatorModalOpen, setIsTranslatorModalOpen] = useState<boolean>(false);

  useEffect(() => {
    releaseSpeech();
    setIsCaptionsActive(false);
    setCaptionStatus('idle');
    setCaptionMessage('');
    setLiveTranscripts([]);
    setIsSpeaking(false);
    setActiveAlertPulse(null);
    setIsA11yModalOpen(false);
    setIsSignLanguageModalOpen(false);
    setIsMuteHandoverModalOpen(false);
    setMuteHandoverConfig(null);
    setIsTranslatorModalOpen(false);
    return releaseSpeech;
  }, [sessionKey, releaseSpeech]);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_A11Y_KEY}_DEAF`, JSON.stringify(isDeafMode));
      localStorage.setItem(`${STORAGE_A11Y_KEY}_MUTE`, JSON.stringify(isMuteMode));
      localStorage.setItem(`${STORAGE_A11Y_KEY}_CONTRAST`, JSON.stringify(highContrast));
      localStorage.setItem(`${STORAGE_A11Y_KEY}_LARGE_TEXT`, JSON.stringify(largeText));
      localStorage.setItem(`${STORAGE_A11Y_KEY}_FLASH`, JSON.stringify(visualAlertFlash));
    } catch {}
  }, [isDeafMode, isMuteMode, highContrast, largeText, visualAlertFlash]);

  // Apply high contrast & large text classes to root
  useEffect(() => {
    // Guarded so the provider also works in non-DOM environments (SSR, unit tests).
    if (typeof document === 'undefined') return;

    if (highContrast) {
      document.documentElement.classList.add('high-contrast-mode');
    } else {
      document.documentElement.classList.remove('high-contrast-mode');
    }

    if (largeText) {
      document.documentElement.classList.add('large-text-mode');
    } else {
      document.documentElement.classList.remove('large-text-mode');
    }
  }, [highContrast, largeText]);

  // Visual edge glow alert trigger + vibration
  const triggerVisualAlert = useCallback(
    (type: 'success' | 'warning' | 'info', message: string) => {
      if (visualAlertFlash) {
        setActiveAlertPulse({ type, message, timestamp: Date.now() });

        // Haptic feedback for visual & auditorily impaired students on mobile/tablet
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate(type === 'success' ? [120, 80, 120] : [200, 100, 200]);
          } catch {}
        }

        // Auto dismiss after 4.5s
        if (alertTimer.current) clearTimeout(alertTimer.current);
        alertTimer.current = setTimeout(() => {
          setActiveAlertPulse((curr) => (curr && Date.now() - curr.timestamp >= 4000 ? null : curr));
        }, 4500);
      }
    },
    [visualAlertFlash]
  );

  const dismissAlertPulse = useCallback(() => {
    setActiveAlertPulse(null);
  }, []);

  // Text-To-Speech for Mute Students
  const speakText = useCallback((text: string) => {
    if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // Speech Recognition (Live Captions)
  const addTranscriptItem = useCallback((text: string, speaker: string = 'Peer') => {
    setLiveTranscripts((prev) => [
      ...prev,
      {
        id: 'transcript-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        text,
        speaker,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, []);

  const clearTranscripts = useCallback(() => {
    setLiveTranscripts([]);
  }, []);

  const startCaptions = useCallback(() => {
    if (speechRecognitionRef.current) return;
    setIsCaptionsActive(true);

    const SpeechRecognitionAPI =
      typeof window !== 'undefined' && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

    if (!SpeechRecognitionAPI) {
      setCaptionStatus('unavailable');
      setCaptionMessage('Microphone captions are unavailable in this browser. You can still type notes.');
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      speechRecognitionRef.current = recognition;
      setCaptionStatus('starting');
      setCaptionMessage('Waiting for microphone permission…');
      recognition.onstart = () => {
        if (speechRecognitionRef.current !== recognition) return;
        setCaptionStatus('listening');
        setCaptionMessage('Microphone captions are listening in English. Check important words together.');
      };

      recognition.onresult = (event: any) => {
        if (speechRecognitionRef.current !== recognition) return;
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript.trim()) {
          addTranscriptItem(finalTranscript.trim(), 'Peer Speaker');
        }
      };

      recognition.onerror = () => {
        if (speechRecognitionRef.current !== recognition) return;
        releaseSpeech();
        setCaptionStatus('error');
        setCaptionMessage('Microphone captions stopped or permission was denied. You can type notes or retry.');
      };

      recognition.onend = () => {
        if (speechRecognitionRef.current === recognition) {
          try {
            recognition.start();
          } catch {
            releaseSpeech();
            setCaptionStatus('error');
            setCaptionMessage('Microphone captions stopped. You can type notes or retry.');
          }
        }
      };

      recognition.start();
    } catch {
      releaseSpeech();
      setCaptionStatus('error');
      setCaptionMessage('Microphone captions could not start. You can type notes or retry.');
    }
  }, [addTranscriptItem, releaseSpeech]);

  const stopCaptions = useCallback(() => {
    releaseSpeech();
    setIsCaptionsActive(false);
    setCaptionStatus('idle');
    setCaptionMessage('');
  }, [releaseSpeech]);

  // Modal opening helpers
  const openSignLanguageModal = useCallback((initialWord?: string) => {
    setSignLanguageInitialWord(initialWord?.toUpperCase() || 'BOOK');
    setIsSignLanguageModalOpen(true);
  }, []);

  const closeSignLanguageModal = useCallback(() => {
    setIsSignLanguageModalOpen(false);
  }, []);

  const openMuteHandoverModal = useCallback((config?: Partial<MuteHandoverConfig>) => {
    setMuteHandoverConfig({
      mode: config?.mode || 'general',
      ...config,
    });
    setIsMuteHandoverModalOpen(true);
  }, []);

  const closeMuteHandoverModal = useCallback(() => {
    setIsMuteHandoverModalOpen(false);
    setMuteHandoverConfig(null);
    stopSpeaking();
  }, [stopSpeaking]);

  return (
    <AccessibilityContext.Provider
      value={{
        isDeafMode,
        setIsDeafMode,
        isMuteMode,
        setIsMuteMode,
        highContrast,
        setHighContrast,
        largeText,
        setLargeText,
        visualAlertFlash,
        setVisualAlertFlash,
        activeAlertPulse,
        triggerVisualAlert,
        dismissAlertPulse,
        speakText,
        isSpeaking,
        stopSpeaking,
        isCaptionsActive,
        captionStatus,
        captionMessage,
        startCaptions,
        stopCaptions,
        liveTranscripts,
        addTranscriptItem,
        clearTranscripts,
        isA11yModalOpen,
        setIsA11yModalOpen,
        isSignLanguageModalOpen,
        signLanguageInitialWord,
        openSignLanguageModal,
        closeSignLanguageModal,
        isMuteHandoverModalOpen,
        muteHandoverConfig,
        openMuteHandoverModal,
        closeMuteHandoverModal,
        isTranslatorModalOpen,
        setIsTranslatorModalOpen,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
