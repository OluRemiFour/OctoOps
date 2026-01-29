'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { CheckCircle, XCircle, FileText, ExternalLink, ShieldCheck, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { common } from '@/lib/api';

export default function QADashboard() {
  const { user } = useAuth();
  const { tasks, approveTask, rejectTask, updateTask, isHydrated, project, fetchTasks } = useAppStore();
  const { toast } = useToast();

  const [loadingTaskId, setLoadingTaskId] = React.useState<string | null>(null);
  const [rejectingTask, setRejectingTask] = React.useState<any | null>(null);
  const [rejectionNote, setRejectionNote] = React.useState('');
  const [rejectionFiles, setRejectionFiles] = React.useState<File[]>([]);
  const [detailsTask, setDetailsTask] = React.useState<any | null>(null);
  const [viewingArtifact, setViewingArtifact] = React.useState<string | null>(null);
  const rejectionInputRef = React.useRef<HTMLInputElement>(null);

  if (!isHydrated) {
      return (
          <div className="flex items-center justify-center h-[60vh]">
              <div className="text-center">
                  <div className="w-12 h-12 border-4 border-[#FFB800] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-[#8B9DC3] font-mono text-xs uppercase tracking-widest">Gently Probing Project Integrity...</p>
              </div>
          </div>
      );
  }

  if (!project) {
    return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center glass p-10 rounded-2xl border border-white/5 max-w-md shadow-2xl">
                <ShieldCheck className="w-10 h-10 text-[#8B9DC3] mx-auto mb-4 opacity-50" />
                <h2 className="text-xl font-bold text-[#E8F0FF] mb-2 tracking-tight">No Active Sector</h2>
                <p className="text-[#8B9DC3] text-sm font-mono leading-relaxed">
                    Quality Assurance protocols are on standby. 
                </p>
            </div>
        </div>
    );
  }

  const handleAction = async (taskId: string, action: () => Promise<void>) => {
    setLoadingTaskId(taskId);
    try {
        await action();
        await fetchTasks();
        toast({ title: "Action Completed", description: "Task status updated successfully." });
    } catch (error) {
        toast({ title: "Action Failed", description: "Could not update task.", variant: "destructive" });
    } finally {
        setLoadingTaskId(null);
    }
  };

  const isMyTask = (t: any) => {
    return true; 
  };

  const isAssignedToMe = (t: any) => {
      const userId = user?.id || (user as any)?._id;
      return t.assignee === userId || t.assigneeEmail === user?.email;
  }

  const reviewQueue = tasks.filter(t => t.status === 'in-review');
  const myReviews = reviewQueue.filter(t => isMyTask(t)); 
  
  const myAssignedTasks = tasks.filter(t => {
      const userId = user?.id || (user as any)?._id;
      const wasReviewedByMe = t.reviewedBy === userId || 
                              (typeof t.reviewedBy === 'object' && (t.reviewedBy as any)?._id === userId) ||
                              (typeof t.reviewedBy === 'string' && t.reviewedBy === userId);
      
      const assignedToMe = isAssignedToMe(t);
      // FIX: Only show COMPLETED tasks in history
      return (assignedToMe && t.status === 'done') || wasReviewedByMe;
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
       <div className="flex items-center justify-between">
         <div>
            <h1 className="font-display text-3xl font-bold text-[#E8F0FF]">Quality Assurance Hub</h1>
            <p className="font-mono text-sm text-[#8B9DC3]">Ensure code quality and requirement compliance.</p>
         </div>
         <div className="glass px-4 py-2 rounded-xl border border-[#FFB800]/30 animate-pulse">
            <span className="font-display text-xl font-bold text-[#FFB800]">{reviewQueue.length}</span>
            <span className="font-mono text-xs text-[#8B9DC3] ml-2">Pending Reviews</span>
         </div>
       </div>

       <Tabs defaultValue="reviews" className="w-full">
         <TabsList className="glass border border-white/10 p-1 mb-6">
            <TabsTrigger value="reviews" className="data-[state=active]:bg-[#FFB800] data-[state=active]:text-[#0A0E27]">
                Review Queue ({myReviews.length})
            </TabsTrigger>
            <TabsTrigger value="tasks" className="data-[state=active]:bg-[#00F0FF] data-[state=active]:text-[#0A0E27]">
                My Tasks & History ({myAssignedTasks.length})
            </TabsTrigger>
         </TabsList>

         <TabsContent value="reviews" className="space-y-6">
            {myReviews.length === 0 && (
                <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-white/5 mx-auto mb-4 flex items-center justify-center">
                        <ShieldCheck className="w-8 h-8 text-[#8B9DC3]" />
                    </div>
                    <p className="text-[#8B9DC3] font-mono">You're all caught up! No pending reviews.</p>
                </div>
            )}
            {myReviews.map(task => (
                <div key={task._id || task.id} className="glass rounded-2xl p-6 border border-[#FFB800]/20 flex gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                             <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#FFB800]/20 text-[#FFB800] border border-[#FFB800]/30">IN REVIEW</span>
                             <h3 className="font-display text-xl font-bold text-[#E8F0FF]">{task.title}</h3>
                        </div>
                        
                        <div className="bg-[#0A0E27]/50 rounded-xl p-4 mb-4 border border-white/5">
                            <h4 className="text-xs font-bold text-[#8B9DC3] mb-2 uppercase tracking-wider">Original Requirements</h4>
                            <p className="font-mono text-sm text-[#E8F0FF] whitespace-pre-wrap">
                                {task.description?.split('Mission Achievement Report:')[0] || "No description provided."}
                            </p>
                        </div>
                        
                        <div className="bg-white/5 rounded-xl p-4 mb-4">
                            <h4 className="text-xs font-bold text-[#E8F0FF] mb-2 uppercase tracking-wider flex items-center gap-2">
                                <FileText className="w-3 h-3" /> Submission Content
                            </h4>
                            <div className="space-y-2">
                                {task.description?.includes('Mission Achievement Report:') ? (
                                    <div className="text-xs font-mono text-[#00F0FF] bg-[#00F0FF]/5 p-3 rounded-lg border border-[#00F0FF]/20">
                                        <p className="font-bold text-[10px] uppercase mb-1 opacity-70">Member Commentary:</p>
                                        {task.description.split('Mission Achievement Report:')[1]}
                                    </div>
                                ) : (
                                    <p className="text-xs text-[#8B9DC3] italic">No technical commentary provided.</p>
                                )}
                                {task.attachments && task.attachments.length > 0 && (
                                    <div className="flex gap-2 pt-2 overflow-x-auto pb-1 custom-scrollbar">
                                        {task.attachments.map((url, idx) => (
                                            <img 
                                                key={idx} 
                                                src={url} 
                                                alt="Artifact" 
                                                onClick={() => setViewingArtifact(url)}
                                                className="w-16 h-16 rounded object-cover border border-white/10 hover:scale-105 active:scale-95 transition-all cursor-zoom-in" 
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="w-48 flex flex-col justify-center gap-3 border-l border-white/5 pl-6">
                        <Button 
                            disabled={loadingTaskId === (task._id || task.id)}
                            onClick={() => handleAction(task._id || task.id, () => approveTask(task._id || task.id, user?.id || (user as any)?._id))}
                            className="w-full bg-[#00FF88] text-[#0A0E27] hover:bg-[#00FF88]/90 font-bold"
                        >
                            {loadingTaskId === (task._id || task.id) ? "Syncing..." : <><ShieldCheck className="w-4 h-4 mr-2" /> Approve</>}
                        </Button>
                        <Button 
                            disabled={loadingTaskId === (task._id || task.id)}
                            onClick={() => setRejectingTask(task)}
                            variant="destructive"
                            className="w-full bg-[#FF3366]/20 text-[#FF3366] hover:bg-[#FF3366]/30 border border-[#FF3366]/50"
                        >
                            <XCircle className="w-4 h-4 mr-2" /> Reject
                        </Button>
                        <Button 
                            onClick={() => setDetailsTask(task)}
                            variant="ghost" 
                            className="w-full text-[#8B9DC3]"
                        >
                            <ExternalLink className="w-3 h-3 mr-2" /> Details
                        </Button>
                    </div>
                </div>
            ))}
         </TabsContent>

         <TabsContent value="tasks" className="space-y-4">
             {myAssignedTasks.length === 0 && (
                <div className="text-center py-12 text-[#8B9DC3] font-mono border border-dashed border-white/10 rounded-xl">
                    No task history detected.
                </div>
             )}
             {myAssignedTasks.map(task => (
                  <div key={task._id || task.id} className="glass p-4 rounded-xl flex items-center justify-between group hover:border-white/20 transition-all">
                     <div>
                         <h4 className="font-bold text-[#E8F0FF]">{task.title}</h4>
                         <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                                task.status === 'done' ? 'bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/20' :
                                'bg-[#8B9DC3]/10 text-[#8B9DC3] border border-[#8B9DC3]/20'
                            }`}>
                                {task.status.toUpperCase()}
                            </span>
                            {task.reviewedBy && (
                                <span className="text-[10px] text-[#8B9DC3] font-mono italic">
                                    {task.status === 'done' ? '✓ Approved by you' : '⚠ Rejected by you'}
                                </span>
                            )}
                         </div>
                     </div>
                     {task.status !== 'done' && task.status !== 'in-review' && (
                        <Button 
                            size="sm"
                            disabled={loadingTaskId === (task._id || task.id)}
                            className="bg-[#00F0FF]/10 text-[#00F0FF] hover:bg-[#00F0FF]/20"
                            onClick={() => handleAction(task._id || task.id, () => updateTask(task._id || task.id, { status: 'in-progress' }))}
                        >
                            Start
                        </Button>
                     )}
                  </div>
             ))}
         </TabsContent>
       </Tabs>

       {/* Rejection Modal */}
       <Dialog open={!!rejectingTask} onOpenChange={(open) => !open && setRejectingTask(null)}>
         <DialogContent className="glass border-[#FF3366]/30 bg-[#0A0E27]/95">
           <DialogHeader>
             <DialogTitle className="text-[#FF3366] font-display text-xl flex items-center gap-2">
               <XCircle className="w-5 h-5" /> Reject Artifact
             </DialogTitle>
             <DialogDescription className="text-[#8B9DC3]">Provide specific feedback for the mission specialist.</DialogDescription>
           </DialogHeader>
           <div className="py-4 font-mono">
              <Textarea 
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
                placeholder="Describe the failure points (e.g. edge cases, styling, logic)..."
                className="glass border-white/10 min-h-[120px] text-sm mb-4"
              />
              <input 
                type="file" 
                ref={rejectionInputRef}
                multiple
                className="hidden"
                onChange={(e) => {
                    if (e.target.files) {
                        setRejectionFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                    }
                }}
              />
              <div 
                onClick={() => rejectionInputRef.current?.click()}
                className="border border-dashed border-white/20 rounded-xl p-4 text-center hover:bg-[#FF3366]/5 hover:border-[#FF3366]/40 transition-all cursor-pointer group"
              >
                  <Upload className="w-5 h-5 text-[#8B9DC3] mx-auto mb-1 group-hover:text-[#FF3366] transition-colors" />
                  <p className="text-[10px] text-[#8B9DC3] group-hover:text-white transition-colors">Attach Rejection Proof (Optional)</p>
              </div>
              {rejectionFiles.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {rejectionFiles.map((file, i) => (
                        <div key={i} className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded-md text-[#8B9DC3] flex items-center gap-1">
                            <span className="truncate max-w-[100px]">{file.name}</span>
                            <button onClick={(e) => { e.stopPropagation(); setRejectionFiles(prev => prev.filter((_, idx) => idx !== i)); }} className="hover:text-white ml-1">×</button>
                        </div>
                    ))}
                </div>
              )}
           </div>
           <DialogFooter>
             <Button variant="ghost" onClick={() => setRejectingTask(null)} className="text-[#8B9DC3]">Cancel</Button>
              <Button 
                disabled={!rejectionNote.trim() || loadingTaskId === rejectingTask?._id}
                onClick={async () => {
                    const tid = rejectingTask?._id || rejectingTask?.id;
                    setLoadingTaskId(tid);
                    try {
                        const uploadedUrls: string[] = [];
                        for (const file of rejectionFiles) {
                            const formData = new FormData();
                            formData.append('file', file);
                            const res = await common.upload(formData);
                            uploadedUrls.push(res.data.url);
                        }

                        await handleAction(tid, () => rejectTask(tid, { 
                            rejectionNote,
                            rejectionAttachments: uploadedUrls,
                            reviewedBy: user?.id || (user as any)?._id 
                        }));
                        setRejectingTask(null); 
                        setRejectionNote(''); 
                        setRejectionFiles([]);
                    } finally {
                        setLoadingTaskId(null);
                    }
                }}
                className="bg-[#FF3366] text-white hover:bg-[#FF3366]/90"
              >
                Confirm Rejection
              </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>

       {/* Detailed Artifact Modal */}
       <Dialog open={!!detailsTask} onOpenChange={(open) => !open && setDetailsTask(null)}>
         <DialogContent className="glass border-[#00F0FF]/30 bg-[#0A0E27]/95 max-w-2xl">
           <DialogHeader>
             <DialogTitle className="text-[#E8F0FF] font-display text-2xl">Mission Artifact Analysis</DialogTitle>
             <DialogDescription className="font-mono text-[#00F0FF] text-xs uppercase tracking-widest">Technical Inspection</DialogDescription>
           </DialogHeader>
           {detailsTask && (
             <div className="space-y-6 py-4">
               <div className="grid grid-cols-2 gap-4">
                 <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                   <p className="text-[10px] text-[#8B9DC3] uppercase font-bold mb-1">Agent</p>
                   <p className="text-[#E8F0FF] font-medium">{detailsTask.assigneeName || 'Assigned Agent'}</p>
                 </div>
                 <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                   <p className="text-[10px] text-[#8B9DC3] uppercase font-bold mb-1">State</p>
                   <p className="text-[#FFB800] font-mono font-bold uppercase">{detailsTask.status}</p>
                 </div>
               </div>
               <div className="p-4 rounded-xl bg-[#0A0E27] border border-white/5">
                 <p className="text-[10px] text-[#8B9DC3] uppercase font-bold mb-2">Requirements</p>
                 <p className="text-[#E8F0FF] font-mono text-sm leading-relaxed">{detailsTask.description?.split('Mission Achievement Report:')[0]}</p>
               </div>
                {detailsTask.description?.includes('Mission Achievement Report:') && (
                  <div className="p-4 rounded-xl bg-[#00FF88]/5 border border-[#00FF88]/20">
                    <p className="text-[10px] text-[#00FF88] uppercase font-bold mb-2">Specialist Commentary</p>
                    <p className="text-[#E8F0FF] font-mono text-sm mb-3">{detailsTask.description.split('Mission Achievement Report:')[1]}</p>
                    {detailsTask.attachments && detailsTask.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {detailsTask.attachments.map((url: string, i: number) => (
                                <img 
                                    key={i} 
                                    src={url} 
                                    alt="Artifact" 
                                    onClick={() => setViewingArtifact(url)}
                                    className="w-20 h-20 rounded border border-white/10 object-cover cursor-zoom-in hover:scale-105 transition-all" 
                                />
                            ))}
                        </div>
                    )}
                  </div>
                )}
                {detailsTask.rejectionNote && (
                  <div className="p-4 rounded-xl bg-[#FF3366]/5 border border-[#FF3366]/20">
                    <p className="text-[10px] text-[#FF3366] uppercase font-bold mb-2">QA Feedback</p>
                    <p className="text-[#E8F0FF] font-mono text-sm mb-3">{detailsTask.rejectionNote}</p>
                    {detailsTask.rejectionAttachments && detailsTask.rejectionAttachments.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {detailsTask.rejectionAttachments.map((url: string, i: number) => (
                                <img 
                                    key={i} 
                                    src={url} 
                                    alt="Feedback" 
                                    onClick={() => setViewingArtifact(url)}
                                    className="w-20 h-20 rounded border border-white/10 object-cover cursor-zoom-in hover:scale-105 transition-all" 
                                />
                            ))}
                        </div>
                    )}
                  </div>
                )}
              </div>
           )}
           <DialogFooter>
             <Button onClick={() => setDetailsTask(null)} className="w-full bg-[#00F0FF] text-[#0A0E27] font-bold">Close Analysis</Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>

       {/* LIGHTBOX VIEWER */}
       <Dialog open={!!viewingArtifact} onOpenChange={() => setViewingArtifact(null)}>
            <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden bg-transparent border-none shadow-none flex items-center justify-center">
                <img 
                    src={viewingArtifact || ''} 
                    alt="Artifact Preview" 
                    className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10"
                />
            </DialogContent>
        </Dialog>
    </div>
  );
}
