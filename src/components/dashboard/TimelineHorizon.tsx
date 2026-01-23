'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  date: string;
  status: 'completed' | 'upcoming' | 'overdue';
  progress: number;
}

const milestones: Milestone[] = [
  { id: '1', title: 'Kick-off & Planning', date: 'Jan 15', status: 'completed', progress: 100 },
  { id: '2', title: 'Design System', date: 'Jan 28', status: 'completed', progress: 100 },
  { id: '3', title: 'Core Features Dev', date: 'Feb 12', status: 'completed', progress: 100 },
  { id: '4', title: 'API Integration', date: 'Feb 25', status: 'completed', progress: 100 },
  { id: '5', title: 'Testing Phase', date: 'Mar 8', status: 'completed', progress: 100 },
  { id: '6', title: 'Beta Release', date: 'Mar 18', status: 'upcoming', progress: 75 },
  { id: '7', title: 'Marketing Campaign', date: 'Mar 25', status: 'upcoming', progress: 40 },
  { id: '8', title: 'Public Launch', date: 'Apr 1', status: 'upcoming', progress: 0 },
];

export default function TimelineHorizon() {
  return (
    <div className="glass rounded-3xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-[#E8F0FF]">
          Timeline Horizon
        </h2>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#00F0FF]" />
          <span className="font-mono text-sm text-[#8B9DC3]">Q1 2024</span>
        </div>
      </div>

      <ScrollArea className="w-full">
        <div className="relative min-w-max pb-4">
          {/* Timeline Line */}
          <div className="absolute top-12 left-0 right-0 h-1 bg-gradient-to-r from-[#00FF88] via-[#FFB800] to-[#00F0FF] opacity-20" />
          
          <div className="flex gap-8 relative">
            {milestones.map((milestone, index) => {
              const isLast = index === milestones.length - 1;
              
              return (
                <div key={milestone.id} className="flex flex-col items-center min-w-[140px]">
                  {/* Node */}
                  <div className="relative z-10 mb-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        milestone.status === 'completed'
                          ? 'bg-[#00FF88]/20 border-2 border-[#00FF88] glow-green'
                          : milestone.status === 'overdue'
                          ? 'bg-[#FF3366]/20 border-2 border-[#FF3366] glow-red animate-pulse'
                          : 'bg-[#00F0FF]/20 border-2 border-[#00F0FF]'
                      }`}
                    >
                      {milestone.status === 'completed' ? (
                        <CheckCircle className="w-6 h-6 text-[#00FF88]" />
                      ) : milestone.status === 'overdue' ? (
                        <AlertCircle className="w-6 h-6 text-[#FF3366]" />
                      ) : (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            background: `conic-gradient(#00F0FF ${milestone.progress * 3.6}deg, rgba(0, 240, 255, 0.2) 0deg)`
                          }}
                        />
                      )}
                    </div>
                    
                    {/* Progress Ring for upcoming */}
                    {milestone.status === 'upcoming' && milestone.progress > 0 && (
                      <svg
                        className="absolute inset-0 w-12 h-12 -rotate-90"
                        viewBox="0 0 48 48"
                      >
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          stroke="#00F0FF"
                          strokeWidth="2"
                          fill="none"
                          strokeDasharray={`${(milestone.progress / 100) * 125.6} 125.6`}
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Content */}
                  <div className="text-center">
                    <div
                      className={`font-display text-sm font-bold mb-1 ${
                        milestone.status === 'completed'
                          ? 'text-[#00FF88]'
                          : milestone.status === 'overdue'
                          ? 'text-[#FF3366]'
                          : 'text-[#00F0FF]'
                      }`}
                    >
                      {milestone.title}
                    </div>
                    <div className="font-mono text-xs text-[#8B9DC3] mb-2">
                      {milestone.date}
                    </div>
                    
                    {milestone.status === 'upcoming' && (
                      <div className="flex items-center justify-center gap-1">
                        <div className="w-16 h-1.5 rounded-full bg-[#00F0FF]/20 overflow-hidden">
                          <div
                            className="h-full bg-[#00F0FF] transition-all duration-500"
                            style={{ width: `${milestone.progress}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs text-[#00F0FF]">
                          {milestone.progress}%
                        </span>
                      </div>
                    )}
                    
                    {milestone.status === 'completed' && (
                      <div className="font-accent text-xs text-[#00FF88]">
                        ✓ Complete
                      </div>
                    )}
                  </div>

                  {/* Connector */}
                  {!isLast && (
                    <div className="absolute top-12 left-[140px] w-8 h-1 bg-gradient-to-r from-transparent to-[#00F0FF]/20" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
