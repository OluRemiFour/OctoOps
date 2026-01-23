'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useAppStore } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Upload, Calendar, Users, ArrowRight, ShieldCheck, Plus, Trash2 } from 'lucide-react';

export default function OnboardingWizard() {
  const router = useRouter();
  const { login } = useAuth();
  const { updateProject, addTeamMember } = useAppStore();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    deadline: '',
    milestones: ['MVP Release', 'Beta Testing', 'Public Launch'],
  });

  const [invites, setInvites] = useState<{ email: string; role: string }[]>([
    { email: '', role: 'qa' } // Enforce at least one QA slot initially
  ]);

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const addInvite = () => setInvites([...invites, { email: '', role: 'member' }]);
  const removeInvite = (index: number) => setInvites(invites.filter((_, i) => i !== index));
  const updateInvite = (index: number, field: 'email' | 'role', value: string) => {
    const newInvites = [...invites];
    newInvites[index] = { ...newInvites[index], [field]: value };
    setInvites(newInvites);
  };

  const handleComplete = () => {
    // 1. Update Project Data
    updateProject({
        name: formData.projectName || 'New Project',
        description: formData.description || 'No description provided.',
        totalMilestones: formData.milestones.length
    });

    // 2. Add Invitees to Team (Mock)
    invites.forEach(invite => {
        if (invite.email) {
            addTeamMember({
                name: invite.email.split('@')[0],
                email: invite.email,
                role: invite.role,
                avatar: '👤'
            });
        }
    });

    // 3. Login as Owner & Redirect
    login('owner');
    router.push('/dashboard');
  };

  const hasQA = invites.some(i => i.role === 'qa' && i.email.trim() !== '');

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
                
                {/* File Upload Mock */}
                <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-[#00F0FF]/30 transition-colors cursor-pointer bg-white/5">
                    <Upload className="w-8 h-8 text-[#8B9DC3] mx-auto mb-3" />
                    <p className="font-mono text-sm text-[#E8F0FF]">Upload Docs, Whiteboards or Briefs</p>
                    <p className="text-xs text-[#8B9DC3] mt-1">OctoOps will analyze them for context</p>
                </div>
            </div>
        )}

        {/* Step 2: Timeline */}
        {step === 2 && (
            <div className="space-y-6">
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
                                <option value="member">Member</option>
                                <option value="qa">QA / Reviewer</option>
                                <option value="owner">Admin</option>
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
                 <Button onClick={handleNext} className="bg-[#00F0FF] text-[#0A0E27] font-bold">
                    Next Step <ArrowRight className="w-4 h-4 ml-2" />
                 </Button>
            ) : (
                 <Button 
                    onClick={handleComplete} 
                    disabled={!hasQA}
                    className="bg-[#00FF88] text-[#0A0E27] font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    Launch OctoOps
                 </Button>
            )}
        </div>
      </div>
    </div>
  );
}
