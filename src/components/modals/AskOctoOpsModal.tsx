'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/lib/store';
import { MessageCircle, Lightbulb, Copy, Mail, Save, Zap, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface DecisionResponse {
  recommendation: 'proceed' | 'delay' | 'pivot';
  confidence: number;
  reasons: string[];
  alternatives: string[];
}

const sampleResponses: Record<string, DecisionResponse> = {
  ship: {
    recommendation: 'proceed',
    confidence: 78,
    reasons: [
      'Beta testing showed 94% user satisfaction',
      '3 out of 4 critical features are fully tested',
      'Marketing campaign is already scheduled',
      'Competitor launching similar feature next month',
    ],
    alternatives: ['Soft launch to 10% of users first', 'Delay by 1 week for additional testing', 'Ship with feature flag to enable rollback'],
  },
  delay: {
    recommendation: 'delay',
    confidence: 85,
    reasons: [
      '3 high-priority tasks still incomplete',
      'Security audit pending completion',
      'Team resource bottleneck detected',
      'Risk of quality issues if rushed',
    ],
    alternatives: ['Reduce scope by 20% and ship on time', 'Request 2 additional resources', 'Split release into 2 phases'],
  },
  pivot: {
    recommendation: 'pivot',
    confidence: 72,
    reasons: [
      'Market research shows shifting user priorities',
      'New competitor feature changes landscape',
      'Current approach has technical debt concerns',
      'Team feedback suggests alternative path',
    ],
    alternatives: ['Focus on mobile-first approach', 'Partner with existing solution', 'Reprioritize feature backlog'],
  },
};

export default function AskOctoOpsModal() {
  const { activeModal, closeModal, activateAgent, addActivity, addNotification } = useAppStore();
  const [question, setQuestion] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [response, setResponse] = useState<DecisionResponse | null>(null);

  const isOpen = activeModal === 'ask-octoops';

  const processQuestion = async () => {
    if (!question.trim()) return;

    setIsProcessing(true);
    setResponse(null);

    // Simulate agent consultation
    const agents = ['Risk', 'Planner', 'Execution', 'Communication', 'Recommendation'];
    
    for (let i = 0; i < agents.length; i++) {
      setProcessingStep(i + 1);
      activateAgent(agents[i], 1000);
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    // Generate response based on question keywords
    const lowerQuestion = question.toLowerCase();
    let responseType: keyof typeof sampleResponses = 'proceed';
    
    if (lowerQuestion.includes('delay') || lowerQuestion.includes('wait') || lowerQuestion.includes('behind')) {
      responseType = 'delay';
    } else if (lowerQuestion.includes('change') || lowerQuestion.includes('different') || lowerQuestion.includes('alternative')) {
      responseType = 'pivot';
    }

    setResponse(sampleResponses[responseType]);
    setIsProcessing(false);
    setProcessingStep(0);

    addActivity({
      agent: 'Recommendation',
      action: `Analyzed strategic question: "${question.slice(0, 50)}..."`,
      time: 'Just now',
    });
  };

  const handleExport = (type: 'copy' | 'email' | 'save') => {
    if (!response) return;

    const text = `OctoOps Decision Support\n\nQuestion: ${question}\n\nRecommendation: ${response.recommendation.toUpperCase()}\nConfidence: ${response.confidence}%\n\nReasons:\n${response.reasons.map((r) => `- ${r}`).join('\n')}\n\nAlternatives:\n${response.alternatives.map((a) => `- ${a}`).join('\n')}`;

    if (type === 'copy') {
      navigator.clipboard.writeText(text);
      addNotification({
        agent: 'Communication',
        title: 'Copied to Clipboard',
        message: 'Decision analysis copied successfully',
        type: 'success',
        read: false,
      });
    } else if (type === 'email') {
      addNotification({
        agent: 'Communication',
        title: 'Email Drafted',
        message: 'Decision analysis ready to send',
        type: 'success',
        read: false,
      });
    } else {
      addNotification({
        agent: 'Communication',
        title: 'Report Saved',
        message: 'Decision analysis saved to reports',
        type: 'success',
        read: false,
      });
    }

    activateAgent('Communication');
  };

  const resetModal = () => {
    setQuestion('');
    setResponse(null);
    setIsProcessing(false);
    setProcessingStep(0);
  };

  const recommendationConfig = {
    proceed: { color: '#00FF88', icon: CheckCircle, label: 'Proceed' },
    delay: { color: '#FFB800', icon: Clock, label: 'Delay' },
    pivot: { color: '#9D4EDD', icon: AlertTriangle, label: 'Pivot' },
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { resetModal(); closeModal(); } }}>
      <DialogContent className="glass border-[#9D4EDD]/30 bg-[#0A0E27]/95 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-bold text-[#E8F0FF] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#9D4EDD]/20 border-2 border-[#9D4EDD]/40 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-[#9D4EDD]" />
            </div>
            Ask OctoOps
          </DialogTitle>
          <DialogDescription className="font-mono text-sm text-[#8B9DC3]">
            Get AI-powered strategic recommendations from all five agents
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Question Input */}
          <div className="space-y-2">
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a strategic question... (e.g., 'Should we ship Feature X next week?')"
              className="glass border-[#9D4EDD]/20 focus:border-[#9D4EDD]/60 bg-transparent font-mono text-[#E8F0FF] placeholder:text-[#8B9DC3]/50 min-h-[100px]"
              disabled={isProcessing}
            />
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs text-[#8B9DC3]">{question.length} characters</span>
              <Button
                onClick={processQuestion}
                disabled={isProcessing || !question.trim()}
                className="bg-[#9D4EDD] hover:bg-[#9D4EDD]/90 text-white font-display font-bold rounded-xl glow-purple disabled:opacity-50"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 animate-pulse" />
                    Analyzing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Get Recommendation
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Agent Consultation Animation */}
          {isProcessing && (
            <div className="glass rounded-2xl p-6 border-[#9D4EDD]/30">
              <div className="font-display text-lg font-bold text-[#E8F0FF] mb-4">
                Consulting All Agents...
              </div>
              <div className="space-y-3">
                {['Risk', 'Planner', 'Execution', 'Communication', 'Recommendation'].map((agent, index) => {
                  const colors: Record<string, string> = {
                    Risk: '#FF3366',
                    Planner: '#00F0FF',
                    Execution: '#00FF88',
                    Communication: '#FFB800',
                    Recommendation: '#9D4EDD',
                  };
                  const isActive = processingStep === index + 1;
                  const isComplete = processingStep > index + 1;

                  return (
                    <div
                      key={agent}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                        isActive ? 'glass border-2' : ''
                      }`}
                      style={{ borderColor: isActive ? `${colors[agent]}60` : 'transparent' }}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                          isActive ? 'scale-110' : ''
                        }`}
                        style={{
                          backgroundColor: `${colors[agent]}${isActive || isComplete ? '30' : '10'}`,
                          boxShadow: isActive ? `0 0 20px ${colors[agent]}50` : 'none',
                        }}
                      >
                        {isComplete ? (
                          <CheckCircle className="w-4 h-4" style={{ color: colors[agent] }} />
                        ) : (
                          <Zap className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} style={{ color: colors[agent] }} />
                        )}
                      </div>
                      <span
                        className={`font-display text-sm font-bold transition-colors duration-300 ${
                          isActive || isComplete ? '' : 'opacity-50'
                        }`}
                        style={{ color: isActive || isComplete ? colors[agent] : '#8B9DC3' }}
                      >
                        {agent} Agent
                      </span>
                      {isActive && (
                        <span className="font-mono text-xs text-[#8B9DC3] ml-auto animate-pulse">Processing...</span>
                      )}
                      {isComplete && (
                        <span className="font-mono text-xs ml-auto" style={{ color: colors[agent] }}>
                          ✓ Complete
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Decision Output */}
          {response && !isProcessing && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Recommendation Badge */}
              <div
                className="glass rounded-2xl p-6"
                style={{ borderColor: `${recommendationConfig[response.recommendation].color}40` }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{
                      backgroundColor: `${recommendationConfig[response.recommendation].color}20`,
                      border: `2px solid ${recommendationConfig[response.recommendation].color}60`,
                      boxShadow: `0 0 30px ${recommendationConfig[response.recommendation].color}30`,
                    }}
                  >
                    {React.createElement(recommendationConfig[response.recommendation].icon, {
                      className: 'w-8 h-8',
                      style: { color: recommendationConfig[response.recommendation].color },
                    })}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className="font-display text-2xl font-bold"
                        style={{ color: recommendationConfig[response.recommendation].color }}
                      >
                        {recommendationConfig[response.recommendation].label}
                      </span>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-24 rounded-full bg-white/10 overflow-hidden"
                        >
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${response.confidence}%`,
                              backgroundColor: recommendationConfig[response.recommendation].color,
                            }}
                          />
                        </div>
                        <span className="font-mono text-sm" style={{ color: recommendationConfig[response.recommendation].color }}>
                          {response.confidence}% confidence
                        </span>
                      </div>
                    </div>
                    <p className="font-mono text-sm text-[#8B9DC3]">
                      Based on analysis of current project state, team capacity, and risk factors
                    </p>
                  </div>
                </div>
              </div>

              {/* Reasons */}
              <div className="glass rounded-2xl p-6 border-[#00F0FF]/20">
                <h4 className="font-display text-lg font-bold text-[#00F0FF] mb-4">Key Reasons</h4>
                <ul className="space-y-2">
                  {response.reasons.map((reason, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] mt-2" />
                      <span className="font-mono text-sm text-[#E8F0FF]">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Alternatives */}
              <div className="glass rounded-2xl p-6 border-[#9D4EDD]/20">
                <h4 className="font-display text-lg font-bold text-[#9D4EDD] mb-4">Alternative Actions</h4>
                <div className="flex flex-wrap gap-2">
                  {response.alternatives.map((alt, index) => (
                    <button
                      key={index}
                      className="px-4 py-2 rounded-xl glass border-[#9D4EDD]/30 hover:border-[#9D4EDD]/60 transition-all duration-200 hover:-translate-y-1"
                    >
                      <span className="font-mono text-sm text-[#E8F0FF]">{alt}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Export Options */}
              <div className="flex gap-3">
                <Button
                  onClick={() => handleExport('copy')}
                  variant="outline"
                  className="flex-1 glass border-[#8B9DC3]/30 text-[#8B9DC3] hover:bg-white/5 rounded-xl"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy to Clipboard
                </Button>
                <Button
                  onClick={() => handleExport('email')}
                  variant="outline"
                  className="flex-1 glass border-[#FFB800]/30 text-[#FFB800] hover:bg-[#FFB800]/10 rounded-xl"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email Team
                </Button>
                <Button
                  onClick={() => handleExport('save')}
                  variant="outline"
                  className="flex-1 glass border-[#00FF88]/30 text-[#00FF88] hover:bg-[#00FF88]/10 rounded-xl"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save to Reports
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
