'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/lib/store';
import { Plus, Zap } from 'lucide-react';

export default function AddTaskModal() {
  const { activeModal, closeModal, addTask, team, activateAgent } = useAppStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [status, setStatus] = useState<'todo' | 'in-progress'>('todo');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOpen = activeModal === 'add-task';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !assignee || !deadline) return;

    setIsSubmitting(true);
    activateAgent('Planner', 2000);

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    addTask({
      title,
      description,
      assignee,
      deadline,
      priority,
      status,
    });

    setIsSubmitting(false);
    resetForm();
    closeModal();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setAssignee('');
    setDeadline('');
    setPriority('medium');
    setStatus('todo');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="glass border-[#00F0FF]/30 bg-[#0A0E27]/95 max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-bold text-[#E8F0FF] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00F0FF]/20 border-2 border-[#00F0FF]/40 flex items-center justify-center">
              <Plus className="w-5 h-5 text-[#00F0FF]" />
            </div>
            Add New Task
          </DialogTitle>
          <DialogDescription className="font-mono text-sm text-[#8B9DC3]">
            Create a new task and let the Planner Agent optimize your timeline
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="font-display text-sm font-bold text-[#E8F0FF]">
              Task Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
              className="glass border-[#00F0FF]/20 focus:border-[#00F0FF]/60 bg-transparent font-mono text-[#E8F0FF] placeholder:text-[#8B9DC3]/50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-display text-sm font-bold text-[#E8F0FF]">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add task description..."
              className="glass border-[#00F0FF]/20 focus:border-[#00F0FF]/60 bg-transparent font-mono text-[#E8F0FF] placeholder:text-[#8B9DC3]/50 min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignee" className="font-display text-sm font-bold text-[#E8F0FF]">
                Assignee
              </Label>
              <Select value={assignee} onValueChange={setAssignee} required>
                <SelectTrigger className="glass border-[#00F0FF]/20 focus:border-[#00F0FF]/60 bg-transparent font-mono text-[#E8F0FF]">
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent className="glass bg-[#0A0E27]/95 border-[#00F0FF]/30">
                  {team.map((member) => (
                    <SelectItem key={member._id || member.id || member.email} value={member.name} className="font-mono text-[#E8F0FF] hover:bg-[#00F0FF]/10">
                      <span className="flex items-center gap-2">
                        <span>{member.avatar}</span>
                        {member.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline" className="font-display text-sm font-bold text-[#E8F0FF]">
                Deadline
              </Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="glass border-[#00F0FF]/20 focus:border-[#00F0FF]/60 bg-transparent font-mono text-[#E8F0FF]"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="font-display text-sm font-bold text-[#E8F0FF]">Priority</Label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high', 'critical'] as const).map((p) => (
                <Button
                  key={p}
                  type="button"
                  size="sm"
                  onClick={() => setPriority(p)}
                  className={`flex-1 capitalize font-mono text-xs ${
                    priority === p 
                      ? 'bg-[#00F0FF]/20 border-2 border-[#00F0FF]/40 text-[#00F0FF]' 
                      : 'glass border-white/5 text-[#8B9DC3] hover:bg-white/5'
                  }`}
                >
                  {p}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-display text-sm font-bold text-[#E8F0FF]">Initial Status</Label>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={status === 'todo' ? 'default' : 'outline'}
                onClick={() => setStatus('todo')}
                className={`flex-1 rounded-xl ${
                  status === 'todo'
                    ? 'bg-[#8B9DC3]/20 border-2 border-[#8B9DC3]/40 text-[#8B9DC3]'
                    : 'glass border-[#00F0FF]/20 text-[#8B9DC3]'
                }`}
              >
                To Do
              </Button>
              <Button
                type="button"
                variant={status === 'in-progress' ? 'default' : 'outline'}
                onClick={() => setStatus('in-progress')}
                className={`flex-1 rounded-xl ${
                  status === 'in-progress'
                    ? 'bg-[#00F0FF]/20 border-2 border-[#00F0FF]/40 text-[#00F0FF]'
                    : 'glass border-[#00F0FF]/20 text-[#8B9DC3]'
                }`}
              >
                In Progress
              </Button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                closeModal();
              }}
              className="flex-1 glass border-[#8B9DC3]/30 text-[#8B9DC3] hover:bg-white/5 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !title || !assignee || !deadline}
              className="flex-1 bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-[#0A0E27] font-display font-bold rounded-xl glow-cyan disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4 animate-pulse" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create Task
                </span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
