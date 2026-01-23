'use client';

import React from 'react';
import HeroSection from './HeroSection';
import AgentShowcase from './AgentShowcase';
import VisualProof from './VisualProof';
import InteractiveDemo from './InteractiveDemo';
import TrustSignals from './TrustSignals';
import CTASection from './CTASection';

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden noise-overlay">
      <HeroSection />
      {/* Rest of the landing page content is fine, but we need to ensure Hero allows routing */}
      <AgentShowcase />
      <VisualProof />
      <InteractiveDemo />
      <TrustSignals />
      <CTASection />
    </div>
  );
}
