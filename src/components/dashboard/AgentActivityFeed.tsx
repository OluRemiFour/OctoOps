'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Zap, CheckCircle, AlertTriangle, MessageSquare, Lightbulb } from 'lucide-react';
import { useAppStore } from '@/lib/store';

const agentIcons = {
  Planner: Zap,
  Execution: CheckCircle,
  Risk: AlertTriangle,
  Communication: MessageSquare,
  Recommendation: Lightbulb
};

const agentColors = {
  Planner: '#00F0FF',
  Execution: '#00FF88',
  Risk: '#FF3366',
  Communication: '#FFB800',
  Recommendation: '#9D4EDD'
};

export default function AgentActivityFeed() {
  const { activities, agentStates } = useAppStore();

  return (
    <div className="glass rounded-3xl p-6 h-[calc(100vh-200px)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold text-[#E8F0FF]">
          Agent Activity
        </h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
          <span className="font-mono text-xs text-[#8B9DC3]">LIVE</span>
        </div>
      </div>

      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = agentIcons[activity.agent as keyof typeof agentIcons] || Zap;
            const color = agentColors[activity.agent as keyof typeof agentColors] || '#00F0FF';
            const isAgentActive = agentStates[activity.agent] === 'active';
            
            return (
              <div
                key={activity.id}
                className={`group p-4 rounded-2xl glass border-2 transition-all duration-200 animate-in fade-in slide-in-from-top-2 ${
                  isAgentActive ? 'border-opacity-60' : 'border-transparent hover:border-[#00F0FF]/20'
                }`}
                style={{ borderColor: isAgentActive ? `${color}60` : undefined }}
              >
                <div className="flex gap-3">
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:scale-110 ${
                      isAgentActive ? 'animate-pulse' : ''
                    }`}
                    style={{
                      backgroundColor: `${color}${isAgentActive ? '30' : '15'}`,
                      border: `2px solid ${color}40`,
                      boxShadow: isAgentActive ? `0 0 15px ${color}40` : 'none'
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span
                        className="font-display text-sm font-bold"
                        style={{ color }}
                      >
                        {activity.agent} Agent
                      </span>
                      <span className="font-mono text-xs text-[#8B9DC3] whitespace-nowrap">
                        {activity.time}
                      </span>
                    </div>
                    <p className="font-mono text-sm text-[#E8F0FF] leading-relaxed">
                      {activity.action}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
