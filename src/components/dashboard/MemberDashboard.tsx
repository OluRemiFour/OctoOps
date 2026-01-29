'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore, Task } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { Play, Pause, CheckCircle, Clock, Upload, Send, Layout, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

import { useToast } from "@/components/ui/use-toast";
import CountdownTimer from './CountdownTimer';
import { formatDate } from '@/lib/dateUtils';
import { common } from '@/lib/api';

export default function MemberDashboard() {
  const { user } = useAuth();
  const { tasks, updateTask, submitForReview, openModal, project, isHydrated, fetchTasks } = useAppStore();
  const { toast } = useToast();
  const [isAssigning, setIsAssigning] = useState(false);
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [submissionNote, setSubmissionNote] = useState('');
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [viewingArtifact, setViewingArtifact] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Find the user's active task
  useEffect(() => {
    if (user && tasks.length > 0) {
      const current = tasks.find(t => 
        getIsMyTask(t) && t.status === 'in-progress'
      );
      setActiveTask(current || null);
    }
  }, [tasks, user]);

  // Countdown Timer Logic (Backend Persistent)
  useEffect(() => {
    if (!activeTask) return;

    const startTimeStr = activeTask.timerStartedAt || activeTask.createdAt || new Date().toISOString();
    const startTime = new Date(startTimeStr).getTime();
    const durationMs = (4 * 60 * 60 * 1000) + (1 * 60 * 1000); // 4h + 1m buffer for skew
    const target = startTime + durationMs;

    const calculate = () => {
      const now = new Date().getTime();
      const diff = target - now;
      
      const displayDiff = diff < 0 ? 0 : diff;
      
      const hours = Math.floor(displayDiff / (1000 * 60 * 60));
      const minutes = Math.floor((displayDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((displayDiff % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });

      return diff > 0;
    };

    calculate();
    const interval = setInterval(() => {
        if (!calculate()) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTask?.timerStartedAt, activeTask?.id]);

  const [isSubmitting, setIsSubmitting] = useState(false);

   const handleSubmit = async () => {
    if (activeTask) {
        const tid = activeTask._id || activeTask.id;
        setIsSubmitting(true);
        try {
            // Real File Uploads
            const uploadedUrls: string[] = [];
            for (const file of attachments) {
                const formData = new FormData();
                formData.append('file', file);
                const res = await common.upload(formData);
                uploadedUrls.push(res.data.url);
            }

            await submitForReview(tid, { 
                description: submissionNote.trim() ? (activeTask.description || '') + `\n\nMission Achievement Report:\n${submissionNote}` : activeTask.description,
                attachments: uploadedUrls
            });
            
            await fetchTasks();
            setSubmissionModalOpen(false);
            setSubmissionNote('');
            setAttachments([]); // Clear for next task
            
            toast({
                title: "Mission Accomplished",
                description: "Task submitted. Synchronizing next mission unit...",
            });

            // "Next Task" Loop
            const nextTask = queueTasks[0];
            if (nextTask) {
                const nextTid = nextTask._id || nextTask.id;
                setLoadingTaskId(nextTid);
                setTimeout(async () => {
                    await updateTask(nextTid, { status: 'in-progress', timerStartedAt: new Date() });
                    await fetchTasks();
                    setLoadingTaskId(null);
                }, 1500);
            }
        } catch (error) {
            toast({
                title: "Submission Failed",
                description: "Could not submit task. Network integrity compromised.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    }
  };

  const handleManualAssign = async () => {
    setIsAssigning(true);
    try {
        const { team } = await import('@/lib/api');
        await team.acceptInvite('RE-SYNC', user?.email || 'User'); 
        await fetchTasks();
        toast({
            title: "Sector Synced",
            description: "AI agent has re-evaluated missions for your persona.",
        });
    } catch (err) {
        console.error("Manual assign failed:", err);
        await fetchTasks();
    } finally {
        setIsAssigning(false);
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
                </p>
            </div>
        </div>
    );
  }

  const getIsMyTask = (t: Task) => {
    if (!user) return false;
    const userId = user.id || (user as any)._id;
    const userEmail = user.email?.toLowerCase();
    const userName = user.name?.toLowerCase();
    const assigneeStr = typeof t.assignee === 'string' ? t.assignee : (t.assignee as any)?._id;
    const assigneeEmail = t.assigneeEmail?.toLowerCase() || (t.assignee as any)?.email?.toLowerCase();
    const assigneeName = t.assigneeName?.toLowerCase() || (t.assignee as any)?.name?.toLowerCase();
    return (assigneeStr === userId || assigneeEmail === userEmail || assigneeName === userName);
  };

  const myTasks = tasks
    .filter(t => getIsMyTask(t) && t.status !== 'done')
    .sort((a, b) => {
        if (a.rejectionNote && !b.rejectionNote) return -1;
        if (!a.rejectionNote && b.rejectionNote) return 1;
        if (a.status === 'in-progress' && b.status !== 'in-progress') return -1;
        if (a.status !== 'in-progress' && b.status === 'in-progress') return 1;
        return 0;
    });

  const completedCount = tasks.filter(t => getIsMyTask(t) && t.status === 'done').length;
  const activeId = activeTask?._id || activeTask?.id;
  const queueTasks = myTasks.filter(t => (t._id || t.id) !== activeId);

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
                   
                   <div className="font-mono text-sm text-[#8B9DC3] mb-8 space-y-4">
                       <p className="leading-relaxed">
                          {activeTask.description?.split('Mission Achievement Report:')[0] || "Focus on delivering high quality code."}
                       </p>
                       
                       {activeTask.description?.includes('Mission Achievement Report:') && (
                          <div className="p-4 rounded-xl bg-[#00FF88]/5 border border-[#00FF88]/20 animate-in fade-in duration-700">
                             <div className="flex items-center gap-2 mb-2 text-[10px] uppercase font-bold text-[#00FF88] tracking-widest">
                                <Sparkles className="w-3 h-3" /> Specialist Commentary
                             </div>
                             <p className="text-[#E8F0FF] italic subpixel-antialiased">
                                {activeTask.description.split('Mission Achievement Report:')[1]}
                             </p>
                          </div>
                       )}
                    </div>
                   
                   <div className="flex gap-4">
                      <Button 
                         onClick={() => setSubmissionModalOpen(true)}
                         className="h-12 px-8 bg-[#00FF88] text-[#0A0E27] hover:bg-[#00FF88]/90 font-bold font-display rounded-xl"
                      >
                         <CheckCircle className="w-5 h-5 mr-2" /> Complete & Submit
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
                                strokeDashoffset="40" 
                                strokeLinecap="round"
                                className="drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]"
                           />
                        </svg>
                        <div className="text-center">
                            <Clock className={`w-8 h-8 ${timeLeft.hours === 0 && timeLeft.minutes < 10 ? 'text-[#FF3366] animate-bounce' : 'text-[#00F0FF] animate-pulse'} mx-auto mb-2`} />
                            <div className={`font-mono text-4xl font-bold ${timeLeft.hours === 0 && timeLeft.minutes < 10 ? 'text-[#FF3366]' : 'text-[#E8F0FF]'}`}>
                                {timeLeft.hours.toString().padStart(2, '0')}:
                                {timeLeft.minutes.toString().padStart(2, '0')}:
                                {timeLeft.seconds.toString().padStart(2, '0')}
                            </div>
                            <div className={`text-xs ${timeLeft.hours === 0 && timeLeft.minutes < 10 ? 'text-[#FF3366] font-bold' : 'text-[#8B9DC3]'} mt-1`}>
                                {timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0 ? 'MISSION ELAPSED' : 'TIME REMAINING'}
                            </div>
                        </div>
                   </div>
                </div>
             </div>

             {/* Enhanced Full-Width Feedback Block */}
             {activeTask.rejectionNote && (
                <div className="relative z-10 glass border-[#FF3366]/40 p-5 rounded-2xl bg-[#FF3366]/5 mt-8 animate-in slide-in-from-bottom-2 duration-500">
                    <div className="flex items-center gap-4 mb-3 border-b border-white/10 pb-3">
                        <div className="w-10 h-10 rounded-xl bg-[#FF3366]/20 flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-[#FF3366] animate-pulse" />
                        </div>
                        <div>
                            <div className="text-[10px] uppercase font-bold text-[#FF3366]/70 tracking-[0.2em] mb-0.5">Automated Intelligence Unit</div>
                            <div className="text-xs uppercase font-extrabold text-[#FF3366] tracking-[0.1em]">⚠️ QA REJECTION PARAMETERS</div>
                        </div>
                    </div>
                    <div className="text-sm text-[#E8F0FF] mb-4 leading-relaxed font-mono whitespace-pre-wrap pl-1 border-l border-[#FF3366]/20 py-1 ml-1.5">{activeTask.rejectionNote}</div>
                    {activeTask.rejectionAttachments && activeTask.rejectionAttachments.length > 0 && (
                        <div className="flex flex-wrap gap-4 pt-2">
                            {activeTask.rejectionAttachments.map((url, idx) => (
                                <img 
                                    key={idx} 
                                    src={url} 
                                    alt="Feedback" 
                                    onClick={() => setViewingArtifact(url)}
                                    className="w-24 h-24 rounded-lg border border-white/10 shadow-2xl object-cover hover:scale-105 active:scale-95 transition-all cursor-zoom-in" 
                                />
                            ))}
                        </div>
                    )}
                </div>
              )}

              {/* LIGHTBOX VIEWER */}
              <Dialog open={!!viewingArtifact} onOpenChange={() => setViewingArtifact(null)}>
                <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden bg-transparent border-none shadow-none flex items-center justify-center">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Artifact Preview</DialogTitle>
                        <DialogDescription>Full scale view of the artifact or feedback image</DialogDescription>
                    </DialogHeader>
                    <img 
                        src={viewingArtifact || ''} 
                        alt="Artifact Preview" 
                        className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10"
                    />
                </DialogContent>
              </Dialog>
        </div>
      ) : (
        <div className="glass rounded-3xl p-12 text-center border-dashed border-2 border-white/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[#00F0FF]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
                <div className="w-16 h-16 rounded-full bg-white/5 mx-auto mb-4 flex items-center justify-center animate-pulse">
                    <Clock className="w-8 h-8 text-[#8B9DC3]" />
                </div>
                <h2 className="font-display text-xl font-bold text-[#E8F0FF] mb-2">Systems Idle</h2>
                <p className="font-mono text-sm text-[#8B9DC3] mb-6">Select a mission from your queue to initialize workspace.</p>
                
                {myTasks.length > 0 && (
                    <Button 
                        disabled={loadingTaskId === (myTasks[0]._id || myTasks[0].id)}
                        onClick={async () => {
                            const tid = myTasks[0]._id || myTasks[0].id;
                            setLoadingTaskId(tid);
                            try {
                                await updateTask(tid, { status: 'in-progress' });
                                await fetchTasks();
                                toast({ title: "Mission Initialized", description: "Workspace parameters synchronized." });
                            } finally {
                                setLoadingTaskId(null);
                            }
                        }}
                        className="bg-[#00F0FF]/20 text-[#00F0FF] hover:bg-[#00F0FF]/30 border border-[#00F0FF]/50 font-mono text-xs"
                    >
                        {loadingTaskId === (myTasks[0]._id || myTasks[0].id) ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Play className="w-3 h-3 mr-2" />}
                        INITIALIZE PRIORITY MISSION
                    </Button>
                )}
            </div>
        </div>
      )}

      {/* Task Queue Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-xl font-bold text-[#E8F0FF] flex items-center gap-2">
            <Layout className="w-5 h-5 text-[#00F0FF]" />
            Your Queue
        </h3>
        <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleManualAssign}
            disabled={isAssigning}
            className="text-[#00F0FF] hover:bg-[#00F0FF]/10 h-8 gap-2 text-[10px] font-mono border border-[#00F0FF]/20"
        >
            {isAssigning ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3"/>}
            AUTO-ASSIGN RE-SYNC
        </Button>
      </div>
        <div className="space-y-3">
             {queueTasks.length === 0 && (
                <div className="text-center py-8 glass border-dashed border-white/5 rounded-xl">
                    <p className="text-[#8B9DC3] font-mono text-xs italic">No secondary missions in queue.</p>
                </div>
             )}
             {queueTasks.map(task => (
                 <div key={task._id || task.id} className="glass p-4 rounded-xl flex items-center justify-between group hover:border-[#00F0FF]/30 transition-all">
                     <div>
                         <h4 className="font-bold text-[#E8F0FF]">{task.title}</h4>
                         <div className="flex items-center gap-3 mt-1">
                             <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-[#8B9DC3]" />
                                <span className="text-xs font-mono text-[#8B9DC3]">{formatDate(task.deadline)}</span>
                             </div>
                             <div className="scale-75 origin-left">
                                <CountdownTimer deadline={task.deadline} status={task.status} timerStartedAt={task.timerStartedAt} />
                             </div>
                             
                             <span className={`text-[10px] px-2 py-0.5 rounded border ${
                                 task.status === 'blocked' ? 'border-[#FF3366]/30 bg-[#FF3366]/10 text-[#FF3366]' :
                                 'border-[#8B9DC3]/30 bg-white/5 text-[#8B9DC3]'
                             }`}>
                                {task.status.toUpperCase()}
                             </span>
                         </div>
                     </div>
                     <div className="flex gap-2">
                        <Button 
                            size="sm" 
                            variant="ghost"
                            className="text-[#8B9DC3] hover:text-[#E8F0FF] h-8 px-2"
                            onClick={() => {
                                const tid = task._id || task.id;
                                toast({ title: "Task Intelligence", description: `${task.title}: ${task.description || 'No specialized instructions.'} [ID: ${tid}]` });
                            }}
                        >
                            Peek
                        </Button>
                        <Button 
                            size="sm" 
                            disabled={isSubmitting || loadingTaskId === (task._id || task.id)}
                            className="bg-[#00F0FF]/10 text-[#00F0FF] hover:bg-[#00F0FF]/20 h-8 font-mono text-[10px]"
                            onClick={async () => {
                                const tid = task._id || task.id;
                                setLoadingTaskId(tid);
                                try {
                                    await updateTask(tid, { status: 'in-progress', timerStartedAt: new Date() });
                                    await fetchTasks();
                                    toast({ title: "Mission Active", description: "Workspace parameters initialized." });
                                } finally {
                                    setLoadingTaskId(null);
                                }
                            }}
                        >
                            {loadingTaskId === (task._id || task.id) ? <Loader2 className="w-3 h-3 animate-spin"/> : 'Start Mission'}
                        </Button>
                     </div>
                 </div>
             ))}
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
                    onClick={() => fileInputRef.current?.click()}
                    className={`border border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${attachments.length > 0 ? 'border-[#00FF88] bg-[#00FF88]/5' : 'border-white/20 hover:bg-white/5'}`}
                >
                     <input 
                        type="file" 
                        multiple 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={(e) => {
                            if (e.target.files) {
                                setAttachments(Array.from(e.target.files));
                            }
                        }}
                     />
                     <Upload className={`w-6 h-6 mx-auto mb-2 ${attachments.length > 0 ? 'text-[#00FF88]' : 'text-[#8B9DC3]'}`} />
                     <span className="text-sm text-[#8B9DC3]">
                        {attachments.length > 0 ? `${attachments.length} files selected` : 'Click to select project artifacts'}
                     </span>
                </div>
                <Button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                    className="w-full bg-[#00FF88] text-[#0A0E27] font-bold"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4 mr-2" /> Submit for Review
                        </>
                    )}
                </Button>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
