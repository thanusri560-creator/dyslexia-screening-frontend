import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SpellingData {
  words: string[];
  word_options: string[][];
}

interface SpellingTestProps {
  data: SpellingData;
  onComplete: (score: number) => void;
  onBack: () => void;
}

export function SpellingTest({ data, onComplete, onBack }: SpellingTestProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  const allItems = data.words;
  const currentItem = allItems[currentIndex];

  const handleAnswer = (answer: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentIndex] = answer;
    setUserAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentIndex < allItems.length - 1) {
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
    allItems.forEach((item, index) => {
      if (userAnswers[index]?.toLowerCase().trim() === item.toLowerCase()) {
        correct++;
      }
    });
    const score = correct / allItems.length;
    onComplete(score);
  };

  if (showResults) {
    return (
      <div className="space-y-6">
        <Card className="border-border/80 shadow-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-display">Spelling Test Complete</CardTitle>
            <CardDescription>
              Review your answers below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {allItems.map((item, index) => {
              const userAnswer = userAnswers[index] || "";
              const isCorrect = userAnswer.toLowerCase().trim() === item.toLowerCase();
              return (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1">
                    <p className="font-medium">{item}</p>
                    <p className={`text-sm ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                      Your answer: {userAnswer || "No answer"}
                    </p>
                  </div>
                  <div className={`text-2xl ${isCorrect ? "✅" : "❌"}`} />
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
          <CardTitle className="text-2xl text-display">Spelling Test</CardTitle>
          <CardDescription>
            Spell the following word or phrase correctly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-lg font-medium mb-4">Item {currentIndex + 1} of {allItems.length}</p>
            <div className="text-3xl font-bold text-primary p-6 bg-primary/10 rounded-lg">
              {currentItem}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="spelling-answer">Your spelling:</Label>
            <Input
              id="spelling-answer"
              type="text"
              value={userAnswers[currentIndex] || ""}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder="Type your answer here"
              className="text-lg"
            />
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
        >
          {currentIndex === allItems.length - 1 ? "Finish Test" : "Next"}
        </Button>
      </div>
    </div>
  );
}
