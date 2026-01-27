'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useAppStore } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Upload, Calendar, Users, ArrowRight, ShieldCheck, Plus, Trash2, Loader2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

export default function OnboardingWizard() {
  const router = useRouter();
  const { login, user: authContextUser } = useAuth();
  const { updateProject, addTeamMember, openModal, onboardingData, setOnboardingData, activateAgent } = useAppStore();
  const [step, setStep] = useState(1);
    const { toast } = useToast();
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    ownerEmail: '',
    deadline: '',
    milestones: [] as string[],
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Sync with onboarding data from store and localStorage
  React.useEffect(() => {
    // Load owner email from setup if available
    const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('octoops_owner_email') : '';
    if (storedEmail && !formData.ownerEmail) {
        setFormData(prev => ({ ...prev, ownerEmail: storedEmail }));
    }

    if (onboardingData) {
      setFormData(prev => ({
        ...prev,
        projectName: onboardingData.name || prev.projectName,
        description: onboardingData.vision || prev.description,
        deadline: onboardingData.recommendations?.recommendedDeadline || prev.deadline,
        milestones: onboardingData.recommendations?.keyMilestones?.map((m: any) => m.name) || prev.milestones
      }));

      if (onboardingData.recommendations?.teamRecommendations?.roles) {
        setInvites(onboardingData.recommendations.teamRecommendations.roles.map((r: any) => ({
          email: '',
          role: r.role.toLowerCase().includes('qa') ? 'qa' : 'member',
          suggestedRole: r.role
        })));
      }
    }
  }, [onboardingData]);

  const [invites, setInvites] = useState<{ email: string; role: string }[]>([
    { email: '', role: 'qa' }
  ]);

  const handleNext = async () => {
    if (step === 1) {
        // If we have data but no AI recommendations yet, trigger it
        if (formData.projectName && formData.description && !onboardingData?.recommendations) {
            setIsAnalyzing(true);
            activateAgent('Planner', 3000);
            try {
                const { ai } = await import('@/lib/api');
                const res = await ai.getTeamAssembly(formData.projectName, formData.description);
                if (res.data?.error) {
                    throw new Error(res.data.error);
                }
                setOnboardingData({ 
                    name: formData.projectName,
                    vision: formData.description,
                    recommendations: res.data 
                });
                setStep(step + 1);
            } catch (e: any) {
                console.error('AI Onboarding Error:', e);
                toast({
                    title: "AI Analysis Failed",
                    description: e.message || 'The system could not analyze your project pulse. Please try again.',
                    variant: "destructive"
                });
                // DO NOT increment step
            } finally {
                setIsAnalyzing(false);
            }
            return; // Exit early as we handle step increment in try block
        }
    }
    setStep(step + 1);
  };
  const handleBack = () => setStep(step - 1);

  const addInvite = () => setInvites([...invites, { email: '', role: 'member' }]);
  const removeInvite = (index: number) => setInvites(invites.filter((_, i) => i !== index));
  const updateInvite = (index: number, field: 'email' | 'role', value: string) => {
    const newInvites = [...invites];
    newInvites[index] = { ...newInvites[index], [field]: value };
    setInvites(newInvites);
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
        let authUser = authContextUser || JSON.parse(localStorage.getItem('octoops_user') || '{}');
        const ownerEmail = formData.ownerEmail || authUser?.email || 'sarah@octoops.dev';
        const ownerName = localStorage.getItem('octoops_owner_name') || 'Project Owner';

        // 1. Ensure Owner User Exists in DB (Signup/Login)
        try {
            const { auth } = await import('@/lib/api');
            // Try explicit signup first to ensure record exists
            const signupRes = await auth.signup({
                name: ownerName,
                email: ownerEmail,
                role: 'owner',
                projectName: formData.projectName // Context
            });
            if (signupRes.data?.user) {
                authUser = { ...signupRes.data.user, id: signupRes.data.user._id };
            }
        } catch (err: any) {
            // If user already exists (400), try to fetch/login to get ID
            console.log("User might already exist, attempting login...", err);
            const { auth } = await import('@/lib/api');
            const loginRes = await auth.login(ownerEmail);
            if (loginRes.data?.user) {
                authUser = { ...loginRes.data.user, id: loginRes.data.user._id };
            }
        }

        if (!authUser?.id) {
            throw new Error("Could not authenticate project owner. Please sign in.");
        }

        const { completeOnboarding } = useAppStore.getState();
        
        await completeOnboarding({
            name: formData.projectName,
            vision: formData.description,
            team: invites,
            ownerId: authUser.id, // Strictly use DB ID
            ownerEmail: ownerEmail,
            deadline: formData.deadline,
            totalMilestones: formData.milestones.length
        });
 
        // Log in context
        await login(ownerEmail);
        router.push('/dashboard');
        
        toast({
            title: "Project Launched",
            description: "Welcome to your OctoOps command center.",
        });
    } catch (e: any) {
        console.error("Launch failed:", e);
        toast({
            title: "Launch Failed",
            description: e.message || "Mission Critical: Infrastructure deployment failed.",
            variant: "destructive"
        });
    } finally {
        setIsCompleting(false);
    }
  };

  const hasQA = invites.some(i => i.role === 'QA Engineer' && i.email.trim() !== '');

  return (
    <div className="min-h-screen bg-[#0A0E27] noise-overlay flex items-center justify-center p-6 flex-col">
      <div className="w-full max-w-2xl mb-4 ml-2">
         <a href="/" className="text-[#8B9DC3] hover:text-[#E8F0FF] text-sm flex items-center gap-2 transition-colors inline-block">
            &larr; Back to Home
         </a>
      </div>
      <div className="w-full max-w-2xl glass rounded-3xl p-8 border border-[#00F0FF]/20 relative">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-white/5 rounded-t-3xl overflow-hidden">
             <div 
                className="h-full bg-[#00F0FF] transition-all duration-500"
                style={{ width: `${(step / 3) * 100}%` }}
             />
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
            <span className="font-mono text-xs text-[#00F0FF] mb-2 block">STEP {step} OF 3</span>
            <h1 className="font-display text-3xl font-bold text-[#E8F0FF]">
                {step === 1 && 'Project Vision'}
                {step === 2 && 'Timeline & Goals'}
                {step === 3 && 'Assemble Team'}
            </h1>
            {onboardingData?.recommendations && step > 1 && (
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/25 text-[10px] font-mono text-[#00F0FF] uppercase tracking-widest animate-pulse">
                    <Sparkles className="w-3 h-3" />
                    AI Assisted • Smart Autofill Active
                </div>
            )}
        </div>

        {/* Step 1: Project Details */}
        {step === 1 && (
            <div className="space-y-6">
                <div>
                    <label className="font-mono text-sm text-[#8B9DC3] mb-2 block">Project Name</label>
                    <Input 
                        value={formData.projectName}
                        onChange={(e) => setFormData({...formData, projectName: e.target.value})}
                        className="glass border-white/10 text-lg h-12" 
                        placeholder="e.g. Phoenix Protocol" 
                    />
                </div>
                <div>
                    <label className="font-mono text-sm text-[#8B9DC3] mb-2 block">What are you building?</label>
                    <Textarea 
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="glass border-white/10 min-h-[120px]" 
                        placeholder="Describe your project goals, scope, and key features..." 
                    />
                </div>
                
                {/* AI Analysis Trigger */}
                <div 
                    onClick={() => openModal('image-upload')}
                    className="border-2 border-dashed border-[#00F0FF]/30 rounded-xl p-8 text-center hover:bg-[#00F0FF]/5 transition-all cursor-pointer group relative overflow-hidden"
                >
                    <div className="flex flex-col items-center gap-3 relative z-10">
                        <div className="w-12 h-12 rounded-full bg-[#00F0FF]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Upload className="w-6 h-6 text-[#00F0FF]" />
                        </div>
                        <div>
                            <p className="font-mono text-sm text-[#E8F0FF]">Upload Docs, Whiteboards or Briefs</p>
                            <p className="text-xs text-[#8B9DC3] mt-1">OctoOps AI will analyze them to build your roadmap</p>
                        </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00F0FF]/0 via-[#00F0FF]/5 to-[#00F0FF]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </div>
            </div>
        )}

        {/* Step 2: Timeline */}
        {step === 2 && (
            <div className="space-y-6">
                 {onboardingData?.recommendations && (
                    <div className="bg-[#00F0FF]/5 border border-[#00F0FF]/20 rounded-xl p-3 text-[11px] text-[#8B9DC3] leading-relaxed flex gap-3 italic">
                        <Sparkles className="w-4 h-4 text-[#00F0FF] shrink-0" />
                        <span>The target deadline and milestones below have been auto-calculated by OctoOps AI based on your project vision. Adjust as needed.</span>
                    </div>
                 )}
                 <div>
                    <label className="font-mono text-sm text-[#8B9DC3] mb-2 block">Target Deadline</label>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B9DC3]" />
                        <Input 
                            value={formData.deadline}
                            onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                            type="date"
                            className="glass border-white/10 text-lg h-12 pl-12" 
                        />
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="font-mono text-sm text-[#8B9DC3]">Key Milestones</label>
                        <button 
                            onClick={() => {
                                const newMs = [...formData.milestones, 'New Milestone'];
                                setFormData({...formData, milestones: newMs});
                            }}
                            className="text-[#00F0FF] text-xs flex items-center gap-1 hover:underline"
                        >
                            <Plus className="w-3 h-3" /> Add Milestone
                        </button>
                    </div>
                    <div className="space-y-3">
                        {formData.milestones.map((ms, i) => (
                            <div key={i} className="flex gap-2 group">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center font-mono text-xs text-[#8B9DC3] shrink-0">
                                    {i + 1}
                                </div>
                                <Input 
                                    value={ms}
                                    onChange={(e) => {
                                        const newMs = [...formData.milestones];
                                        newMs[i] = e.target.value;
                                        setFormData({...formData, milestones: newMs});
                                    }}
                                    className="glass border-white/10" 
                                />
                                {formData.milestones.length > 1 && (
                                    <button 
                                        onClick={() => {
                                            const newMs = formData.milestones.filter((_, idx) => idx !== i);
                                            setFormData({...formData, milestones: newMs});
                                        }}
                                        className="text-[#FF3366] opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-[#FF3366]/10 rounded"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* Step 3: Team */}
        {step === 3 && (
            <div className="space-y-6">
                {onboardingData?.recommendations && (
                    <div className="bg-[#9D4EDD]/5 border border-[#9D4EDD]/20 rounded-xl p-3 text-[11px] text-[#8B9DC3] leading-relaxed flex gap-3 italic">
                        <Sparkles className="w-4 h-4 text-[#9D4EDD] shrink-0" />
                        <span>Ideally sized team slots have been generated for you. Provide emails to invite these key roles.</span>
                    </div>
                )}
                <div className="bg-[#0A0E27]/50 p-4 rounded-xl border border-[#FFB800]/20 flex gap-3 text-sm text-[#FFB800]">
                    <ShieldCheck className="w-5 h-5 shrink-0" />
                    <p>A QA / Reviewer role is required to ensure quality control in the OctoOps verification loop.</p>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {invites.map((invite, i) => (
                        <div key={i} className="flex gap-3">
                            <Input 
                                value={invite.email}
                                onChange={(e) => updateInvite(i, 'email', e.target.value)}
                                placeholder="teammate@email.com"
                                className="glass border-white/10 flex-1"
                            />
                            <select 
                                value={invite.role}
                                onChange={(e) => updateInvite(i, 'role', e.target.value)}
                                className="bg-[#0A0E27]/50 border border-white/10 rounded-md px-3 text-[#E8F0FF] focus:outline-none focus:border-[#00F0FF]"
                            >
                                <option value="Project Lead">Project Lead</option>
                                <option value="Frontend Developer">Frontend Developer</option>
                                <option value="Backend Developer">Backend Developer</option>
                                <option value="Fullstack Developer">Fullstack Developer</option>
                                <option value="UI/UX Designer">UI/UX Designer</option>
                                <option value="QA Engineer">QA Engineer</option>
                                <option value="Mobile Developer">Mobile Developer</option>
                                <option value="DevOps Engineer">DevOps Engineer</option>
                                <option value="Content Creator">Content Creator</option>
                                <option value="Marketing Manager">Marketing Manager</option>
                                <option value="Technical Writer">Technical Writer</option>
                                <option value="Other">Other</option>
                            </select>
                            {invites.length > 1 && (
                                <button onClick={() => removeInvite(i)} className="p-2 text-[#FF3366] hover:bg-[#FF3366]/10 rounded-lg">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <Button 
                    onClick={addInvite}
                    variant="outline" 
                    className="w-full border-dashed border-white/20 text-[#8B9DC3] hover:text-white"
                >
                    <Plus className="w-4 h-4 mr-2" /> Add Another Member
                </Button>
            </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex justify-between">
            {step > 1 ? (
                <Button onClick={handleBack} variant="ghost" className="text-[#8B9DC3]">Back</Button>
            ) : <div></div>}
            
            {step < 3 ? (
                 <Button 
                    onClick={handleNext} 
                    disabled={isAnalyzing}
                    className="bg-[#00F0FF] text-[#0A0E27] font-bold h-12 px-8 min-w-[160px]"
                 >
                    {isAnalyzing && step === 1 ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            Next Step <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                    )}
                 </Button>
            ) : (
                  <Button 
                     onClick={handleComplete} 
                     disabled={!hasQA || isCompleting || project?.status === 'in-review'}
                     className={`bg-[#00FF88] text-[#0A0E27] font-bold h-12 px-8 min-w-[200px] glow-green disabled:opacity-50 ${project?.status === 'in-review' ? 'cursor-not-allowed' : ''}`}
                  >
                     {isCompleting ? (
                         <>
                             <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                             Initializing Network...
                         </>
                     ) : project?.status === 'in-review' ? (
                        "Project In Review"
                     ) : (
                         "Launch OctoOps"
                     )}
                  </Button>
            )}
        </div>
      </div>
    </div>
  );
}
