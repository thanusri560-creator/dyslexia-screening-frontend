import React, { useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { screeningAPI } from '@/lib/api';
import { Mic, MicOff, Play, Pause, CheckCircle, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

type ScreeningStep = 'intro' | 'reading' | 'phonological' | 'spelling' | 'processing' | 'complete';

export default function Screening() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [step, setStep] = useState<ScreeningStep>('intro');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [sessionId, setSessionId] = useState<string>('');
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const progress = {
    intro: 0,
    reading: 25,
    phonological: 50,
    spelling: 75,
    processing: 90,
    complete: 100,
  };

  const handleStartScreening = async () => {
    if (!user) return;
    try {
      const session = await screeningAPI.startScreening(user.id);
      setSessionId(session.sessionId);
      setStep('reading');
    } catch (error) {
      console.error('Failed to start screening:', error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      setAnswers(prev => ({
        ...prev,
        recordingTime: recordingTime,
      }));
    }
  };

  const handleSubmitScreening = async () => {
    setIsSubmitting(true);
    setStep('processing');
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      await screeningAPI.submitAnswers(sessionId, answers);
      setStep('complete');
    } catch (error) {
      console.error('Failed to submit screening:', error);
      alert('Failed to submit screening. Please try again.');
      setStep('spelling');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute requiredRole={['student']}>
      <Layout>
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-display font-bold text-foreground">Dyslexia Screening</h1>
              <span className="text-sm text-muted-foreground">{progress[step]}%</span>
            </div>
            <Progress value={progress[step]} className="h-2" />
          </div>

          {/* Intro Step */}
          {step === 'intro' && (
            <div className="card-soft space-y-6">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">Welcome to the Screening</h2>
                <p className="text-muted-foreground leading-relaxed">
                  This comprehensive screening test will help identify potential dyslexia-related challenges. The assessment includes three main components:
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-primary">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Reading Test</h3>
                    <p className="text-sm text-muted-foreground">Read passages aloud and answer comprehension questions</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-primary">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Phonological Tasks</h3>
                    <p className="text-sm text-muted-foreground">Complete sound recognition and rhyming exercises</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-primary">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Spelling Quiz</h3>
                    <p className="text-sm text-muted-foreground">Spell words presented in sentences</p>
                  </div>
                </div>
              </div>

              <div className="bg-secondary p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  ⏱️ <strong>Estimated time:</strong> 15-20 minutes
                </p>
              </div>

              <div className="bg-accent/10 border-l-4 border-accent p-4 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>Disclaimer:</strong> This is a screening tool for informational purposes only and is NOT a medical diagnosis. Results should be reviewed with a qualified professional.
                </p>
              </div>

              <Button
                onClick={handleStartScreening}
                className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-base font-medium"
              >
                Begin Screening
              </Button>
            </div>
          )}

          {/* Reading Test Step */}
          {step === 'reading' && (
            <div className="card-soft space-y-6">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">Reading Test</h2>
                <p className="text-muted-foreground">Read the passage below aloud. Your response will be recorded.</p>
              </div>

              <div className="bg-secondary p-6 rounded-lg space-y-4">
                <p className="text-lg leading-relaxed text-foreground">
                  "The sun was setting behind the mountains, painting the sky in shades of orange and purple. Sarah walked along the path, enjoying the cool evening breeze. She could hear the birds singing their final songs of the day. It was a perfect moment to reflect on the day's adventures and plan for tomorrow."
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Recording Status</p>
                    <p className="font-semibold text-foreground">
                      {isRecording ? `Recording... ${recordingTime}s` : 'Ready to record'}
                    </p>
                  </div>
                  <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`gap-2 ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'}`}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="w-4 h-4" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        Start Recording
                      </>
                    )}
                  </Button>
                </div>

                <textarea
                  placeholder="Or type your observations here..."
                  className="w-full h-24 p-4 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  onChange={(e) =>
                    setAnswers(prev => ({
                      ...prev,
                      readingObservations: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('intro')}
                  className="flex-1 h-12"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep('phonological')}
                  className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Phonological Tasks Step */}
          {step === 'phonological' && (
            <div className="card-soft space-y-6">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">Phonological Tasks</h2>
                <p className="text-muted-foreground">Complete the sound and rhyming exercises below.</p>
              </div>

              <div className="space-y-6">
                {/* Question 1 */}
                <div className="space-y-3">
                  <p className="font-medium text-foreground">Which word rhymes with "cat"?</p>
                  <div className="grid grid-cols-2 gap-3">
                    {['bat', 'dog', 'hat', 'run'].map((word) => (
                      <button
                        key={word}
                        onClick={() =>
                          setAnswers(prev => ({
                            ...prev,
                            rhymeAnswer: word,
                          }))
                        }
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          answers.rhymeAnswer === word
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary'
                        }`}
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 2 */}
                <div className="space-y-3">
                  <p className="font-medium text-foreground">How many syllables in "elephant"?</p>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        onClick={() =>
                          setAnswers(prev => ({
                            ...prev,
                            syllableAnswer: num,
                          }))
                        }
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          answers.syllableAnswer === num
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('reading')}
                  className="flex-1 h-12"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep('spelling')}
                  className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Spelling Quiz Step */}
          {step === 'spelling' && (
            <div className="card-soft space-y-6">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">Spelling Quiz</h2>
                <p className="text-muted-foreground">Spell the words presented in sentences.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-foreground">Spell the word: <strong>beautiful</strong></p>
                  <input
                    type="text"
                    placeholder="Type the spelling..."
                    className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    onChange={(e) =>
                      setAnswers(prev => ({
                        ...prev,
                        spelling1: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-3">
                  <p className="text-foreground">Spell the word: <strong>necessary</strong></p>
                  <input
                    type="text"
                    placeholder="Type the spelling..."
                    className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    onChange={(e) =>
                      setAnswers(prev => ({
                        ...prev,
                        spelling2: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-3">
                  <p className="text-foreground">Spell the word: <strong>rhythm</strong></p>
                  <input
                    type="text"
                    placeholder="Type the spelling..."
                    className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    onChange={(e) =>
                      setAnswers(prev => ({
                        ...prev,
                        spelling3: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('phonological')}
                  className="flex-1 h-12"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmitScreening}
                  disabled={isSubmitting}
                  className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Screening'}
                </Button>
              </div>
            </div>
          )}

          {/* Processing Step */}
          {step === 'processing' && (
            <div className="card-soft space-y-6 text-center py-12">
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-pulse">
                  <span className="text-3xl">🧠</span>
                </div>
                <h2 className="text-2xl font-semibold text-foreground">Analyzing Your Responses</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Our AI is processing your screening results. This may take a few moments...
                </p>
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                    <p className="text-sm text-muted-foreground">Evaluating reading fluency</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <p className="text-sm text-muted-foreground">Analyzing phonological awareness</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }} />
                    <p className="text-sm text-muted-foreground">Assessing spelling patterns</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Complete Step */}
          {step === 'complete' && (
            <div className="card-soft space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-foreground">Screening Complete!</h2>
                <p className="text-muted-foreground">
                  Thank you for completing the dyslexia screening. Your results are being processed.
                </p>
              </div>
              <div className="bg-secondary p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Your assessment results will be available shortly. You'll receive personalized recommendations based on your performance.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setLocation('/student-dashboard')}
                  className="flex-1 h-12"
                >
                  Back to Dashboard
                </Button>
                <Button
                  onClick={() => setLocation('/results')}
                  className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  View Results
                </Button>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
