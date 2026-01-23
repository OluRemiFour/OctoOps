'use client';

import React, { useState } from 'react';
import { Zap, CheckCircle, AlertTriangle, MessageSquare, Lightbulb } from 'lucide-react';

const agents = [
  {
    name: 'Planner Agent',
    color: '#00F0FF',
    icon: Zap,
    description: 'Breaks down goals into actionable milestones and tracks dependencies',
    capabilities: ['Task decomposition', 'Dependency mapping', 'Timeline optimization']
  },
  {
    name: 'Execution Agent',
    color: '#00FF88',
    icon: CheckCircle,
    description: 'Monitors progress, detects blockers, and coordinates team actions',
    capabilities: ['Progress tracking', 'Blocker detection', 'Team coordination']
  },
  {
    name: 'Risk Agent',
    color: '#FF3366',
    icon: AlertTriangle,
    description: 'Predicts potential delays and resource conflicts before they happen',
    capabilities: ['Risk prediction', 'Impact analysis', 'Proactive alerts']
  },
  {
    name: 'Communication Agent',
    color: '#FFB800',
    icon: MessageSquare,
    description: 'Sends intelligent notifications and facilitates team updates',
    capabilities: ['Smart notifications', 'Status updates', 'Team sync']
  },
  {
    name: 'Recommendation Agent',
    color: '#9D4EDD',
    icon: Lightbulb,
    description: 'Provides data-driven decisions on scope, priorities, and strategy',
    capabilities: ['Strategic advice', 'Decision support', 'Alternative scenarios']
  }
];

export default function AgentShowcase() {
  const [hoveredAgent, setHoveredAgent] = useState<number | null>(null);

  return (
    <section className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="font-display text-5xl font-bold mb-6">
            Five Agents, One{' '}
            <span className="text-[#00F0FF]">Intelligence</span>
          </h2>
          <p className="text-[#8B9DC3] text-xl font-mono max-w-2xl mx-auto">
            Each agent specializes in a critical aspect of project management, 
            working in parallel to keep your team synchronized and on track.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent, index) => {
            const Icon = agent.icon;
            const isHovered = hoveredAgent === index;
            
            return (
              <div
                key={index}
                className="group relative glass rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                style={{
                  borderColor: isHovered ? `${agent.color}40` : 'rgba(0, 240, 255, 0.2)',
                  boxShadow: isHovered ? `0 0 40px ${agent.color}50` : 'none'
                }}
                onMouseEnter={() => setHoveredAgent(index)}
                onMouseLeave={() => setHoveredAgent(null)}
              >
                {/* Icon */}
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300"
                  style={{
                    backgroundColor: isHovered ? `${agent.color}20` : `${agent.color}10`,
                    border: `2px solid ${agent.color}40`
                  }}
                >
                  <Icon 
                    className="w-8 h-8 transition-all duration-300"
                    style={{ 
                      color: agent.color,
                      filter: isHovered ? 'drop-shadow(0 0 8px currentColor)' : 'none'
                    }} 
                  />
                </div>

                {/* Content */}
                <h3 className="font-display text-2xl font-bold mb-3" style={{ color: agent.color }}>
                  {agent.name}
                </h3>
                
                <p className="text-[#E8F0FF] font-mono text-sm leading-relaxed mb-6">
                  {agent.description}
                </p>

                {/* Capabilities */}
                <div className="space-y-2">
                  {agent.capabilities.map((capability, capIndex) => (
                    <div key={capIndex} className="flex items-center gap-2">
                      <div 
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: agent.color }}
                      />
                      <span className="font-accent text-xs text-[#8B9DC3]">
                        {capability}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Hover Tentacle Effect */}
                {isHovered && (
                  <div 
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-8 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: agent.color,
                      boxShadow: `0 0 20px ${agent.color}`
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
