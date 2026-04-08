import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';

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

export default function Home() {
  const [, setLocation] = useLocation();
  const [isLoaded, setIsLoaded] = useState(false);

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
          <Link href="/">
            <a className="flex items-center gap-2 font-display text-2xl font-bold text-primary">
              <span className="text-2xl">🧠</span>
              <span className="hidden sm:inline">DyslexiaScreen</span>
            </a>
          </Link>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Sign Up
              </Button>
            </Link>
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
              <Link href="/help">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </Link>
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
        </div>
      </footer>
    </div>
  );
}
