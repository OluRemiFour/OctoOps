'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/lib/store';
import { Edit3 } from 'lucide-react';

export default function EditTaskModal() {
  const { activeModal, closeModal, modalData, updateTask } = useAppStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [status, setStatus] = useState<'todo' | 'in-progress' | 'in-review' | 'done' | 'blocked'>('todo');
  const [deadline, setDeadline] = useState('');

  const isOpen = activeModal === 'edit-task';

  useEffect(() => {
    if (isOpen && modalData) {
      setTitle(modalData.title || '');
      setDescription(modalData.description || '');
      setPriority(modalData.priority || 'medium');
      setStatus(modalData.status || 'todo');
      setDeadline(modalData.deadline || '');
    }
  }, [isOpen, modalData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const taskId = modalData?._id || modalData?.id;
    if (!title || !taskId) return;

    await updateTask(taskId, {
      title,
      description,
      priority,
      status,
      deadline
    });

    closeModal();
    setTitle('');
    setDescription('');
    setPriority('medium');
    setStatus('todo');
    setDeadline('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) closeModal(); }}>
      <DialogContent className="glass border-[#00F0FF]/30 bg-[#0A0E27]/95 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-bold text-[#E8F0FF] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00F0FF]/20 border-2 border-[#00F0FF]/40 flex items-center justify-center">
              <Edit3 className="w-5 h-5 text-[#00F0FF]" />
            </div>
            Edit Task
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#00F0FF] uppercase tracking-wider font-mono">Task Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="glass border-white/10"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-[#8B9DC3] uppercase tracking-wider font-mono">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="glass border-white/10 min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#FFB800] uppercase tracking-wider font-mono">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high' | 'critical')}
                className="w-full glass border border-white/10 rounded-xl px-4 py-2 text-[#E8F0FF] bg-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#9D4EDD] uppercase tracking-wider font-mono">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'todo' | 'in-progress' | 'in-review' | 'done' | 'blocked')}
                className="w-full glass border border-white/10 rounded-xl px-4 py-2 text-[#E8F0FF] bg-transparent"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="in-review">In Review</option>
                <option value="done">Done</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-[#00FF88] uppercase tracking-wider font-mono">Deadline</label>
            <Input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="glass border-white/10"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => closeModal()}
              className="flex-1 text-[#8B9DC3] hover:text-[#E8F0FF]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-[#0A0E27] font-bold"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
