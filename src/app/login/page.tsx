'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Sparkles, ArrowRight, ShieldCheck, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function LoginContent() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode'); // 'admin' (signup) or 'member' (login)
  
  // State for Member Login (Invite Code)
  const [inviteCode, setInviteCode] = useState('');

  // State for Admin Signup/Login
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  
  const handleMemberLogin = async () => {
    if (!inviteCode) return;
    
    const success = await login(inviteCode);
    if (!success) {
        alert('Authentication Failed: Invalid code or unregistered email.');
        return;
    }
    router.push('/dashboard');
  };

  const handleAdminSignup = () => {
    if (!adminEmail) {
        alert('Please provide your email address to initialize your environment.');
        return;
    }
    // Simple state persistence for onboarding
    localStorage.setItem('octoops_owner_email', adminEmail);
    localStorage.setItem('octoops_owner_name', adminName || 'Sarah Chen');
    
    // Redirect to Onboarding Wizard to complete setup
    router.push('/onboarding');
  };

  // Determine view based on URL param
  const isSignup = mode === 'admin';

  return (
    <div className="min-h-screen grid items-center justify-center bg-[#0A0E27] noise-overlay relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#00F0FF] rounded-full blur-[150px] opacity-10 animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#9D4EDD] rounded-full blur-[150px] opacity-10 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-md p-8 glass rounded-3xl relative z-10 mx-4 border border-white/5">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-[#00F0FF]/10 border border-[#00F0FF]/20 flex items-center justify-center mx-auto mb-3 glow-cyan shadow-[0_0_30px_rgba(0,240,255,0.2)]">
            <span className="text-5xl">🐙</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-[#E8F0FF] mb-2 tracking-tight">
            {isSignup ? 'Project Owner' : 'Welcome Team'}
          </h1>
          <p className="font-mono text-sm text-[#8B9DC3]">
            {isSignup 
                ? 'Initialize your OctoOps environment' 
                : 'Access your workspace via invite link'}
          </p>
        </div>

        <div className="space-y-6">
          {isSignup ? (
            /* ADMIN SIGNUP FORM */
            <div className="space-y-2 animate-in fade-in slide-in-from-right-4">
                <div className="space-y-2">
                  <label className="font-mono text-xs text-[#00F0FF] uppercase tracking-wider ml-1">Full Name</label>
                  <div className="relative">
                     <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B9DC3]" />
                     <Input 
                         value={adminName}
                         onChange={(e) => setAdminName(e.target.value)}
                         className="glass border-white/10 text-white pl-12 h-12" 
                         placeholder="Sarah Chen" 
                     />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-mono text-xs text-[#00F0FF] uppercase tracking-wider ml-1">Email Address</label>
                  <div className="relative">
                     <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B9DC3]" />
                     <Input 
                         value={adminEmail}
                         onChange={(e) => setAdminEmail(e.target.value)}
                         type="email"
                         className="glass border-white/10 text-white pl-12 h-12" 
                         placeholder="sarah@octoops.dev" 
                     />
                  </div>
                </div>
               
               <div className="bg-[#00F0FF]/5 border border-[#00F0FF]/20 rounded-xl p-4 text-xs text-[#8B9DC3] leading-relaxed">
                  <span className="text-[#00F0FF] font-bold block mb-1">Getting Started:</span>
                  You will be redirected to the Onboarding Wizard to set up your project vision, timeline, and invite your team.
               </div>

               <Button 
                onClick={handleAdminSignup}
                className="w-full h-14 bg-[#00F0FF] text-[#0A0E27] hover:bg-[#00F0FF]/90 font-bold font-display text-lg rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all hover:scale-[1.02]"
               >
                 Create Free Account
                 <ArrowRight className="w-5 h-5 ml-2" />
               </Button>
               
               <div className="text-center">
                 <a href="/login?mode=member" className="text-xs text-[#8B9DC3] hover:text-[#E8F0FF] hover:underline">
                    Join an existing team instead
                 </a>
               </div>
            </div>
          ) : (
            /* MEMBER LOGIN FORM */
            <div className="animate-in fade-in slide-in-from-left-4">
               <div className="space-y-2">
                 <label className="font-mono text-xs text-[#00FF88] uppercase tracking-wider ml-1">Invite Code / Link / Email Address</label>
                 <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B9DC3]" />
                    <Input 
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        className="glass border-white/10 text-white pl-12 h-12" 
                        placeholder="Enter code or owner email..." 
                    />
                 </div>
                 <p className="text-[10px] text-[#8B9DC3] pl-1 opacity-60">
                    * Authenticated project owners can enter their email directly.
                 </p>
               </div>
               
               <Button 
                onClick={handleMemberLogin}
                className="w-full h-14 bg-[#00FF88] text-[#0A0E27] hover:bg-[#00FF88]/90 font-bold font-display text-lg rounded-xl shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all hover:scale-[1.02]"
               >
                 Access Environment
                 <ArrowRight className="w-5 h-5 ml-2" />
               </Button>

               <div className="text-center pt-2">
                 <a href="/login?mode=admin" className="text-xs text-[#8B9DC3] hover:text-[#E8F0FF] hover:underline">
                    Start your own project
                 </a>
               </div>
            </div>
          )}
        </div>
        
        <div className="absolute top-6 left-6 z-20">
             <a href="/" className="text-[#8B9DC3] hover:text-[#E8F0FF] text-sm flex items-center gap-2 transition-colors">
                &larr; Back to Home
             </a>
        </div>

        <div className="mt-4 text-center border-t border-white/5 pt-3">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
                <Sparkles className="w-3 h-3 text-[#FF3366]" />
                <span className="font-mono text-[10px] text-[#8B9DC3] uppercase tracking-wider">
                  Secure Agentic Environment
                </span>
             </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0E27] flex items-center justify-center font-mono text-[#00F0FF]">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
