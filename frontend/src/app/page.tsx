'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ParticleCanvas } from '@/components/layout/ParticleCanvas';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Mic,
  Code2,
  BarChart3,
  Zap,
  Trophy,
  CheckCircle,
  ArrowRight,
  Star,
} from 'lucide-react';

const features = [
  { icon: Brain, title: 'AI Questions', desc: 'GPT-4o generates role-specific questions tailored to your target company and difficulty.' },
  { icon: Mic, title: 'Voice Analysis', desc: 'Record audio answers and get Whisper-powered transcription with confidence scoring.' },
  { icon: Code2, title: 'Code Interviews', desc: 'Monaco Editor integration for live coding challenges with syntax highlighting.' },
  { icon: BarChart3, title: 'Real-time Feedback', desc: 'Instant AI evaluation across accuracy, clarity, depth, and confidence dimensions.' },
  { icon: Zap, title: 'Performance Analytics', desc: 'Track your progress over time with detailed charts and score breakdowns.' },
  { icon: Trophy, title: 'Interview Streaks', desc: 'Build consistent practice habits with daily streak tracking and achievements.' },
];

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    features: ['3 interviews/month', 'Basic AI feedback', 'Text answers only', 'Score tracking'],
    cta: 'Get Started',
    href: '/register',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    features: ['Unlimited interviews', 'Advanced AI feedback', 'Voice + Code answers', 'Detailed analytics', 'Custom question sets', 'Priority support'],
    cta: 'Start Pro',
    href: '/register',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: '$99',
    period: '/month',
    features: ['Team management', 'Custom AI personas', 'API access', 'SSO integration', 'Dedicated support', 'White-label option'],
    cta: 'Contact Sales',
    href: '/register',
    highlight: false,
  },
];

const testimonials = [
  { name: 'Sarah K.', role: 'SWE @ Google', text: 'InterVAI helped me land my dream job. The AI feedback was incredibly detailed and actionable.', stars: 5 },
  { name: 'Marcus T.', role: 'PM @ Meta', text: 'The behavioral question generator is outstanding. I practiced STAR method answers every day for a month.', stars: 5 },
  { name: 'Priya S.', role: 'ML Engineer @ OpenAI', text: 'The system design practice is unmatched. Got an offer within 3 weeks of daily practice.', stars: 5 },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neural-bg relative overflow-hidden">
      <ParticleCanvas />
      <Navbar />

      {/* Hero */}
      <section className="relative z-10 pt-32 pb-24 px-4 text-center max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <Badge className="mb-6 text-sm px-4 py-1.5">
            <Zap className="w-3.5 h-3.5 mr-1" /> Powered by GPT-4o + Whisper
          </Badge>

          <h1 className="font-orbitron text-5xl md:text-7xl font-black mb-6 leading-tight">
            Master Your{' '}
            <span className="text-neural-cyan text-glow-cyan">Interviews</span>
            <br />
            with AI
          </h1>

          <p className="text-neural-text-muted text-lg md:text-xl max-w-2xl mx-auto mb-10 font-rajdhani leading-relaxed">
            AI-powered mock interviews that simulate real conversations, evaluate your answers across multiple dimensions, and give you actionable feedback to level up fast.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="xl" asChild>
              <Link href="/register">
                Start Free <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>

          <p className="mt-6 text-neural-text-muted text-sm">No credit card required · 3 free interviews</p>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-24 px-4 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
          <h2 className="font-orbitron text-3xl md:text-4xl font-bold text-center mb-4">
            Everything You Need to{' '}
            <span className="text-neural-cyan">Ace It</span>
          </h2>
          <p className="text-neural-text-muted text-center mb-14 font-rajdhani text-lg">
            Six powerful tools to turn interview anxiety into confidence.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:border-neural-cyan/40 hover:shadow-[0_0_20px_rgba(0,245,255,0.1)] transition-all duration-300 group">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-neural-cyan/10 border border-neural-cyan/20 flex items-center justify-center mb-3 group-hover:glow-cyan transition-all">
                      <Icon className="w-6 h-6 text-neural-cyan" />
                    </div>
                    <CardTitle className="text-lg">{title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">{desc}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Pricing */}
      <section className="relative z-10 py-24 px-4 max-w-5xl mx-auto">
        <h2 className="font-orbitron text-3xl md:text-4xl font-bold text-center mb-4">
          Simple <span className="text-neural-cyan">Pricing</span>
        </h2>
        <p className="text-neural-text-muted text-center mb-14 font-rajdhani text-lg">
          Start free. Upgrade when you&apos;re ready.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(({ name, price, period, features: feats, cta, href, highlight }) => (
            <Card
              key={name}
              className={`relative ${highlight ? 'border-neural-cyan glow-cyan' : 'hover:border-neural-border/80'}`}
            >
              {highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge>Most Popular</Badge>
                </div>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{name}</CardTitle>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="font-orbitron text-4xl font-black text-neural-cyan">{price}</span>
                  <span className="text-neural-text-muted font-rajdhani">{period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {feats.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm font-rajdhani text-neural-text-primary">
                      <CheckCircle className="w-4 h-4 text-neural-cyan shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button variant={highlight ? 'default' : 'outline'} className="w-full" asChild>
                  <Link href={href}>{cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 py-24 px-4 max-w-5xl mx-auto">
        <h2 className="font-orbitron text-3xl font-bold text-center mb-14">
          Join <span className="text-neural-cyan">10,000+</span> Engineers Who Landed Their Dream Jobs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map(({ name, role, text, stars }) => (
            <Card key={name} className="hover:border-neural-purple/40 transition-all">
              <CardContent className="pt-6">
                <div className="flex mb-3">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-neural-text-muted font-rajdhani text-sm leading-relaxed mb-4">&ldquo;{text}&rdquo;</p>
                <div>
                  <p className="font-semibold text-neural-text-primary text-sm">{name}</p>
                  <p className="text-neural-cyan text-xs font-rajdhani">{role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-neural-border py-10 px-4 text-center">
        <p className="font-orbitron text-neural-cyan text-lg font-black tracking-widest mb-2">
          INTER<span className="text-neural-purple">VAI</span>
        </p>
        <p className="text-neural-text-muted text-sm font-rajdhani">
          © 2025 InterVAI. Built with AI, for the AI era.
        </p>
      </footer>
    </div>
  );
}
