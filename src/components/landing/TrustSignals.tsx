'use client';

import React from 'react';
import { Clock, TrendingUp, Target, Users } from 'lucide-react';

const metrics = [
  {
    icon: Clock,
    value: '2,847',
    label: 'Hours Saved',
    sublabel: 'Across all teams this month',
    color: '#00F0FF'
  },
  {
    icon: TrendingUp,
    value: '94%',
    label: 'Risks Predicted',
    sublabel: 'Before they became critical',
    color: '#FF3366'
  },
  {
    icon: Target,
    value: '89%',
    label: 'On-Time Delivery',
    sublabel: 'Projects shipped as planned',
    color: '#00FF88'
  },
  {
    icon: Users,
    value: '12K+',
    label: 'Active Teams',
    sublabel: 'Trust OctoOps daily',
    color: '#9D4EDD'
  }
];

export default function TrustSignals() {
  return (
    <section className="relative py-32 px-6 bg-gradient-to-b from-transparent via-[#0A0E27] to-transparent">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-5xl font-bold mb-6">
            Proven <span className="text-[#00FF88]">Results</span>
          </h2>
          <p className="text-[#8B9DC3] text-xl font-mono">
            Real metrics from teams using OctoOps to ship better, faster
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            
            return (
              <div
                key={index}
                className="glass rounded-3xl p-8 text-center transition-all duration-300 hover:-translate-y-2 group"
                style={{
                  borderColor: `${metric.color}20`
                }}
              >
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{
                      backgroundColor: `${metric.color}15`,
                      border: `2px solid ${metric.color}40`,
                      boxShadow: `0 0 20px ${metric.color}20`
                    }}
                  >
                    <Icon 
                      className="w-8 h-8"
                      style={{ color: metric.color }}
                    />
                  </div>
                </div>

                {/* Value */}
                <div 
                  className="font-display text-5xl font-bold mb-3 transition-colors duration-300"
                  style={{ color: metric.color }}
                >
                  {metric.value}
                </div>

                {/* Label */}
                <div className="font-display text-lg font-bold text-[#E8F0FF] mb-2">
                  {metric.label}
                </div>

                {/* Sublabel */}
                <div className="font-accent text-sm text-[#8B9DC3]">
                  {metric.sublabel}
                </div>
              </div>
            );
          })}
        </div>

        {/* Testimonial Section */}
        <div className="mt-20 glass rounded-3xl p-12 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#00F0FF] to-[#9D4EDD] p-1">
                <div className="w-full h-full rounded-full bg-[#0A0E27] flex items-center justify-center">
                  <span className="text-4xl">👨‍💼</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <p className="font-mono text-lg text-[#E8F0FF] leading-relaxed mb-4 italic">
                "OctoOps caught a critical dependency issue 2 days before our launch deadline. 
                The Risk Agent flagged it, Communication Agent coordinated the team, and we 
                shipped on time. It's like having an AI project manager who never sleeps."
              </p>
              <div>
                <div className="font-display font-bold text-[#00F0FF]">Sarah Chen</div>
                <div className="font-accent text-sm text-[#8B9DC3]">Head of Engineering, TechCorp</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
