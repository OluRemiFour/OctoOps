'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/lib/store';
import { AlertTriangle, Loader2 } from 'lucide-react';

export default function EditRiskModal() {
  const { activeModal, closeModal, modalData, updateRisk } = useAppStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [isSaving, setIsSaving] = useState(false);

  const isOpen = activeModal === 'edit-risk';

  useEffect(() => {
    if (isOpen && modalData) {
      setTitle(modalData.title || '');
      setDescription(modalData.description || '');
      setSeverity(modalData.severity || 'medium');
    }
  }, [isOpen, modalData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const riskId = modalData?._id || modalData?.id;
    if (!title || !riskId) return;

    setIsSaving(true);
    try {
        await updateRisk(riskId, { title, description, severity });
        closeModal();
    } catch (err) {
        console.error("Failed to update risk", err);
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) closeModal(); }}>
      <DialogContent className="glass border-[#FF3366]/30 bg-[#0A0E27]/95 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-bold text-[#E8F0FF] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF3366]/20 border-2 border-[#FF3366]/40 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-[#FF3366]" />
            </div>
            Edit Risk
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-[#FF3366] uppercase tracking-wider font-mono">Risk Title</label>
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

          <div className="space-y-2">
            <label className="text-sm font-bold text-[#FFB800] uppercase tracking-wider font-mono">Severity</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as any)}
              className="w-full glass border border-white/10 rounded-xl px-4 py-2 text-[#E8F0FF] bg-[#0A0E27]"
            >
              <option className='bg-[#0A0E27]' value="low">Low</option>
              <option className='bg-[#0A0E27]' value="medium">Medium</option>
              <option className='bg-[#0A0E27]' value="high">High</option>
              <option className='bg-[#0A0E27]' value="critical">Critical</option>
            </select>
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
              disabled={isSaving}
              className="flex-1 bg-[#FF3366] hover:bg-[#FF3366]/90 text-white font-bold"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
