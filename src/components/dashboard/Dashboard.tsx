'use client';

import React from 'react';
import OctopusVisualization from './OctopusVisualization';
import AgentActivityFeed from './AgentActivityFeed';
import ProjectContextPanel from './ProjectContextPanel';
import TimelineHorizon from './TimelineHorizon';
import QuickActionsDock from './QuickActionsDock';
import NotificationToast from './NotificationToast';
import ModalProvider from '@/components/modals/ModalProvider';
import { useAppStore } from '@/lib/store';
import { Bell } from 'lucide-react';

export default function Dashboard() {
  const { openModal, notifications, agentStates } = useAppStore();
  
  const activeAgentCount = Object.values(agentStates).filter(s => s === 'active').length;
  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen noise-overlay p-6 pt-24">
      <div className="max-w-[1920px] mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold mb-2">
              Command Center
            </h1>
            <p className="font-mono text-sm text-[#8B9DC3]">
              Real-time project intelligence powered by 5 AI agents
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
            
            <div className="glass rounded-2xl px-6 py-3">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${activeAgentCount > 0 ? 'bg-[#00FF88]' : 'bg-[#8B9DC3]'} animate-pulse`} />
                <span className="font-mono text-sm text-[#E8F0FF]">
                  {activeAgentCount > 0 ? `${activeAgentCount} Agent${activeAgentCount > 1 ? 's' : ''} Active` : 'All Agents Ready'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid lg:grid-cols-[1fr_400px] gap-6 mb-6">
          {/* Left: Central Octopus + Timeline */}
          <div className="space-y-6">
            {/* Project Context */}
            <ProjectContextPanel />
            
            {/* Octopus Visualization */}
            <div className="glass rounded-3xl p-8">
              <OctopusVisualization />
            </div>
            
            {/* Timeline */}
            <TimelineHorizon />
          </div>

          {/* Right: Activity Feed */}
          <div>
            <AgentActivityFeed />
          </div>
        </div>

        {/* Quick Actions Dock */}
        <QuickActionsDock />
        
        {/* Notification Toast */}
        <NotificationToast />
        
        {/* Modal Provider */}
        <ModalProvider />
      </div>
    </div>
  );
}
