'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import OctopusVisualization from './OctopusVisualization';
import AgentActivityFeed from './AgentActivityFeed';
import ProjectContextPanel from './ProjectContextPanel';
import TimelineHorizon from './TimelineHorizon';
import QuickActionsDock from './QuickActionsDock';
import NotificationToast from './NotificationToast';
import TeamTaskBoard from './TeamTaskBoard';
import MemberDashboard from './MemberDashboard';
import QADashboard from './QADashboard';
import { useAppStore } from '@/lib/store';
import { Bell } from 'lucide-react';
import TasksPage from './pages/TasksPage';
import RisksPage from './pages/RisksPage';
import TeamPage from './pages/TeamPage';
import SettingsPage from './pages/SettingsPage';

import DashboardNavbar from './DashboardNavbar';

export default function Dashboard() {
  const { openModal, notifications, agentStates, fetchProject, fetchTasks, fetchTeam, fetchRisks, isHydrated } = useAppStore();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isAuthenticated) {
      fetchProject();
    }
  }, [isAuthenticated]);

  // Protect Dashboard
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);
  
  if (!isAuthenticated) return null; // Prevent flash

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00F0FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#8B9DC3] font-mono">Initializing OctoOps Pulse...</p>
        </div>
      </div>
    );
  }

  // ROLE-BASED DASHBOARD ROUTING
  if (user?.role === 'member') {
    return (
        <div className="min-h-screen bg-[#0A0E27] text-[#E8F0FF] font-mono noise-overlay pt-24">
             <DashboardNavbar activeTab={activeTab} onTabChange={setActiveTab} />
             <div className="max-w-7xl mx-auto px-6">
                {activeTab === 'overview' && <MemberDashboard />}
                {activeTab === 'tasks' && <TasksPage />}
                {activeTab === 'risks' && <RisksPage />}
                {activeTab === 'team' && <TeamPage />}
                {activeTab === 'settings' && <SettingsPage />}
             </div>
             <NotificationToast />
        </div>
    );
  }

  if (user?.role === 'qa') {
    return (
        <div className="min-h-screen bg-[#0A0E27] text-[#E8F0FF] font-mono noise-overlay pt-24">
             <DashboardNavbar activeTab={activeTab} onTabChange={setActiveTab} />
             <div className="max-w-7xl mx-auto px-6">
                {activeTab === 'overview' && <QADashboard />}
                {activeTab === 'tasks' && <TasksPage />}
                {activeTab === 'risks' && <RisksPage />}
                {activeTab === 'team' && <TeamPage />}
                {activeTab === 'settings' && <SettingsPage />}
             </div>
             <NotificationToast />
        </div>
    );
  }

  // DEFAULT / OWNER DASHBOARD (COMMAND CENTER)
  const activeAgentCount = Object.values(agentStates).filter(s => s === 'active').length;
  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#0A0E27] text-[#E8F0FF] font-mono noise-overlay p-4 md:p-6 mt-20 overflow-x-hidden">
      <DashboardNavbar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="max-w-[1920px] mx-auto space-y-6 pt-6">
        {/* Header - Simplified for Owner Command Center since Nav has title */}
        <div className="flex items-center justify-between">
           <div>
               {/* Breadcrumb / Status can go here */}
           </div>
           
           <div className="glass px-4 py-2 rounded-xl border border-[#00FF88]/30 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${activeAgentCount > 0 ? 'bg-[#00FF88]' : 'bg-[#8B9DC3]'} animate-pulse`} />
                <span className="font-mono text-xs text-[#E8F0FF]">
                  {activeAgentCount > 0 ? `${activeAgentCount} Agents Active` : 'Agents Standing By'}
                </span>
           </div>
        </div>

        {/* Main Content Area */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)] lg:h-[600px]">
              {/* Right Column: Context & Activity */}
              <div className="flex flex-col gap-6 h-full overflow-y-auto pr-2 custom-scrollbar">
                <ProjectContextPanel />
                <TeamTaskBoard />
                <div className="flex-1 min-h-[300px]">
                  <AgentActivityFeed />
                </div>
              </div>
            
              {/* Left Column: Visualizations */}
              <div className="glass rounded-3xl p-8 flex items-center justify-center relative overflow-hidden">
                <div className="absolute top-6 left-6 z-10">
                  <h2 className="font-display text-xl font-bold text-[#00F0FF]">Live Agent Network</h2>
                </div>
                <OctopusVisualization />
              </div>
            </div>

            {/* Bottom Row: Timeline */}
            <div className="w-full">
              <TimelineHorizon />
            </div>
          </>
        )}

        {activeTab === 'tasks' && (
           <TasksPage />
        )}

        {activeTab === 'risks' && (
           <RisksPage />
        )}

        {activeTab === 'team' && (
           <TeamPage />
        )}

        {activeTab === 'settings' && (
           <SettingsPage />
        )}

        {/* Quick Actions Dock */}
        <QuickActionsDock />
        
        {/* Notification Toast */}
        <NotificationToast />
        
      </div>
    </div>
  );
}
