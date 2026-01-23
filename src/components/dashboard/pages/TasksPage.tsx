'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { Plus, Search, Filter, Calendar, User, Flag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function TasksPage() {
  const { user } = useAuth();
  const { tasks, openModal, updateTask, deleteTask: removeTask, isHydrated, project } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    
    // ROLE-BASED FILTERING: Members only see their own tasks
    const isOwner = user?.role === 'owner';
    const assigneeData = task.assignee as any;
    
    const matchesRole = isOwner ? true : (
      assigneeData?.name === user?.name || 
      assigneeData?.email === user?.email || 
      task.assigneeName === user?.name ||
      task.assigneeEmail === user?.email ||
      assigneeData === user?.email // Fallback for simple string email
    );

    return matchesSearch && matchesStatus && matchesPriority && matchesRole;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-[#00FF88]/20 text-[#00FF88] border-[#00FF88]/30';
      case 'in-review': return 'bg-[#FFB800]/20 text-[#FFB800] border-[#FFB800]/30';
      case 'blocked': return 'bg-[#FF3366]/20 text-[#FF3366] border-[#FF3366]/30';
      case 'in-progress': return 'bg-[#00F0FF]/20 text-[#00F0FF] border-[#00F0FF]/30';
      default: return 'bg-[#8B9DC3]/20 text-[#8B9DC3] border-[#8B9DC3]/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-[#FF3366]';
      case 'high': return 'text-[#FFB800]';
      case 'medium': return 'text-[#00F0FF]';
      default: return 'text-[#8B9DC3]';
    }
  };

  if (!isHydrated) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00FF88] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#8B9DC3] font-mono text-xs uppercase tracking-widest">Reconstructing Task Grid...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center h-[60vh]">
        <div className="text-center glass p-12 rounded-3xl border border-white/10 shadow-2xl">
          <div className="w-20 h-20 bg-[#00FF88]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#00FF88]/30">
            <Calendar className="w-10 h-10 text-[#00FF88]" />
          </div>
          <h2 className="text-2xl font-bold text-[#E8F0FF] mb-2 tracking-tight">No Project Active</h2>
          <p className="text-[#8B9DC3] mb-8 font-mono text-sm max-w-sm mx-auto leading-relaxed">
            Every mission needs a plan. Create a project to start tracking your milestones and tasks.
          </p>
          <Button onClick={() => openModal('project-vision')} className="bg-[#00FF88] text-[#0A0E27] font-bold px-8 h-12 rounded-xl glow-green hover:scale-105 transition-transform">
            Launch Onboarding
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#E8F0FF]">Tasks</h1>
          <p className="font-mono text-sm text-[#8B9DC3] mt-1">
            Manage and track all project tasks
          </p>
        </div>
        <Button
          onClick={() => openModal('add-task')}
          className="bg-[#00FF88] text-[#0A0E27] hover:bg-[#00FF88]/90 font-bold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B9DC3]" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass border-white/10"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="glass border border-white/10 rounded-xl px-4 py-2 text-[#E8F0FF] bg-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="in-review">In Review</option>
            <option value="done">Done</option>
            <option value="blocked">Blocked</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="glass border border-white/10 rounded-xl px-4 py-2 text-[#E8F0FF] bg-transparent"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', count: tasks.length, color: '#E8F0FF' },
          { label: 'To Do', count: tasks.filter(t => t.status === 'todo').length, color: '#8B9DC3' },
          { label: 'In Progress', count: tasks.filter(t => t.status === 'in-progress').length, color: '#00F0FF' },
          { label: 'In Review', count: tasks.filter(t => t.status === 'in-review').length, color: '#FFB800' },
          { label: 'Done', count: tasks.filter(t => t.status === 'done').length, color: '#00FF88' },
        ].map((stat, idx) => (
          <div key={idx} className="glass rounded-xl p-4 text-center">
            <div className="font-display text-2xl font-bold" style={{ color: stat.color }}>
              {stat.count}
            </div>
            <div className="font-mono text-xs text-[#8B9DC3] mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 mx-auto mb-4 flex items-center justify-center">
              <Search className="w-8 h-8 text-[#8B9DC3]" />
            </div>
            <h3 className="font-display text-xl font-bold text-[#E8F0FF] mb-2">No tasks found</h3>
            <p className="text-[#8B9DC3] font-mono text-sm">
              {searchQuery || filterStatus !== 'all' || filterPriority !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first task to get started'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className="glass rounded-xl p-4 hover:border-[#00F0FF]/30 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-display text-lg font-bold text-[#E8F0FF]">
                      {task.title}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full border font-bold ${getStatusColor(task.status)}`}>
                      {task.status.replace('-', ' ').toUpperCase()}
                    </span>
                    <Flag className={`w-4 h-4 ${getPriorityColor(task.priority || 'medium')}`} />
                  </div>

                  {task.description && (
                    <p className="text-sm text-[#8B9DC3] mb-3">{task.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-[#8B9DC3]">
                    {task.assigneeName && (
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {task.assigneeName}
                      </div>
                    )}
                    {task.deadline && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(task.deadline).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openModal('edit-task', task)}
                    className="text-[#00F0FF] hover:bg-[#00F0FF]/10"
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeTask(task.id)}
                    className="text-[#FF3366] hover:bg-[#FF3366]/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
