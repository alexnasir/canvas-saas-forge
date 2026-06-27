import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, CheckCircle2, Monitor, Layout as LayoutIcon, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';

export default function Landing() {
  const login = useAuthStore((state) => state.login);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground fill-current" />
            </div>
            <span className="font-bold text-xl tracking-tight">NasiTu</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary">Features</a>
            <a href="#templates" className="text-sm font-medium text-muted-foreground hover:text-primary">Templates</a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-primary">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" onClick={() => login('demo@nasitu.io')}>Log in</Button>
            </Link>
            <Link to="/dashboard">
              <Button onClick={() => login('demo@nasitu.io')}>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Next Gen SaaS Builder is here
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Build SaaS Apps <br /> Without Writing Code
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              The most powerful visual builder for modern software teams. 
              Launch production-ready CRMs, Marketplaces, and AI tools in minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/dashboard">
                <Button size="lg" className="h-12 px-8 text-lg rounded-full" onClick={() => login('demo@nasitu.io')}>
                  Start Building for Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="h-12 px-8 text-lg rounded-full">
                View Live Demo
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mt-20 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10"></div>
            <div className="rounded-2xl border bg-card shadow-2xl overflow-hidden aspect-[16/9] max-w-5xl mx-auto">
               <img 
                src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/00f5583d-c5c4-4bce-afa3-837ccf9294ed/nasitu-builder-preview-cbd08721-1782597389976.webp" 
                alt="NasiTu Dashboard" 
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need to ship</h2>
            <p className="text-muted-foreground">From drag-and-drop to production deployment.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                title: "Visual Logic Engine", 
                desc: "Build complex workflows and business logic without writing a single line of JavaScript.",
                icon: Cpu
              },
              { 
                title: "Pre-built Components", 
                desc: "High-quality, responsive components that follow modern design systems and accessibility standards.",
                icon: LayoutIcon
              },
              { 
                title: "Real-time Preview", 
                desc: "See exactly what your app looks like on mobile, tablet, and desktop as you build.",
                icon: Monitor
              }
            ].map((f, i) => (
              <div key={i} className="p-8 rounded-2xl bg-card border hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
