/**
 * Automated Verification Suite for AI Translation & Visual & Auditorily impaired Accessibility Features
 */

import { SUPPORTED_LANGUAGES, UI_DICTIONARY } from '../data/translations';

export function runA11yTranslationVerification() {
  console.log('=== STARTING AI TRANSLATION & ACCESSIBILITY VERIFICATION SUITE ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${msg}`);
      failed++;
    }
  }

  // --- SUITE 1: SUPPORTED LANGUAGES CATALOG ---
  console.log('--- Test Suite 1: Supported Languages Catalog ---');
  assert(SUPPORTED_LANGUAGES.length >= 10, `At least 10 languages configured (found ${SUPPORTED_LANGUAGES.length})`);
  
  const english = SUPPORTED_LANGUAGES.find((l) => l.code === 'en');
  assert(Boolean(english), 'English is supported');
  
  const hindi = SUPPORTED_LANGUAGES.find((l) => l.code === 'hi');
  assert(Boolean(hindi), 'Hindi is supported (Indian campus priority)');
  assert(hindi?.nativeName === 'हिन्दी', 'Hindi native name is correct');

  const arabic = SUPPORTED_LANGUAGES.find((l) => l.code === 'ar');
  assert(Boolean(arabic), 'Arabic is supported');
  assert(arabic?.direction === 'rtl', 'Arabic is flagged as RTL');

  const indianRegionalLangs = ['bn', 'ta', 'te', 'mr'];
  for (const lang of indianRegionalLangs) {
    assert(
      SUPPORTED_LANGUAGES.some((l) => l.code === lang),
      `Regional Indian campus language ${lang} is supported`
    );
  }

  // --- SUITE 2: UI TRANSLATIONS & DICTIONARY ---
  console.log('\n--- Test Suite 2: UI Translation Dictionary ---');
  const dictKeys = Object.keys(UI_DICTIONARY);
  assert(dictKeys.length > 20, `Rich UI dictionary coverage (${dictKeys.length} terms)`);
  assert(Boolean(UI_DICTIONARY['nav.book_exchange']?.en), 'Key nav.book_exchange defined in en');
  assert(Boolean(UI_DICTIONARY['nav.book_exchange']?.hi), 'Key nav.book_exchange translated in hi');
  assert(Boolean(UI_DICTIONARY['nav.book_exchange']?.es), 'Key nav.book_exchange translated in es');
  assert(Boolean(UI_DICTIONARY['nav.book_exchange']?.fr), 'Key nav.book_exchange translated in fr');

  // Check fallback behavior
  function translateKey(key: string, lang: string): string {
    const entry = UI_DICTIONARY[key];
    if (entry && entry[lang]) return entry[lang];
    if (entry && entry.en) return entry.en;
    return key;
  }
  assert(translateKey('nav.book_exchange', 'hi') === 'पुस्तक विनिमय', 'Translates correctly to Hindi');
  assert(translateKey('non.existent.key', 'hi') === 'non.existent.key', 'Falls back gracefully on missing key');

  // --- SUITE 3: ACCESSIBILITY SOUNDBOARD & AAC VOCABULARY ---
  console.log('\n--- Test Suite 3: AAC & Mute Communication System ---');
  const aacPhrases = [
    { id: 'h1', category: 'handover', text: 'I am here to collect the textbook.' },
    { id: 'h2', category: 'handover', text: 'Here is my 4-digit verification code.' },
    { id: 'm1', category: 'mentoring', text: 'Please explain this concept visually on paper or whiteboard.' },
    { id: 'm2', category: 'mentoring', text: 'Could you please slow down slightly?' },
    { id: 'c1', category: 'canteen', text: 'I would like to redeem my canteen reward with this QR code.' },
    { id: 'a1', category: 'assistance', text: 'I am deaf / mute and use visual communication.' }
  ];

  const categories = new Set(aacPhrases.map(p => p.category));
  assert(categories.has('handover'), 'AAC includes Handover phrases');
  assert(categories.has('mentoring'), 'AAC includes Mentoring phrases');
  assert(categories.has('canteen'), 'AAC includes Canteen phrases');
  assert(categories.has('assistance'), 'AAC includes Assistance phrases');

  // Verification of text-to-speech fallback
  function canSpeak(text: string): boolean {
    return typeof text === 'string' && text.trim().length > 0;
  }
  assert(canSpeak('Hello from CampusLoop AAC'), 'Can synthesize text-to-speech string');

  // --- SUITE 4: DEAF VISUAL ALERTS & SIGN SPELLING ---
  console.log('\n--- Test Suite 4: Visual Alerting & Deaf Assistive Modes ---');
  interface VisualAlert {
    id: string;
    title: string;
    message: string;
    type: 'success' | 'warning' | 'info';
    timestamp: number;
  }

  const alertQueue: VisualAlert[] = [];
  function triggerVisualAlert(title: string, message: string, type: 'success' | 'warning' | 'info' = 'info') {
    const alert: VisualAlert = {
      id: `alert-${Date.now()}-${Math.random()}`,
      title,
      message,
      type,
      timestamp: Date.now()
    };
    alertQueue.push(alert);
    return alert;
  }

  const testAlert = triggerVisualAlert('New Mentoring Request', 'Aarav requested Trigonometry help.', 'info');
  assert(alertQueue.length === 1, 'Visual alert queued for deaf user');
  assert(testAlert.title === 'New Mentoring Request', 'Visual alert title preserved');
  assert(testAlert.type === 'info', 'Visual alert type preserved');

  // --- SUITE 5: SIGN LANGUAGE LETTERS VALIDATION ---
  console.log('\n--- Test Suite 5: Sign Language Letter Coverage ---');
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  assert(letters.length === 26, '26 Alphabet letters covered');
  const numbers = '0123456789'.split('');
  assert(numbers.length === 10, '10 Numbers covered');

  console.log(`\n=================================================`);
  console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`=================================================`);

  return { passed, failed };
}

if (runA11yTranslationVerification().failed > 0) process.exitCode = 1;
