'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { AlertTriangle, Archive } from 'lucide-react';

export default function ArchiveConfirmModal() {
  const { activeModal, closeModal, openModal } = useAppStore();
  const isOpen = activeModal === 'archive-confirm';

  const handleConfirm = () => {
    openModal('celebration');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) closeModal(); }}>
      <DialogContent className="glass border-[#FF3366]/30 bg-[#0A0E27]/95 max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-bold text-[#E8F0FF] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF3366]/20 border-2 border-[#FF3366]/40 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-[#FF3366]" />
            </div>
            Complete Mission?
          </DialogTitle>
          <DialogDescription className="font-mono text-sm text-[#8B9DC3] pt-2">
            This action will archive the current project and reset your dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="p-4 rounded-xl bg-[#FFB800]/10 border border-[#FFB800]/20">
            <h4 className="font-bold text-[#FFB800] mb-2 flex items-center gap-2">
              <Archive className="w-4 h-4" />
              What happens next:
            </h4>
            <ul className="text-sm text-[#8B9DC3] space-y-1 ml-6 list-disc">
              <li>Project marked as completed</li>
              <li>Dashboard reset for new project</li>
              <li>History preserved in archives</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => closeModal()}
              className="flex-1 text-[#8B9DC3] hover:text-[#E8F0FF]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0A0E27] font-bold glow-green"
            >
              Confirm & Archive
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
