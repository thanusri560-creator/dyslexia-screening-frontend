import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SyllableQuestion {
  id: string;
  word: string;
  correct_syllables: number;
  type: "count" | "segment";
}

interface SyllableData {
  questions: SyllableQuestion[];
}

interface SyllableTestProps {
  data: SyllableData;
  onComplete: (score: number) => void;
  onBack: () => void;
}

export function SyllableTest({ data, onComplete, onBack }: SyllableTestProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = data.questions[currentIndex];

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = answer;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentIndex < data.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowResults(true);
      calculateScore();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    data.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      if (question.type === "count") {
        const parsedAnswer = parseInt(userAnswer || "0", 10);
        if (!isNaN(parsedAnswer) && parsedAnswer === question.correct_syllables) {
          correct++;
        }
      } else {
        // For segmentation, we'd need more complex logic
        // For now, just check if they provided an answer
        if (userAnswer && userAnswer.trim().length > 0) {
          correct++;
        }
      }
    });
    const score = correct / data.questions.length;
    onComplete(score);
  };

  if (showResults) {
    return (
      <div className="space-y-6">
        <Card className="border-border/80 shadow-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-display">Syllable Test Complete</CardTitle>
            <CardDescription>
              Review your answers below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.questions.map((question, index) => {
              const userAnswer = answers[index] || "";
              const isCorrect = question.type === "count" 
                ? !isNaN(parseInt(userAnswer, 10)) && parseInt(userAnswer, 10) === question.correct_syllables
                : userAnswer.trim().length > 0;
              
              return (
                <div key={question.id} className="p-4 rounded-lg border">
                  <p className="font-medium mb-2">
                    Word: <span className="text-primary">{question.word}</span>
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Task: {question.type === "count" ? "Count syllables" : "Segment the word"}
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Your answer: {userAnswer || "No answer"}
                  </p>
                  {question.type === "count" && (
                    <p className={`text-sm ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                      Correct answer: {question.correct_syllables} syllable{question.correct_syllables !== 1 ? "s" : ""}
                    </p>
                  )}
                  <div className={`text-2xl mt-2 ${isCorrect ? "✅" : "❌"}`} />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/80 shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl text-display">Syllable Test</CardTitle>
          <CardDescription>
            Count and segment syllables in words
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-lg font-medium mb-4">Question {currentIndex + 1} of {data.questions.length}</p>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {currentQuestion.type === "count" ? "How many syllables?" : "Break into syllables:"}
              </p>
              <div className="text-3xl font-bold text-primary p-6 bg-primary/10 rounded-lg">
                {currentQuestion.word}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="syllable-answer">
              {currentQuestion.type === "count" ? "Number of syllables:" : "Syllable separation (use hyphens):"}
            </Label>
            <Input
              id="syllable-answer"
              type="text"
              value={answers[currentIndex] || ""}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder={currentQuestion.type === "count" ? "Enter number (e.g., 2)" : "e.g., ba-na-na"}
              className="text-lg"
            />
            {currentQuestion.type === "count" && (
              <p className="text-sm text-muted-foreground">
                Enter the number of syllables in the word
              </p>
            )}
            {currentQuestion.type === "segment" && (
              <p className="text-sm text-muted-foreground">
                Separate the word into syllables using hyphens
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={currentIndex === 0 ? onBack : handlePrevious}
        >
          {currentIndex === 0 ? "Back to Test Selection" : "Previous"}
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={handleNext}
          disabled={!answers[currentIndex]?.trim()}
        >
          {currentIndex === data.questions.length - 1 ? "Finish Test" : "Next"}
        </Button>
      </div>
    </div>
  );
}
