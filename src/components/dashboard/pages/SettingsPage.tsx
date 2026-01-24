'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Bell, Github, MessageSquare, Sparkles, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { settings as settingsApi, projects as projectsApi } from '@/lib/api';
import { useToast } from "@/components/ui/use-toast";

export default function SettingsPage() {
  const { project, openModal, isHydrated } = useAppStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Project Settings
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectDeadline, setProjectDeadline] = useState('');
  const [totalMilestones, setTotalMilestones] = useState(0);

  // Notification Settings
  const [notifications, setNotifications] = useState({
    email: true,
    taskUpdates: true,
    riskAlerts: true,
    teamChanges: true,
  });

  // Integration Settings
  const [integrations, setIntegrations] = useState({
    github: { enabled: false, repoUrl: '', token: '' },
    slack: { enabled: false, webhookUrl: '' },
  });

  // AI Settings
  const [aiSettings, setAISettings] = useState({
    autoRiskDetection: true,
    taskRecommendations: true,
    healthScoreTracking: true,
  });

  useEffect(() => {
    if (project?._id) {
      setProjectName(project.name || '');
      setProjectDescription(project.description || '');
      setProjectDeadline(project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : '');
      setTotalMilestones(project.totalMilestones || 0);
      fetchSettings();
    } else if (project === null) {
      setLoading(false);
    }
  }, [project]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await settingsApi.get(project!._id!);
      if (res.data) {
        setNotifications(res.data.notifications || notifications);
        setIntegrations(res.data.integrations || integrations);
        setAISettings(res.data.aiSettings || aiSettings);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast({
        title: "Error",
        description: "Failed to load settings.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProject = async () => {
    try {
      setSaving(true);
      await settingsApi.update({
        projectId: project!._id!,
        name: projectName,
        description: projectDescription,
        deadline: projectDeadline,
        totalMilestones,
      });
      toast({
        title: "Settings Saved",
        description: "Project settings updated successfully.",
      });
    } catch (error) {
      console.error('Failed to save project settings:', error);
      toast({
        title: "Error",
        description: "Failed to save project settings.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setSaving(true);
      await settingsApi.updateNotifications(project!._id!, notifications);
      toast({
        title: "Notifications Updated",
        description: "Notification preferences saved.",
      });
    } catch (error) {
      console.error('Failed to save notifications:', error);
      toast({
        title: "Error",
        description: "Failed to save notification settings.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveIntegrations = async () => {
    try {
      setSaving(true);
      await settingsApi.updateIntegrations(project!._id!, integrations);
      toast({
        title: "Integrations Saved",
        description: "Integration settings updated.",
      });
    } catch (error) {
      console.error('Failed to save integrations:', error);
      toast({
        title: "Error",
        description: "Failed to save integrations.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAI = async () => {
    try {
      setSaving(true);
      await settingsApi.updateAI(project!._id!, aiSettings);
      toast({
        title: "AI Settings Saved",
        description: "AI preferences updated.",
      });
    } catch (error) {
      console.error('Failed to save AI settings:', error);
      toast({
        title: "Error",
        description: "Failed to save AI settings.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm('This will permanently delete the project and all associated tasks, risks, and settings. Are you sure?')) return;
    
    try {
      setSaving(true);
      // Fallback to project ID from store if _id is missing
      const idToDelete = project!._id || project!.id;
      await projectsApi.update({ projectId: idToDelete, status: 'deleted' }); // Soft delete
      toast({
        title: "Project Archived",
        description: "Project has been successfully archived.",
      });
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast({
        title: "Error",
        description: "Failed to delete project.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !isHydrated) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00F0FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#8B9DC3] font-mono text-xs uppercase tracking-widest">Synchronizing Project Pulse...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-[#E8F0FF]">Settings</h1>
        <p className="font-mono text-sm text-[#8B9DC3] mt-1">
          Configure your project and preferences
        </p>
      </div>

      {/* Project Settings */}
      <div className="glass rounded-2xl p-6">
        <h2 className="font-display text-xl font-bold text-[#E8F0FF] mb-4">Project Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#8B9DC3] mb-2">Project Name</label>
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="glass border-white/10"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#8B9DC3] mb-2">Description</label>
            <Textarea
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="glass border-white/10 min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#8B9DC3] mb-2">Deadline</label>
              <Input
                type="date"
                value={projectDeadline}
                onChange={(e) => setProjectDeadline(e.target.value)}
                className="glass border-white/10"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#8B9DC3] mb-2">Total Milestones</label>
              <Input
                type="number"
                value={totalMilestones}
                onChange={(e) => setTotalMilestones(parseInt(e.target.value) || 0)}
                className="glass border-white/10"
              />
            </div>
          </div>

          <Button
            onClick={handleSaveProject}
            disabled={saving}
            className="bg-[#00FF88] text-[#0A0E27] hover:bg-[#00FF88]/90"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Project Settings
          </Button>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-5 h-5 text-[#00F0FF]" />
          <h2 className="font-display text-xl font-bold text-[#E8F0FF]">Notifications</h2>
        </div>
        <div className="space-y-3">
          {Object.entries(notifications).map(([key, value]) => (
            <label key={key} className="flex items-center justify-between p-3 rounded-xl bg-white/5 cursor-pointer hover:bg-white/10 transition-all">
              <span className="text-[#E8F0FF]">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </span>
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                className="w-5 h-5 rounded border-2 border-[#00F0FF] bg-transparent checked:bg-[#00F0FF]"
              />
            </label>
          ))}
        </div>
        <Button
          onClick={handleSaveNotifications}
          disabled={saving}
          className="bg-[#00F0FF] text-[#0A0E27] hover:bg-[#00F0FF]/90 mt-4"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Notifications
        </Button>
      </div>

      {/* AI Settings */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-[#9D4EDD]" />
          <h2 className="font-display text-xl font-bold text-[#E8F0FF]">AI Features</h2>
        </div>
        <div className="space-y-3">
          {Object.entries(aiSettings).map(([key, value]) => (
            <label key={key} className="flex items-center justify-between p-3 rounded-xl bg-white/5 cursor-pointer hover:bg-white/10 transition-all">
              <span className="text-[#E8F0FF]">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </span>
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setAISettings({ ...aiSettings, [key]: e.target.checked })}
                className="w-5 h-5 rounded border-2 border-[#9D4EDD] bg-transparent checked:bg-[#9D4EDD]"
              />
            </label>
          ))}
        </div>
        <Button
          onClick={handleSaveAI}
          disabled={saving}
          className="bg-[#9D4EDD] text-white hover:bg-[#9D4EDD]/90 mt-4"
        >
          <Save className="w-4 h-4 mr-2" />
          Save AI Settings
        </Button>
      </div>

      {/* Integrations */}
      <div className="glass rounded-2xl p-6">
        <h2 className="font-display text-xl font-bold text-[#E8F0FF] mb-4">Integrations</h2>
        
        {/* GitHub */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Github className="w-5 h-5 text-[#E8F0FF]" />
            <h3 className="font-bold text-[#E8F0FF]">GitHub</h3>
            <label className="ml-auto flex items-center gap-2">
              <span className="text-sm text-[#8B9DC3]">Enabled</span>
              <input
                type="checkbox"
                checked={integrations.github.enabled}
                onChange={(e) => setIntegrations({
                  ...integrations,
                  github: { ...integrations.github, enabled: e.target.checked }
                })}
                className="w-4 h-4"
              />
            </label>
          </div>
          {integrations.github.enabled && (
            <div className="space-y-3 ml-8">
              <Input
                placeholder="Repository URL"
                value={integrations.github.repoUrl}
                onChange={(e) => setIntegrations({
                  ...integrations,
                  github: { ...integrations.github, repoUrl: e.target.value }
                })}
                className="glass border-white/10"
              />
              <Input
                type="password"
                placeholder="Access Token"
                value={integrations.github.token}
                onChange={(e) => setIntegrations({
                  ...integrations,
                  github: { ...integrations.github, token: e.target.value }
                })}
                className="glass border-white/10"
              />
            </div>
          )}
        </div>

        {/* Slack */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <MessageSquare className="w-5 h-5 text-[#E8F0FF]" />
            <h3 className="font-bold text-[#E8F0FF]">Slack</h3>
            <label className="ml-auto flex items-center gap-2">
              <span className="text-sm text-[#8B9DC3]">Enabled</span>
              <input
                type="checkbox"
                checked={integrations.slack.enabled}
                onChange={(e) => setIntegrations({
                  ...integrations,
                  slack: { ...integrations.slack, enabled: e.target.checked }
                })}
                className="w-4 h-4"
              />
            </label>
          </div>
          {integrations.slack.enabled && (
            <div className="ml-8">
              <Input
                placeholder="Webhook URL"
                value={integrations.slack.webhookUrl}
                onChange={(e) => setIntegrations({
                  ...integrations,
                  slack: { ...integrations.slack, webhookUrl: e.target.value }
                })}
                className="glass border-white/10"
              />
            </div>
          )}
        </div>

        <Button
          onClick={handleSaveIntegrations}
          disabled={saving}
          className="bg-[#00F0FF] text-[#0A0E27] hover:bg-[#00F0FF]/90 mt-4"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Integrations
        </Button>
      </div>

      {/* Danger Zone */}
      <div className="glass rounded-2xl p-6 border-2 border-[#FF3366]/30">
        <h2 className="font-display text-xl font-bold text-[#FF3366] mb-2">Danger Zone</h2>
        <p className="text-sm text-[#8B9DC3] mb-4">
          Irreversible actions that will permanently affect your project
        </p>
        <Button
          variant="destructive"
          className="bg-[#FF3366] text-white hover:bg-[#FF3366]/90 transition-all border-none ring-offset-[#0A0E27] focus-visible:ring-[#FF3366]"
          onClick={handleDeleteProject}
          disabled={saving}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          {saving ? 'Processing...' : 'Archive Project'}
        </Button>
      </div>
    </div>
  );
}
