import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp, Mail, Phone, MessageSquare } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: 'What is dyslexia?',
    answer:
      'Dyslexia is a specific learning disability that affects how the brain processes written language. It\'s not related to intelligence and is often hereditary. People with dyslexia may struggle with reading fluency, decoding, and spelling, but they often have strengths in other areas like creativity and problem-solving.',
  },
  {
    question: 'How accurate is this screening?',
    answer:
      'This screening tool is designed to identify potential dyslexia characteristics and should not be considered a definitive diagnosis. For a comprehensive evaluation, please consult with a qualified dyslexia specialist or educational psychologist.',
  },
  {
    question: 'Can dyslexia be cured?',
    answer:
      'Dyslexia is not a condition that can be "cured," but with proper intervention and support strategies, individuals with dyslexia can develop effective compensatory techniques and improve their reading and writing skills significantly.',
  },
  {
    question: 'What should I do if I suspect dyslexia?',
    answer:
      'If you suspect dyslexia, take our screening test first. If results indicate moderate to high risk, seek a professional evaluation from a dyslexia specialist, educational psychologist, or speech-language pathologist who can provide a comprehensive assessment.',
  },
  {
    question: 'Are there different types of dyslexia?',
    answer:
      'Yes, dyslexia can manifest differently in different people. Some may struggle primarily with phonological processing, while others may have difficulty with visual processing or orthographic awareness. Our screening covers multiple areas to provide a comprehensive assessment.',
  },
  {
    question: 'How can I support someone with dyslexia?',
    answer:
      'Support includes using dyslexia-friendly fonts, providing extra time for reading and writing, using multi-sensory learning approaches, offering positive reinforcement, and ensuring access to assistive technology. Our recommendations page provides specific strategies.',
  },
  {
    question: 'Is dyslexia more common in certain populations?',
    answer:
      'Dyslexia affects people across all demographics, though it may be identified more frequently in certain populations due to access to screening and resources. Approximately 5-10% of the population has dyslexia.',
  },
  {
    question: 'Can adults develop dyslexia?',
    answer:
      'Dyslexia is a lifelong condition that individuals are born with, not something that develops in adulthood. However, adults may not be diagnosed until later in life. If you suspect you have dyslexia, our screening can help.',
  },
];

export default function Help() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for contact form submission
    alert('Thank you for your message. We will get back to you soon!');
    setContactForm({ name: '', email: '', message: '' });
  };

  return (
    <Layout>
      <div className="space-y-12">
        {/* Header */}
        <section className="space-y-4">
          <h1 className="text-4xl font-display font-bold text-foreground">Help & Support</h1>
          <p className="text-lg text-muted-foreground">
            Learn about dyslexia, find answers to common questions, and get support.
          </p>
        </section>

        {/* What is Dyslexia Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-display font-bold text-foreground">What is Dyslexia?</h2>

          <div className="card-soft space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Dyslexia is a specific learning disability that affects how the brain processes written language. It is not related to intelligence, motivation, or vision. People with dyslexia have a different neurological makeup that affects their ability to decode written words.
            </p>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Common Characteristics:</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary">•</span>
                  <span>Difficulty with reading fluency and accuracy</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">•</span>
                  <span>Challenges with spelling and written expression</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">•</span>
                  <span>Difficulty with phonological awareness (sound recognition)</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">•</span>
                  <span>Trouble with word retrieval and naming</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">•</span>
                  <span>Difficulty organizing thoughts in writing</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4 mt-6">
              <h3 className="font-semibold text-foreground">Strengths Often Associated with Dyslexia:</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-accent">✓</span>
                  <span>Strong visual-spatial skills</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent">✓</span>
                  <span>Creativity and innovative thinking</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent">✓</span>
                  <span>Strong verbal communication skills</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent">✓</span>
                  <span>Problem-solving abilities</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent">✓</span>
                  <span>Empathy and social awareness</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-display font-bold text-foreground">Frequently Asked Questions</h2>

          <div className="space-y-3">
            {faqItems.map((item, index) => (
              <div key={index} className="card-soft">
                <button
                  onClick={() => toggleFAQ(index)}
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

        {/* Resources Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-display font-bold text-foreground">Helpful Resources</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card-soft space-y-4">
              <div className="text-3xl mb-2">📚</div>
              <h3 className="text-xl font-semibold text-foreground">Learning Resources</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Access books, articles, and guides about dyslexia and learning strategies.
              </p>
              <Button variant="outline" className="w-full h-10">
                Explore Resources
              </Button>
            </div>

            <div className="card-soft space-y-4">
              <div className="text-3xl mb-2">🎓</div>
              <h3 className="text-xl font-semibold text-foreground">Educational Support</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Find information about accommodations and support in school settings.
              </p>
              <Button variant="outline" className="w-full h-10">
                Learn More
              </Button>
            </div>

            <div className="card-soft space-y-4">
              <div className="text-3xl mb-2">👥</div>
              <h3 className="text-xl font-semibold text-foreground">Support Communities</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Connect with others, share experiences, and find peer support.
              </p>
              <Button variant="outline" className="w-full h-10">
                Join Community
              </Button>
            </div>

            <div className="card-soft space-y-4">
              <div className="text-3xl mb-2">🔧</div>
              <h3 className="text-xl font-semibold text-foreground">Assistive Technology</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Discover tools and apps that can help with reading and writing.
              </p>
              <Button variant="outline" className="w-full h-10">
                Browse Tools
              </Button>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-display font-bold text-foreground">Get in Touch</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="card-soft space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Email</h3>
                    <p className="text-muted-foreground text-sm">support@dyslexiascreen.com</p>
                  </div>
                </div>
              </div>

              <div className="card-soft space-y-3">
                <div className="flex items-start gap-3">
                  <Phone className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Phone</h3>
                    <p className="text-muted-foreground text-sm">1-800-DYSLEXIA (1-800-397-5394)</p>
                  </div>
                </div>
              </div>

              <div className="card-soft space-y-3">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Live Chat</h3>
                    <p className="text-muted-foreground text-sm">Available Monday-Friday, 9am-5pm EST</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="card-soft">
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base font-medium">
                    Your Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="h-10"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="h-10"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-base font-medium">
                    Message
                  </Label>
                  <textarea
                    id="message"
                    placeholder="How can we help?"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full h-24 p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    required
                  />
                </div>

                <Button type="submit" className="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
