import React, { createContext, useContext, useState, useEffect } from 'react';

interface AccessibilitySettings {
  dyslexiaFont: boolean;
  textSize: 'normal' | 'large' | 'extra-large';
  highContrast: boolean;
  reduceMotion: boolean;
  textToSpeech: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (settings: Partial<AccessibilitySettings>) => void;
  resetSettings: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const DEFAULT_SETTINGS: AccessibilitySettings = {
  dyslexiaFont: true,
  textSize: 'normal',
  highContrast: false,
  reduceMotion: false,
  textToSpeech: false,
};

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('accessibilitySettings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load accessibility settings:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save settings to localStorage and apply to DOM
  useEffect(() => {
    if (!isLoaded) return;

    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
  }, [settings, isLoaded]);

  // Apply settings to DOM separately to avoid race conditions
  useEffect(() => {
    if (!isLoaded) return;

    const root = document.documentElement;
    
    // Apply font setting
    if (settings.dyslexiaFont) {
      root.classList.add('dyslexia-font');
    } else {
      root.classList.remove('dyslexia-font');
    }

    // Apply contrast setting
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Apply motion setting
    if (settings.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Apply text size
    root.setAttribute('data-text-size', settings.textSize);
  }, [settings, isLoaded]);

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <AccessibilityContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};
