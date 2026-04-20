import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface WordQuestion {
  id: string;
  target: string;
  distractors: string[];
  correctAnswer: string;
  type: "visual" | "auditory";
}

interface WordRecognitionData {
  word_pairs: {
    target: string;
    distractors: string[];
  }[];
}

interface WordRecognitionTestProps {
  data: WordRecognitionData;
  onComplete: (score: number) => void;
  onBack: () => void;
}

export function WordRecognitionTest({ data, onComplete, onBack }: WordRecognitionTestProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Transform the data to include all options and find the correct answer
  const currentWordPair = data.word_pairs[currentIndex];
  const currentQuestion = {
    id: `word-${currentIndex}`,
    target: currentWordPair.target,
    distractors: currentWordPair.distractors,
    correctAnswer: currentWordPair.target,
    options: [currentWordPair.target, ...currentWordPair.distractors].sort(() => Math.random() - 0.5),
    type: "visual" as const
  };

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentIndex < data.word_pairs.length - 1) {
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
    data.word_pairs.forEach((wordPair, index) => {
      if (answers[index] === wordPair.target) {
        correct++;
      }
    });
    const score = correct / data.word_pairs.length;
    onComplete(score);
  };

  if (showResults) {
    return (
      <div className="space-y-6">
        <Card className="border-border/80 shadow-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-display">Word Recognition Test Complete</CardTitle>
            <CardDescription>
              Review your answers below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.word_pairs.map((wordPair, index) => {
              const userAnswer = answers[index];
              const isCorrect = userAnswer === wordPair.target;
              return (
                <div key={index} className="p-4 rounded-lg border">
                  <p className="font-medium mb-2">
                    Target word: <span className="text-primary">{wordPair.target}</span>
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Your answer: {userAnswer || "No answer"}
                  </p>
                  <p className={`text-sm ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                    Correct answer: {wordPair.target}
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
          <CardTitle className="text-2xl text-display">Word Recognition Test</CardTitle>
          <CardDescription>
            Identify and differentiate similar words
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-lg font-medium mb-4">Question {currentIndex + 1} of {data.word_pairs.length}</p>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Look for the target word:</p>
              <div className="text-3xl font-bold text-primary p-6 bg-primary/10 rounded-lg">
                {currentQuestion.target}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Which word matches the target?</Label>
            <RadioGroup
              value={answers[currentIndex]?.toString() || ""}
              onValueChange={handleAnswer}
            >
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`word-option-${index}`} />
                  <Label htmlFor={`word-option-${index}`} className="text-lg cursor-pointer font-medium">
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
          {currentIndex === data.word_pairs.length - 1 ? "Finish Test" : "Next"}
        </Button>
      </div>
    </div>
  );
}
