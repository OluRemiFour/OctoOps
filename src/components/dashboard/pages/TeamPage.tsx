'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { Plus, Mail, UserMinus, Shield, Clock, CheckCircle, XCircle, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { team as teamApi } from '@/lib/api';
import { useToast } from "@/components/ui/use-toast";
import { socket } from '@/lib/socket';
import { formatDate } from '@/lib/dateUtils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ROLES = [
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
  'Other',
];

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  title?: string;
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
  const { project, openModal, isHydrated, tasks } = useAppStore();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);

  useEffect(() => {
    if (project?._id) {
      fetchTeamData();

      // Join project room
      socket.emit('join-project', project._id);

      // Listen for team updates
      socket.on('team-updated', (data) => {
        if (data.projectId === project._id) {
          fetchTeamData();
          if (data.newMember) {
            toast({
              title: "Network Expansion",
              description: `${data.newMember.name} has joined the mission.`,
            });
          }
        }
      });

      socket.on('tasks-updated', (data) => {
        if (data.projectId === project._id) {
          useAppStore.getState().fetchTasks(); 
        }
      });

      return () => {
        socket.emit('leave-project', project._id);
        socket.off('team-updated');
        socket.off('tasks-updated');
      };
    } else if (project === null) {
      setLoading(false);
    }
  }, [project?._id]);
Nodes: TeamPage

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
    setRemovingId(memberId);
    try {
      await teamApi.removeMember(memberId, project!._id as string);
      await fetchTeamData();
      toast({
        title: "Member Removed",
        description: "Team member has been successfully removed.",
      });
    } catch (error: any) {
      console.error('Failed to remove member:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to remove team member.",
        variant: "destructive"
      });
    } finally {
      setRemovingId(null);
      setMemberToRemove(null);
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

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await teamApi.updateRole(userId, newRole);
      await fetchTeamData();
      toast({
        title: "Role Updated",
        description: `Successfully reassigned to ${newRole.toUpperCase()}.`,
      });
    } catch (error: any) {
      console.error('Failed to update role:', error);
      toast({
        title: "Update Failed",
        description: error.response?.data?.error || "Failed to update member role.",
        variant: "destructive"
      });
    }
  };

  const getRoleBadge = (role: string, title?: string) => {
    const roleKey = (title || role || '').toLowerCase();
    
    // Owner: Royal Purple
    if (role === 'owner') {
      return { 
        bg: 'bg-[#9D4EDD]/20', 
        text: 'text-[#9D4EDD]', 
        border: 'border-[#9D4EDD]/40', 
        glow: 'shadow-[0_0_15px_rgba(157,78,221,0.3)]',
        icon: Shield 
      };
    }
    
    // Lead: Deep Purple
    if (roleKey.includes('lead')) {
      return { 
        bg: 'bg-[#9D4EDD]/20', 
        text: 'text-[#9D4EDD]', 
        border: 'border-[#9D4EDD]/40', 
        glow: 'shadow-[0_0_15px_rgba(157,78,221,0.3)]',
        icon: Shield 
      };
    }

    // QA: Vibrant Gold (The most important requested aesthetic)
    if (roleKey.includes('qa') || roleKey.includes('test') || roleKey.includes('reviewer')) {
      return { 
        bg: 'bg-[#FFB800]/20', 
        text: 'text-[#FFB800]', 
        border: 'border-[#FFB800]/50', 
        glow: 'shadow-[0_0_20px_rgba(255,184,0,0.4)] animate-pulse',
        icon: CheckCircle 
      };
    }

    // Engineeres: Cyber Cyan
    if (roleKey.includes('dev') || roleKey.includes('engineer') || roleKey.includes('mobile') || roleKey.includes('backend')) {
      return { 
        bg: 'bg-[#00F0FF]/20', 
        text: 'text-[#00F0FF]', 
        border: 'border-[#00F0FF]/40', 
        glow: 'shadow-[0_0_15px_rgba(0,240,255,0.3)]',
        icon: Shield 
      };
    }

    // Designers: Hot Pink/Red
    if (roleKey.includes('design') || roleKey.includes('ui') || roleKey.includes('ux')) {
      return { 
        bg: 'bg-[#FF3366]/20', 
        text: 'text-[#FF3366]', 
        border: 'border-[#FF3366]/40', 
        glow: 'shadow-[0_0_15px_rgba(255,51,102,0.3)]',
        icon: Shield 
      };
    }

    // DevOps: Emerald Green
    if (roleKey.includes('devops') || roleKey.includes('deploy')) {
      return { 
        bg: 'bg-[#00FF88]/20', 
        text: 'text-[#00FF88]', 
        border: 'border-[#00FF88]/40', 
        glow: 'shadow-[0_0_15px_rgba(0,255,136,0.3)]',
        icon: Shield 
      };
    }
    
    return { 
        bg: 'bg-[#8B9DC3]/20', 
        text: 'text-[#8B9DC3]', 
        border: 'border-[#8B9DC3]/30', 
        glow: '',
        icon: Shield 
    };
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
            const roleBadge = getRoleBadge(member.role, member.title);
            const RoleIcon = roleBadge.icon;
            const roleKey = (member.title || member.role || '').toLowerCase();
            const isQA = roleKey.includes('qa') || roleKey.includes('reviewer');
            
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
                      <span>{isQA ? 'Review Queue' : 'Mission Progress'}</span>
                      <span className="text-[#00F0FF]">
                        {(() => {
                            const allTasks = tasks;
                            const memberTasks = allTasks.filter(t => 
                                t.assignee === member._id || 
                                t.assigneeName === member.name || 
                                t.assigneeEmail === member.email ||
                                (typeof t.assignee === 'object' && (t.assignee as any)?._id === member._id)
                            );
                            const done = memberTasks.filter(t => t.status === 'done').length;
                            const total = memberTasks.length;
                            
                            if (isQA) {
                                const pending = allTasks.filter(t => t.status === 'in-review').length;
                                return `${pending} Rev | ${done}/${total} Work`;
                            }
                            return `${done} / ${total} Done`;
                        })()}
                      </span>
                   </div>
                   <div className="space-y-1">
                      {(() => {
                          const allTasks = tasks;
                          const memberTasks = allTasks.filter(t => 
                            t.assignee === member._id || 
                            t.assigneeName === member.name || 
                            t.assigneeEmail === member.email ||
                            (typeof t.assignee === 'object' && (t.assignee as any)?._id === member._id)
                          );
                          
                          const list = isQA 
                            ? [...allTasks.filter(t => t.status === 'in-review'), ...memberTasks]
                            : memberTasks;

                          return list.slice(0, 2).map(task => (
                             <div key={task._id || task.id} className="text-[10px] py-1 px-2 rounded bg-white/5 border border-white/10 text-[#E8F0FF] truncate">
                                • {task.title}
                             </div>
                          ));
                      })()}
                   </div>
                </div>

                  <div className="flex flex-col gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full border font-bold ${roleBadge.bg} ${roleBadge.text} ${roleBadge.border} ${roleBadge.glow} flex items-center gap-1 w-fit transition-all duration-500`}>
                        <RoleIcon className="w-3 h-3" />
                        {(member.title || member.role || member.email.split('@')[0]).toUpperCase()}
                    </span>

                    {user?.role === 'owner' && member.role !== 'owner' && (
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-[#8B9DC3] font-mono">CHANGE:</span>
                            <select 
                                value={member.title || (member.role === 'qa' ? 'QA Engineer' : 'Frontend Developer')}
                                onChange={(e) => handleUpdateRole(member._id, e.target.value)}
                                className="text-[10px] bg-transparent border-none text-[#00F0FF] focus:outline-none cursor-pointer font-bold hover:underline"
                            >
                                {ROLES.map(r => (
                                    <option key={r} value={r} className="bg-[#0A0E27]">{r.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                    )}
                  </div>

                  <div className="flex gap-2 self-start">
                    {user?.role === 'owner' && (
                        <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setMemberToRemove(member)}
                        disabled={removingId === member._id || member.email === user.email}
                        title={member.email === user.email ? "You cannot remove yourself" : "Remove member"}
                        className={`${(member.email === user.email) ? 'text-[#8B9DC3] opacity-40 cursor-not-allowed' : 'text-[#FF3366] hover:bg-[#FF3366]/10'} h-7`}
                        >
                        {removingId === member._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserMinus className="w-4 h-4" />}
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
              const roleBadge = getRoleBadge(invite.role, (invite as any).title);
              
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
                        Invited by {invite.invitedBy.name} • {formatDate(invite.createdAt)}
                      </div>
                    </div>
                  </div>

                  {user?.role === 'owner' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCancelInvite(invite._id)}
                      disabled={cancelingId === invite._id}
                      title="Cancel invite"
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
      {/* Removal Confirmation Dialog */}
      <AlertDialog open={!!memberToRemove} onOpenChange={(open) => !open && setMemberToRemove(null)}>
        <AlertDialogContent className="glass border-[#FF3366]/30 bg-[#0A0E27]/95">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#E8F0FF]">Confirm Member Extraction</AlertDialogTitle>
            <AlertDialogDescription className="text-[#8B9DC3]">
              Are you sure you want to remove <span className="text-[#00F0FF] font-bold">{memberToRemove?.name}</span> from the project? 
              This action will revoke their access to the workspace immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="glass border-white/10 text-[#8B9DC3] hover:bg-white/5">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleRemoveMember(memberToRemove!._id)}
              className="bg-[#FF3366] text-white hover:bg-[#FF3366]/90"
            >
              Confirm Removal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
