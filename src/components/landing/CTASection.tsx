'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';

export default function CTASection() {
  const router = useRouter();

  return (
    <section className="relative py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="glass rounded-[3rem] p-12 lg:p-16 text-center relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00F0FF] opacity-10 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#9D4EDD] opacity-10 blur-[120px] rounded-full" />
          
          <div className="relative z-10">
            <div className="inline-block mb-6">
              <span className="font-accent text-[#00F0FF] text-sm tracking-wider uppercase px-4 py-2 glass rounded-full">
                Ready to Transform Your Projects?
              </span>
            </div>
            
            <h2 className="font-display text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Start Shipping with{' '}
              <span className="bg-gradient-to-r from-[#00F0FF] via-[#00FF88] to-[#9D4EDD] bg-clip-text text-transparent">
                AI Intelligence
              </span>
            </h2>
            
            <p className="text-[#8B9DC3] text-xl font-mono max-w-2xl mx-auto mb-12 leading-relaxed">
              Join thousands of teams using OctoOps to predict risks, coordinate autonomously, 
              and ship projects on time. No credit card required.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                onClick={() => router.push('/dashboard')}
                className="bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-[#0A0E27] font-display font-bold text-lg px-12 py-7 rounded-2xl glow-cyan transition-all duration-200 hover:scale-105 w-full sm:w-auto"
              >
                Start Free Project
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => {
                  const demoSection = document.getElementById('demo-section');
                  demoSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="glass border-[#00F0FF]/30 hover:border-[#00F0FF]/60 text-[#E8F0FF] font-display font-bold text-lg px-12 py-7 rounded-2xl transition-all duration-200 hover:scale-105 w-full sm:w-auto"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch 2-Min Demo
              </Button>
            </div>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-3 gap-8 mt-16 pt-16 border-t border-[#00F0FF]/20">
              <div>
                <div className="font-display text-2xl font-bold text-[#00FF88] mb-2">
                  Free Forever
                </div>
                <div className="font-mono text-sm text-[#8B9DC3]">
                  Up to 3 projects, unlimited agents
                </div>
              </div>
              
              <div>
                <div className="font-display text-2xl font-bold text-[#00F0FF] mb-2">
                  5-Min Setup
                </div>
                <div className="font-mono text-sm text-[#8B9DC3]">
                  No technical knowledge needed
                </div>
              </div>
              
              <div>
                <div className="font-display text-2xl font-bold text-[#9D4EDD] mb-2">
                  24/7 Support
                </div>
                <div className="font-mono text-sm text-[#8B9DC3]">
                  AI + human help when you need it
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 space-y-4">
          <div className="flex justify-center gap-8 font-accent text-sm text-[#8B9DC3]">
            <a href="#" className="hover:text-[#00F0FF] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#00F0FF] transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-[#00F0FF] transition-colors">Documentation</a>
            <a href="#" className="hover:text-[#00F0FF] transition-colors">API</a>
          </div>
          <div className="font-mono text-sm text-[#8B9DC3]">
            © 2026 OctoOps. All rights reserved.
          </div>
        </div>
      </div>
    </section>
  );
}
