import React from 'react';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { Volume2, Type, Eye, Zap } from 'lucide-react';

export default function Accessibility() {
  const { settings, updateSettings, resetSettings } = useAccessibility();

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <section className="space-y-4">
            <h1 className="text-4xl font-display font-bold text-foreground">Accessibility Settings</h1>
            <p className="text-lg text-muted-foreground">
              Customize your experience to make reading and navigation easier.
            </p>
          </section>

          {/* Dyslexia Font Toggle */}
          <section className="card-soft space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Type className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-1">Dyslexia-Friendly Font</h2>
                  <p className="text-sm text-muted-foreground">
                    Use OpenDyslexic font, which is specifically designed for dyslexic readers with increased spacing and unique letterforms.
                  </p>
                </div>
              </div>
              <button
                onClick={() => updateSettings({ dyslexiaFont: !settings.dyslexiaFont })}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  settings.dyslexiaFont ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    settings.dyslexiaFont ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {settings.dyslexiaFont && (
              <div className="p-4 bg-secondary rounded-lg">
                <p className="font-display text-lg text-foreground">
                  This text is displayed in OpenDyslexic font
                </p>
              </div>
            )}
          </section>

          {/* Text Size Control */}
          <section className="card-soft space-y-4">
            <div className="flex items-start gap-3">
              <Eye className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-foreground mb-1">Text Size</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Adjust the size of text throughout the application for better readability.
                </p>

                <div className="space-y-3">
                  {['normal', 'large', 'extra-large'].map((size) => (
                    <button
                      key={size}
                      onClick={() => updateSettings({ textSize: size as any })}
                      className={`w-full p-4 rounded-lg border-2 transition-colors text-left ${
                        settings.textSize === size
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary'
                      }`}
                    >
                      <div
                        className={`font-medium text-foreground ${
                          size === 'normal' ? 'text-base' : size === 'large' ? 'text-lg' : 'text-xl'
                        }`}
                      >
                        {size === 'normal' ? 'Normal' : size === 'large' ? 'Large' : 'Extra Large'} Text Size
                      </div>
                      <div
                        className={`text-muted-foreground mt-1 ${
                          size === 'normal' ? 'text-sm' : size === 'large' ? 'text-base' : 'text-lg'
                        }`}
                      >
                        This is a sample text preview
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* High Contrast Toggle */}
          <section className="card-soft space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Zap className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-1">High Contrast Mode</h2>
                  <p className="text-sm text-muted-foreground">
                    Increase contrast between text and background for better visibility.
                  </p>
                </div>
              </div>
              <button
                onClick={() => updateSettings({ highContrast: !settings.highContrast })}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  settings.highContrast ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    settings.highContrast ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </section>

          {/* Reduce Motion Toggle */}
          <section className="card-soft space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Zap className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-1">Reduce Motion</h2>
                  <p className="text-sm text-muted-foreground">
                    Minimize animations and transitions for a calmer viewing experience.
                  </p>
                </div>
              </div>
              <button
                onClick={() => updateSettings({ reduceMotion: !settings.reduceMotion })}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  settings.reduceMotion ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    settings.reduceMotion ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </section>

          {/* Text-to-Speech Toggle */}
          <section className="card-soft space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Volume2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-1">Text-to-Speech</h2>
                  <p className="text-sm text-muted-foreground">
                    Enable audio narration to hear content read aloud.
                  </p>
                </div>
              </div>
              <button
                onClick={() => updateSettings({ textToSpeech: !settings.textToSpeech })}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  settings.textToSpeech ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    settings.textToSpeech ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </section>

          {/* Tips Section */}
          <section className="card-soft space-y-4">
            <h2 className="text-xl font-semibold text-foreground mb-4">Accessibility Tips</h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <span className="text-primary font-bold">•</span>
                <p>Experiment with different settings to find what works best for you</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary font-bold">•</span>
                <p>Dyslexia-friendly fonts work best when combined with increased spacing</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary font-bold">•</span>
                <p>High contrast mode can reduce eye strain during extended reading</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary font-bold">•</span>
                <p>Take regular breaks when using text-to-speech to avoid fatigue</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary font-bold">•</span>
                <p>Your settings are saved automatically and will persist across sessions</p>
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <section className="flex gap-3">
            <Button
              onClick={resetSettings}
              variant="outline"
              className="flex-1 h-12"
            >
              Reset to Defaults
            </Button>
            <Button
              onClick={() => window.history.back()}
              className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Done
            </Button>
          </section>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
