'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { Plus, AlertTriangle, CheckCircle, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RisksPage() {
  const { user } = useAuth();
  const { risks, openModal, resolveRisk: markResolved, isHydrated, project } = useAppStore();
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('active');

  const filteredRisks = risks.filter(risk => {
    if (filter === 'active') return !risk.resolved;
    if (filter === 'resolved') return risk.resolved;
    return true;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return { bg: 'bg-[#FF3366]/20', text: 'text-[#FF3366]', border: 'border-[#FF3366]/30' };
      case 'high': return { bg: 'bg-[#FFB800]/20', text: 'text-[#FFB800]', border: 'border-[#FFB800]/30' };
      case 'medium': return { bg: 'bg-[#00F0FF]/20', text: 'text-[#00F0FF]', border: 'border-[#00F0FF]/30' };
      default: return { bg: 'bg-[#8B9DC3]/20', text: 'text-[#8B9DC3]', border: 'border-[#8B9DC3]/30' };
    }
  };

  const activeRisks = risks.filter(r => !r.resolved);
  const criticalCount = activeRisks.filter(r => r.severity === 'critical').length;
  const highCount = activeRisks.filter(r => r.severity === 'high').length;

  if (!isHydrated) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FF3366] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#8B9DC3] font-mono text-xs uppercase tracking-widest">Scanning Project Integrity...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#E8F0FF]">Risk Management</h1>
          <p className="font-mono text-sm text-[#8B9DC3] mt-1">
            Identify and mitigate project risks
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => openModal('ai-risk-analysis')}
            className="bg-[#9D4EDD] text-white hover:bg-[#9D4EDD]/90 font-bold"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI Analysis
          </Button>
          <Button
            onClick={() => openModal('add-risk')}
            className="bg-[#FF3366] text-white hover:bg-[#FF3366]/90 font-bold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Risk
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4 text-center">
          <div className="font-display text-2xl font-bold text-[#FF3366]">{activeRisks.length}</div>
          <div className="font-mono text-xs text-[#8B9DC3] mt-1">Active Risks</div>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <div className="font-display text-2xl font-bold text-[#FF3366]">{criticalCount}</div>
          <div className="font-mono text-xs text-[#8B9DC3] mt-1">Critical</div>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <div className="font-display text-2xl font-bold text-[#FFB800]">{highCount}</div>
          <div className="font-mono text-xs text-[#8B9DC3] mt-1">High Priority</div>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <div className="font-display text-2xl font-bold text-[#00FF88]">
            {risks.filter(r => r.resolved).length}
          </div>
          <div className="font-mono text-xs text-[#8B9DC3] mt-1">Resolved</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="glass rounded-xl p-1 inline-flex">
        {(['active', 'resolved', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
              filter === f
                ? 'bg-[#FF3366] text-white'
                : 'text-[#8B9DC3] hover:text-[#E8F0FF]'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Risks List */}
      <div className="space-y-4">
        {filteredRisks.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-[#00FF88]" />
            </div>
            <h3 className="font-display text-xl font-bold text-[#E8F0FF] mb-2">
              {filter === 'active' ? 'No active risks' : 'No risks found'}
            </h3>
            <p className="text-[#8B9DC3] font-mono text-sm">
              {filter === 'active' ? 'Your project is looking healthy!' : 'Use AI analysis to detect potential risks'}
            </p>
          </div>
        ) : (
          filteredRisks.map((risk) => {
            const colors = getSeverityColor(risk.severity);
            return (
              <div
                key={risk.id}
                className={`glass rounded-2xl p-6 border-2 ${colors.border} ${risk.resolved ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <AlertTriangle className={`w-5 h-5 ${colors.text}`} />
                      <h3 className="font-display text-xl font-bold text-[#E8F0FF]">
                        {risk.title}
                      </h3>
                      <span className={`text-xs px-3 py-1 rounded-full border font-bold ${colors.bg} ${colors.text} ${colors.border}`}>
                        {risk.severity.toUpperCase()}
                      </span>
                      {risk.detectedBy === 'ai' && (
                        <span className="text-xs px-2 py-1 rounded-full bg-[#9D4EDD]/20 text-[#9D4EDD] border border-[#9D4EDD]/30">
                          AI Detected
                        </span>
                      )}
                      {risk.resolved && (
                        <span className="text-xs px-2 py-1 rounded-full bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/30">
                          RESOLVED
                        </span>
                      )}
                    </div>

                    <p className="text-[#E8F0FF] mb-4">{risk.description}</p>

                    {risk.predictedImpact && (
                      <div className="mb-4">
                        <div className="text-xs font-bold text-[#8B9DC3] mb-1">PREDICTED IMPACT</div>
                        <p className="text-sm text-[#FFB800]">{risk.predictedImpact}</p>
                      </div>
                    )}

                    {risk.recommendations && risk.recommendations.length > 0 && (
                      <div className="mb-4">
                        <div className="text-xs font-bold text-[#8B9DC3] mb-2">RECOMMENDATIONS</div>
                        <ul className="space-y-1">
                          {risk.recommendations.map((rec, idx) => (
                            <li key={idx} className="text-sm text-[#00F0FF] flex items-start gap-2">
                              <span className="text-[#00F0FF] mt-1">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {risk.confidence && (
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-[#8B9DC3]">Confidence:</div>
                        <div className="flex-1 max-w-[200px] h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#00FF88]"
                            style={{ width: `${risk.confidence}%` }}
                          />
                        </div>
                        <div className="text-xs font-bold text-[#00FF88]">{risk.confidence}%</div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {!risk.resolved ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => markResolved(risk.id)}
                          className="bg-[#00FF88] text-[#0A0E27] hover:bg-[#00FF88]/90"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Resolve
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openModal('edit-risk', risk)}
                          className="text-[#00F0FF] hover:bg-[#00F0FF]/10"
                        >
                          Edit
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-[#8B9DC3]"
                        disabled
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Resolved
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
