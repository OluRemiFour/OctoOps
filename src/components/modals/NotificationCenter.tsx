'use client';

import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/lib/store';
import { Bell, Check, Trash2, Zap, CheckCircle, AlertTriangle, MessageSquare, Lightbulb, X } from 'lucide-react';

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

const typeColors = {
  info: '#00F0FF',
  success: '#00FF88',
  warning: '#FFB800',
  error: '#FF3366',
};

export default function NotificationCenter() {
  const { activeModal, closeModal, notifications, markNotificationRead, clearNotifications } = useAppStore();

  const isOpen = activeModal === 'notifications';
  const unreadCount = notifications.filter((n) => !n.read).length;

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <SheetContent className="glass border-l border-[#00F0FF]/20 bg-[#0A0E27]/95 w-[400px] sm:w-[450px] p-0">
        <SheetHeader className="p-6 pb-4 border-b border-[#00F0FF]/10">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-display text-xl font-bold text-[#E8F0FF] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00F0FF]/20 border-2 border-[#00F0FF]/40 flex items-center justify-center relative">
                <Bell className="w-5 h-5 text-[#00F0FF]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#FF3366] text-white text-xs flex items-center justify-center font-mono">
                    {unreadCount}
                  </span>
                )}
              </div>
              Notifications
            </SheetTitle>
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearNotifications}
                className="text-[#8B9DC3] hover:text-[#FF3366]"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
          <SheetDescription className="font-mono text-sm text-[#8B9DC3]">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-140px)] p-4">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-center">
              <div className="w-20 h-20 rounded-2xl bg-[#00F0FF]/10 border-2 border-[#00F0FF]/20 flex items-center justify-center mb-4">
                <Bell className="w-10 h-10 text-[#00F0FF]/50" />
              </div>
              <div className="font-display text-lg font-bold text-[#8B9DC3] mb-2">No notifications</div>
              <div className="font-mono text-sm text-[#8B9DC3]/70">
                Agent alerts and updates will appear here
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => {
                const AgentIcon = agentIcons[notification.agent as keyof typeof agentIcons] || Bell;
                const agentColor = agentColors[notification.agent as keyof typeof agentColors] || '#00F0FF';
                const typeColor = typeColors[notification.type];

                return (
                  <div
                    key={notification.id}
                    className={`glass rounded-xl p-4 transition-all duration-200 hover:-translate-x-1 ${
                      !notification.read ? 'border-l-4' : 'border-l-4 border-transparent opacity-70'
                    }`}
                    style={{ borderLeftColor: !notification.read ? typeColor : 'transparent' }}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: `${agentColor}15`,
                          border: `2px solid ${agentColor}40`,
                        }}
                      >
                        <AgentIcon className="w-5 h-5" style={{ color: agentColor }} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="font-display text-sm font-bold" style={{ color: agentColor }}>
                            {notification.agent} Agent
                          </span>
                          <span className="font-mono text-xs text-[#8B9DC3] whitespace-nowrap">
                            {formatTime(notification.timestamp)}
                          </span>
                        </div>
                        <div className="font-display font-bold text-[#E8F0FF] mb-1">{notification.title}</div>
                        <p className="font-mono text-sm text-[#8B9DC3] leading-relaxed">{notification.message}</p>

                        {/* Actions */}
                        {notification.actions && notification.actions.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {notification.actions.map((action, index) => (
                              <Button
                                key={index}
                                size="sm"
                                variant="outline"
                                className="glass border-[#00F0FF]/30 text-[#00F0FF] hover:bg-[#00F0FF]/10 rounded-lg text-xs"
                              >
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}

                        {/* Mark as Read */}
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markNotificationRead(notification.id)}
                            className="mt-2 text-[#8B9DC3] hover:text-[#00FF88] p-0 h-auto"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            <span className="font-mono text-xs">Mark as read</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
