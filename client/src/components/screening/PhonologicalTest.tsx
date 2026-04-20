import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface PhonologicalQuestion {
  instruction: string;
  word: string;
  answer: string;
  options: string[];
}

interface PhonologicalData {
  sound_tasks: PhonologicalQuestion[];
}

interface PhonologicalTestProps {
  data: PhonologicalData;
  onComplete: (score: number) => void;
  onBack: () => void;
}

export function PhonologicalTest({ data, onComplete, onBack }: PhonologicalTestProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  if (!data || !data.sound_tasks || data.sound_tasks.length === 0) {
    return <div>Loading...</div>;
  }

  const currentQuestion = data.sound_tasks[currentIndex];

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentIndex < data.sound_tasks.length - 1) {
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
    data.sound_tasks.forEach((question, index) => {
      if (answers[index] === question.answer) {
        correct++;
      }
    });
    const score = correct / data.sound_tasks.length;
    onComplete(score);
  };

  if (showResults) {
    return (
      <div className="space-y-6">
        <Card className="border-border/80 shadow-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-display">Phonological Test Complete</CardTitle>
            <CardDescription>
              Review your answers below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.sound_tasks.map((question, index) => {
              const userAnswer = answers[index];
              const isCorrect = userAnswer === question.answer;
              return (
                <div key={index} className="p-4 rounded-lg border">
                  <p className="font-medium mb-2">{question.instruction}</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Word: {question.word}
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Your answer: {userAnswer || "No answer"}
                  </p>
                  <p className={`text-sm ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                    Correct answer: {question.answer}
                  </p>
                  <div className={`text-2xl mt-2 ${isCorrect ? "text-green-600" : "text-red-600"}`} />
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
          <CardTitle className="text-2xl text-display">Phonological Test</CardTitle>
          <CardDescription>
            Identify sounds, rhymes, and phonetic patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-lg font-medium mb-4">Question {currentIndex + 1} of {data.sound_tasks.length}</p>
            <div className="text-xl font-medium p-6 bg-muted rounded-lg">
              {currentQuestion.instruction}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Select your answer:</Label>
            <RadioGroup
              value={answers[currentIndex] || ""}
              onValueChange={handleAnswer}
            >
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="text-base cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
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
          disabled={!answers[currentIndex]}
        >
          {currentIndex === data.sound_tasks.length - 1 ? "Finish Test" : "Next"}
        </Button>
      </div>
    </div>
  );
}
