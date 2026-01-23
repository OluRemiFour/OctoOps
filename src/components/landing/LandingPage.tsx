'use client';

import React, { useState } from 'react';
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
      <AgentShowcase />
      <VisualProof />
      <InteractiveDemo />
      <TrustSignals />
      <CTASection />
    </div>
  );
}
