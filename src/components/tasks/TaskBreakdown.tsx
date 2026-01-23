'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Network, List, Plus, Bell } from 'lucide-react';
import TaskTreeView from './TaskTreeView';
import ModalProvider from '@/components/modals/ModalProvider';
import NotificationToast from '@/components/dashboard/NotificationToast';
import { useAppStore } from '@/lib/store';

export default function TaskBreakdown() {
  const [viewMode, setViewMode] = useState<'tree' | 'graph'>('tree');
  const { openModal, notifications } = useAppStore();
  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen noise-overlay p-6 pt-24">
      <div className="max-w-[1920px] mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold mb-2">
              Task Breakdown
            </h1>
            <p className="font-mono text-sm text-[#8B9DC3]">
              Hierarchical view of all project tasks and dependencies
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
            
            {/* View Toggle */}
            <div className="glass rounded-2xl p-1 flex gap-1">
              <Button
                size="sm"
                variant={viewMode === 'tree' ? 'default' : 'ghost'}
                onClick={() => setViewMode('tree')}
                className={`rounded-xl ${
                  viewMode === 'tree'
                    ? 'bg-[#00F0FF]/20 border-2 border-[#00F0FF]/40 text-[#00F0FF]'
                    : 'text-[#8B9DC3] hover:text-[#E8F0FF]'
                }`}
              >
                <List className="w-4 h-4 mr-2" />
                Tree View
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'graph' ? 'default' : 'ghost'}
                onClick={() => setViewMode('graph')}
                className={`rounded-xl ${
                  viewMode === 'graph'
                    ? 'bg-[#00F0FF]/20 border-2 border-[#00F0FF]/40 text-[#00F0FF]'
                    : 'text-[#8B9DC3] hover:text-[#E8F0FF]'
                }`}
              >
                <Network className="w-4 h-4 mr-2" />
                Graph View
              </Button>
            </div>

            {/* Add Task Button */}
            <Button
              size="lg"
              onClick={() => openModal('add-task')}
              className="bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-[#0A0E27] font-display font-bold rounded-2xl glow-cyan"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Task View */}
        {viewMode === 'tree' ? (
          <TaskTreeView />
        ) : (
          <div className="glass rounded-3xl p-12 text-center">
            <Network className="w-16 h-16 text-[#00F0FF] mx-auto mb-4" />
            <h3 className="font-display text-2xl font-bold mb-2">
              Dependency Graph View
            </h3>
            <p className="font-mono text-sm text-[#8B9DC3]">
              Visual graph showing task relationships and dependencies
            </p>
          </div>
        )}
        
        {/* Modals */}
        <ModalProvider />
        <NotificationToast />
      </div>
    </div>
  );
}
