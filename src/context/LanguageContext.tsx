import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { SUPPORTED_LANGUAGES, SupportedLanguage, UI_DICTIONARY } from '../data/translations';

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  setLanguageByCode: (code: string) => void;
  t: (key: string, defaultText?: string) => string;
  translateTextWithAI: (text: string, overrideTargetLang?: string) => Promise<string>;
  isTranslating: boolean;
  supportedLanguages: SupportedLanguage[];
  cacheStats: { cachedCount: number };
}

const STORAGE_LANG_KEY = 'CAMPUSLOOP_LANG_V1';
const STORAGE_TRANSLATION_CACHE_KEY = 'CAMPUSLOOP_TRANSLATION_CACHE_V1';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode; sessionKey?: string }> = ({ children, sessionKey = 'default' }) => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(() => {
    try {
      const savedCode = localStorage.getItem(STORAGE_LANG_KEY);
      const matched = SUPPORTED_LANGUAGES.find((l) => l.code === savedCode);
      if (matched) return matched;
    } catch {}
    return SUPPORTED_LANGUAGES[0]; // English
  });

  // Translated text can contain private notes. Keep it only in this demo session.
  const translationCache = useRef(new Map<string, string>());
  const [cachedCount, setCachedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const requests = useRef(new Set<AbortController>());
  const sessionVersion = useRef(0);

  // Sync language and document direction
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_LANG_KEY, currentLanguage.code);
      document.documentElement.lang = currentLanguage.code;
      document.documentElement.dir = currentLanguage.direction || 'ltr';
    } catch {}
  }, [currentLanguage]);

  // Clear old persisted text and invalidate outstanding requests on account/reset.
  useEffect(() => {
    sessionVersion.current++;
    translationCache.current.clear();
    setCachedCount(0);
    setPendingCount(0);
    try { localStorage.removeItem(STORAGE_TRANSLATION_CACHE_KEY); } catch {}
    return () => {
      sessionVersion.current++;
      requests.current.forEach(request => request.abort());
      requests.current.clear();
    };
  }, [sessionKey]);

  const setLanguageByCode = useCallback((code: string) => {
    const found = SUPPORTED_LANGUAGES.find((l) => l.code === code);
    if (found) {
      setCurrentLanguage(found);
    }
  }, []);

  // Fast dictionary lookup
  const t = useCallback(
    (key: string, defaultText?: string): string => {
      const entry = UI_DICTIONARY[key];
      if (entry && entry[currentLanguage.code]) {
        return entry[currentLanguage.code];
      }
      if (entry && entry.en) {
        return entry.en;
      }
      return defaultText || key;
    },
    [currentLanguage.code]
  );

  // Dynamic AI Translation using Gemini via /api/translate
  const translateTextWithAI = useCallback(
    async (text: string, overrideTargetLang?: string): Promise<string> => {
      const targetLangName = overrideTargetLang || currentLanguage.name;
      const targetLangCode = overrideTargetLang
        ? SUPPORTED_LANGUAGES.find((l) => l.name === overrideTargetLang)?.code || overrideTargetLang
        : currentLanguage.code;

      if (!text || text.trim() === '' || targetLangCode === 'en' && !overrideTargetLang) {
        return text;
      }

      const cacheKey = `${targetLangCode}:::${text.trim()}`;
      const cached = translationCache.current.get(cacheKey);
      if (cached) return cached;

      const version = sessionVersion.current;
      const controller = new AbortController();
      requests.current.add(controller);
      const timeout = setTimeout(() => controller.abort(), 25_000);
      setPendingCount(count => count + 1);
      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            text,
            targetLanguage: targetLangName,
            sourceLanguage: 'English',
            context: 'Academic textbooks, peer mentoring, and campus credits exchange',
          }),
        });

        if (!res.ok) {
          throw new Error(`Server returned ${res.status}`);
        }

        const data = await res.json();
        if (version !== sessionVersion.current) throw new Error('The demo session changed.');
        if (data.status !== 'success' || typeof data.translatedText !== 'string' || !data.translatedText.trim()) {
          throw new Error('AI translation is unavailable. Your original text has been kept.');
        }
        const translated = data.translatedText;
        translationCache.current.set(cacheKey, translated);
        setCachedCount(translationCache.current.size);
        return translated;
      } catch {
        throw new Error('AI translation is unavailable. Your original text has been kept.');
      } finally {
        clearTimeout(timeout);
        requests.current.delete(controller);
        if (version === sessionVersion.current) setPendingCount(count => Math.max(0, count - 1));
      }
    },
    [currentLanguage]
  );

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguageByCode,
        t,
        translateTextWithAI,
        isTranslating: pendingCount > 0,
        supportedLanguages: SUPPORTED_LANGUAGES,
        cacheStats: { cachedCount },
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
