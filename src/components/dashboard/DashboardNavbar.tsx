'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { LayoutDashboard, Users, AlertTriangle, Settings, LogOut, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardNavbarProps {
    activeTab?: string;
    onTabChange?: (tab: string) => void;
}

export default function DashboardNavbar({ activeTab, onTabChange }: DashboardNavbarProps) {
  const { user, logout } = useAuth();
  const role = user?.role || 'member';

  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', roles: ['owner', 'member', 'qa'] },
    { icon: CheckSquare, label: 'Tasks', roles: ['owner', 'member', 'qa'] },
    { icon: AlertTriangle, label: 'Risks', roles: ['owner'] }, // Owner only
    { icon: Users, label: 'Team', roles: ['owner', 'qa'] }, // Owner/QA only
    { icon: Settings, label: 'Settings', roles: ['owner'] }, // Owner only
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10 px-6 h-20 flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-center">
            <span className="text-2xl">🐙</span>
        </div>
        <div className="hidden md:block">
            <h1 className="font-display font-bold text-xl text-[#E8F0FF]">OctoOps</h1>
            <span className="font-mono text-[10px] text-[#8B9DC3] uppercase tracking-wider border border-[#8B9DC3]/30 px-1 rounded">
                {role === 'owner' ? 'COMMAND CENTER' : role === 'qa' ? 'QA HUB' : 'WORKSTATION'}
            </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-2">
        {navItems.filter(item => item.roles.includes(role)).map((item) => {
            const isActive = activeTab === item.label.toLowerCase();
            return (
                <Button
                    key={item.label}
                    variant={isActive ? "secondary" : "ghost"}
                    onClick={() => onTabChange ? onTabChange(item.label.toLowerCase()) : alert(`Navigating to ${item.label}... (Feature coming soon)`)}
                    className={`gap-2 ${isActive ? 'bg-[#00F0FF]/20 text-[#00F0FF]' : 'text-[#8B9DC3] hover:text-[#00F0FF] hover:bg-white/5'}`}
                >
                    <item.icon className="w-4 h-4" />
                    <span className="hidden md:inline">{item.label}</span>
                </Button>
            );
        })}
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
             <div className="text-right hidden md:block">
                 <div className="font-bold text-sm text-[#E8F0FF]">{user?.name}</div>
                 <div className="text-xs text-[#8B9DC3] capitalize">{role}</div>
             </div>
             <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                 {user?.avatar}
             </div>
        </div>
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={logout}
            className="text-[#FF3366] hover:bg-[#FF3366]/10"
        >
            <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </nav>
  );
}
