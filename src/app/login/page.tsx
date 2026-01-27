'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Sparkles, ArrowRight, ShieldCheck, Mail, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from "@/components/ui/use-toast";

function LoginContent() {
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode'); 
  
  // State for Member Login (Invite Code)
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // State for Admin Signup/Login
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [isOwnerLoading, setIsOwnerLoading] = useState(false);
  
  // Auto-fill invite code from URL
  React.useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setInviteCode(code);
    }
  }, [searchParams]);

  const handleMemberLogin = async () => {
    if (!inviteCode) return;
    
    setIsLoading(true);
    try {
        // 1. Try to accept the invite first if it's a code (hex-like check or just try)
        // If it's an email, it will fail or we can skip. 
        // Hex codes are typically 32 chars.
        if (inviteCode.length > 20 && !inviteCode.includes('@')) {
            try {
                console.log(`[JoinFlow] Attempting to auto-accept invite: ${inviteCode}`);
                const { team } = await import('@/lib/api');
                const acceptanceRes = await team.acceptInvite(inviteCode, 'Team Member');
                console.log(`[JoinFlow] Acceptance result:`, acceptanceRes.data);
            } catch (acceptErr) {
                console.warn("[JoinFlow] Auto-accept failed or skipped (might be already accepted):", acceptErr);
            }
        }

        // 2. Perform the actual login
        await login(inviteCode);
        router.push('/dashboard');
    } catch (error: any) {
        const errorMessage = error.response?.data?.error || error.message || "An unexpected error occurred during login.";
        
        toast({
            title: "Authentication Failed",
            description: errorMessage,
            variant: "destructive"
        });
    } finally {
        setIsLoading(false);
    }
  };

  const handleAdminSignup = async () => {
    if (!adminEmail) {
        toast({
            title: "Validation Error",
            description: "Please provide your email address to initialize your environment.",
            variant: "destructive"
        });
        return;
    }

    setIsOwnerLoading(true);
    
    try {
        // Check if owner already exists by attempting login
        const { auth } = await import('@/lib/api');
        // We use the same login endpoint; if it returns user, they exist
        const response = await auth.login(adminEmail).catch(() => null);
        
        if (response?.data?.user) {
            // User exists - Log them in directly
            await login(adminEmail);
            toast({
                title: "Welcome Back",
                description: "Recovering your command center...",
            });
            router.push('/dashboard');
        } else {
            // User does not exist - Go to Onboarding (Signup)
            // Simple state persistence for onboarding
            localStorage.setItem('octoops_owner_email', adminEmail);
            localStorage.setItem('octoops_owner_name', adminName || 'Project Owner');
            
            router.push('/onboarding');
        }
    } catch (e) {
        // Fallback to onboarding if check fails strangely, or error out
        console.error("Owner check failed", e);
        router.push('/onboarding');
    } finally {
        setIsOwnerLoading(false);
    }
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

      <div className="absolute top-8 left-8 z-20">
             <a href="/" className="text-[#8B9DC3] hover:text-[#E8F0FF] text-sm flex items-center gap-2 transition-colors">
                &larr; Back to Home
             </a>
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
                 disabled={isOwnerLoading}
                 className="w-full h-14 bg-[#00F0FF] text-[#0A0E27] hover:bg-[#00F0FF]/90 font-bold font-display text-lg rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all hover:scale-[1.02]"
               >
                 {isOwnerLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Initializing...
                    </>
                 ) : (
                    <>
                        Create Free Account
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                 )}
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
               <div className="space-y-4">
                 <label className="font-mono text-xs text-[#00FF88] uppercase tracking-wider ml-1">Invite Code / Email Address</label>
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
                disabled={isLoading}
                className="w-full h-14 bg-[#00FF88] text-[#0A0E27] hover:bg-[#00FF88]/90 font-bold font-display text-lg rounded-xl shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all hover:scale-[1.02]"
               >
                 {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Verifying Access...
                    </>
                 ) : (
                    <>
                        Access Environment
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                 )}
               </Button>

               <div className="text-center pt-2">
                 <a href="/login?mode=admin" className="text-xs text-[#8B9DC3] hover:text-[#E8F0FF] hover:underline">
                    Start your own project
                 </a>
               </div>
            </div>
          )}
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
