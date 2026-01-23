'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { X, Zap, CheckCircle, AlertTriangle, MessageSquare, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';

const agentIcons = {
  Planner: Zap,
  Execution: CheckCircle,
  Risk: AlertTriangle,
  Communication: MessageSquare,
  Recommendation: Lightbulb,
};

const agentColors = {
  Planner: '#00F0FF',
  Execution: '#00FF88',
  Risk: '#FF3366',
  Communication: '#FFB800',
  Recommendation: '#9D4EDD',
};

interface ToastNotification {
  id: string;
  agent: string;
  title: string;
  message: string;
  visible: boolean;
}

export default function NotificationToast() {
  const { notifications, markNotificationRead, openModal } = useAppStore();
  const [visibleToasts, setVisibleToasts] = useState<ToastNotification[]>([]);
  const [processedIds, setProcessedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Check for new unread notifications
    const newNotifications = notifications.filter(
      (n) => !n.read && !processedIds.has(n.id)
    );

    if (newNotifications.length > 0) {
      const newIds = new Set(processedIds);
      
      newNotifications.forEach((notification) => {
        newIds.add(notification.id);
        
        const toast: ToastNotification = {
          id: notification.id,
          agent: notification.agent,
          title: notification.title,
          message: notification.message,
          visible: true,
        };

        setVisibleToasts((prev) => [...prev, toast]);

        // Auto-hide after 5 seconds
        setTimeout(() => {
          setVisibleToasts((prev) =>
            prev.map((t) => (t.id === notification.id ? { ...t, visible: false } : t))
          );
          
          // Remove from DOM after animation
          setTimeout(() => {
            setVisibleToasts((prev) => prev.filter((t) => t.id !== notification.id));
          }, 300);
        }, 5000);
      });

      setProcessedIds(newIds);
    }
  }, [notifications, processedIds]);

  const dismissToast = (id: string) => {
    setVisibleToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, visible: false } : t))
    );
    markNotificationRead(id);
    
    setTimeout(() => {
      setVisibleToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  };

  const handleViewDetails = (id: string) => {
    markNotificationRead(id);
    openModal('notifications');
    dismissToast(id);
  };

  if (visibleToasts.length === 0) return null;

  return (
    <div className="fixed top-24 right-6 z-50 space-y-3 max-w-md">
      {visibleToasts.map((toast) => {
        const AgentIcon = agentIcons[toast.agent as keyof typeof agentIcons] || Zap;
        const agentColor = agentColors[toast.agent as keyof typeof agentColors] || '#00F0FF';

        return (
          <div
            key={toast.id}
            className={`glass rounded-2xl p-4 transition-all duration-300 ${
              toast.visible
                ? 'animate-in slide-in-from-right-full opacity-100'
                : 'animate-out slide-out-to-right-full opacity-0'
            }`}
            style={{ borderColor: `${agentColor}40` }}
          >
            <div className="flex gap-3">
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: `${agentColor}20`,
                  border: `2px solid ${agentColor}40`,
                  boxShadow: `0 0 15px ${agentColor}30`,
                }}
              >
                <AgentIcon className="w-5 h-5" style={{ color: agentColor }} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className="font-display text-sm font-bold"
                    style={{ color: agentColor }}
                  >
                    {toast.agent} Agent
                  </span>
                  <button
                    onClick={() => dismissToast(toast.id)}
                    className="text-[#8B9DC3] hover:text-[#E8F0FF] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="font-display font-bold text-[#E8F0FF] text-sm mt-1">
                  {toast.title}
                </div>
                <p className="font-mono text-xs text-[#8B9DC3] mt-1 line-clamp-2">
                  {toast.message}
                </p>
                
                {/* Actions */}
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => dismissToast(toast.id)}
                    className="text-[#8B9DC3] hover:text-[#E8F0FF] h-7 px-2 text-xs"
                  >
                    Acknowledge
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewDetails(toast.id)}
                    className="glass text-xs h-7 px-2"
                    style={{ 
                      borderColor: `${agentColor}40`,
                      color: agentColor 
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
