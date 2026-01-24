'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserPlus, Trash2, Mail, Bell, MoreVertical, Users, Award, Clock, CheckCircle } from 'lucide-react';
import NotificationToast from '@/components/dashboard/NotificationToast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function TeamPortal() {
  const { team, removeTeamMember, tasks, openModal, notifications, activateAgent, addNotification, addActivity } = useAppStore();
  const unreadNotifications = notifications.filter(n => !n.read).length;

  // Calculate tasks per team member
  const getTaskCount = (memberName: string) => {
    let count = 0;
    const countTasks = (taskList: typeof tasks) => {
      taskList.forEach(task => {
        if (task.assignee.includes(memberName.split(' ')[0])) count++;
        if (task.subtasks) countTasks(task.subtasks);
      });
    };
    countTasks(tasks);
    return count;
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    removeTeamMember(memberId);
    activateAgent('Communication', 2000);
    addNotification({
      agent: 'Communication',
      title: 'Team Member Removed',
      message: `${memberName} has been removed from the team`,
      type: 'info',
      read: false,
    });
  };

  const handleSendMessage = (memberName: string) => {
    activateAgent('Communication', 1500);
    addActivity({
      agent: 'Communication',
      action: `Sending notification to ${memberName}`,
      time: 'Just now',
    });
    addNotification({
      agent: 'Communication',
      title: 'Message Sent',
      message: `Notification sent to ${memberName}`,
      type: 'success',
      read: false,
    });
  };

  return (
    <div className="min-h-screen noise-overlay p-6 pt-24">
      <div className="max-w-[1920px] mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold mb-2">
              Team Portal
            </h1>
            <p className="font-mono text-sm text-[#8B9DC3]">
              Manage your project team and view member contributions
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button
              onClick={() => openModal('notifications')}
              className="relative glass rounded-xl p-3 hover:bg-white/10 transition-colors"
            >
              <Bell className="w-5 h-5 text-[#E8F0FF]" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#FF3366] text-white text-xs flex items-center justify-center font-mono animate-pulse">
                  {unreadNotifications}
                </span>
              )}
            </button>
            
            {/* Add Member Button */}
            <Button
              onClick={() => openModal('invite-member')}
              size="lg"
              className="bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0A0E27] font-display font-bold rounded-2xl glow-green"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Invite Member
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#00F0FF]/20 border-2 border-[#00F0FF]/40 flex items-center justify-center">
                <Users className="w-6 h-6 text-[#00F0FF]" />
              </div>
              <div>
                <div className="font-display text-3xl font-bold text-[#00F0FF]">{team.length}</div>
                <div className="font-accent text-xs text-[#8B9DC3]">Team Members</div>
              </div>
            </div>
          </div>
          
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#00FF88]/20 border-2 border-[#00FF88]/40 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-[#00FF88]" />
              </div>
              <div>
                <div className="font-display text-3xl font-bold text-[#00FF88]">87%</div>
                <div className="font-accent text-xs text-[#8B9DC3]">Task Completion</div>
              </div>
            </div>
          </div>
          
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#FFB800]/20 border-2 border-[#FFB800]/40 flex items-center justify-center">
                <Clock className="w-6 h-6 text-[#FFB800]" />
              </div>
              <div>
                <div className="font-display text-3xl font-bold text-[#FFB800]">2.1h</div>
                <div className="font-accent text-xs text-[#8B9DC3]">Avg Response</div>
              </div>
            </div>
          </div>
          
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#9D4EDD]/20 border-2 border-[#9D4EDD]/40 flex items-center justify-center">
                <Award className="w-6 h-6 text-[#9D4EDD]" />
              </div>
              <div>
                <div className="font-display text-3xl font-bold text-[#9D4EDD]">92</div>
                <div className="font-accent text-xs text-[#8B9DC3]">Team Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Members Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.map((member) => {
            const taskCount = getTaskCount(member.name);
            
            return (
              <div
                key={member.id}
                className="glass rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 group"
              >
                <div className="flex items-start justify-between mb-4">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00F0FF] to-[#9D4EDD] p-0.5">
                      <div className="w-full h-full rounded-2xl bg-[#0A0E27] flex items-center justify-center">
                        <span className="text-3xl">{member.avatar}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold text-[#E8F0FF]">
                        {member.name}
                      </h3>
                      <p className="font-mono text-xs text-[#8B9DC3]">
                        {member.role}
                      </p>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10">
                        <MoreVertical className="w-4 h-4 text-[#8B9DC3]" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="glass bg-[#0A0E27]/95 border-[#00F0FF]/30">
                      <DropdownMenuItem 
                        className="font-mono text-sm text-[#E8F0FF] hover:bg-[#00F0FF]/10 cursor-pointer"
                        onClick={() => handleSendMessage(member.name)}
                      >
                        <Mail className="w-4 h-4 mr-2 text-[#FFB800]" />
                        Send Message
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-[#00F0FF]/10" />
                      <DropdownMenuItem 
                        className="font-mono text-sm text-[#FF3366] hover:bg-[#FF3366]/10 cursor-pointer"
                        onClick={() => handleRemoveMember(member.id, member.name)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove Member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {/* Email */}
                <div className="mb-4">
                  <div className="font-mono text-xs text-[#8B9DC3] truncate">
                    {member.email}
                  </div>
                </div>
                
                {/* Stats */}
                <div className="flex items-center gap-4 pt-4 border-t border-[#00F0FF]/10">
                  <div>
                    <div className="font-display text-xl font-bold text-[#00F0FF]">{taskCount}</div>
                    <div className="font-accent text-xs text-[#8B9DC3]">Tasks</div>
                  </div>
                  <div className="h-8 w-px bg-[#00F0FF]/10" />
                  <div>
                    <div className="font-display text-xl font-bold text-[#00FF88]">
                      {Math.floor(Math.random() * 30) + 70}%
                    </div>
                    <div className="font-accent text-xs text-[#8B9DC3]">Complete</div>
                  </div>
                  <div className="h-8 w-px bg-[#00F0FF]/10" />
                  <div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
                      <span className="font-mono text-xs text-[#00FF88]">Online</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Add Member Card */}
          <button
            onClick={() => openModal('invite-member')}
            className="glass rounded-2xl p-6 border-2 border-dashed border-[#00FF88]/30 hover:border-[#00FF88]/60 transition-all duration-200 hover:-translate-y-1 flex flex-col items-center justify-center min-h-[200px]"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#00FF88]/20 border-2 border-[#00FF88]/40 flex items-center justify-center mb-4">
              <UserPlus className="w-8 h-8 text-[#00FF88]" />
            </div>
            <div className="font-display text-lg font-bold text-[#E8F0FF] mb-1">
              Add Team Member
            </div>
            <div className="font-mono text-xs text-[#8B9DC3]">
              Invite someone to join your project
            </div>
          </button>
        </div>
        
        <NotificationToast />
      </div>
    </div>
  );
}
