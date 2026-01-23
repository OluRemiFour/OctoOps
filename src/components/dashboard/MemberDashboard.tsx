'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore, Task } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { Play, Pause, CheckCircle, Clock, Upload, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

export default function MemberDashboard() {
  const { user } = useAuth();
  const { tasks, updateTask, submitForReview, openModal, project, isHydrated } = useAppStore();
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [submissionNote, setSubmissionNote] = useState('');
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  // Find the user's active task
  useEffect(() => {
    if (user) {
      const current = tasks.find(t => t.assignee === user.name && t.status === 'in-progress');
      setActiveTask(current || null);
    }
  }, [tasks, user]);

  // Countdown Timer Logic (Mock deadline for demo)
  useEffect(() => {
    if (!activeTask) return;

    // Mock: Set deadline to 4 hours from now if not parsing correctly, or just use a fixed mock diff
    const target = new Date();
    target.setHours(target.getHours() + 4); 

    const interval = setInterval(() => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTask]);

  const handleSubmit = () => {
    if (activeTask) {
        submitForReview(activeTask.id);
        setSubmissionModalOpen(false);
        setSubmissionNote('');
    }
  };

  if (!isHydrated) {
    return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-[#00FF88] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[#8B9DC3] font-mono text-xs uppercase tracking-widest">Syncing Workspace Pulse...</p>
            </div>
        </div>
    );
  }

  if (!project) {
    return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center glass p-10 rounded-2xl border border-white/5 max-w-md shadow-2xl">
                <Clock className="w-10 h-10 text-[#8B9DC3] mx-auto mb-4 opacity-50" />
                <h2 className="text-xl font-bold text-[#E8F0FF] mb-2 tracking-tight">No Active Mission</h2>
                <p className="text-[#8B9DC3] text-sm font-mono leading-relaxed">
                    You are currently not assigned to any active project cycles. 
                    Systems are standing by.
                </p>
            </div>
        </div>
    );
  }

  const getIsMyTask = (t: Task) => {
    const assigneeData = t.assignee as any;
    return (
      assigneeData?.name === user?.name || 
      assigneeData?.email === user?.email || 
      t.assigneeName === user?.name ||
      t.assigneeEmail === user?.email ||
      assigneeData === user?.email
    );
  };

  const myTasks = tasks.filter(t => getIsMyTask(t) && t.status !== 'done');
  const completedCount = tasks.filter(t => getIsMyTask(t) && t.status === 'done').length;

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
            <h1 className="font-display text-3xl font-bold text-[#E8F0FF]">
                Welcome back, {user?.name.split(' ')[0]}
            </h1>
            <p className="font-mono text-sm text-[#8B9DC3]">
                You have {myTasks.length} pending tasks.
            </p>
        </div>
        <div className="glass px-4 py-2 rounded-xl border border-[#00FF88]/30">
            <span className="font-display text-xl font-bold text-[#00FF88]">{completedCount}</span>
            <span className="font-mono text-xs text-[#8B9DC3] ml-2">Tasks Completed</span>
        </div>
      </div>

      {/* Active Workstation */}
      {activeTask ? (
        <div className="glass rounded-3xl p-8 border border-[#00F0FF]/30 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-[#00F0FF]/10 blur-[80px] rounded-full pointer-events-none" />
             
             <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                <div>
                   <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF] font-mono text-xs mb-4">
                      <Play className="w-3 h-3 fill-current" /> IN PROGRESS
                   </span>
                   <h2 className="font-display text-4xl font-bold text-[#E8F0FF] mb-4 leading-tight">
                      {activeTask.title}
                   </h2>
                   <p className="font-mono text-sm text-[#8B9DC3] mb-8">
                      {activeTask.description || "Focus on delivering high quality code. Check existing patterns before implementing."}
                   </p>
                   
                   <div className="flex gap-4">
                      <Button 
                         onClick={() => setSubmissionModalOpen(true)}
                         className="h-12 px-8 bg-[#00FF88] text-[#0A0E27] hover:bg-[#00FF88]/90 font-bold font-display rounded-xl"
                      >
                         <CheckCircle className="w-5 h-5 mr-2" /> Complete & Submit
                      </Button>
                      <Button 
                         variant="outline"
                         className="h-12 px-6 glass border-white/10 text-[#E8F0FF] hover:bg-white/5 rounded-xl"
                      >
                         <Pause className="w-5 h-5 mr-2" /> Pause Timer
                      </Button>
                   </div>
                </div>

                {/* Countdown UI */}
                <div className="flex justify-center">
                   <div className="relative w-64 h-64 rounded-full border-4 border-[#00F0FF]/20 flex items-center justify-center glass">
                        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                           <circle 
                                cx="50" cy="50" r="46" 
                                fill="none" 
                                stroke="#00F0FF" 
                                strokeWidth="4"
                                strokeDasharray="289"
                                strokeDashoffset="40" // Mock progress
                                strokeLinecap="round"
                                className="drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]"
                           />
                        </svg>
                        <div className="text-center">
                            <Clock className="w-8 h-8 text-[#00F0FF] mx-auto mb-2 animate-pulse" />
                            <div className="font-mono text-4xl font-bold text-[#E8F0FF]">
                                {timeLeft.hours.toString().padStart(2, '0')}:
                                {timeLeft.minutes.toString().padStart(2, '0')}:
                                {timeLeft.seconds.toString().padStart(2, '0')}
                            </div>
                            <div className="text-xs text-[#8B9DC3] mt-1">TIME REMAINING</div>
                        </div>
                   </div>
                </div>
             </div>
        </div>
      ) : (
        <div className="glass rounded-3xl p-12 text-center border-dashed border-2 border-white/10">
            <div className="w-16 h-16 rounded-full bg-white/5 mx-auto mb-4 flex items-center justify-center">
                <Clock className="w-8 h-8 text-[#8B9DC3]" />
            </div>
            <h2 className="font-display text-xl font-bold text-[#E8F0FF] mb-2">No Active Task</h2>
            <p className="font-mono text-sm text-[#8B9DC3]">Pick a task from your queue to start the timer.</p>
        </div>
      )}

      {/* Task Queue */}
      <div>
        <h3 className="font-display text-xl font-bold text-[#E8F0FF] mb-4">Your Queue</h3>
        <div className="space-y-3">
             {myTasks.filter(t => t.id !== activeTask?.id).map(task => (
                 <div key={task.id} className="glass p-4 rounded-xl flex items-center justify-between group hover:border-[#00F0FF]/30 transition-all">
                     <div>
                         <h4 className="font-bold text-[#E8F0FF]">{task.title}</h4>
                         <div className="flex items-center gap-3 mt-1">
                             <span className="text-xs font-mono text-[#8B9DC3]">{task.deadline}</span>
                             <span className={`text-[10px] px-2 py-0.5 rounded border ${
                                 task.status === 'blocked' ? 'border-[#FF3366]/30 bg-[#FF3366]/10 text-[#FF3366]' :
                                 'border-[#8B9DC3]/30 bg-white/5 text-[#8B9DC3]'
                             }`}>
                                {task.status.toUpperCase()}
                             </span>
                         </div>
                     </div>
                     <Button 
                         size="sm" 
                         className="bg-[#00F0FF]/10 text-[#00F0FF] hover:bg-[#00F0FF]/20"
                         onClick={() => updateTask(task.id, { status: 'in-progress' })}
                     >
                        Start
                     </Button>
                 </div>
             ))}
        </div>
      </div>

      {/* Submission Modal */}
      <Dialog open={submissionModalOpen} onOpenChange={setSubmissionModalOpen}>
        <DialogContent className="glass border-[#00FF88]/30 bg-[#0A0E27]/95">
           <DialogHeader>
                <DialogTitle className="font-display text-xl text-[#00FF88]">Submit Task</DialogTitle>
                <DialogDescription>Add details about your work for QA review.</DialogDescription>
           </DialogHeader>
           <div className="space-y-4 py-4">
                <Textarea 
                    value={submissionNote}
                    onChange={(e) => setSubmissionNote(e.target.value)}
                    placeholder="Describe what you built..."
                    className="glass border-white/10 min-h-[100px]"
                />
                <div 
                    onClick={() => openModal('image-upload')}
                    className="border border-dashed border-white/20 rounded-lg p-6 text-center cursor-pointer hover:bg-white/5 transition-colors"
                >
                     <Upload className="w-6 h-6 text-[#8B9DC3] mx-auto mb-2" />
                     <span className="text-sm text-[#8B9DC3]">Attach Screenshots or Files</span>
                </div>
                <Button onClick={handleSubmit} className="w-full bg-[#00FF88] text-[#0A0E27] font-bold">
                    <Send className="w-4 h-4 mr-2" /> Submit for Review
                </Button>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
