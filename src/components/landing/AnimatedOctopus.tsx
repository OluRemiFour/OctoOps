'use client';

import React, { useEffect, useState } from 'react';

export default function AnimatedOctopus() {
  const [activeTentacle, setActiveTentacle] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTentacle(Math.floor(Math.random() * 5));
      setTimeout(() => setActiveTentacle(null), 2000);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const tentacles = [
    { name: 'Planner', color: '#00F0FF', angle: -60 },
    { name: 'Execution', color: '#00FF88', angle: -30 },
    { name: 'Risk', color: '#FF3366', angle: 0 },
    { name: 'Communication', color: '#FFB800', angle: 30 },
    { name: 'Recommendation', color: '#9D4EDD', angle: 60 }
  ];

  return (
    <div className="relative w-full max-w-1xl aspect-square">
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Glow effects */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          <radialGradient id="brainGradient">
            <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#9D4EDD" stopOpacity="0.1" />
          </radialGradient>
        </defs>

        {/* Tentacles */}
        {tentacles.map((tentacle, index) => {
          const isActive = activeTentacle === index;
          const baseX = 200;
          const baseY = 200;
          const angle = (tentacle.angle * Math.PI) / 180;
          const length = 120;
          const endX = baseX + Math.cos(angle) * length;
          const endY = baseY + Math.sin(angle) * length;
          
          // Create curved path
          const controlX = baseX + Math.cos(angle) * (length * 0.6);
          const controlY = baseY + Math.sin(angle) * (length * 0.6) + 20;

          return (
            <g key={index}>
              {/* Tentacle path */}
              <path
                d={`M ${baseX} ${baseY} Q ${controlX} ${controlY} ${endX} ${endY}`}
                stroke={tentacle.color}
                strokeWidth={isActive ? '6' : '4'}
                fill="none"
                strokeLinecap="round"
                filter={isActive ? 'url(#glow)' : undefined}
                opacity={isActive ? 1 : 0.6}
                className="transition-all duration-500"
                style={{
                  transform: isActive ? 'scale(1.08)' : 'scale(1)',
                  transformOrigin: `${baseX}px ${baseY}px`,
                }}
              />
              
              {/* End node */}
              <circle
                cx={endX}
                cy={endY}
                r={isActive ? '10' : '8'}
                fill={tentacle.color}
                filter={isActive ? 'url(#glow)' : undefined}
                opacity={isActive ? 1 : 0.7}
                className="transition-all duration-500"
              />
              
              {/* Label */}
              <text
                x={endX + Math.cos(angle) * 25}
                y={endY + Math.sin(angle) * 25}
                fill={tentacle.color}
                fontSize="12"
                fontFamily="JetBrains Mono"
                textAnchor="middle"
                opacity={isActive ? 1 : 0.7}
                className="transition-opacity duration-500"
              >
                {tentacle.name}
              </text>
            </g>
          );
        })}

        {/* Central brain */}
        <circle
          cx="200"
          cy="200"
          r="50"
          fill="url(#brainGradient)"
          filter="url(#glow)"
          className="animate-pulse"
        />
        
        <circle
          cx="200"
          cy="200"
          r="50"
          fill="none"
          stroke="#00F0FF"
          strokeWidth="2"
          opacity="0.4"
        />

        {/* Inner core */}
        <circle
          cx="200"
          cy="200"
          r="30"
          fill="rgba(0, 240, 255, 0.2)"
          className="animate-pulse"
          style={{ animationDelay: '500ms' }}
        />

        {/* Logo/Icon in center */}
        <text
          x="200"
          y="210"
          fill="#E8F0FF"
          fontSize="24"
          fontFamily="Space Grotesk"
          fontWeight="bold"
          textAnchor="middle"
        >
          🐙
        </text>
      </svg>
    </div>
  );
}
