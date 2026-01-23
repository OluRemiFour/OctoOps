'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, UserPlus, Image, MessageCircle, FileText } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function QuickActionsDock() {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);
  const { openModal } = useAppStore();

  const actions = [
    { id: 'add-task', icon: Plus, label: 'Add Task', color: '#00F0FF', modal: 'add-task' },
    { id: 'invite', icon: UserPlus, label: 'Invite Member', color: '#00FF88', modal: 'invite-member' },
    { id: 'upload', icon: Image, label: 'Upload Image', color: '#FFB800', modal: 'image-upload' },
    { id: 'ask', icon: MessageCircle, label: 'Ask OctoOps', color: '#9D4EDD', modal: 'ask-octoops' },
    { id: 'reports', icon: FileText, label: 'View Reports', color: '#FF3366', modal: 'view-reports' },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className="glass rounded-[2rem] p-4 border-[#00F0FF]/30 glow-cyan">
        <div className="flex items-center gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            const isHovered = hoveredAction === action.id;
            
            return (
              <div key={action.id} className="relative">
                <Button
                  size="lg"
                  onClick={() => openModal(action.modal)}
                  className={`w-14 h-14 rounded-2xl transition-all duration-300 ${
                    isHovered ? 'scale-110 -translate-y-2' : ''
                  }`}
                  style={{
                    backgroundColor: isHovered ? `${action.color}30` : `${action.color}15`,
                    border: `2px solid ${action.color}60`,
                    boxShadow: isHovered ? `0 8px 20px ${action.color}40` : 'none'
                  }}
                  onMouseEnter={() => setHoveredAction(action.id)}
                  onMouseLeave={() => setHoveredAction(null)}
                >
                  <Icon className="w-6 h-6" style={{ color: action.color }} />
                </Button>
                
                {/* Tooltip */}
                {isHovered && (
                  <div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 glass rounded-xl whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-200"
                    style={{ borderColor: `${action.color}40` }}
                  >
                    <div className="font-mono text-sm font-bold" style={{ color: action.color }}>
                      {action.label}
                    </div>
                    <div
                      className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 rotate-45"
                      style={{
                        backgroundColor: `${action.color}15`,
                        borderRight: `1px solid ${action.color}40`,
                        borderBottom: `1px solid ${action.color}40`
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
