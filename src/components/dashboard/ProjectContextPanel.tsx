'use client';

import React from 'react';
import { Users, Target, TrendingUp, Edit2, Rocket, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';

import { Map } from 'lucide-react'; // Added import

export default function ProjectContextPanel() {
  const { project, team, onboardingData, openModal, archiveProject } = useAppStore();

  if (!project) {
    const isPreview = onboardingData?.name || onboardingData?.vision;
    
    return (
      <div className="glass rounded-3xl p-8 border-2 border-dashed border-[#00F0FF]/20">
        <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-[#9D4EDD] shrink-0 animate-pulse" />
            <h2 className="font-display text-xl font-bold text-[#E8F0FF]">
                {isPreview ? 'Project Projection: ' + onboardingData.name : 'Mission Deployment Ready'}
            </h2>
        </div>
        
        {isPreview ? (
            <div className="space-y-4">
                <p className="font-mono text-sm text-[#8B9DC3] line-clamp-3 italic">
                    "{onboardingData.vision}"
                </p>
                <div className="bg-[#00F0FF]/5 border border-[#00F0FF]/20 rounded-xl p-4 flex gap-4 items-center">
                    <TrendingUp className="w-5 h-5 text-[#00F0FF] shrink-0" />
                    <div>
                        <div className="text-xs font-bold text-[#00F0FF] uppercase tracking-wider">AI Readiness Level</div>
                        <div className="text-xs text-[#8B9DC3]">Network parameters validated. Roadmap generation standby.</div>
                    </div>
                </div>
            </div>
        ) : (
            <p className="font-mono text-sm text-[#8B9DC3] mb-6">
                Define your project vision or upload a mockup to initialize your autonomous agent network.
            </p>
        )}

        <div className="mt-6 flex flex-wrap gap-4">
          <Button
            onClick={() => openModal('project-vision')}
            className={`font-bold h-12 px-8 rounded-xl transition-all ${isPreview ? 'bg-[#00FF88] text-[#0A0E27] glow-green' : 'bg-[#9D4EDD] text-white glow-purple'}`}
          >
            <Rocket className="w-5 h-5 mr-2" />
            {isPreview ? 'Launch Mission' : 'Define Vision'}
          </Button>
          {!isPreview && (
            <Button
                onClick={() => openModal('image-upload')}
                className="glass border-[#00F0FF]/30 text-[#00F0FF] hover:bg-[#00F0FF]/10 font-bold h-12 px-8 rounded-xl"
            >
                <ImageIcon className="w-5 h-5 mr-2" />
                Upload Mockup
            </Button>
          )}
        </div>
      </div>
    );
  }

  const healthScore = project.healthScore;

  return (
    <div className="glass rounded-3xl p-8">
      <div className="grid md:grid-cols-[1fr_auto] gap-8">
        {/* Left: Project Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="font-display text-3xl font-bold text-[#E8F0FF]">
                {project.name}
              </h2>
              <span className="px-3 py-1 rounded-full bg-[#00FF88]/10 border border-[#00FF88]/30 font-mono text-xs text-[#00FF88]">
                {project.status?.toUpperCase() || 'ACTIVE'}
              </span>
            </div>
            <p className="font-mono text-sm text-[#8B9DC3] leading-relaxed">
              {project.description}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => openModal('project-vision')}
              className="bg-[#9D4EDD]/20 text-xs border border-[#9D4EDD]/40 text-[#9D4EDD] hover:bg-[#9D4EDD]/30 font-bold"
            >
              <Sparkles className="w-4 h-4 mr-1" />
              Define Vision
            </Button>
            <Button
              onClick={() => openModal('roadmap-view')}
              className="bg-[#00F0FF]/20 text-xs border border-[#00F0FF]/40 text-[#00F0FF] hover:bg-[#00F0FF]/30 font-bold"
            >
              <Map className="w-4 h-4 mr-1" />
              Analyze Roadmap
            </Button>
            <Button
              onClick={() => openModal('archive-confirm')}
              className="bg-[#00FF88] text-[#0A0E27] text-xs hover:bg-[#00FF88]/90 font-bold glow-green ml-auto"
            >
              <Rocket className="w-4 h-4 mr-1" />
              Launch & Complete
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Team Size */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#00F0FF]/10 border-2 border-[#00F0FF]/30 flex items-center justify-center">
                <Users className="w-6 h-6 text-[#00F0FF]" />
              </div>
              <div>
                <div className="font-display text-2xl font-bold text-[#00F0FF]">{team.length}</div>
                <div className="font-accent text-xs text-[#8B9DC3]">Team Members</div>
              </div>
            </div>

            {/* Milestones */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#FFB800]/10 border-2 border-[#FFB800]/30 flex items-center justify-center">
                <Target className="w-6 h-6 text-[#FFB800]" />
              </div>
              <div>
                <div className="font-display text-2xl font-bold text-[#FFB800]">{project.milestonesCompleted}/{project.totalMilestones}</div>
                <div className="font-accent text-xs text-[#8B9DC3]">Milestones</div>
              </div>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#9D4EDD]/10 border-2 border-[#9D4EDD]/30 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#9D4EDD]" />
              </div>
              <div>
                <div className="font-display text-2xl font-bold text-[#9D4EDD]">{project.progress}%</div>
                <div className="font-accent text-xs text-[#8B9DC3]">Complete</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Health Score */}
        <div className="flex flex-col items-center justify-center min-w-[200px]">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              <defs>
                <linearGradient id="health-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00FF88" />
                  <stop offset="100%" stopColor="#00F0FF" />
                </linearGradient>
              </defs>
              
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="rgba(0, 240, 255, 0.1)"
                strokeWidth="12"
                fill="none"
              />
              
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="url(#health-gradient)"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${(healthScore / 100) * 439.8} 439.8`}
                className="transition-all duration-1000 ease-out"
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(0, 255, 136, 0.5))'
                }}
              />
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="font-display text-4xl font-bold text-[#00FF88]">
                {healthScore}
              </div>
              <div className="font-accent text-xs text-[#8B9DC3]">Health Score</div>
            </div>
          </div>
          
          <p className="font-mono text-xs text-center text-[#8B9DC3] mt-4 max-w-[180px]">
            {healthScore >= 80 ? 'Excellent project health' :
             healthScore >= 60 ? 'Good, minor risks detected' :
             'Attention needed'}
          </p>
        </div>
      </div>
    </div>
  );
}
