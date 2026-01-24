'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { AlertTriangle, CheckCircle, Clock, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const severityConfig = {
  low: { color: '#00FF88', label: 'Low', icon: Clock },
  medium: { color: '#FFB800', label: 'Medium', icon: AlertTriangle },
  high: { color: '#FF6B4A', label: 'High', icon: AlertTriangle },
  critical: { color: '#FF3366', label: 'Critical', icon: AlertTriangle },
};

export default function RiskCards() {
  const { risks, resolveRisk, activateAgent, addActivity, addNotification } = useAppStore();
  const [expandedRisk, setExpandedRisk] = useState<string | null>(null);
  const [showResolved, setShowResolved] = useState(false);

  const activeRisks = risks.filter((r) => !r.resolved);
  const resolvedRisks = risks.filter((r) => r.resolved);
  const displayRisks = showResolved ? resolvedRisks : activeRisks;

  const handleResolve = (riskId: string) => {
    resolveRisk(riskId);
    activateAgent('Risk', 2000);
    addNotification({
      agent: 'Risk',
      title: 'Risk Resolved',
      message: 'Risk has been marked as resolved',
      type: 'success',
      read: false,
    });
  };

  const handleRecommendation = (riskId: string, recommendation: string) => {
    activateAgent('Recommendation', 2000);
    addActivity({
      agent: 'Recommendation',
      action: `Executing recommendation: ${recommendation}`,
      time: 'Just now',
    });
    addNotification({
      agent: 'Recommendation',
      title: 'Action Initiated',
      message: recommendation,
      type: 'info',
      read: false,
    });
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-[#E8F0FF]">
          {showResolved ? 'Resolved Risks' : 'Active Risks'}
          <span className="ml-2 text-[#8B9DC3] text-lg">
            ({displayRisks.length})
          </span>
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowResolved(!showResolved)}
          className="text-[#8B9DC3] hover:text-[#E8F0FF]"
        >
          {showResolved ? 'Show Active' : 'Show Resolved'}
        </Button>
      </div>

      {/* Risk Cards */}
      <ScrollArea className="h-[calc(100vh-350px)]">
        <div className="space-y-4 pr-4">
          {displayRisks.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center">
              <CheckCircle className="w-12 h-12 text-[#00FF88] mx-auto mb-4" />
              <div className="font-display text-lg font-bold text-[#E8F0FF] mb-2">
                {showResolved ? 'No Resolved Risks' : 'No Active Risks'}
              </div>
              <div className="font-mono text-sm text-[#8B9DC3]">
                {showResolved
                  ? 'Resolved risks will appear here'
                  : 'Risk Agent is continuously monitoring your project'}
              </div>
            </div>
          ) : (
            displayRisks.map((risk) => {
              const config = severityConfig[risk.severity];
              const Icon = config.icon;
              const isExpanded = expandedRisk === risk.id;

              return (
                <div
                  key={risk.id}
                  className={`glass rounded-2xl overflow-hidden transition-all duration-300 ${
                    risk.resolved ? 'opacity-60' : ''
                  }`}
                  style={{ borderColor: `${config.color}30` }}
                >
                  {/* Header */}
                  <div
                    className="p-5 cursor-pointer"
                    onClick={() => setExpandedRisk(isExpanded ? null : risk.id)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Severity Icon */}
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          !risk.resolved ? 'animate-pulse' : ''
                        }`}
                        style={{
                          backgroundColor: `${config.color}20`,
                          border: `2px solid ${config.color}40`,
                          boxShadow: !risk.resolved ? `0 0 20px ${config.color}30` : 'none',
                        }}
                      >
                        <Icon className="w-6 h-6" style={{ color: config.color }} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className="px-3 py-1 rounded-full font-mono text-xs"
                            style={{
                              backgroundColor: `${config.color}20`,
                              color: config.color,
                            }}
                          >
                            {config.label.toUpperCase()}
                          </span>
                          <span className="font-mono text-xs text-[#8B9DC3]">
                            {formatTime(risk.detectedAt)}
                          </span>
                        </div>
                        <h3 className="font-display text-lg font-bold text-[#E8F0FF] mb-2">
                          {risk.title}
                        </h3>
                        <p className="font-mono text-sm text-[#8B9DC3] line-clamp-2">
                          {risk.description}
                        </p>
                      </div>

                      {/* Expand Icon */}
                      <button className="text-[#8B9DC3] hover:text-[#E8F0FF] transition-colors">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-5 pb-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
                      {/* Confidence Meter */}
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-xs text-[#8B9DC3]">
                              AI Confidence
                            </span>
                            <span
                              className="font-display font-bold"
                              style={{ color: config.color }}
                            >
                              {risk.confidence}%
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${risk.confidence}%`,
                                backgroundColor: config.color,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Predicted Impact */}
                      <div>
                        <div className="font-mono text-xs text-[#8B9DC3] mb-2">
                          Predicted Impact
                        </div>
                        <div className="glass rounded-xl p-3 bg-white/5">
                          <p className="font-mono text-sm text-[#E8F0FF]">
                            {risk.predictedImpact}
                          </p>
                        </div>
                      </div>

                      {/* Affected Tasks */}
                      {risk.affectedTasks && risk.affectedTasks.length > 0 && (
                        <div>
                          <div className="font-mono text-xs text-[#8B9DC3] mb-2">
                            Affected Tasks
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {risk.affectedTasks.map((taskId) => (
                              <span
                                key={taskId}
                                className="px-2 py-1 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30 font-mono text-xs text-[#00F0FF]"
                              >
                                Task #{taskId}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommendations */}
                      {!risk.resolved && risk.recommendations && risk.recommendations.length > 0 && (
                        <div>
                          <div className="font-mono text-xs text-[#8B9DC3] mb-2">
                            Recommended Actions
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {risk.recommendations.map((rec, index) => (
                              <button
                                key={index}
                                onClick={() => handleRecommendation(risk.id, rec)}
                                className="px-3 py-2 rounded-xl glass border-[#9D4EDD]/30 hover:border-[#9D4EDD]/60 hover:bg-[#9D4EDD]/10 transition-all duration-200 hover:-translate-y-0.5"
                              >
                                <span className="font-mono text-xs text-[#E8F0FF]">{rec}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      {!risk.resolved && (
                        <div className="flex gap-3 pt-2">
                          <Button
                            onClick={() => handleResolve(risk.id)}
                            className="flex-1 bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0A0E27] font-display font-bold rounded-xl"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark Resolved
                          </Button>
                          <Button
                            variant="outline"
                            className="glass border-[#8B9DC3]/30 text-[#8B9DC3] hover:bg-white/5 rounded-xl"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Dismiss
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
