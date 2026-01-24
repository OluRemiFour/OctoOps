'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAppStore } from '@/lib/store';
import { Settings, Bell, Shield, Palette, Zap, Save, CheckCircle, AlertTriangle, MessageSquare, Lightbulb } from 'lucide-react';
import NotificationToast from '@/components/dashboard/NotificationToast';

export default function SettingsPage() {
  const { project, updateProject, openModal, notifications, addNotification, activateAgent } = useAppStore();
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [notifications48h, setNotifications48h] = useState(true);
  const [notificationsStalled, setNotificationsStalled] = useState(true);
  const [notificationsRisk, setNotificationsRisk] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state with project data when it loads
  React.useEffect(() => {
    if (project) {
      setProjectName(project.name);
      setProjectDescription(project.description || '');
    }
  }, [project]);
  
  const unreadNotifications = notifications.filter(n => !n.read).length;

  const handleSaveProject = async () => {
    setIsSaving(true);
    activateAgent('Planner', 2000);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    updateProject({
      name: projectName,
      description: projectDescription,
    });
    
    addNotification({
      agent: 'Planner',
      title: 'Settings Saved',
      message: 'Project settings have been updated successfully',
      type: 'success',
      read: false,
    });
    
    setIsSaving(false);
  };

  const agentSettings = [
    { name: 'Planner Agent', icon: Zap, color: '#00F0FF', enabled: true },
    { name: 'Execution Agent', icon: CheckCircle, color: '#00FF88', enabled: true },
    { name: 'Risk Agent', icon: AlertTriangle, color: '#FF3366', enabled: true },
    { name: 'Communication Agent', icon: MessageSquare, color: '#FFB800', enabled: true },
    { name: 'Recommendation Agent', icon: Lightbulb, color: '#9D4EDD', enabled: true },
  ];

  return (
    <div className="min-h-screen noise-overlay p-6 pt-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl font-bold mb-2">
              Settings
            </h1>
            <p className="font-mono text-sm text-[#8B9DC3]">
              Configure your project and agent preferences
            </p>
          </div>
          
          {/* Notification Bell */}
          <button
            onClick={() => openModal('notifications')}
            className="relative glass rounded-xl p-3 hover:bg-white/10 transition-colors"
          >
            <Bell className="w-5 h-5 text-[#E8F0FF]" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#FF3366] text-white text-xs flex items-center justify-center font-mono animate-pulse">
                {unreadNotifications}
              </span>
            )}
          </button>
        </div>

        <div className="space-y-8">
          {/* Project Settings */}
          <section className="glass rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#00F0FF]/20 border-2 border-[#00F0FF]/40 flex items-center justify-center">
                <Settings className="w-5 h-5 text-[#00F0FF]" />
              </div>
              <h2 className="font-display text-2xl font-bold text-[#E8F0FF]">
                Project Settings
              </h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-display text-sm font-bold text-[#E8F0FF]">
                  Project Name
                </Label>
                <Input
                  id="name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="glass border-[#00F0FF]/20 focus:border-[#00F0FF]/60 bg-transparent font-mono text-[#E8F0FF]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="font-display text-sm font-bold text-[#E8F0FF]">
                  Description
                </Label>
                <textarea
                  id="description"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="w-full min-h-[100px] rounded-xl glass border-[#00F0FF]/20 focus:border-[#00F0FF]/60 bg-transparent font-mono text-[#E8F0FF] p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#00F0FF]/20"
                />
              </div>

              <Button
                onClick={handleSaveProject}
                disabled={isSaving}
                className="bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-[#0A0E27] font-display font-bold rounded-xl"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <Zap className="w-4 h-4 animate-pulse" />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </span>
                )}
              </Button>
            </div>
          </section>

          {/* Notification Settings */}
          <section className="glass rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#FFB800]/20 border-2 border-[#FFB800]/40 flex items-center justify-center">
                <Bell className="w-5 h-5 text-[#FFB800]" />
              </div>
              <h2 className="font-display text-2xl font-bold text-[#E8F0FF]">
                Notifications
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div>
                  <div className="font-display font-bold text-[#E8F0FF]">
                    48-Hour Deadline Reminders
                  </div>
                  <div className="font-mono text-xs text-[#8B9DC3]">
                    Get notified 48 hours before task deadlines
                  </div>
                </div>
                <Switch checked={notifications48h} onCheckedChange={setNotifications48h} />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div>
                  <div className="font-display font-bold text-[#E8F0FF]">
                    Stalled Task Alerts
                  </div>
                  <div className="font-mono text-xs text-[#8B9DC3]">
                    Alert when tasks haven't progressed for 3 days
                  </div>
                </div>
                <Switch checked={notificationsStalled} onCheckedChange={setNotificationsStalled} />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div>
                  <div className="font-display font-bold text-[#E8F0FF]">
                    Risk Detection Alerts
                  </div>
                  <div className="font-mono text-xs text-[#8B9DC3]">
                    Immediate notifications for detected project risks
                  </div>
                </div>
                <Switch checked={notificationsRisk} onCheckedChange={setNotificationsRisk} />
              </div>
            </div>
          </section>

          {/* Agent Settings */}
          <section className="glass rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#9D4EDD]/20 border-2 border-[#9D4EDD]/40 flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#9D4EDD]" />
              </div>
              <h2 className="font-display text-2xl font-bold text-[#E8F0FF]">
                AI Agents
              </h2>
            </div>

            <div className="space-y-4">
              {agentSettings.map((agent) => {
                const Icon = agent.icon;
                return (
                  <div
                    key={agent.name}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                          backgroundColor: `${agent.color}20`,
                          border: `2px solid ${agent.color}40`,
                        }}
                      >
                        <Icon className="w-5 h-5" style={{ color: agent.color }} />
                      </div>
                      <div>
                        <div className="font-display font-bold text-[#E8F0FF]">
                          {agent.name}
                        </div>
                        <div className="font-mono text-xs" style={{ color: agent.color }}>
                          Active
                        </div>
                      </div>
                    </div>
                    <Switch defaultChecked={agent.enabled} />
                  </div>
                );
              })}
            </div>
          </section>

          {/* Danger Zone */}
          <section className="glass rounded-3xl p-8 border-[#FF3366]/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#FF3366]/20 border-2 border-[#FF3366]/40 flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#FF3366]" />
              </div>
              <h2 className="font-display text-2xl font-bold text-[#FF3366]">
                Danger Zone
              </h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#FF3366]/10 border border-[#FF3366]/30">
                <div className="font-display font-bold text-[#E8F0FF] mb-1">
                  Archive Project
                </div>
                <div className="font-mono text-xs text-[#8B9DC3] mb-4">
                  Archive this project and all its data. You can restore it later.
                </div>
                <Button
                  variant="outline"
                  className="border-[#FF3366]/50 text-[#FF3366] hover:bg-[#FF3366]/10"
                >
                  Archive Project
                </Button>
              </div>
            </div>
          </section>
        </div>
        
        {/* Modals */}
        <NotificationToast />
      </div>
    </div>
  );
}
