import React from 'react';
import { AppProvider } from '../context/AppContext';
import { LanguageProvider } from '../context/LanguageContext';
import { AccessibilityProvider } from '../context/AccessibilityContext';

/**
 * Mirrors the provider nesting used by src/App.tsx so component tests exercise
 * the same context stack the real application mounts:
 *   AppProvider > LanguageProvider > AccessibilityProvider
 *
 * AllenOS accessibility/translation features read from LanguageProvider and
 * AccessibilityProvider, so tests that render CampusLoop components (which in
 * the merged app sit underneath those providers) must mount them the same way.
 */
export const TestProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AppProvider>
    <LanguageProvider>
      <AccessibilityProvider>{children}</AccessibilityProvider>
    </LanguageProvider>
  </AppProvider>
);
