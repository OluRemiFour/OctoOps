'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Clock, Users } from 'lucide-react';

export default function InteractiveDemo() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [step, setStep] = useState(0);

  const startSimulation = () => {
    setIsSimulating(true);
    setStep(0);
    
    const steps = [1, 2, 3, 4];
    steps.forEach((s, i) => {
      setTimeout(() => setStep(s), (i + 1) * 1500);
    });
    
    setTimeout(() => {
      setIsSimulating(false);
      setStep(0);
    }, 8000);
  };

  return (
    <section id="demo-section" className="relative py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display text-5xl font-bold mb-6">
            See <span className="text-[#00F0FF]">Intelligence</span> in Action
          </h2>
          <p className="text-[#8B9DC3] text-xl font-mono">
            Trigger a simulated deadline risk and watch all five agents respond in real-time
          </p>
        </div>

        <div className="glass rounded-3xl p-8 lg:p-12">
          {/* Simulation Trigger */}
          <div className="flex flex-col items-center gap-6 mb-12">
            <Button
              size="lg"
              onClick={startSimulation}
              disabled={isSimulating}
              className="bg-[#FF3366] hover:bg-[#FF3366]/90 text-white font-display font-bold text-lg px-12 py-6 rounded-2xl glow-red transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSimulating ? 'Agents Responding...' : 'Trigger Deadline Risk'}
            </Button>
            <p className="font-accent text-sm text-[#8B9DC3]">
              Simulate: Major milestone due in 24 hours, 3 tasks still incomplete
            </p>
          </div>

          {/* Agent Response Timeline */}
          <div className="space-y-6">
            {/* Step 1: Risk Detection */}
            <AgentResponse
              active={step >= 1}
              agentName="Risk Agent"
              agentColor="#FF3366"
              icon={AlertTriangle}
              message="Detected critical deadline risk: Launch Feature due in 24h with 3 incomplete tasks"
              time="0.2s"
            />

            {/* Step 2: Impact Analysis */}
            <AgentResponse
              active={step >= 2}
              agentName="Planner Agent"
              agentColor="#00F0FF"
              icon={Clock}
              message="Analyzed dependencies: 2 tasks can be parallelized, 1 task blocking progress"
              time="0.8s"
            />

            {/* Step 3: Team Coordination */}
            <AgentResponse
              active={step >= 3}
              agentName="Communication Agent"
              agentColor="#FFB800"
              icon={Users}
              message="Notified Sarah & Mike, requested immediate blocker update"
              time="1.2s"
            />

            {/* Step 4: Recommendation */}
            <AgentResponse
              active={step >= 4}
              agentName="Recommendation Agent"
              agentColor="#9D4EDD"
              icon={CheckCircle}
              message="Recommendation: Delay launch 48h OR reduce scope by removing non-critical UI polish"
              time="2.1s"
            />
          </div>

          {/* Result Banner */}
          {step >= 4 && (
            <div className="mt-8 glass rounded-2xl p-6 border-[#00FF88]/30 bg-[#00FF88]/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-[#00FF88] flex-shrink-0 mt-1" />
                <div>
                  <div className="font-display text-lg font-bold text-[#00FF88] mb-2">
                    Crisis Averted in 2.1 Seconds
                  </div>
                  <div className="font-mono text-sm text-[#E8F0FF] leading-relaxed">
                    All agents collaborated autonomously to detect, analyze, communicate, and recommend 
                    a solution—before you even knew there was a problem.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

interface AgentResponseProps {
  active: boolean;
  agentName: string;
  agentColor: string;
  icon: React.ElementType;
  message: string;
  time: string;
}

function AgentResponse({ active, agentName, agentColor, icon: Icon, message, time }: AgentResponseProps) {
  return (
    <div 
      className={`flex items-start gap-4 p-4 rounded-2xl transition-all duration-500 ${
        active 
          ? 'glass border-2 opacity-100 translate-x-0' 
          : 'bg-transparent border-2 border-transparent opacity-30 translate-x-4'
      }`}
      style={{ borderColor: active ? `${agentColor}40` : 'transparent' }}
    >
      {/* Icon */}
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-500"
        style={{
          backgroundColor: active ? `${agentColor}20` : `${agentColor}10`,
          border: `2px solid ${agentColor}40`,
          boxShadow: active ? `0 0 20px ${agentColor}50` : 'none'
        }}
      >
        <Icon className="w-6 h-6" style={{ color: agentColor }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <span className="font-display text-sm font-bold" style={{ color: agentColor }}>
            {agentName}
          </span>
          <span className="font-mono text-xs text-[#8B9DC3]">{time}</span>
        </div>
        <p className="font-mono text-sm text-[#E8F0FF] leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
}
