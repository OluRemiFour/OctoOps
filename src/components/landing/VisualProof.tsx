'use client';

import React from 'react';
import { X, Check } from 'lucide-react';

export default function VisualProof() {
  return (
    <section className="relative py-32 px-6 bg-gradient-to-b from-transparent via-[#0A0E27] to-transparent">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="font-display text-5xl font-bold mb-6">
            Beyond <span className="text-[#FF3366]">Passive</span> Tracking
          </h2>
          <p className="text-[#8B9DC3] text-xl font-mono max-w-2xl mx-auto">
            Traditional tools wait for you to update them. OctoOps actively monitors, 
            predicts, and coordinates—like having a project manager who never sleeps.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Passive Tracker */}
          <div className="glass rounded-3xl p-8 border-[#FF3366]/20">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-[#FF3366]/10 border-2 border-[#FF3366]/30 flex items-center justify-center">
                <X className="w-6 h-6 text-[#FF3366]" />
              </div>
              <h3 className="font-display text-2xl font-bold text-[#FF3366]">
                Passive Task Tracker
              </h3>
            </div>

            <div className="space-y-4">
              <Feature 
                negative
                text="Manual status updates required"
              />
              <Feature 
                negative
                text="Risks discovered when it's too late"
              />
              <Feature 
                negative
                text="No proactive team coordination"
              />
              <Feature 
                negative
                text="Static task lists without intelligence"
              />
              <Feature 
                negative
                text="Managers spend hours checking progress"
              />
              <Feature 
                negative
                text="Decisions based on outdated information"
              />
            </div>

            <div className="mt-8 pt-6 border-t border-[#FF3366]/20">
              <div className="font-mono text-sm text-[#8B9DC3]">Project Success Rate</div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="font-display text-4xl font-bold text-[#FF3366]">42%</span>
                <span className="font-accent text-sm text-[#8B9DC3]">of projects on time</span>
              </div>
            </div>
          </div>

          {/* OctoOps Intelligence */}
          <div className="glass rounded-3xl p-8 border-[#00FF88]/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FF88] opacity-5 blur-3xl rounded-full" />
            
            <div className="flex items-center gap-3 mb-8 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-[#00FF88]/10 border-2 border-[#00FF88]/30 flex items-center justify-center">
                <Check className="w-6 h-6 text-[#00FF88]" />
              </div>
              <h3 className="font-display text-2xl font-bold text-[#00FF88]">
                OctoOps Intelligence
              </h3>
            </div>

            <div className="space-y-4 relative z-10">
              <Feature 
                text="Autonomous progress monitoring 24/7"
              />
              <Feature 
                text="Predicts risks 48 hours in advance"
              />
              <Feature 
                text="Proactive notifications & coordination"
              />
              <Feature 
                text="AI-powered task dependencies & optimization"
              />
              <Feature 
                text="Managers focus on decisions, not updates"
              />
              <Feature 
                text="Real-time data for strategic planning"
              />
            </div>

            <div className="mt-8 pt-6 border-t border-[#00FF88]/20 relative z-10">
              <div className="font-mono text-sm text-[#8B9DC3]">Project Success Rate</div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="font-display text-4xl font-bold text-[#00FF88]">89%</span>
                <span className="font-accent text-sm text-[#8B9DC3]">of projects on time</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Feature({ text, negative = false }: { text: string; negative?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
        negative ? 'bg-[#FF3366]/10' : 'bg-[#00FF88]/10'
      }`}>
        {negative ? (
          <X className="w-3 h-3 text-[#FF3366]" />
        ) : (
          <Check className="w-3 h-3 text-[#00FF88]" />
        )}
      </div>
      <span className="font-mono text-sm text-[#E8F0FF] leading-relaxed">
        {text}
      </span>
    </div>
  );
}
