import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

const AnimatedLetter: React.FC<{ letter: string; delay: number; isFlipped?: boolean }> = ({
  letter,
  delay,
  isFlipped = false,
}) => {
  return (
    <span
      className="inline-block text-6xl md:text-7xl font-display font-bold text-primary"
      style={{
        animation: `float 3s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        transform: isFlipped ? 'scaleX(-1)' : 'none',
        display: 'inline-block',
      }}
    >
      {letter}
    </span>
  );
};

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: 'Is this a medical diagnosis?',
    answer: 'No. This is an early screening tool designed to identify potential dyslexia characteristics. A professional evaluation by a dyslexia specialist or educational psychologist is required for a formal diagnosis.',
  },
  {
    question: 'How long does the screening take?',
    answer: 'The complete screening typically takes 15-25 minutes, depending on your pace. You can pause and resume at any time.',
  },
  {
    question: 'Will my data be kept private?',
    answer: 'Yes. Your screening results and personal information are kept confidential and encrypted. We never share your data with third parties without your consent.',
  },
  {
    question: 'Can I retake the screening?',
    answer: 'Absolutely! You can retake the screening as many times as you want. We recommend taking it every 4-6 weeks to track progress.',
  },
  {
    question: 'What if I get a high-risk result?',
    answer: 'A high-risk result suggests you should seek professional evaluation. We provide resources and recommendations to help you take the next steps.',
  },
  {
    question: 'Is dyslexia treatable?',
    answer: 'While dyslexia is a lifelong condition, with proper intervention and support strategies, individuals with dyslexia can significantly improve their reading and writing skills.',
  },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const [isLoaded, setIsLoaded] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  useEffect(() => {
    setIsLoaded(true);

    // Add animation styles to document
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0%, 100% {
          transform: translateY(0px) ${isLoaded ? 'scaleX(1)' : 'scaleX(-1)'};
        }
        50% {
          transform: translateY(-20px) ${isLoaded ? 'scaleX(1)' : 'scaleX(-1)'};
        }
      }

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .fade-in-up {
        animation: fadeInUp 0.8s ease-out forwards;
      }

      @media (prefers-reduced-motion: reduce) {
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(0px);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleStartScreening = () => {
    setLocation('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary to-background">
      {/* Header */}
      <header className="border-b border-border bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2 font-display text-2xl font-bold text-primary no-underline">
            <span className="text-2xl">🧠</span>
            <span className="hidden sm:inline">DyslexiaScreen</span>
          </a>
          <div className="flex gap-3">
            <a href="/login" className="no-underline">
              <Button variant="ghost">Login</Button>
            </a>
            <a href="/signup" className="no-underline">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Sign Up
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text */}
          <div className="fade-in-up space-y-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground leading-tight mb-4">
                Early Detection, Better Support
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Our AI-powered dyslexia screening tool helps identify reading difficulties early, enabling timely intervention and personalized support for students, parents, and educators.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground">Accessible Design</h3>
                  <p className="text-sm text-muted-foreground">Built specifically for dyslexic users with dyslexia-friendly fonts and spacing</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground">Comprehensive Assessment</h3>
                  <p className="text-sm text-muted-foreground">Multiple screening tests covering reading, phonological awareness, and spelling</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground">Personalized Recommendations</h3>
                  <p className="text-sm text-muted-foreground">Get tailored support strategies and resources based on assessment results</p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <Button
                onClick={handleStartScreening}
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              >
                Start Screening <ArrowRight className="w-4 h-4" />
              </Button>
              <a href="/help" className="no-underline">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </a>
            </div>
          </div>

          {/* Right Column - Animated Letters */}
          <div className="fade-in-up flex items-center justify-center h-96 md:h-full">
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <div className="flex justify-center gap-1 md:gap-2 flex-wrap">
                  <AnimatedLetter letter="D" delay={0} isFlipped={true} />
                  <AnimatedLetter letter="Y" delay={0.1} />
                  <AnimatedLetter letter="S" delay={0.2} />
                  <AnimatedLetter letter="L" delay={0.3} />
                  <AnimatedLetter letter="E" delay={0.4} isFlipped={true} />
                  <AnimatedLetter letter="X" delay={0.5} />
                  <AnimatedLetter letter="I" delay={0.6} />
                  <AnimatedLetter letter="A" delay={0.7} />
                </div>
              </div>
              <p className="text-muted-foreground text-sm md:text-base max-w-xs mx-auto">
                Notice how some letters appear flipped? This playful animation represents the unique way dyslexic brains perceive text.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What is Dyslexia Section */}
      <section className="bg-white py-16 md:py-24 border-t border-border">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12 text-foreground">
            What is Dyslexia?
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Dyslexia is a specific learning disability that affects how the brain processes written language. It's not related to intelligence or laziness, but rather a difference in how the brain is wired for reading.
              </p>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground">Common Signs:</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="text-primary">•</span>
                    <span>Difficulty reading fluently or accurately</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary">•</span>
                    <span>Trouble with spelling and written expression</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary">•</span>
                    <span>Difficulty recognizing sounds in words</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary">•</span>
                    <span>Slow reading speed or comprehension issues</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="card-soft space-y-4">
              <h3 className="text-xl font-semibold text-foreground">Important Facts:</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="text-3xl">📊</div>
                  <div>
                    <p className="font-semibold text-foreground">5-10% of population</p>
                    <p className="text-sm text-muted-foreground">Dyslexia affects approximately 1 in 10 people</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="text-3xl">🧠</div>
                  <div>
                    <p className="font-semibold text-foreground">Not related to intelligence</p>
                    <p className="text-sm text-muted-foreground">Many successful people have dyslexia</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="text-3xl">✨</div>
                  <div>
                    <p className="font-semibold text-foreground">Treatable with support</p>
                    <p className="text-sm text-muted-foreground">Proper intervention significantly improves outcomes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12 text-foreground">
          How Our Screening Works
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: 1,
              title: 'Instructions',
              description: 'Get clear guidance on what to expect during the screening process',
            },
            {
              step: 2,
              title: 'Assessment Tests',
              description: 'Complete multiple tests covering reading, phonological awareness, and spelling',
            },
            {
              step: 3,
              title: 'Audio Recording',
              description: 'Record your pronunciation for voice-based analysis',
            },
            {
              step: 4,
              title: 'AI Analysis',
              description: 'Our AI analyzes your responses and generates a comprehensive report',
            },
          ].map((item) => (
            <div key={item.step} className="card-soft space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl mx-auto">
                {item.step}
              </div>
              <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16 md:py-24 border-t border-border">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12 text-foreground">
            For Everyone
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Students */}
            <div className="card-soft space-y-4">
              <div className="text-4xl">👨‍🎓</div>
              <h3 className="text-xl font-semibold text-foreground">Students</h3>
              <p className="text-muted-foreground">
                Take interactive screening tests in a supportive environment designed just for you. Get insights into your reading strengths.
              </p>
            </div>

            {/* Parents */}
            <div className="card-soft space-y-4">
              <div className="text-4xl">👨‍👩‍👧</div>
              <h3 className="text-xl font-semibold text-foreground">Parents</h3>
              <p className="text-muted-foreground">
                Monitor your child's progress and receive personalized recommendations to support their learning journey.
              </p>
            </div>

            {/* Teachers */}
            <div className="card-soft space-y-4">
              <div className="text-4xl">👨‍🏫</div>
              <h3 className="text-xl font-semibold text-foreground">Teachers</h3>
              <p className="text-muted-foreground">
                Identify students who may need additional support and access resources to create inclusive classrooms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12 text-foreground">
          Frequently Asked Questions
        </h2>
        <div className="max-w-2xl mx-auto space-y-3">
          {faqItems.map((item, index) => (
            <div key={index} className="card-soft">
              <button
                onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                className="w-full flex items-center justify-between py-2 text-left"
              >
                <h3 className="font-semibold text-foreground">{item.question}</h3>
                {expandedFAQ === index ? (
                  <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                )}
              </button>

              {expandedFAQ === index && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer Section */}
      <section className="bg-accent/10 border-t border-accent/20 py-8 md:py-12">
        <div className="container">
          <div className="flex gap-4 items-start">
            <AlertCircle className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-foreground mb-2">Important Disclaimer</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                This is an early screening tool and <strong>NOT a medical diagnosis system</strong>. Results are for informational purposes only and should not be considered a formal diagnosis of dyslexia. For a comprehensive evaluation, please consult with a qualified dyslexia specialist, educational psychologist, or healthcare professional. Always seek professional guidance for educational and medical decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-16 md:py-24">
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-12 text-center space-y-6 border border-primary/20">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of students, parents, and teachers using our platform to support dyslexic learners.
          </p>
          <Button
            onClick={handleStartScreening}
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 mx-auto"
          >
            Begin Your Screening <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 mt-16">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2026 Dyslexia Screening. Designed with accessibility in mind.</p>
          <p className="mt-2 text-xs">This tool is for screening purposes only and not a substitute for professional evaluation.</p>
        </div>
      </footer>
    </div>
  );
}
