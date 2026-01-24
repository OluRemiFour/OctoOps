'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { Plus, Mail, UserMinus, Shield, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { team as teamApi } from '@/lib/api';
import { useToast } from "@/components/ui/use-toast";

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  status?: string;
}

interface PendingInvite {
  _id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  invitedBy: {
    name: string;
    email: string;
  };
}

export default function TeamPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { project, openModal, isHydrated } = useAppStore();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  useEffect(() => {
    if (project?._id) {
      fetchTeamData();
    } else if (project === null) {
      setLoading(false);
    }
  }, [project]);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      const res = await teamApi.getMembers(project!._id as string);
      setMembers(res.data.members || []);
      setPendingInvites(res.data.pendingInvites || []);
    } catch (error) {
      console.error('Failed to fetch team:', error);
      toast({
        title: "Error",
        description: "Failed to load team data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    // Keep confirm as a safety check, but toast for result
    if (!confirm('Are you sure you want to remove this team member?')) return;
    
    setRemovingId(memberId);
    try {
      await teamApi.removeMember(memberId, project!._id as string);
      await fetchTeamData();
      toast({
        title: "Member Removed",
        description: "Team member has been successfully removed.",
      });
    } catch (error) {
      console.error('Failed to remove member:', error);
      toast({
        title: "Error",
        description: "Failed to remove team member.",
        variant: "destructive"
      });
    } finally {
      setRemovingId(null);
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    setCancelingId(inviteId);
    try {
      await teamApi.cancelInvite(inviteId);
      await fetchTeamData();
      toast({
        title: "Invite Canceled",
        description: "Invitation has been revoked.",
      });
    } catch (error) {
      console.error('Failed to cancel invite:', error);
      toast({
        title: "Error",
        description: "Failed to cancel invitation.",
        variant: "destructive"
      });
    } finally {
      setCancelingId(null);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return { bg: 'bg-[#9D4EDD]/20', text: 'text-[#9D4EDD]', border: 'border-[#9D4EDD]/30', icon: Shield };
      case 'qa':
        return { bg: 'bg-[#FFB800]/20', text: 'text-[#FFB800]', border: 'border-[#FFB800]/30', icon: CheckCircle };
      default:
        return { bg: 'bg-[#00F0FF]/20', text: 'text-[#00F0FF]', border: 'border-[#00F0FF]/30', icon: Shield };
    }
  };

  if (loading || !isHydrated) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00F0FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#8B9DC3]">Synchronizing Team Network...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#E8F0FF]">Team Management</h1>
          <p className="font-mono text-sm text-[#8B9DC3] mt-1">
            Manage team members and invitations
          </p>
        </div>
        {user?.role === 'owner' && (
          <Button
            onClick={() => openModal('invite-member')}
            className="bg-[#00FF88] text-[#0A0E27] hover:bg-[#00FF88]/90 font-bold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4 text-center">
          <div className="font-display text-2xl font-bold text-[#E8F0FF]">{members.length}</div>
          <div className="font-mono text-xs text-[#8B9DC3] mt-1">Total Members</div>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <div className="font-display text-2xl font-bold text-[#9D4EDD]">
            {members.filter(m => m.role === 'owner').length}
          </div>
          <div className="font-mono text-xs text-[#8B9DC3] mt-1">Owners</div>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <div className="font-display text-2xl font-bold text-[#00F0FF]">
            {members.filter(m => m.role === 'member').length}
          </div>
          <div className="font-mono text-xs text-[#8B9DC3] mt-1">Members</div>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <div className="font-display text-2xl font-bold text-[#FFB800]">{pendingInvites.length}</div>
          <div className="font-mono text-xs text-[#8B9DC3] mt-1">Pending Invites</div>
        </div>
      </div>

      {/* Team Members */}
      <div>
        <h2 className="font-display text-xl font-bold text-[#E8F0FF] mb-4">Team Members</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => {
            const roleBadge = getRoleBadge(member.role);
            const RoleIcon = roleBadge.icon;
            
            return (
              <div key={member._id} className="glass rounded-xl p-6 hover:border-[#00F0FF]/30 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#00F0FF]/20 flex items-center justify-center text-2xl">
                      {member.avatar || '👤'}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-[#E8F0FF]">{member.name}</h3>
                      <p className="text-xs text-[#8B9DC3]">{member.email}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                   <div className="flex items-center justify-between text-xs font-bold text-[#8B9DC3] uppercase tracking-wider">
                      <span>Recent Assignments</span>
                      <span className="text-[#00F0FF]">{useAppStore.getState().tasks.filter(t => t.assignee === member.email || t.assigneeName === member.name).length} Tasks</span>
                   </div>
                   <div className="space-y-1">
                      {useAppStore.getState().tasks
                        .filter(t => t.assignee === member.email || t.assigneeName === member.name)
                        .slice(0, 2)
                        .map(task => (
                           <div key={task.id} className="text-[10px] py-1 px-2 rounded bg-white/5 border border-white/10 text-[#E8F0FF] truncate">
                              • {task.title}
                           </div>
                        ))}
                   </div>
                </div>

                <div className="flex items-center justify-between mt-6">
                  <span className={`text-xs px-3 py-1 rounded-full border font-bold ${roleBadge.bg} ${roleBadge.text} ${roleBadge.border} flex items-center gap-1`}>
                    <RoleIcon className="w-3 h-3" />
                    {member.role.toUpperCase()}
                  </span>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toast({ title: "Briefing Sent", description: `Re-sent onboarding materials to ${member.name}.` })}
                      className="text-[#00FF88] hover:bg-[#00FF88]/10 text-[10px] font-bold h-7"
                    >
                      Invite
                    </Button>
                    {user?.role === 'owner' && member.role !== 'owner' && (
                        <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveMember(member._id)}
                        disabled={removingId === member._id}
                        className="text-[#FF3366] hover:bg-[#FF3366]/10 h-7"
                        >
                        {removingId === member._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserMinus className="w-4 h-4" />}
                        </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending Invitations */}
      {pendingInvites.length > 0 && (
        <div>
          <h2 className="font-display text-xl font-bold text-[#E8F0FF] mb-4">Pending Invitations</h2>
          <div className="space-y-3">
            {pendingInvites.map((invite) => {
              const roleBadge = getRoleBadge(invite.role);
              
              return (
                <div key={invite._id} className="glass rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#FFB800]/20 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-[#FFB800]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#E8F0FF]">{invite.email}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-bold ${roleBadge.bg} ${roleBadge.text} ${roleBadge.border}`}>
                          {invite.role.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#8B9DC3] mt-1">
                        <Clock className="w-3 h-3" />
                        Invited by {invite.invitedBy.name} • {new Date(invite.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {user?.role === 'owner' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCancelInvite(invite._id)}
                      disabled={cancelingId === invite._id}
                      className="text-[#FF3366] hover:bg-[#FF3366]/10"
                    >
                      {cancelingId === invite._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-1" />}
                      {cancelingId !== invite._id && 'Cancel'}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
