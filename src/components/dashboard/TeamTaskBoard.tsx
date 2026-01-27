'use client';

import React, { useState } from 'react';
import { useAppStore, Task } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { CheckCircle, Clock, AlertTriangle, ArrowRight, ShieldCheck, PlayCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CountdownTimer from './CountdownTimer';

export default function TeamTaskBoard() {
  const { user } = useAuth();
  const { tasks, updateTask, submitForReview, approveTask } = useAppStore();
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);

  const handleAction = async (taskId: string, action: () => Promise<void>) => {
    if (!taskId) return;
    setLoadingTaskId(taskId);
    try {
        await action();
    } finally {
        setLoadingTaskId(null);
    }
  };

  if (!user) return null;

  // Filter tasks based on role
  const myTasks = tasks.filter((task) => {
    if (user.role === 'owner') return true; 
    const isAssignee = task.assignee === user.name || task.assigneeEmail === user.email || task.assigneeName === user.name;
    if (user.role === 'qa') return task.status === 'in-review' || isAssignee;
    return isAssignee;
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
              key={task._id || task.id}
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
                    <CountdownTimer deadline={task.deadline} status={task.status} />
                    <span className="font-mono text-xs text-[#8B9DC3] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {task.deadline}
                    </span>
                  </div>
                  {/* COMPLETION NOTES / DESCRIPTION for QA */}
                  {task.description && (
                    <div className="mb-3 p-3 rounded-lg bg-[#0A0E27]/50 border border-white/5 text-xs text-[#8B9DC3] font-mono whitespace-pre-wrap">
                        {task.description.length > 150 && user.role === 'member' 
                            ? task.description.substring(0, 150) + "..." 
                            : task.description}
                    </div>
                  )}
                </div>
                
                {/* Actions based on Role and Status */}
                <div className="flex gap-2">
                  {/* MEMBER ACTIONS */}
                  {user.role === 'member' && task.status === 'todo' && (
                    <Button 
                        size="sm" 
                        disabled={loadingTaskId === (task._id || task.id)}
                        className="bg-[#00F0FF]/20 text-[#00F0FF] hover:bg-[#00F0FF]/30 border border-[#00F0FF]/50"
                        onClick={() => handleAction(task._id || task.id, () => updateTask(task._id || task.id, { status: 'in-progress' }))}
                    >
                        {loadingTaskId === (task._id || task.id) ? <Loader2 className="w-4 h-4 animate-spin" /> : <><PlayCircle className="w-4 h-4 mr-1" /> Start</>}
                    </Button>
                  )}
                  
                  {user.role === 'member' && task.status === 'in-progress' && (
                    <Button 
                        size="sm" 
                        disabled={loadingTaskId === (task._id || task.id)}
                        className="bg-[#FFB800]/20 text-[#FFB800] hover:bg-[#FFB800]/30 border border-[#FFB800]/50"
                        onClick={() => handleAction(task._id || task.id, () => submitForReview(task._id || task.id))}
                    >
                        {loadingTaskId === (task._id || task.id) ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Submit <ArrowRight className="w-4 h-4 ml-1" /></>}
                    </Button>
                  )}

                  {/* QA ACTIONS */}
                  {(user.role === 'qa' || user.role === 'owner') && task.status === 'in-review' && (
                    <div className="flex gap-2">
                        <Button 
                            size="sm" 
                            disabled={loadingTaskId === (task._id || task.id)}
                            className="bg-[#00FF88]/20 text-[#00FF88] hover:bg-[#00FF88]/30 border border-[#00FF88]/50"
                            onClick={() => handleAction(task._id || task.id, () => approveTask(task._id || task.id))}
                        >
                            {loadingTaskId === (task._id || task.id) ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ShieldCheck className="w-4 h-4 mr-1" /> Approve</>}
                        </Button>
                        <Button 
                            size="sm" 
                            variant="destructive"
                            disabled={loadingTaskId === (task._id || task.id)}
                            className="bg-[#FF3366]/20 text-[#FF3366] hover:bg-[#FF3366]/30 border border-[#FF3366]/50"
                            onClick={() => handleAction(task._id || task.id, () => updateTask(task._id || task.id, { status: 'in-progress' }))}
                        >
                            {loadingTaskId === (task._id || task.id) ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reject'}
                        </Button>
                    </div>
                  )}
                  
                  {/* COMMON ACTIONS */}
                   {task.status !== 'done' && (
                     <Button
                        size="sm"
                        variant="ghost" 
                        disabled={loadingTaskId === (task._id || task.id)}
                        className="text-[#8B9DC3] hover:text-[#FF3366] hover:bg-[#FF3366]/10"
                        onClick={() => handleAction(task._id || task.id, () => updateTask(task._id || task.id, { status: 'blocked' }))}
                     >
                        {loadingTaskId === (task._id || task.id) ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
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
