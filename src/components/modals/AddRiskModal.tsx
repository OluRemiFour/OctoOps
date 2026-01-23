'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/lib/store';
import { AlertTriangle, Plus } from 'lucide-react';
import { risks as risksApi } from '@/lib/api';

export default function AddRiskModal() {
  const { activeModal, closeModal, project, fetchRisks, addActivity, activateAgent } = useAppStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOpen = activeModal === 'add-risk';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !project?._id) return;

    setIsSubmitting(true);
    try {
      await risksApi.create({
        projectId: project._id,
        title,
        description,
        severity,
        detectedBy: 'manual'
      });
      
      addActivity({
        agent: 'Risk',
        action: `Manually added project risk: ${title}`,
        time: 'Just now'
      });
      
      activateAgent('Risk', 2000);
      await fetchRisks();
      resetForm();
      closeModal();
    } catch (error) {
      console.error('Failed to add risk:', error);
      alert('Failed to add risk. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSeverity('medium');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { resetForm(); closeModal(); } }}>
      <DialogContent className="glass border-[#FF3366]/30 bg-[#0A0E27]/95 max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-bold text-[#E8F0FF] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF3366]/20 border-2 border-[#FF3366]/40 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-[#FF3366]" />
            </div>
            Report New Risk
          </DialogTitle>
          <DialogDescription className="font-mono text-sm text-[#8B9DC3]">
            Manually log a potential project bottleneck or threat
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-[#E8F0FF]">Risk Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., API Rate Limiting"
              className="glass border-white/10 text-[#E8F0FF]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-[#E8F0FF]">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the potential impact..."
              className="glass border-white/10 text-[#E8F0FF] min-h-[100px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity" className="text-[#E8F0FF]">Severity Level</Label>
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger className="glass border-white/10 text-[#E8F0FF]">
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent className="glass bg-[#0A0E27] border-white/10">
                <SelectItem value="low" className="text-[#00FF88]">Low</SelectItem>
                <SelectItem value="medium" className="text-[#00F0FF]">Medium</SelectItem>
                <SelectItem value="high" className="text-[#FFB800]">High</SelectItem>
                <SelectItem value="critical" className="text-[#FF3366]">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={closeModal}
              className="flex-1 text-[#8B9DC3] hover:text-[#E8F0FF]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#FF3366] hover:bg-[#FF3366]/90 text-white font-bold glow-red"
            >
              {isSubmitting ? 'Logging...' : 'Log Risk'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
