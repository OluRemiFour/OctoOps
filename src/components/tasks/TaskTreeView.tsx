'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, MoreVertical, Clock, AlertCircle, CheckCircle2, Edit2, Trash2, Play, Pause, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAppStore, Task } from '@/lib/store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Beta Release Milestone',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Sarah Chen',
    deadline: 'Mar 18',
    subtasks: [
      {
        id: '1-1',
        title: 'Complete final UI polish',
        status: 'in-progress',
        priority: 'medium',
        assignee: 'Mike Johnson',
        deadline: 'Mar 15',
        subtasks: [
          { id: '1-1-1', title: 'Fix navigation animations', status: 'done', priority: 'low', assignee: 'Mike', deadline: 'Mar 12' },
          { id: '1-1-2', title: 'Update color scheme', status: 'in-progress', priority: 'medium', assignee: 'Mike', deadline: 'Mar 14' },
        ]
      },
      {
        id: '1-2',
        title: 'Run security audit',
        status: 'todo',
        priority: 'critical',
        assignee: 'David Lee',
        deadline: 'Mar 16',
      },
      {
        id: '1-3',
        title: 'Prepare beta documentation',
        status: 'done',
        priority: 'low',
        assignee: 'Emma Wilson',
        deadline: 'Mar 10',
      },
    ]
  },
  {
    id: '2',
    title: 'Marketing Campaign',
    status: 'in-progress',
    priority: 'medium',
    assignee: 'Lisa Parker',
    deadline: 'Mar 25',
    subtasks: [
      { id: '2-1', title: 'Create social media content', status: 'in-progress', priority: 'medium', assignee: 'Lisa', deadline: 'Mar 20' },
      { id: '2-2', title: 'Design email templates', status: 'todo', priority: 'low', assignee: 'John', deadline: 'Mar 22' },
      { id: '2-3', title: 'Schedule promotional posts', status: 'blocked', priority: 'medium', assignee: 'Lisa', deadline: 'Mar 24' },
    ]
  },
  {
    id: '3',
    title: 'Public Launch',
    status: 'todo',
    priority: 'critical',
    assignee: 'Sarah Chen',
    deadline: 'Apr 1',
    subtasks: [
      { id: '3-1', title: 'Deploy to production', status: 'todo', priority: 'critical', assignee: 'DevOps', deadline: 'Apr 1' },
      { id: '3-2', title: 'Monitor initial metrics', status: 'todo', priority: 'high', assignee: 'Sarah', deadline: 'Apr 2' },
    ]
  },
];

export default function TaskTreeView() {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set(['1', '2']));
  const { tasks, updateTask, deleteTask, selectedTasks, toggleTaskSelection, activateAgent, addActivity, addNotification } = useAppStore();
  
  // Use tasks from store or fall back to sample
  const displayTasks = tasks.length > 0 ? tasks : sampleTasks;

  const toggleExpand = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const cycleStatus = (task: Task) => {
    const statusOrder: Array<'todo' | 'in-progress' | 'in-review' | 'done' | 'blocked'> = ['todo', 'in-progress', 'in-review', 'done', 'blocked'];
    const currentIndex = statusOrder.indexOf(task.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    
    updateTask(task.id, { status: nextStatus });
    activateAgent('Execution', 2000);
    addActivity({
      agent: 'Execution',
      action: `Task "${task.title}" status changed to ${nextStatus}`,
      time: 'Just now',
    });
    
    if (nextStatus === 'done') {
      addNotification({
        agent: 'Execution',
        title: 'Task Completed',
        message: `"${task.title}" has been marked as done`,
        type: 'success',
        read: false,
      });
    }
  };

  const handleDelete = (taskId: string, taskTitle: string) => {
    deleteTask(taskId);
    addActivity({
      agent: 'Planner',
      action: `Deleted task: ${taskTitle}`,
      time: 'Just now',
    });
    activateAgent('Planner', 1500);
  };

  const renderTask = (task: Task, level: number = 0) => {
    const isExpanded = expandedTasks.has(task.id);
    const hasSubtasks = task.subtasks && task.subtasks.length > 0;
    
    const statusConfig = {
      'todo': { color: '#8B9DC3', label: 'To Do', icon: Clock },
      'in-progress': { color: '#00F0FF', label: 'In Progress', icon: Clock },
      'in-review': { color: '#9D4EDD', label: 'In Review', icon: Zap },
      'done': { color: '#00FF88', label: 'Done', icon: CheckCircle2 },
      'blocked': { color: '#FF3366', label: 'Blocked', icon: AlertCircle }
    };

    const config = statusConfig[task.status];
    const StatusIcon = config.icon;

    return (
      <div key={task.id}>
        <div
          className={`group glass rounded-2xl p-5 mb-4 transition-all duration-200 hover:-translate-y-1 cursor-pointer ${
            task.status === 'blocked' ? 'border-2 border-[#FF3366]/40 animate-pulse' : 'border-2 border-transparent'
          }`}
          style={{ marginLeft: `${level * 32}px` }}
        >
          <div className="flex items-center gap-4">
            {/* Expand/Collapse */}
            {hasSubtasks ? (
              <button
                onClick={() => toggleExpand(task.id)}
                className="w-8 h-8 rounded-xl glass flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-[#00F0FF]" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-[#8B9DC3]" />
                )}
              </button>
            ) : (
              <div className="w-8" />
            )}

            {/* Status Icon - Clickable to cycle status */}
            <button
              onClick={(e) => { e.stopPropagation(); cycleStatus(task); }}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110 hover:ring-2 hover:ring-white/20"
              style={{
                backgroundColor: `${config.color}15`,
                border: `2px solid ${config.color}40`
              }}
              title="Click to change status"
            >
              <StatusIcon className="w-5 h-5" style={{ color: config.color }} />
            </button>

            {/* Task Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-display text-lg font-bold text-[#E8F0FF]">
                  {task.title}
                </h3>
                <Badge
                  variant="outline"
                  className="font-mono text-xs"
                  style={{
                    backgroundColor: `${config.color}10`,
                    borderColor: `${config.color}40`,
                    color: config.color
                  }}
                >
                  {config.label}
                </Badge>
              </div>
              <div className="flex items-center gap-4 font-mono text-sm text-[#8B9DC3]">
                <span>👤 {task.assignee}</span>
                <span>📅 {task.deadline}</span>
                {hasSubtasks && (
                  <span>
                    {task.subtasks!.filter(t => t.status === 'done').length}/{task.subtasks!.length} subtasks
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-10 h-10 rounded-xl glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10">
                  <MoreVertical className="w-5 h-5 text-[#8B9DC3]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="glass bg-[#0A0E27]/95 border-[#00F0FF]/30">
                <DropdownMenuItem 
                  className="font-mono text-sm text-[#E8F0FF] hover:bg-[#00F0FF]/10 cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); cycleStatus(task); }}
                >
                  <Play className="w-4 h-4 mr-2 text-[#00F0FF]" />
                  Change Status
                </DropdownMenuItem>
                <DropdownMenuItem className="font-mono text-sm text-[#E8F0FF] hover:bg-[#00F0FF]/10 cursor-pointer">
                  <Edit2 className="w-4 h-4 mr-2 text-[#FFB800]" />
                  Edit Task
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#00F0FF]/10" />
                <DropdownMenuItem 
                  className="font-mono text-sm text-[#FF3366] hover:bg-[#FF3366]/10 cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); handleDelete(task.id, task.title); }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Subtasks */}
        {hasSubtasks && isExpanded && (
          <div>
            {task.subtasks!.map(subtask => renderTask(subtask, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {displayTasks.map(task => renderTask(task))}
    </div>
  );
}
