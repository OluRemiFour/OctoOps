'use client';

import React from 'react';
import RiskHeatmap from './RiskHeatmap';
import RiskCards from './RiskCards';
import NotificationToast from '@/components/dashboard/NotificationToast';
import { useAppStore } from '@/lib/store';
import { Bell, AlertTriangle } from 'lucide-react';

export default function RiskDashboard() {
  const { openModal, notifications, risks } = useAppStore();
  const unreadNotifications = notifications.filter(n => !n.read).length;
  const highRisks = risks.filter(r => !r.resolved && (r.severity === 'high' || r.severity === 'critical')).length;

  return (
    <div className="min-h-screen noise-overlay p-6 pt-24">
      <div className="max-w-[1920px] mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold mb-2">
              Risk Dashboard
            </h1>
            <p className="font-mono text-sm text-[#8B9DC3]">
              AI-powered risk detection and predictive analytics
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* High Risk Alert */}
            {highRisks > 0 && (
              <div className="glass rounded-2xl px-4 py-2 border-[#FF3366]/30 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#FF3366] animate-pulse" />
                <span className="font-mono text-sm text-[#FF3366]">
                  {highRisks} High Priority
                </span>
              </div>
            )}
            
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
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid lg:grid-cols-[1fr_500px] gap-6">
          {/* Left: Active Risks */}
          <div>
            <RiskCards />
          </div>

          {/* Right: Heatmap */}
          <div>
            <RiskHeatmap />
          </div>
        </div>
        
        {/* Modals */}
        <NotificationToast />
      </div>
    </div>
  );
}
