'use client';

import React from 'react';
import { useAppStore, Task } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { CheckCircle, Clock, AlertTriangle, ArrowRight, ShieldCheck, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TeamTaskBoard() {
  const { user } = useAuth();
  const { tasks, updateTask, submitForReview, approveTask } = useAppStore();

  if (!user) return null;

  // Filter tasks based on role
  const myTasks = tasks.filter((task) => {
    if (user.role === 'owner') return true; // Owners see all
    if (user.role === 'qa') return task.status === 'in-review' || task.assignee === user.name;
    return task.assignee === user.name; // Members see their own
  });

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'done': return '#00FF88';
      case 'in-review': return '#FFB800';
      case 'blocked': return '#FF3366';
      case 'in-progress': return '#00F0FF';
      default: return '#8B9DC3';
    }
  };

  return (
    <div className="glass rounded-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-[#E8F0FF]">
          {user.role === 'qa' ? 'QA Queue' : 'My Tasks'}
        </h2>
        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 font-mono text-xs text-[#8B9DC3]">
          {myTasks.length} Active
        </div>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
        {myTasks.length === 0 ? (
          <div className="text-center py-8 text-[#8B9DC3] font-mono text-sm">
            No active tasks found.
          </div>
        ) : (
          myTasks.map((task) => (
            <div
              key={task.id}
              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#00F0FF]/30 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display font-bold text-[#E8F0FF] mb-1">{task.title}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span 
                        className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border"
                        style={{ 
                            color: getStatusColor(task.status),
                            borderColor: `${getStatusColor(task.status)}40`,
                            backgroundColor: `${getStatusColor(task.status)}10`
                        }}
                    >
                        {task.status.replace('-', ' ')}
                    </span>
                    <span className="font-mono text-xs text-[#8B9DC3] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {task.deadline}
                    </span>
                  </div>
                </div>
                
                {/* Actions based on Role and Status */}
                <div className="flex gap-2">
                  {/* MEMBER ACTIONS */}
                  {user.role === 'member' && task.status === 'todo' && (
                    <Button 
                        size="sm" 
                        className="bg-[#00F0FF]/20 text-[#00F0FF] hover:bg-[#00F0FF]/30 border border-[#00F0FF]/50"
                        onClick={() => updateTask(task.id, { status: 'in-progress' })}
                    >
                        <PlayCircle className="w-4 h-4 mr-1" /> Start
                    </Button>
                  )}
                  
                  {user.role === 'member' && task.status === 'in-progress' && (
                    <Button 
                        size="sm" 
                        className="bg-[#FFB800]/20 text-[#FFB800] hover:bg-[#FFB800]/30 border border-[#FFB800]/50"
                        onClick={() => submitForReview(task.id)}
                    >
                        Submit <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}

                  {/* QA ACTIONS */}
                  {(user.role === 'qa' || user.role === 'owner') && task.status === 'in-review' && (
                    <div className="flex gap-2">
                        <Button 
                            size="sm" 
                            className="bg-[#00FF88]/20 text-[#00FF88] hover:bg-[#00FF88]/30 border border-[#00FF88]/50"
                            onClick={() => approveTask(task.id)}
                        >
                            <ShieldCheck className="w-4 h-4 mr-1" /> Approve
                        </Button>
                        <Button 
                            size="sm" 
                            variant="destructive"
                            className="bg-[#FF3366]/20 text-[#FF3366] hover:bg-[#FF3366]/30 border border-[#FF3366]/50"
                            onClick={() => updateTask(task.id, { status: 'in-progress' })} // Send back
                        >
                            Reject
                        </Button>
                    </div>
                  )}
                  
                  {/* COMMON ACTIONS */}
                   {task.status !== 'done' && (
                     <Button
                        size="sm"
                        variant="ghost" 
                        className="text-[#8B9DC3] hover:text-[#FF3366] hover:bg-[#FF3366]/10"
                        onClick={() => updateTask(task.id, { status: 'blocked' })}
                     >
                        <AlertTriangle className="w-4 h-4" />
                     </Button>
                   )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
