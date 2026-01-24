'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { team as teamApi } from '@/lib/api';
import { UserPlus, MessageSquare } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const roles = [
  'Project Lead',
  'Frontend Developer',
  'Backend Developer',
  'Fullstack Developer',
  'UI/UX Designer',
  'QA Engineer',
  'Mobile Developer',
  'DevOps Engineer',
  'Content Creator',
  'Marketing Manager',
  'Technical Writer',
];

const avatars = ['👨‍💻', '👩‍💻', '👨‍🎨', '👩‍🎨', '🧑‍💼', '👨‍💼', '👩‍💼', '🧑‍🔧', '👨‍🔬', '👩‍🔬'];

export default function InviteMemberModal() {
  const { activeModal, closeModal, addTeamMember, activateAgent, addNotification } = useAppStore();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [avatar, setAvatar] = useState('👨‍💻');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOpen = activeModal === 'invite-member';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !role) return;

    setIsSubmitting(true);
    activateAgent('Communication', 2000);

    const { user: authUser } = useAuth();

    // Real Invitation API call
    try {
        await teamApi.invite({
            email,
            role,
            projectId: useAppStore.getState().project?._id,
            invitedBy: authUser?.id || '507f1f77bcf86cd799439011',
            name // Passing name too if supported
        });

        addNotification({
            agent: 'Communication',
            title: 'Team Invitation Sent',
            message: `Invitation sent to ${name} (${email})`,
            type: 'success',
            read: false,
        });
        
        await useAppStore.getState().fetchTeam();
        toast({
            title: "Invitation Sent",
            description: `Invitation sent to ${name} (${email})`,
        });
    } catch (err) {
        console.error("Failed to send invite:", err);
        toast({
            title: "Error",
            description: "System error: Could not transmit invitation data.",
            variant: "destructive"
        });
    }
    setIsSubmitting(false);
    resetForm();
    closeModal();
  };
 
  const resetForm = () => {
    setName('');
    setEmail('');
    setRole('');
    setAvatar('👨‍💻');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="glass border-[#00FF88]/30 bg-[#0A0E27]/95 max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-bold text-[#E8F0FF] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00FF88]/20 border-2 border-[#00FF88]/40 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-[#00FF88]" />
            </div>
            Invite Team Member
          </DialogTitle>
          <DialogDescription className="font-mono text-sm text-[#8B9DC3]">
            Add a new member to your project team
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label className="font-display text-sm font-bold text-[#E8F0FF]">Avatar</Label>
            <div className="flex gap-2 flex-wrap">
              {avatars.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAvatar(a)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-200 ${
                    avatar === a
                      ? 'bg-[#00FF88]/20 border-2 border-[#00FF88]/60 scale-110'
                      : 'glass border-transparent hover:border-[#00FF88]/30'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="font-display text-sm font-bold text-[#E8F0FF]">
              Full Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name..."
              className="glass border-[#00FF88]/20 focus:border-[#00FF88]/60 bg-transparent font-mono text-[#E8F0FF] placeholder:text-[#8B9DC3]/50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="font-display text-sm font-bold text-[#E8F0FF]">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="glass border-[#00FF88]/20 focus:border-[#00FF88]/60 bg-transparent font-mono text-[#E8F0FF] placeholder:text-[#8B9DC3]/50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="font-display text-sm font-bold text-[#E8F0FF]">
              Role
            </Label>
            <Select value={role} onValueChange={setRole} required>
              <SelectTrigger className="glass border-[#00FF88]/20 focus:border-[#00FF88]/60 bg-transparent font-mono text-[#E8F0FF]">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent className="glass bg-[#0A0E27]/95 border-[#00FF88]/30">
                {roles.map((r) => (
                  <SelectItem key={r} value={r} className="font-mono text-[#E8F0FF] hover:bg-[#00FF88]/10">
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              disabled={isSubmitting || !name || !email || !role}
              className="flex-1 bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0A0E27] font-display font-bold rounded-xl glow-green disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 animate-pulse" />
                  Sending...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Send Invite
                </span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
