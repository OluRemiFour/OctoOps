'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { PartyPopper, Trophy, Rocket, CheckCircle, ArrowRight, History, BarChart3, Archive } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function CelebrationModal() {
  const { activeModal, closeModal, project, tasks, archiveProject } = useAppStore();
  const { toast } = useToast();
  const [isArchiving, setIsArchiving] = useState(false);
  const isOpen = activeModal === 'celebration';

  const completedMilestones = React.useMemo(() => {
    return Array.from(new Set(tasks.map(t => t.milestone).filter(Boolean)));
  }, [tasks]);

  // Confetti effect
  const [confettiPieces, setConfettiPieces] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      const pieces = Array.from({ length: 50 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100 + '%',
        delay: Math.random() * 3 + 's',
        color: ['#00F0FF', '#00FF88', '#FFB800', '#9D4EDD', '#FF3366'][Math.floor(Math.random() * 5)],
        size: Math.random() * 8 + 4 + 'px'
      }));
      setConfettiPieces(pieces);
    } else {
      setConfettiPieces([]);
    }
  }, [isOpen]);

  const handleArchive = async () => {
    setIsArchiving(true);
    try {
      await archiveProject();
      toast({
        title: "Mission Complete!",
        description: "Project archived successfully. Redirecting to new mission setup...",
      });
      closeModal();
    } catch (error) {
      console.error('Archive failed:', error);
      toast({
        title: "Archive Failed",
        description: "Failed to archive project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsArchiving(false);
    }
  };

  if (!project) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) closeModal(); }}>
      <DialogContent className="glass border-[#00FF88]/40 bg-[#0A0E27]/95 max-w-2xl overflow-hidden min-h-[500px]">
        {/* Confetti pieces */}
        {confettiPieces.map(p => (
          <div 
            key={p.id}
            className="confetti-piece"
            style={{ 
              left: p.left, 
              animationDelay: p.delay, 
              backgroundColor: p.color,
              width: p.size,
              height: p.size 
            }}
          />
        ))}

        <div className="relative z-10 py-6 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-[#00FF88]/10 border-2 border-[#00FF88]/40 flex items-center justify-center mb-6 animate-pop-in">
            <Trophy className="w-12 h-12 text-[#00FF88] glow-green" />
          </div>

          <DialogHeader className="mb-8">
            <DialogTitle className="font-display text-4xl font-bold text-[#E8F0FF] mb-2 tracking-tight">
              Mission Accomplished!
            </DialogTitle>
            <p className="font-mono text-[#8B9DC3] uppercase tracking-[0.3em] text-xs">
              Sector Protocols Fully Synchronized
            </p>
          </DialogHeader>

          {/* Journey Map Summary */}
          <div className="w-full grid md:grid-cols-2 gap-6 mb-8 text-left">
            <div className="glass p-5 rounded-2xl border-white/5 bg-white/5">
              <h4 className="font-display font-bold text-[#00F0FF] flex items-center gap-2 mb-4 text-sm">
                <History className="w-4 h-4" /> Milestone Accomplishments
              </h4>
              <div className="space-y-4 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                 <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#00FF88]/20 flex items-center justify-center shrink-0 border border-[#00FF88]/30">
                        <Rocket className="w-3 h-3 text-[#00FF88]" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-[#E8F0FF]">Vision Fully Realized</p>
                        <p className="text-[10px] text-[#8B9DC3]">{project.name} system is now live.</p>
                    </div>
                 </div>
                 {completedMilestones.length > 0 ? completedMilestones.map((m, i) => (
                    <div key={i} className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#00FF88]/10 flex items-center justify-center shrink-0 border border-[#00FF88]/20">
                            <CheckCircle className="w-3 h-3 text-[#00FF88]" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-[#E8F0FF]">{m}</p>
                            <p className="text-[10px] text-[#8B9DC3]">Infrastructure integrity verified for this phase.</p>
                        </div>
                    </div>
                 )) : (
                    <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#00FF88]/10 flex items-center justify-center shrink-0 border border-[#00FF88]/20">
                            <CheckCircle className="w-3 h-3 text-[#00FF88]" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-[#E8F0FF]">Mission Critical Paths</p>
                            <p className="text-[10px] text-[#8B9DC3]">{tasks.length} tasks completed successfully.</p>
                        </div>
                    </div>
                 )}
              </div>
            </div>

            <div className="glass p-5 rounded-2xl border-white/5 bg-white/5">
              <h4 className="font-display font-bold text-[#9D4EDD] flex items-center gap-2 mb-4 text-sm">
                <BarChart3 className="w-4 h-4" /> Mission Analysis
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-white/5 pb-2">
                   <p className="text-xs text-[#8B9DC3]">Final Health Score</p>
                   <p className="text-xl font-display font-bold text-[#00FF88]">{project.healthScore}%</p>
                </div>
                <div className="flex justify-between items-end border-b border-white/5 pb-2">
                   <p className="text-xs text-[#8B9DC3]">Efficiency Rating</p>
                   <p className="text-lg font-display font-bold text-[#00F0FF]">OPTIMAL</p>
                </div>
                <div className="flex justify-between items-end border-b border-white/5 pb-2">
                   <p className="text-xs text-[#8B9DC3]">System Velocity</p>
                   <p className="text-lg font-display font-bold text-[#FFB800]">Pioneer Class</p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full space-y-4">
            <p className="text-sm text-[#8B9DC3] italic">
              "The {project.name} initiative has reached 100% containment. Mission parameters exceed initial projections."
            </p>
            
            <div className="flex gap-4 pt-4">
               <Button 
                variant="ghost" 
                onClick={() => closeModal()}
                className="flex-1 text-[#8B9DC3] hover:text-[#E8F0FF] border border-white/10"
               >
                 Keep Inspecting
               </Button>
               <Button 
                onClick={handleArchive}
                disabled={isArchiving}
                className="flex-[1.5] bg-[#00FF88] text-[#0A0E27] font-bold h-12 flex items-center justify-center gap-2 rounded-xl glow-green"
               >
                 {isArchiving ? 'Archiving...' : (
                   <>
                     Archive & Launch Next Mission <ArrowRight className="w-4 h-4" />
                   </>
                 )}
               </Button>
            </div>
          </div>
        </div>

        {/* Floating background elements */}
        <div className="absolute top-10 right-10 opacity-20 animate-float pointer-events-none">
            <Rocket className="w-12 h-12 text-[#00FF88]" />
        </div>
        <div className="absolute bottom-10 left-10 opacity-20 animate-float pointer-events-none" style={{ animationDelay: '-3s' }}>
            <PartyPopper className="w-12 h-12 text-[#00F0FF]" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
