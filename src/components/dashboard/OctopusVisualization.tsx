'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';

interface Agent {
  name: string;
  color: string;
  angle: number;
}

const agentConfig: Agent[] = [
  { name: 'Planner', color: '#00F0FF', angle: -60 },
  { name: 'Execution', color: '#00FF88', angle: -30 },
  { name: 'Risk', color: '#FF3366', angle: 0 },
  { name: 'Communication', color: '#FFB800', angle: 30 },
  { name: 'Recommendation', color: '#9D4EDD', angle: 60 }
];

export default function OctopusVisualization() {
  const { agentStates, activateAgent, openModal, risks } = useAppStore();

  const handleAgentClick = (agentName: string) => {
    activateAgent(agentName, 2000);
    
    // Open relevant modal based on agent
    const modalMap: Record<string, string> = {
      Planner: 'add-task',
      Execution: 'view-reports',
      Risk: 'view-reports',
      Communication: 'invite-member',
      Recommendation: 'ask-octoops',
    };
    
    if (modalMap[agentName]) {
      openModal(modalMap[agentName]);
    }
  };

  const hasHighRisk = risks.some(r => r.severity === 'high' || r.severity === 'critical');
  const isConverging = agentStates['Recommendation'] === 'active';

  return (
    <div className="relative w-full max-w-3xl mx-auto aspect-[16/12]">
      <svg
        viewBox="0 0 800 500"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Glow Filter */}
          <filter id="glow-effect">
            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          {/* Gradient for Brain */}
          <radialGradient id="brain-gradient">
            <stop offset="0%" stopColor={hasHighRisk ? "#FF3366" : "#00F0FF"} stopOpacity="0.4" />
            <stop offset="50%" stopColor={hasHighRisk ? "#FF0000" : "#9D4EDD"} stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0A0E27" stopOpacity="0.1" />
          </radialGradient>

          {/* Particle animations */}
          {agentConfig.map((agent, index) => (
            <g key={`particle-def-${index}`}>
              <circle id={`particle-${index}`} r="3" fill={agent.color} opacity="0.8" />
            </g>
          ))}
        </defs>

        {/* Risk Ripple Animation */}
        {hasHighRisk && (
          <g>
            <circle cx="400" cy="250" r="100" fill="none" stroke="#FF3366" strokeWidth="2" opacity="0.5" className="animate-ping" style={{ animationDuration: '3s' }} />
            <circle cx="400" cy="250" r="150" fill="none" stroke="#FF3366" strokeWidth="1" opacity="0.3" className="animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }} />
          </g>
        )}

        {/* Tentacles */}
        {agentConfig.map((agent, index) => {
          const baseX = 400;
          const baseY = 250;
          const angle = (agent.angle * Math.PI) / 180;
          const length = 180;
          
          // Convergence Logic: Pull agents inward if converging
          const currentLength = isConverging ? 80 : 180; 
          
          const endX = baseX + Math.cos(angle) * currentLength;
          const endY = baseY + Math.sin(angle) * currentLength;
          
          const controlX = baseX + Math.cos(angle) * (currentLength * 0.6);
          const controlY = baseY + Math.sin(angle) * (currentLength * 0.6) + (isConverging ? 0 : 30);

          const isActive = agentStates[agent.name] === 'active';

          return (
            <g key={index} 
               className="cursor-pointer transition-all duration-1000 ease-in-out" // Smooth transition for convergence
               onClick={() => handleAgentClick(agent.name)}>
              
              {/* Tentacle Glow Layer */}
              {isActive && (
                <path
                  d={`M ${baseX} ${baseY} Q ${controlX} ${controlY} ${endX} ${endY}`}
                  stroke={agent.color}
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  opacity="0.3"
                  filter="url(#glow-effect)"
                  className="transition-all duration-1000 ease-in-out"
                />
              )}
              
              {/* Main Tentacle */}
              <path
                d={`M ${baseX} ${baseY} Q ${controlX} ${controlY} ${endX} ${endY}`}
                stroke={agent.color}
                strokeWidth={isActive ? '6' : '4'}
                fill="none"
                strokeLinecap="round"
                opacity={isActive ? 1 : 0.5}
                className="transition-all duration-1000 ease-in-out hover:opacity-100"
                strokeDasharray={isActive ? "none" : "10,5"}
              />
              
              {/* End Node */}
              <circle
                cx={endX}
                cy={endY}
                r={isActive ? '16' : '12'}
                fill={agent.color}
                opacity={isActive ? 1 : 0.6}
                filter={isActive ? 'url(#glow-effect)' : undefined}
                className="transition-all duration-1000 ease-in-out"
              />
              
              {/* Inner Node Pulse */}
              {isActive && (
                <circle
                  cx={endX}
                  cy={endY}
                  r="10"
                  fill="none"
                  stroke={agent.color}
                  strokeWidth="2"
                  opacity="0.5"
                  className="animate-ping"
                />
              )}
              
              {/* Label */}
              <text
                x={endX + Math.cos(angle) * 35}
                y={endY + Math.sin(angle) * 35 + 5}
                fill={agent.color}
                fontSize="14"
                fontFamily="Space Grotesk"
                fontWeight="bold"
                textAnchor="middle"
                opacity={isActive ? 1 : 0.7}
                className="transition-all duration-1000 ease-in-out"
              >
                {agent.name}
              </text>
              
              {/* Status Indicator */}
              <text
                x={endX + Math.cos(angle) * 35}
                y={endY + Math.sin(angle) * 35 + 20}
                fill="#8B9DC3"
                fontSize="10"
                fontFamily="JetBrains Mono"
                textAnchor="middle"
                opacity="0.7"
                className="transition-all duration-1000 ease-in-out"
              >
                {isActive ? 'ACTIVE' : 'IDLE'}
              </text>
            </g>
          );
        })}

        {/* Central Brain */}
        <g>
          {/* Outer Glow */}
          <circle
            cx="400"
            cy="250"
            r="90"
            fill="url(#brain-gradient)"
            filter="url(#glow-effect)"
            className={`animate-pulse ${hasHighRisk ? 'animate-pulse-fast' : ''}`}
          />
          
          {/* Main Brain Circle */}
          <circle
            cx="400"
            cy="250"
            r="70"
            fill={hasHighRisk ? "rgba(255, 51, 102, 0.1)" : "rgba(0, 240, 255, 0.1)"}
            stroke={hasHighRisk ? "#FF3366" : "#00F0FF"}
            strokeWidth="3"
            opacity="0.6"
          />
          
          {/* Inner Core - Pulsing */}
          <circle
            cx="400"
            cy="250"
            r="50"
            fill="rgba(157, 78, 221, 0.2)"
            className="animate-pulse"
            style={{ animationDelay: '500ms', animationDuration: '3s' }}
          />
          
          {/* Innermost Core */}
          <circle
            cx="400"
            cy="250"
            r="35"
            fill="rgba(0, 240, 255, 0.3)"
            className="animate-pulse"
            style={{ animationDelay: '1s', animationDuration: '2s' }}
          />

          {/* OctoOps Logo */}
          <text
            x="400"
            y="260"
            fill="#E8F0FF"
            fontSize="40"
            fontFamily="Space Grotesk"
            fontWeight="bold"
            textAnchor="middle"
          >
            🐙
          </text>
        </g>

        {/* Connection Lines between active agents */}
        {agentConfig.map((agent, i) => {
          if (agentStates[agent.name] !== 'active') return null;
          
          return agentConfig.slice(i + 1).map((otherAgent, j) => {
            if (agentStates[otherAgent.name] !== 'active') return null;
            
            // Re-calculate positions for lines to match convergent state
            const currentLength = isConverging ? 80 : 180;
            
            const angle1 = (agent.angle * Math.PI) / 180;
            const angle2 = (otherAgent.angle * Math.PI) / 180;
            const x1 = 400 + Math.cos(angle1) * 70; // Start from brain edge (approx)
            const y1 = 250 + Math.sin(angle1) * 70;
            const x2 = 400 + Math.cos(angle2) * 70;
            const y2 = 250 + Math.sin(angle2) * 70;
            
            return (
              <line
                key={`connection-${i}-${j}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#00F0FF"
                strokeWidth="1"
                opacity="0.2"
                strokeDasharray="5,5"
                className="animate-pulse"
              />
            );
          });
        })}
      </svg>
    </div>
  );
}
