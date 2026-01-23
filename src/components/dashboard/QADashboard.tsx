'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { CheckCircle, XCircle, FileText, ExternalLink, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function QADashboard() {
  const { user } = useAuth();
  const { tasks, approveTask, updateTask, isHydrated, project } = useAppStore();

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
                    Assign a project to start reviewing task artifacts.
                </p>
            </div>
        </div>
    );
  }

  const reviewQueue = tasks.filter(t => t.status === 'in-review');
  const myReviews = reviewQueue.filter(t => t.assignee === user?.name);
  const otherReviews = reviewQueue.filter(t => t.assignee !== user?.name);

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

       <Tabs defaultValue="my-queue" className="w-full">
         <TabsList className="glass border border-white/10 p-1 mb-6">
            <TabsTrigger value="my-queue" className="data-[state=active]:bg-[#FFB800] data-[state=active]:text-[#0A0E27]">
                My Queue ({myReviews.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="data-[state=active]:bg-[#E8F0FF] data-[state=active]:text-[#0A0E27]">
                All Pending ({reviewQueue.length})
            </TabsTrigger>
         </TabsList>

         <TabsContent value="my-queue" className="space-y-6">
            {myReviews.map(task => (
                <div key={task.id} className="glass rounded-2xl p-6 border border-[#FFB800]/20 flex gap-6">
                    {/* Task Info */}
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                             <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#FFB800]/20 text-[#FFB800] border border-[#FFB800]/30">IN REVIEW</span>
                             <h3 className="font-display text-xl font-bold text-[#E8F0FF]">{task.title}</h3>
                        </div>
                        <p className="font-mono text-sm text-[#8B9DC3] mb-4">
                            {task.description || "No description."}
                        </p>
                        
                        {/* Mock Submission Artifacts */}
                        <div className="bg-white/5 rounded-xl p-4 mb-4">
                            <h4 className="text-xs font-bold text-[#E8F0FF] mb-2 uppercase tracking-wider flex items-center gap-2">
                                <FileText className="w-3 h-3" /> Submission Attachments
                            </h4>
                            <div className="flex gap-3">
                                <div className="px-3 py-2 bg-[#0A0E27] rounded-lg border border-white/10 text-xs text-[#00F0FF] cursor-pointer hover:border-[#00F0FF]">
                                    pr_changes.diff
                                </div>
                                <div className="px-3 py-2 bg-[#0A0E27] rounded-lg border border-white/10 text-xs text-[#00F0FF] cursor-pointer hover:border-[#00F0FF]">
                                    screenshot_v2.png
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="w-48 flex flex-col justify-center gap-3 border-l border-white/5 pl-6">
                        <Button 
                            onClick={() => approveTask(task.id)}
                            className="w-full bg-[#00FF88] text-[#0A0E27] hover:bg-[#00FF88]/90 font-bold"
                        >
                            <ShieldCheck className="w-4 h-4 mr-2" /> Approve
                        </Button>
                        <Button 
                            onClick={() => updateTask(task.id, { status: 'in-progress' })}
                            variant="destructive"
                            className="w-full bg-[#FF3366]/20 text-[#FF3366] hover:bg-[#FF3366]/30 border border-[#FF3366]/50"
                        >
                            <XCircle className="w-4 h-4 mr-2" /> Request Changes
                        </Button>
                        <Button variant="ghost" className="w-full text-[#8B9DC3]">
                            <ExternalLink className="w-3 h-3 mr-2" /> View Full Diff
                        </Button>
                    </div>
                </div>
            ))}
            {myReviews.length === 0 && (
                <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-white/5 mx-auto mb-4 flex items-center justify-center">
                        <ShieldCheck className="w-8 h-8 text-[#8B9DC3]" />
                    </div>
                    <p className="text-[#8B9DC3] font-mono">You're all caught up! No pending reviews assigned to you.</p>
                </div>
            )}
         </TabsContent>
       </Tabs>
    </div>
  );
}
