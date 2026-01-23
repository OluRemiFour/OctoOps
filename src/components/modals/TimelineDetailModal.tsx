'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { CheckCircle, Clock, AlertCircle, Target, List, Flag, Calendar } from 'lucide-react';

export default function TimelineDetailModal() {
  const { activeModal, closeModal, modalData, tasks } = useAppStore();
  
  if (activeModal !== 'timeline-detail' || !modalData) return null;

  const milestone = modalData;
  const milestoneTasks = tasks.filter(t => t.milestone === milestone.title);
  const completedCount = milestoneTasks.filter(t => t.status === 'done').length;
  const progress = milestoneTasks.length > 0 ? Math.round((completedCount / milestoneTasks.length) * 100) : 0;

  return (
    <Dialog open={activeModal === 'timeline-detail'} onOpenChange={closeModal}>
      <DialogContent className="glass border-[#00F0FF]/30 bg-[#0A0E27]/95 max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-2">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              milestone.status === 'completed' ? 'bg-[#00FF88]/10 text-[#00FF88]' : 'bg-[#00F0FF]/10 text-[#00F0FF]'
            }`}>
              {milestone.status === 'completed' ? <CheckCircle /> : <Clock />}
            </div>
            <div>
              <DialogTitle className="font-display text-2xl font-bold text-[#E8F0FF]">
                {milestone.title}
              </DialogTitle>
              <DialogDescription className="text-[#8B9DC3] flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                Target Date: {milestone.date}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-[#E8F0FF]">{progress}%</div>
              <div className="text-[10px] text-[#8B9DC3] uppercase tracking-wider">Progress</div>
            </div>
            <div className="glass p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-[#00FF88]">{completedCount}</div>
              <div className="text-[10px] text-[#8B9DC3] uppercase tracking-wider">Achieved</div>
            </div>
            <div className="glass p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-[#FFB800]">{milestoneTasks.length - completedCount}</div>
              <div className="text-[10px] text-[#8B9DC3] uppercase tracking-wider">Pending</div>
            </div>
          </div>

          {/* Goal Summary */}
          <div className="space-y-3">
            <h3 className="font-bold text-[#E8F0FF] flex items-center gap-2">
              <Target className="w-4 h-4 text-[#FFB800]" />
              Milestone Goals
            </h3>
            <div className="glass p-4 rounded-xl space-y-2">
              <p className="text-sm text-[#8B9DC3] leading-relaxed">
                {milestone.description || "Project phase focused on achieving specific deliverables and quality benchmarks for the next stage of development."}
              </p>
            </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-3">
            <h3 className="font-bold text-[#E8F0FF] flex items-center gap-2">
              <List className="w-4 h-4 text-[#00F0FF]" />
              Tracked Tasks
            </h3>
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
              {milestoneTasks.length > 0 ? milestoneTasks.map((task, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-sm text-[#E8F0FF]">{task.title}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    task.status === 'done' ? 'bg-[#00FF88]/10 text-[#00FF88]' : 'bg-[#FFB800]/10 text-[#FFB800]'
                  }`}>
                    {task.status.toUpperCase()}
                  </span>
                </div>
              )) : (
                <p className="text-center text-sm text-[#8B9DC3] py-4">No tasks assigned to this milestone yet.</p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={closeModal} className="glass border-[#00F0FF]/30 text-[#00F0FF] hover:bg-[#00F0FF]/10">
              Back to Overview
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
