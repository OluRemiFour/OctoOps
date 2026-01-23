'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, X } from 'lucide-react';
import AnimatedOctopus from './AnimatedOctopus';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export default function HeroSection() {
  const router = useRouter();
  const [showDemo, setShowDemo] = useState(false);

  const handleStartProject = () => {
    router.push('/dashboard');
  };

  return (
    <>
    {/* Demo Modal */}
    <Dialog open={showDemo} onOpenChange={setShowDemo}>
      <DialogContent className="glass border-[#00F0FF]/30 bg-[#0A0E27]/95 max-w-3xl p-0 overflow-hidden">
        <div className="relative aspect-video bg-[#0A0E27]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-[#00F0FF]/20 border-2 border-[#00F0FF]/40 flex items-center justify-center mx-auto mb-4">
                <Play className="w-10 h-10 text-[#00F0FF]" />
              </div>
              <div className="font-display text-2xl font-bold text-[#E8F0FF] mb-2">
                OctoOps Demo
              </div>
              <p className="font-mono text-sm text-[#8B9DC3] max-w-md mx-auto">
                Watch how five AI agents work together to predict risks, coordinate your team, and ship projects on time.
              </p>
              <Button 
                onClick={handleStartProject}
                className="mt-6 bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-[#0A0E27] font-display font-bold rounded-xl"
              >
                Try It Now
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
          <button
            onClick={() => setShowDemo(false)}
            className="absolute top-4 right-4 text-[#8B9DC3] hover:text-[#E8F0FF] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
    <section className="relative min-h-screen flex items-center justify-center px-6 py-20 overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(0, 240, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text Content */}
          <div className="space-y-8">
            <div className="inline-block">
              <span className="font-accent text-[#00F0FF] text-sm tracking-wider uppercase px-4 py-2 glass rounded-full">
                Autonomous Project Intelligence
              </span>
            </div>
            
            <h1 className="font-display font-bold text-6xl lg:text-7xl leading-tight">
              Meet{' '}
              <span className="bg-gradient-to-r from-[#00F0FF] via-[#00FF88] to-[#9D4EDD] bg-clip-text text-transparent">
                OctoOps
              </span>
            </h1>
            
            <p className="text-[#8B9DC3] text-lg lg:text-xl font-mono leading-relaxed max-w-xl">
              Five specialized AI agents working in parallel—like an octopus brain 
              coordinating its tentacles. Real-time risk detection, autonomous task 
              coordination, and intelligent decision support for modern teams.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                onClick={handleStartProject}
                className="bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-[#0A0E27] font-display font-bold text-lg px-8 py-6 rounded-2xl glow-cyan transition-all duration-200 hover:scale-105"
              >
                Start Free Project
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => setShowDemo(true)}
                className="glass border-[#00F0FF]/30 hover:border-[#00F0FF]/60 text-[#E8F0FF] font-display font-bold text-lg px-8 py-6 rounded-2xl transition-all duration-200 hover:scale-105"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-8 pt-8 border-t border-[#00F0FF]/20">
              <div>
                <div className="font-display text-3xl font-bold text-[#00F0FF]">5</div>
                <div className="font-accent text-sm text-[#8B9DC3]">AI Agents</div>
              </div>
              <div>
                <div className="font-display text-3xl font-bold text-[#00FF88]">98%</div>
                <div className="font-accent text-sm text-[#8B9DC3]">Accuracy</div>
              </div>
              <div>
                <div className="font-display text-3xl font-bold text-[#FFB800]">24/7</div>
                <div className="font-accent text-sm text-[#8B9DC3]">Monitoring</div>
              </div>
            </div>
          </div>

          {/* Right: Animated Octopus */}
          <div className="flex items-center justify-center lg:justify-end">
            <AnimatedOctopus />
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
