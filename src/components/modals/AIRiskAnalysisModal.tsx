'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { Sparkles, Loader2, AlertTriangle, ShieldCheck, TrendingDown } from 'lucide-react';
import { risks as risksApi } from '@/lib/api';

export default function AIRiskAnalysisModal() {
  const { activeModal, closeModal, project, tasks, fetchRisks, addActivity, activateAgent } = useAppStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const isOpen = activeModal === 'ai-risk-analysis';

  const handleStartAnalysis = async () => {
    if (!project?._id) return;
    
    setIsAnalyzing(true);
    activateAgent('Risk', 5000);
    try {
      const res = await risksApi.analyze(project._id, {
        name: project.name,
        tasks: tasks.map(t => ({ title: t.title, status: t.status, priority: t.priority })),
        deadline: project.deadline,
        teamSize: project.team?.length || 0
      });
      setResults(res.data);
      addActivity({
        agent: 'Risk',
        action: `Completed AI risk sweep for ${project.name}`,
        time: 'Just now'
      });
      await fetchRisks();
    } catch (error) {
      console.error('AI Risk Analysis failed:', error);
      alert('Analysis failed. Please ensure your Gemini API key is valid.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetModal = () => {
    setResults(null);
    setIsAnalyzing(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { resetModal(); closeModal(); } }}>
      <DialogContent className="glass border-[#9D4EDD]/30 bg-[#0A0E27]/95 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-bold text-[#E8F0FF] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#9D4EDD]/20 border-2 border-[#9D4EDD]/40 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#9D4EDD]" />
            </div>
            AI Risk Guard
          </DialogTitle>
          <DialogDescription className="font-mono text-sm text-[#8B9DC3]">
            Deep scan project context to identify hidden threats and bottlenecks
          </DialogDescription>
        </DialogHeader>

        {!results && !isAnalyzing ? (
          <div className="py-12 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 mx-auto flex items-center justify-center">
              <ShieldCheck className="w-10 h-10 text-[#00F0FF] opacity-50" />
            </div>
            <p className="text-[#8B9DC3] max-w-sm mx-auto">
              Ready to perform a comprehensive sweep of your tasks, timeline, and team capacity.
            </p>
            <Button
              onClick={handleStartAnalysis}
              className="bg-[#9D4EDD] hover:bg-[#9D4EDD]/90 text-white font-bold h-12 px-8 rounded-xl glow-purple"
            >
              Start AI Scan
            </Button>
          </div>
        ) : isAnalyzing ? (
          <div className="py-12 text-center space-y-6">
            <div className="relative w-24 h-24 mx-auto">
              <Loader2 className="w-24 h-24 text-[#9D4EDD] animate-spin" />
              <AlertTriangle className="absolute inset-0 m-auto w-8 h-8 text-[#9D4EDD] animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Scanning Project Pulse...</h3>
              <p className="text-[#8B9DC3] font-mono text-sm">Identifying potential deadline slippage and resource conflicts</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="p-4 rounded-xl bg-[#00FF88]/10 border border-[#00FF88]/20 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#00FF88]/20 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-[#00FF88]" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#00FF88]">Analysis Complete</div>
                <div className="text-xs text-[#8B9DC3]">Found {results.length} focus areas</div>
              </div>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {results.map((risk: any, i: number) => (
                <div key={i} className="glass p-4 rounded-xl border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{risk.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      risk.severity === 'high' ? 'bg-[#FF3366]/20 text-[#FF3366]' : 'bg-[#FFB800]/20 text-[#FFB800]'
                    }`}>
                      {risk.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-[#8B9DC3] leading-relaxed">{risk.description}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={closeModal} className="glass border-white/10 text-white hover:bg-white/5">
                Dismiss
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
