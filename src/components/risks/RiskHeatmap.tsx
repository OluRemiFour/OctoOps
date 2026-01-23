'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = ['Jan', 'Feb', 'Mar', 'Apr'];

// Generate sample risk data for calendar
const generateRiskData = () => {
  const data: Record<string, number> = {};
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  
  for (let i = 0; i < 60; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const key = date.toISOString().split('T')[0];
    // Random risk level 0-4 (0 = no risk, 4 = critical)
    data[key] = Math.floor(Math.random() * 5);
  }
  return data;
};

const riskColors = ['#1a1f4a', '#00FF88', '#FFB800', '#FF6B4A', '#FF3366'];
const riskLabels = ['No Risk', 'Low', 'Medium', 'High', 'Critical'];

export default function RiskHeatmap() {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [riskData] = useState(generateRiskData);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const renderCalendar = () => {
    const weeks: JSX.Element[] = [];
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    
    let days: JSX.Element[] = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateKey = date.toISOString().split('T')[0];
      const riskLevel = riskData[dateKey] || 0;
      const isToday = day === now.getDate();
      const isPast = day < now.getDate();
      
      days.push(
        <div
          key={day}
          className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 relative ${
            isToday ? 'ring-2 ring-[#00F0FF]' : ''
          }`}
          style={{
            backgroundColor: isPast || day <= now.getDate() + 7 ? riskColors[riskLevel] : 'rgba(255,255,255,0.05)',
          }}
          onMouseEnter={() => setHoveredDate(dateKey)}
          onMouseLeave={() => setHoveredDate(null)}
        >
          <span className={`font-mono text-xs ${riskLevel >= 2 ? 'text-white' : 'text-[#8B9DC3]'}`}>
            {day}
          </span>
          
          {/* Tooltip */}
          {hoveredDate === dateKey && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 glass rounded-xl whitespace-nowrap z-10 animate-in fade-in slide-in-from-bottom-2">
              <div className="font-mono text-xs text-[#E8F0FF] mb-1">
                {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
              <div 
                className="font-display text-sm font-bold"
                style={{ color: riskColors[riskLevel] }}
              >
                {riskLabels[riskLevel]}
              </div>
            </div>
          )}
        </div>
      );
      
      // Start new week
      if ((firstDay + day) % 7 === 0) {
        weeks.push(<div key={`week-${weeks.length}`} className="flex gap-1">{days}</div>);
        days = [];
      }
    }
    
    // Add remaining days
    if (days.length > 0) {
      weeks.push(<div key={`week-${weeks.length}`} className="flex gap-1">{days}</div>);
    }
    
    return weeks;
  };

  return (
    <div className="glass rounded-3xl p-6 h-full">
      <h2 className="font-display text-2xl font-bold text-[#E8F0FF] mb-6">
        Risk Heatmap
      </h2>
      
      {/* Month Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="font-display text-lg font-bold text-[#00F0FF]">
          {now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
      </div>
      
      {/* Day Labels */}
      <div className="flex gap-1 mb-2">
        {daysOfWeek.map((day) => (
          <div key={day} className="w-8 text-center font-mono text-xs text-[#8B9DC3]">
            {day[0]}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="space-y-1 mb-6">
        {renderCalendar()}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-[#8B9DC3]">Less</span>
        <div className="flex gap-1">
          {riskColors.map((color, index) => (
            <div
              key={index}
              className="w-6 h-6 rounded-md"
              style={{ backgroundColor: color }}
              title={riskLabels[index]}
            />
          ))}
        </div>
        <span className="font-mono text-xs text-[#8B9DC3]">More</span>
      </div>
      
      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-[#00F0FF]/10">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="font-mono text-xs text-[#8B9DC3] mb-1">High Risk Days</div>
            <div className="font-display text-2xl font-bold text-[#FF3366]">5</div>
          </div>
          <div>
            <div className="font-mono text-xs text-[#8B9DC3] mb-1">Avg. Risk Level</div>
            <div className="font-display text-2xl font-bold text-[#FFB800]">Medium</div>
          </div>
        </div>
      </div>
    </div>
  );
}
