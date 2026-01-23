'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { FileText, Download, TrendingUp, Clock, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';

type ReportType = 'overview' | 'tasks' | 'risks' | 'team';

interface ReportData {
  type: ReportType;
  title: string;
  icon: React.ElementType;
  color: string;
  metrics: { label: string; value: string | number; change?: string }[];
}

export default function ViewReportsModal() {
  const { activeModal, closeModal, project, tasks, risks, team, activities } = useAppStore();
  const [selectedReport, setSelectedReport] = useState<ReportType>('overview');

  const isOpen = activeModal === 'view-reports';
  
  if (!isOpen) return null;
  if (!project) {
    return (
      <Dialog open={isOpen} onOpenChange={closeModal}>
        <DialogContent className="glass border-[#00F0FF]/30 bg-[#0A0E27]/95">
          <DialogHeader>
            <DialogTitle className="text-[#E8F0FF]">No Project Selected</DialogTitle>
            <DialogDescription className="text-[#8B9DC3]">Please select or create a project to view reports.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end pt-4">
            <Button onClick={closeModal} className="bg-[#00F0FF] text-[#0A0E27]">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const completedTasks = tasks.reduce((acc, task) => {
    const countDone = (t: typeof tasks[0]): number => {
      let count = t.status === 'done' ? 1 : 0;
      if (t.subtasks) {
        count += t.subtasks.reduce((a, st) => a + countDone(st), 0);
      }
      return count;
    };
    return acc + countDone(task);
  }, 0);

  const totalTasks = tasks.reduce((acc, task) => {
    const countAll = (t: typeof tasks[0]): number => {
      let count = 1;
      if (t.subtasks) {
        count += t.subtasks.reduce((a, st) => a + countAll(st), 0);
      }
      return count;
    };
    return acc + countAll(task);
  }, 0);

  const activeRisks = risks.filter((r) => !r.resolved).length;
  const highRisks = risks.filter((r) => !r.resolved && (r.severity === 'high' || r.severity === 'critical')).length;

  const reports: ReportData[] = [
    {
      type: 'overview',
      title: 'Project Overview',
      icon: TrendingUp,
      color: '#00F0FF',
      metrics: [
        { label: 'Health Score', value: `${project.healthScore}/100`, change: '+5 from last week' },
        { label: 'Progress', value: `${project.progress}%`, change: '+12% this sprint' },
        { label: 'Milestones', value: `${project.milestonesCompleted}/${project.totalMilestones}` },
        { label: 'Team Size', value: team.length },
        { label: 'Agent Actions (24h)', value: activities.length },
        { label: 'Days to Deadline', value: 18 },
      ],
    },
    {
      type: 'tasks',
      title: 'Task Analytics',
      icon: CheckCircle,
      color: '#00FF88',
      metrics: [
        { label: 'Total Tasks', value: totalTasks },
        { label: 'Completed', value: completedTasks, change: `${Math.round((completedTasks / totalTasks) * 100)}%` },
        { label: 'In Progress', value: totalTasks - completedTasks - 2 },
        { label: 'Blocked', value: 1, change: 'Needs attention' },
        { label: 'Avg. Completion Time', value: '3.2 days' },
        { label: 'On-Time Rate', value: '87%', change: '+3% from last sprint' },
      ],
    },
    {
      type: 'risks',
      title: 'Risk Assessment',
      icon: AlertTriangle,
      color: '#FF3366',
      metrics: [
        { label: 'Active Risks', value: activeRisks },
        { label: 'High/Critical', value: highRisks, change: 'Requires immediate action' },
        { label: 'Risks Resolved', value: risks.filter((r) => r.resolved).length },
        { label: 'Avg. Confidence', value: `${Math.round(risks.reduce((a, r) => a + r.confidence, 0) / risks.length)}%` },
        { label: 'Detection Rate', value: '94%' },
        { label: 'Prevention Rate', value: '78%' },
      ],
    },
    {
      type: 'team',
      title: 'Team Performance',
      icon: Clock,
      color: '#FFB800',
      metrics: [
        { label: 'Team Members', value: team.length },
        { label: 'Tasks/Person', value: Math.round(totalTasks / team.length * 10) / 10 },
        { label: 'Response Time', value: '< 2 hours' },
        { label: 'Collaboration Score', value: '92/100' },
        { label: 'Workload Balance', value: 'Good', change: '1 person overloaded' },
        { label: 'Sprint Velocity', value: '34 pts', change: '+8% from last sprint' },
      ],
    },
  ];

  const currentReport = reports.find((r) => r.type === selectedReport) || reports[0];
  const Icon = currentReport.icon;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="glass border-[#FF3366]/30 bg-[#0A0E27]/95 max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-bold text-[#E8F0FF] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF3366]/20 border-2 border-[#FF3366]/40 flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#FF3366]" />
            </div>
            Project Reports
          </DialogTitle>
          <DialogDescription className="font-mono text-sm text-[#8B9DC3]">
            Real-time analytics and insights from all AI agents
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Report Type Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {reports.map((report) => {
              const ReportIcon = report.icon;
              const isSelected = selectedReport === report.type;

              return (
                <button
                  key={report.type}
                  onClick={() => setSelectedReport(report.type)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 whitespace-nowrap ${
                    isSelected
                      ? 'glass border-2'
                      : 'bg-white/5 hover:bg-white/10 border-2 border-transparent'
                  }`}
                  style={{ borderColor: isSelected ? `${report.color}40` : 'transparent' }}
                >
                  <ReportIcon className="w-4 h-4" style={{ color: isSelected ? report.color : '#8B9DC3' }} />
                  <span
                    className="font-display text-sm font-bold"
                    style={{ color: isSelected ? report.color : '#8B9DC3' }}
                  >
                    {report.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Report Header */}
          <div
            className="glass rounded-2xl p-6"
            style={{ borderColor: `${currentReport.color}30` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    backgroundColor: `${currentReport.color}20`,
                    border: `2px solid ${currentReport.color}40`,
                  }}
                >
                  <Icon className="w-7 h-7" style={{ color: currentReport.color }} />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold" style={{ color: currentReport.color }}>
                    {currentReport.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-3 h-3 text-[#8B9DC3]" />
                    <span className="font-mono text-xs text-[#8B9DC3]">
                      Updated: {new Date().toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                className="glass border-[#8B9DC3]/30 text-[#8B9DC3] hover:bg-white/5 rounded-xl"
              >
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {currentReport.metrics.map((metric, index) => (
              <div
                key={index}
                className="glass rounded-xl p-4 transition-all duration-200 hover:-translate-y-1"
                style={{ borderColor: `${currentReport.color}20` }}
              >
                <div className="font-mono text-xs text-[#8B9DC3] mb-2">{metric.label}</div>
                <div className="font-display text-2xl font-bold" style={{ color: currentReport.color }}>
                  {metric.value}
                </div>
                {metric.change && (
                  <div className="font-accent text-xs text-[#8B9DC3] mt-1">{metric.change}</div>
                )}
              </div>
            ))}
          </div>

          {/* Visual Chart Placeholder */}
          <div className="glass rounded-2xl p-6" style={{ borderColor: `${currentReport.color}20` }}>
            <h4 className="font-display text-lg font-bold text-[#E8F0FF] mb-4">Trend Analysis</h4>
            <div className="h-48 flex items-end justify-around gap-2">
              {[65, 45, 78, 52, 89, 67, 94, 72, 85, 91, 68, 87].map((value, index) => (
                <div
                  key={index}
                  className="w-full max-w-[40px] rounded-t-lg transition-all duration-300 hover:opacity-80"
                  style={{
                    height: `${value}%`,
                    backgroundColor: `${currentReport.color}${index === 11 ? '' : '60'}`,
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-4 font-mono text-xs text-[#8B9DC3]">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>
              <span>Sep</span>
              <span>Oct</span>
              <span>Nov</span>
              <span>Dec</span>
            </div>
          </div>

          {/* Recent Activity for this Report Type */}
          <div className="glass rounded-2xl p-6" style={{ borderColor: `${currentReport.color}20` }}>
            <h4 className="font-display text-lg font-bold text-[#E8F0FF] mb-4">Recent Insights</h4>
            <div className="space-y-3">
              {activities.slice(0, 3).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                  <div
                    className="w-2 h-2 rounded-full mt-2"
                    style={{ backgroundColor: currentReport.color }}
                  />
                  <div className="flex-1">
                    <div className="font-mono text-sm text-[#E8F0FF]">{activity.action}</div>
                    <div className="font-accent text-xs text-[#8B9DC3] mt-1">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
