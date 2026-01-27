'use client';

import { create } from 'zustand';
import { auth, projects, tasks as tasksApi, ai, risks as risksApi, team as teamApi } from './api';

// Types
export interface Task {
  id: string;
  _id?: string;
  title: string;
  status: 'todo' | 'in-progress' | 'in-review' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: string;
  assigneeName?: string;
  assigneeEmail?: string;
  deadline: string;
  description?: string;
  subtasks?: Task[];
  dependencies?: string[];
  milestone?: string;
  reviewedBy?: string | { _id: string; name: string; email: string };
  rejectionNote?: string;
  attachments?: string[];
  rejectionAttachments?: string[];
  timerStartedAt?: string | Date;
  createdAt?: string | Date;
}

export interface Risk {
  id: string;
  _id?: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedTasks?: string[];
  predictedImpact?: string;
  recommendations?: string[];
  confidence?: number;
  detectedAt: Date;
  detectedBy: 'ai' | 'manual';
  resolved: boolean;
}

export interface Project {
  _id?: string;
  id: string;
  name: string;
  description: string;
  healthScore: number;
  teamSize: number;
  milestonesCompleted: number;
  totalMilestones: number;
  progress: number;
  deadline?: string;
  status?: string;
  ownerId?: string;
  team?: any[];
}

export interface TeamMember {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

export interface Activity {
  id: string;
  agent: 'Planner' | 'Execution' | 'Risk' | 'Communication' | 'Recommendation';
  action: string;
  time: string;
  timestamp: Date;
}

export interface Notification {
  id: string;
  agent: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: Date;
  read: boolean;
  actions?: { label: string; action: string }[];
}

// Store interface
interface AppState {
  // Project
  project: Project | null;
  fetchProject: (projectId?: string) => Promise<void>;
  updateProject: (updates: Partial<Project>) => Promise<void>;
  archiveProject: () => Promise<void>;

  // Tasks
  tasks: Task[];
  fetchTasks: () => Promise<void>;
  addTask: (task: Omit<Task, 'id'>, projectId?: string) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  submitForReview: (taskId: string, data?: Partial<Task>) => Promise<void>;
  rejectTask: (taskId: string, data: Partial<Task>) => Promise<void>;
  approveTask: (taskId: string, userId?: string) => Promise<void>;
  selectedTasks: string[];
  setSelectedTasks: (ids: string[]) => void;
  toggleTaskSelection: (id: string) => void;

  // Risks
  risks: Risk[];
  fetchRisks: () => Promise<void>;
  addRisk: (risk: Omit<Risk, 'id'>) => Promise<void>;
  updateRisk: (id: string, updates: Partial<Risk>) => Promise<void>;
  deleteRisk: (id: string) => Promise<void>;
  resolveRisk: (id: string) => Promise<void>;

  // Team
  team: TeamMember[];
  fetchTeam: () => Promise<void>;
  addTeamMember: (member: Omit<TeamMember, 'id'>) => Promise<void>;
  removeTeamMember: (id: string) => Promise<void>;

  // Activities
  activities: Activity[];
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;

  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // Modals
  activeModal: string | null;
  modalData: any;
  openModal: (modal: string, data?: any) => void;
  closeModal: () => void;

  // Agent states
  agentStates: Record<string, 'idle' | 'active' | 'thinking'>;
  setAgentState: (agent: string, state: 'idle' | 'active' | 'thinking') => void;
  activateAgent: (agent: string, duration?: number) => void;
  isHydrated: boolean;
  setHydrated: (val: boolean) => void;
  onboardingData: { name: string; vision: string; extractedItems: any[]; recommendations?: any } | null;
  setOnboardingData: (data: any) => void;
  completeOnboarding: (data: { name: string; vision: string; team: any[]; ownerId: string; ownerEmail?: string; deadline?: string; totalMilestones?: number }) => Promise<void>;
  startAgentHeartbeat: () => void;
  checkProjectCompletion: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useAppStore = create<AppState>((set, get) => ({
  // Project
  project: null,
  isHydrated: false,
  setHydrated: (val: boolean) => set({ isHydrated: val }),
  onboardingData: null,
  setOnboardingData: (data) => set((state) => ({ 
    onboardingData: { 
      ...(state.onboardingData || { name: '', vision: '', extractedItems: [] }), 
      ...data 
    } 
  })),
  fetchProject: async (projectId?: string) => {
    try {
        const res = await projects.get(projectId);
        if (res.data) {
          set({ project: res.data });
          // Auto-fetch related data if project exists
          await Promise.all([
            get().fetchTasks(),
            get().fetchTeam(),
            get().fetchRisks()
          ]);
          get().startAgentHeartbeat();
          get().checkProjectCompletion();
        }
    } catch (err) {
        console.error("Failed to fetch project", err);
    } finally {
        set({ isHydrated: true });
    }
  },
  updateProject: async (updates) => {
    try {
        const currentProject = get().project;
        if (!currentProject?._id) {
            set((state) => ({ project: state.project ? { ...state.project, ...updates } : null }));
            return;
        }
        // Backend expects projectId explicitly in the body
        const res = await projects.update({ ...updates, projectId: currentProject._id });
        set({ project: res.data });
        get().addActivity({ agent: 'Planner', action: `Updated project context`, time: 'Just now' });
        // Refresh project to get calculated fields if any
        await get().fetchProject(currentProject._id);
    } catch (err) {
        console.error("Failed to update project", err);
        throw err;
    }
  },
  archiveProject: async () => {
    try {
        const projectId = get().project?._id;
        if (!projectId) return;

        await projects.archive(projectId);
        
        // Complete Reset for New Project
        set({ 
            project: null,
            tasks: [],
            risks: [],
            team: [],
            activities: [],
            notifications: [],
            selectedTasks: [],
            onboardingData: null,
            activeModal: null,
            modalData: null,
            agentStates: {
                Planner: 'idle',
                Execution: 'idle',
                Risk: 'idle',
                Communication: 'idle',
                Recommendation: 'idle',
            }
        });

        // Clear localStorage
        if (typeof window !== 'undefined') {
            localStorage.removeItem('octoops_owner_email');
            localStorage.removeItem('octoops_owner_name');
        }

        // Redirect to onboarding for new project
        if (typeof window !== 'undefined') {
            window.location.href = '/onboarding';
        }
    } catch (err) {
        console.error("Failed to archive project", err);
        throw err;
    }
  },

  // Tasks
  tasks: [],
  fetchTasks: async () => {
    try {
        const projectId = get().project?._id;
        if (!projectId) return;
        const res = await tasksApi.getAll(projectId);
        set({ tasks: res.data });
    } catch (err) {
        console.error("Failed to fetch tasks", err);
    }
  },
  addTask: async (task, projectId) => {
    try {
        const res = await tasksApi.create({ ...task, projectId });
        set((state) => ({ tasks: [res.data, ...state.tasks] }));
        
        get().addActivity({ agent: 'Planner', action: `Created new task: ${task.title}`, time: 'Just now' });
        get().activateAgent('Planner');
    } catch (err) {
        console.error("Failed to create task", err);
        throw err;
    }
  },
  updateTask: async (id, updates) => {
    try {
        const res = await tasksApi.update(id, updates);
        set((state) => ({
            tasks: state.tasks.map((t) => (t.id === id || t._id === id) ? res.data : t)
        }));
        get().addActivity({ agent: 'Execution', action: `Task status synchronization successful`, time: 'Just now' });
        get().activateAgent('Execution');
        // If status changed to done or was rejected, refresh project stats
        if (updates.status === 'done' || updates.status === 'todo') {
            await get().fetchProject(get().project?._id);
            get().checkProjectCompletion();
        }
    } catch (err) {
        console.error("Failed to update task", err);
        throw err;
    }
  },
  deleteTask: async (id) => {
    try {
      await tasksApi.delete(id);
      set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id && t._id !== id) }));
      get().addActivity({ agent: 'Execution', action: `Deleted task ${id}`, time: 'Just now' });
    } catch (err) {
      console.error("Failed to delete task", err);
      throw err;
    }
  },
  
  selectedTasks: [],
  setSelectedTasks: (ids) => set({ selectedTasks: ids }),
  toggleTaskSelection: (id) => set((state) => ({
    selectedTasks: state.selectedTasks.includes(id)
      ? state.selectedTasks.filter((t) => t !== id)
      : [...state.selectedTasks, id]
  })),

  submitForReview: async (taskId, data) => {
    try {
        // Optimistic update
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === taskId || t._id === taskId) ? { ...t, status: 'in-review', ...data } : t)
        }));
        
        await tasksApi.submit(taskId, data);
        
        get().addActivity({ agent: 'Execution', action: `Task submitted for review`, time: 'Just now' });
        get().activateAgent('Execution');

        get().addNotification({
            agent: 'Execution',
            title: 'Submitted for Review',
            message: `Task is now pending QA.`,
            type: 'info',
            read: false
        });
    } catch (err) {
        console.error("Failed to submit task", err);
        // Rollback optimistic update
        await get().fetchTasks(); 
        throw err;
    }
  },

  rejectTask: async (taskId, data) => {
    try {
        await tasksApi.reject(taskId, data);
        set((state) => ({
            tasks: state.tasks.map((t) => (t.id === taskId || t._id === taskId) ? { ...t, status: 'todo', ...data } : t)
        }));
        get().addActivity({ agent: 'Communication', action: `Task rejected by QA`, time: 'Just now' });
        get().activateAgent('Communication');
        await get().fetchProject(get().project?._id);
    } catch (err) {
        console.error("Failed to reject task", err);
        await get().fetchTasks();
        throw err;
    }
  },

  approveTask: async (taskId, userId) => {
     try {
        await tasksApi.approve(taskId, userId);
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === taskId || t._id === taskId) ? { ...t, status: 'done', reviewedBy: userId, rejectionNote: undefined } : t)
        }));
        get().addActivity({ agent: 'Execution', action: `Task approved and completed`, time: 'Just now' });
        get().activateAgent('Execution');
        await get().fetchProject(get().project?._id); // Refresh project stats
     } catch (err) {
        console.error("Failed to approve task", err);
        await get().fetchTasks();
        throw err;
     }
  },

  // Risks
  risks: [],
  fetchRisks: async () => {
    try {
        const projectId = get().project?._id;
        if (!projectId) return;
        const res = await risksApi.getAll(projectId);
        set({ risks: res.data });
    } catch (err) {
        console.error("Failed to fetch risks", err);
    }
  },
  addRisk: async (risk) => {
    try {
      const projectId = get().project?._id;
      if (!projectId) return;

      const res = await risksApi.create({ 
        ...risk, 
        projectId,
        detectedBy: 'manual'
      });
      
      set((state) => ({ risks: [res.data, ...state.risks] }));
      
      get().addNotification({
        agent: 'Risk',
        title: 'New Risk Logged',
        message: risk.title,
        type: 'warning',
        read: false,
      });
      get().activateAgent('Risk', 3000);
      await get().fetchProject(projectId); // Update health score
    } catch (err) {
      console.error("Failed to add risk", err);
    }
  },
  updateRisk: async (id, updates) => {
    try {
      const res = await risksApi.update(id, updates);
      set((state) => ({
        risks: state.risks.map((r) => (r.id === id || r._id === id) ? res.data : r)
      }));
      get().addActivity({ agent: 'Risk', action: `Updated risk: ${updates.title || 'parameters'}`, time: 'Just now' });
      await get().fetchProject(get().project?._id);
    } catch (err) {
      console.error("Failed to update risk", err);
    }
  },
  deleteRisk: async (id) => {
    try {
      await risksApi.delete(id);
      set((state) => ({ risks: state.risks.filter((r) => r.id !== id && r._id !== id) }));
      await get().fetchProject(get().project?._id);
    } catch (err) {
      console.error("Failed to delete risk", err);
    }
  },
  resolveRisk: async (id) => {
    try {
      await risksApi.resolve(id);
      await get().fetchRisks(); 
      get().addActivity({ agent: 'Risk', action: `Resolved risk: ${get().risks.find(r => r.id === id || r._id === id)?.title}`, time: 'Just now' });
      get().addNotification({
        agent: 'Risk',
        title: 'Risk Resolved',
        message: 'Risk has been successfully resolved',
        type: 'success',
        read: false
      });
    } catch (err) {
      console.error("Failed to resolve risk", err);
    }
  },

  // Team
  team: [],
  fetchTeam: async () => {
    try {
        const projectId = get().project?._id;
        if (!projectId) return;
        const res = await teamApi.getMembers(projectId);
        set({ team: res.data.members || [] });
    } catch (err) {
        console.error("Failed to fetch team", err);
    }
  },
  addTeamMember: async (member) => {
    try {
        const projectId = get().project?._id;
        if (!projectId) return;
        await teamApi.invite({ ...member, projectId });
        get().addActivity({ agent: 'Communication', action: `Sent invitation to ${member.name}`, time: 'Just now' });
        get().activateAgent('Communication');
        await get().fetchTeam();
    } catch (err) {
        console.error("Failed to invite member", err);
    }
  },
  removeTeamMember: async (id) => {
    try {
        const projectId = get().project?._id;
        if (!projectId) return;

        const member = get().team.find((m) => m.id === id || m._id === id);
        
        // Persist to backend
        await teamApi.removeMember(id, projectId);

        set((state) => ({ team: state.team.filter((m) => m.id !== id && m._id !== id) }));
        
        if (member) {
          get().addActivity({ agent: 'Communication', action: `Removed team member: ${member.name}`, time: 'Just now' });
        }
        get().activateAgent('Communication');
    } catch (err) {
        console.error("Failed to remove team member", err);
        throw err;
    }
  },

  // Activities
  activities: [],
  addActivity: (activity) => {
    const newActivity = { ...activity, id: generateId(), timestamp: new Date() };
    set((state) => ({ activities: [newActivity, ...state.activities].slice(0, 50) }));
  },

  // Notifications
  notifications: [],
  addNotification: (notification) => {
    const newNotification = { ...notification, id: generateId(), timestamp: new Date() };
    set((state) => ({ notifications: [newNotification, ...state.notifications].slice(0, 20) }));
  },
  markNotificationRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) => n.id === id ? { ...n, read: true } : n)
    }));
  },
  clearNotifications: () => set({ notifications: [] }),

  // Modals
  activeModal: null,
  modalData: null,
  openModal: (modal, data = null) => set({ activeModal: modal, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),

  // Agent states
  agentStates: {
    Planner: 'idle',
    Execution: 'idle',
    Risk: 'idle',
    Communication: 'idle',
    Recommendation: 'idle',
  },
  setAgentState: (agent, state) => {
    set((s) => ({ agentStates: { ...s.agentStates, [agent]: state } }));
  },
  completeOnboarding: async (data) => {
    try {
        // Prevent re-initialization if project is in-review
        const existingProject = get().project;
        if (existingProject?.status === 'in-review') {
            throw new Error("Cannot re-initialize project while it is in review.");
        }

        // Activate ALL agents during launch
        Object.keys(get().agentStates).forEach(agent => get().activateAgent(agent, 6000));

        // 1. Create Project
        const projectRes = await projects.create({
            name: data.name,
            description: data.vision,
            status: 'launching',
            ownerId: data.ownerId,
            ownerEmail: data.ownerEmail,
            deadline: data.deadline,
            totalMilestones: data.totalMilestones || 0,
            healthScore: 100
        });
        const newProject = projectRes.data;
        set({ project: newProject });

        // 2. Invite Team Members with Roles
        for (const member of data.team) {
            if (member.email) {
                await teamApi.invite({ 
                    ...member, 
                    projectId: newProject._id,
                    invitedBy: data.ownerId
                });
            }
        }

        // 3. Trigger initial AI Task Generation
        const taskRes = await ai.generateTasks(newProject._id);
        if (taskRes.data) {
            await get().fetchTasks();
            get().addActivity({ 
                agent: 'Planner', 
                action: `Autonomous roadmap successfully deployed with ${taskRes.data.length} mission-critical tasks.`, 
                time: 'Just now' 
            });
        }

        // 4. Update status and start heartbeat
        get().updateProject({ status: 'active' });
        get().startAgentHeartbeat();

    } catch (err) {
        console.error("Onboarding Completion Failed:", err);
        throw err;
    }
  },
  startAgentHeartbeat: () => {
    const agents = ['Planner', 'Execution', 'Risk', 'Communication', 'Recommendation'];
    setInterval(() => {
        const randomAgent = agents[Math.floor(Math.random() * agents.length)];
        const { project } = get();
        if (project) {
            get().activateAgent(randomAgent, 4000);
            
            // Occasionally add background activity
            if (Math.random() > 0.7) {
                const activityMap: Record<string, string[]> = {
                    Risk: ['Scanning network protocols', 'Validating system integrity', 'Analyzing project velocity'],
                    Communication: ['Syncing team schedules', 'Optimizing channel bandwidth', 'Aggregating mission reports'],
                    Execution: ['Monitoring task throughput', 'Validating milestone dependencies', 'Optimizing resource allocation'],
                    Planner: ['Refining long-term horizon', 'Analyzing mission priority shifts', 'Recalculating critical path'],
                    Recommendation: ['Identifying parallelization opportunities', 'Suggesting team efficiency gains', 'Spotlight: Low latency detected']
                };
                const actions = activityMap[randomAgent];
                get().addActivity({
                    agent: randomAgent as any,
                    action: actions[Math.floor(Math.random() * actions.length)],
                    time: 'Just now'
                });
            }
        }
    }, 15000);
  },
  activateAgent: (agent, duration = 3000) => {
    get().setAgentState(agent, 'active');
    setTimeout(() => get().setAgentState(agent, 'idle'), duration);
  },
  checkProjectCompletion: () => {
    const { project, tasks, activeModal, openModal } = get();
    if (!project || tasks.length === 0 || activeModal === 'celebration' || project.status === 'archived') return;

    const allTasksDone = tasks.every(t => t.status === 'done');
    const allMilestonesReached = project.totalMilestones > 0 && project.milestonesCompleted >= project.totalMilestones;

    if (allTasksDone && allMilestonesReached) {
        // Trigger celebration
        setTimeout(() => openModal('celebration'), 1000); // Slight delay for smoothness
    }
  },
}));
