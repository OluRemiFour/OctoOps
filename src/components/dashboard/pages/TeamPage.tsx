'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { Plus, Mail, UserMinus, Shield, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { team as teamApi } from '@/lib/api';

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
  const { project, openModal, isHydrated } = useAppStore();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    
    try {
      await teamApi.removeMember(memberId, project!._id as string);
      await fetchTeamData();
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    try {
      await teamApi.cancelInvite(inviteId);
      await fetchTeamData();
    } catch (error) {
      console.error('Failed to cancel invite:', error);
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

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center h-[60vh]">
        <div className="text-center glass p-12 rounded-3xl border border-white/10">
          <h2 className="text-2xl font-bold text-[#E8F0FF] mb-2">No Project Active</h2>
          <p className="text-[#8B9DC3] mb-6">Create or select a project to manage your team.</p>
          <Button onClick={() => openModal('create-project')} className="bg-[#00FF88] text-[#0A0E27]">Create Project</Button>
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
            onClick={() => openModal('invite-team')}
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

                <div className="flex items-center justify-between">
                  <span className={`text-xs px-3 py-1 rounded-full border font-bold ${roleBadge.bg} ${roleBadge.text} ${roleBadge.border} flex items-center gap-1`}>
                    <RoleIcon className="w-3 h-3" />
                    {member.role.toUpperCase()}
                  </span>

                  {user?.role === 'owner' && member.role !== 'owner' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveMember(member._id)}
                      className="text-[#FF3366] hover:bg-[#FF3366]/10"
                    >
                      <UserMinus className="w-4 h-4" />
                    </Button>
                  )}
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
                      className="text-[#FF3366] hover:bg-[#FF3366]/10"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Cancel
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
