'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ListTodo, AlertTriangle, Users, Settings, Bell } from 'lucide-react';
import { useAppStore } from '@/lib/store';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: '#00F0FF' },
  { href: '/dashboard/tasks', icon: ListTodo, label: 'Tasks', color: '#00FF88' },
  { href: '/dashboard/risks', icon: AlertTriangle, label: 'Risks', color: '#FF3366' },
  { href: '/dashboard/team', icon: Users, label: 'Team', color: '#FFB800' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings', color: '#8B9DC3' },
];

export default function Navigation() {
  const pathname = usePathname();
  const { notifications, risks, openModal } = useAppStore();
  const unreadCount = notifications.filter(n => !n.read).length;
  const activeRisks = risks.filter(r => !r.resolved).length;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#00F0FF]/10">
      <div className="glass backdrop-blur-xl">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="text-3xl transition-transform duration-300 group-hover:scale-110">
                🐙
              </div>
              <div>
                <div className="font-display text-2xl font-bold bg-gradient-to-r from-[#00F0FF] to-[#9D4EDD] bg-clip-text text-transparent">
                  OctoOps
                </div>
                <div className="font-accent text-xs text-[#8B9DC3]">
                  Multi-Agent AI PM
                </div>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 relative ${
                      isActive
                        ? 'glass border-2'
                        : 'hover:bg-white/5'
                    }`}
                    style={isActive ? {
                      borderColor: `${item.color}40`,
                      boxShadow: `0 0 20px ${item.color}20`
                    } : {}}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{ color: isActive ? item.color : '#8B9DC3' }}
                    />
                    <span
                      className={`font-display text-sm font-bold ${
                        isActive ? '' : 'text-[#8B9DC3]'
                      }`}
                      style={isActive ? { color: item.color } : {}}
                    >
                      {item.label}
                    </span>
                    {/* Badge for Risks */}
                    {item.label === 'Risks' && activeRisks > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#FF3366] text-white text-xs flex items-center justify-center font-mono">
                        {activeRisks}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="font-display text-sm font-bold text-[#E8F0FF]">
                  Project Manager
                </div>
                <div className="font-mono text-xs text-[#8B9DC3]">
                  admin@octoops.dev
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00F0FF] to-[#9D4EDD] flex items-center justify-center">
                <span className="text-lg">👨‍💼</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
