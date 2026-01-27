'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/lib/store';
import { Sparkles, Users, Calendar, Target, Rocket, Loader2, Image as ImageIcon, Edit3, Check } from 'lucide-react';
import { ai, projects as projectsApi } from '@/lib/api';
import { useToast } from "@/components/ui/use-toast";

export default function ProjectVisionModal() {
  const { activeModal, openModal, closeModal, project, updateProject, fetchProject, fetchTasks, addActivity, activateAgent, onboardingData, setOnboardingData } = useAppStore();
  const { toast } = useToast();
  const [projectName, setProjectName] = useState('');
  const [vision, setVision] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [step, setStep] = useState<'input' | 'recommendations'>('input');
  
  // States for editing recommendations
  const [editedDeadline, setEditedDeadline] = useState('');
  const [editedMilestones, setEditedMilestones] = useState<any[]>([]);
  const [editedTeam, setEditedTeam] = useState<any[]>([]);

  // Sync with onboarding data
  useEffect(() => {
    if (onboardingData?.name) setProjectName(onboardingData.name);
    if (onboardingData?.vision) setVision(onboardingData.vision);
    
    // If we have AI results in onboarding data (from image upload), populate them
    if (onboardingData?.recommendations) {
      const recs = onboardingData.recommendations;
      setRecommendations(recs);
      setEditedDeadline(recs.recommendedDeadline || '');
      setEditedMilestones(recs.keyMilestones || []);
      setEditedTeam(recs.teamRecommendations?.roles || []);
      setStep('recommendations');
    }
  }, [onboardingData]);

  const isOpen = activeModal === 'project-vision';

  const handleAnalyze = async () => {
    const currentName = projectName || onboardingData?.name;
    const currentVision = vision || onboardingData?.vision;

    if (!currentName || !currentVision) {
      toast({
        title: "Missing Information",
        description: "Please provide a project name and vision context (or upload a mockup).",
        variant: "destructive"
      });
      return;
    }
    
    setIsAnalyzing(true);
    try {
      console.log('Analyzing vision for:', currentName);
      const res = await ai.getTeamAssembly(currentName, currentVision);
      console.log('AI Raw Response:', res.data);
      
      const data = res.data?.recommendations || res.data?.data || res.data?.teamAssembly || res.data;
      
      if (!data) {
        throw new Error('No data received from AI. Please try refining your vision.');
      }

      // Map dynamic fields with fallbacks
      const milestones = data.keyMilestones || data.milestones || [];
      const team = data.teamRecommendations?.roles || data.teamRecommendations || data.roles || data.team || [];
      let deadline = data.recommendedDeadline || data.deadline || '';
      
      // Validate deadline: If missing or in the past, default to +30 days
      const dateObj = new Date(deadline);
      const now = new Date();
      if (!deadline || isNaN(dateObj.getTime()) || dateObj < now) {
          const future = new Date();
          future.setDate(future.getDate() + 30); // Default to 1 month sprint
          deadline = future.toISOString().split('T')[0];
      }

      setRecommendations(data);
      setEditedDeadline(deadline);
      setEditedMilestones(milestones);
      setEditedTeam(team);
      setStep('recommendations');
      
      // Save results to global store
      setOnboardingData({ 
        name: currentName,
        vision: currentVision,
        recommendations: data 
      });
      
      activateAgent('Planner', 3000);
    } catch (error: any) {
      console.error('Failed to analyze vision:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || 'AI analysis failed. Please try again.',
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLaunch = async () => {
    setIsAnalyzing(true);
    try {
      // Update project with agreed details
      if (project?._id) {
        await projectsApi.update({
          projectId: project._id,
          deadline: editedDeadline,
          totalMilestones: editedMilestones.length
        });
        
        // Generate initial tasks
        await ai.generateTasks(project._id);
      }
      
      addActivity({
        agent: 'Planner',
        action: 'Launched project with AI-generated roadmap and tasks',
        time: 'Just now'
      });

      activateAgent('Execution', 5000);
      activateAgent('Communication', 5000);
      activateAgent('Risk', 5000);
      activateAgent('Recommendation', 5000);
      
      await fetchProject();
      await fetchTasks();
      closeModal();
      toast({
        title: "OctoOps Launched",
        description: "AI Agents are now active and team has been assembled.",
      });
    } catch (error) {
      console.error('Failed to launch project:', error);
      toast({
        title: "Launch Error",
        description: "Failed to launch project tasks.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) closeModal(); }}>
      <DialogContent className="glass border-[#9D4EDD]/30 bg-[#0A0E27]/95 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-bold text-[#E8F0FF] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#9D4EDD]/20 border-2 border-[#9D4EDD]/40 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-[#9D4EDD]" />
            </div>
            Project Vision & Assembly
          </DialogTitle>
          <DialogDescription className="font-mono text-sm text-[#8B9DC3]">
            Define your vision and let OctoOps AI assemble the ideal roadmap
          </DialogDescription>
        </DialogHeader>

        {step === 'input' ? (
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#00F0FF] uppercase tracking-wider font-mono">Mission Codename</label>
                <Input
                  placeholder="e.g. Project Quantum, OctoScale..."
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="glass border-white/10 text-xl font-bold h-14 focus:border-[#00F0FF]/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#9D4EDD] uppercase tracking-wider font-mono">Vision Context / Requirements</label>
                <Textarea
                  placeholder="Describe your goals, tech stack, and key deliverables..."
                  value={vision}
                  onChange={(e) => setVision(e.target.value)}
                  className="glass min-h-[160px] border-white/10 text-[#E8F0FF] placeholder:text-white/20"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button
                onClick={() => openModal('image-upload')}
                className="flex-1 glass border-[#00F0FF]/30 text-[#00F0FF] hover:bg-[#00F0FF]/10 h-16"
              >
                <ImageIcon className="w-5 h-5 mr-2" />
                Upload Mockup
              </Button>
              <Button
                onClick={handleAnalyze}
                disabled={!projectName || !vision || isAnalyzing}
                className="flex-[2] bg-[#9D4EDD] hover:bg-[#9D4EDD]/90 text-white h-16 font-bold text-lg rounded-xl glow-purple"
              >
                {isAnalyzing ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin w-5 h-5" />
                    Analyzing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Next Step: AI Vision Scan
                  </span>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-8 py-4">
            <div className="p-4 rounded-xl bg-[#9D4EDD]/10 border border-[#9D4EDD]/20">
              <p className="text-[#E8F0FF] text-sm italic">
                "Based on your vision, OctoOps AI recommends the following structure. Feel free to adjust any details before launching."
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Timeline & Milestones */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#00F0FF]">
                  <Calendar className="w-5 h-5" />
                  <h3 className="font-bold uppercase tracking-wider">Timeline & Roadmap</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-[#8B9DC3] mb-1 block">Target Deadline</label>
                    <Input
                      type="date"
                      value={editedDeadline}
                      onChange={(e) => setEditedDeadline(e.target.value)}
                      className="glass border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-[#8B9DC3] mb-1 block">Key Milestones</label>
                    {editedMilestones.map((m, i) => (
                      <div key={i} className="glass p-3 rounded-lg border-white/5 flex items-center justify-between">
                        <span className="text-sm text-[#E8F0FF]">{m.name}</span>
                        <span className="text-[10px] text-[#00FF88] border border-[#00FF88]/30 px-2 py-0.5 rounded-full">{m.estimatedWeeks} weeks</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Team Assembly */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#FFB800]">
                  <Users className="w-5 h-5" />
                  <h3 className="font-bold uppercase tracking-wider">Ideal Team</h3>
                </div>
                <div className="space-y-3">
                  {(editedTeam || []).map((role, i) => (
                    <div key={i} className="glass p-4 rounded-xl border-white/5 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#E8F0FF]">{role?.role || 'Team Member'}</span>
                        <span className="text-xs bg-white/5 px-2 py-1 rounded">Qty: {role?.count || 1}</span>
                      </div>
                      <p className="text-[10px] text-[#8B9DC3]">
                        {Array.isArray(role?.responsibilities) ? role.responsibilities.join(', ') : 'Assisting with project deliverables'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-white/5">
              <Button
                variant="ghost"
                onClick={() => setStep('input')}
                className="text-[#8B9DC3] hover:text-[#E8F0FF]"
              >
                Back to Vision
              </Button>
              <Button
                onClick={handleLaunch}
                disabled={isAnalyzing}
                className="flex-1 bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0A0E27] h-14 font-bold text-xl glow-green"
              >
                {isAnalyzing ? <Loader2 className="animate-spin mr-2" /> : <Rocket className="w-6 h-6 mr-2" />}
                Launch OctoOps
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
