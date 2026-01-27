'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { formatDate } from '@/lib/dateUtils';

interface Milestone {
  id: string;
  title: string;
  date: string;
  status: 'completed' | 'upcoming' | 'overdue';
  progress: number;
}

export default function TimelineHorizon() {
  const { tasks, project, openModal } = useAppStore();

  // DERIVE MILESTONES FROM TASKS
  const milestones = React.useMemo(() => {
    if (!tasks || tasks.length === 0) return [];
    
    const uniqueMilestones = Array.from(new Set(tasks.map(t => t.milestone).filter(Boolean)));
    
    return uniqueMilestones.map((m, idx) => {
        const milestoneTasks = tasks.filter(t => t.milestone === m);
        const completed = milestoneTasks.filter(t => t.status === 'done').length;
        const total = milestoneTasks.length;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        // Find latest deadline for this milestone
        const deadlines = milestoneTasks.map(t => t.deadline).filter(Boolean);
        const lastDeadline = deadlines.length > 0 ? formatDate(new Date(Math.max(...deadlines.map(d => new Date(d as any).getTime())))) : 'Syncing...';

        return {
            id: String(idx + 1),
            title: m || 'Mission Protocol',
            date: lastDeadline,
            status: progress === 100 ? 'completed' : 'upcoming',
            progress
        };
    });
  }, [tasks]);

  if (milestones.length === 0) {
      return (
        <div className="glass rounded-3xl p-8 text-center border border-white/5 opacity-50">
             <Clock className="w-12 h-12 text-[#8B9DC3] mx-auto mb-4" />
             <p className="font-mono text-sm text-[#8B9DC3]">Architecting Mission Horizon... AI is establishing critical path milestones.</p>
        </div>
      );
  }

  return (
    <div className="glass rounded-3xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl font-bold text-[#E8F0FF]">
          Timeline Horizon
        </h2>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#00F0FF]" />
          <span className="font-mono text-sm text-[#8B9DC3]">
            Q{Math.floor(new Date().getMonth() / 3) + 1} {new Date().getFullYear()}
          </span>
        </div>
      </div>

      <ScrollArea className="w-full">
        <div className="relative min-w-max">
          {/* Timeline Line */}
          <div className="absolute top-12 left-0 right-0 h-1 bg-gradient-to-r from-[#00FF88] via-[#FFB800] to-[#00F0FF] opacity-20" />
          
          <div className="flex gap-8 relative">
            {milestones.map((milestone, index) => {
              const isLast = index === milestones.length - 1;
              
              return (
                <div 
                  key={milestone.id} 
                  className="flex flex-col items-center min-w-[140px] cursor-pointer group"
                  onClick={() => openModal('timeline-detail', milestone)}
                >
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
