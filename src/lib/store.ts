'use client';

import { create } from 'zustand';

// Types
export interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done' | 'blocked';
  assignee: string;
  deadline: string;
  description?: string;
  subtasks?: Task[];
  dependencies?: string[];
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedTasks: string[];
  predictedImpact: string;
  recommendations: string[];
  confidence: number;
  detectedAt: Date;
  resolved: boolean;
}

export interface TeamMember {
  id: string;
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

export interface Project {
  id: string;
  name: string;
  description: string;
  healthScore: number;
  teamSize: number;
  milestonesCompleted: number;
  totalMilestones: number;
  progress: number;
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
  project: Project;
  updateProject: (updates: Partial<Project>) => void;

  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  selectedTasks: string[];
  setSelectedTasks: (ids: string[]) => void;
  toggleTaskSelection: (id: string) => void;

  // Risks
  risks: Risk[];
  addRisk: (risk: Omit<Risk, 'id'>) => void;
  resolveRisk: (id: string) => void;

  // Team
  team: TeamMember[];
  addTeamMember: (member: Omit<TeamMember, 'id'>) => void;
  removeTeamMember: (id: string) => void;

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
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useAppStore = create<AppState>((set, get) => ({
  // Initial Project
  project: {
    id: '1',
    name: 'Product Launch Q1',
    description: 'Launch new mobile app with AI-powered features, including smart notifications, personalized recommendations, and real-time collaboration tools.',
    healthScore: 87,
    teamSize: 12,
    milestonesCompleted: 5,
    totalMilestones: 8,
    progress: 68,
  },
  updateProject: (updates) => set((state) => ({ project: { ...state.project, ...updates } })),

  // Tasks
  tasks: [
    {
      id: '1',
      title: 'Beta Release Milestone',
      status: 'in-progress',
      assignee: 'Sarah Chen',
      deadline: 'Mar 18',
      description: 'Complete all tasks for beta release',
      subtasks: [
        {
          id: '1-1',
          title: 'Complete final UI polish',
          status: 'in-progress',
          assignee: 'Mike Johnson',
          deadline: 'Mar 15',
          subtasks: [
            { id: '1-1-1', title: 'Fix navigation animations', status: 'done', assignee: 'Mike', deadline: 'Mar 12' },
            { id: '1-1-2', title: 'Update color scheme', status: 'in-progress', assignee: 'Mike', deadline: 'Mar 14' },
          ]
        },
        {
          id: '1-2',
          title: 'Run security audit',
          status: 'todo',
          assignee: 'David Lee',
          deadline: 'Mar 16',
        },
        {
          id: '1-3',
          title: 'Prepare beta documentation',
          status: 'done',
          assignee: 'Emma Wilson',
          deadline: 'Mar 10',
        },
      ]
    },
    {
      id: '2',
      title: 'Marketing Campaign',
      status: 'in-progress',
      assignee: 'Lisa Parker',
      deadline: 'Mar 25',
      subtasks: [
        { id: '2-1', title: 'Create social media content', status: 'in-progress', assignee: 'Lisa', deadline: 'Mar 20' },
        { id: '2-2', title: 'Design email templates', status: 'todo', assignee: 'John', deadline: 'Mar 22' },
        { id: '2-3', title: 'Schedule promotional posts', status: 'blocked', assignee: 'Lisa', deadline: 'Mar 24' },
      ]
    },
    {
      id: '3',
      title: 'Public Launch',
      status: 'todo',
      assignee: 'Sarah Chen',
      deadline: 'Apr 1',
      subtasks: [
        { id: '3-1', title: 'Deploy to production', status: 'todo', assignee: 'DevOps', deadline: 'Apr 1' },
        { id: '3-2', title: 'Monitor initial metrics', status: 'todo', assignee: 'Sarah', deadline: 'Apr 2' },
      ]
    },
  ],
  addTask: (task) => {
    const newTask = { ...task, id: generateId() };
    set((state) => ({ tasks: [...state.tasks, newTask] }));
    get().addActivity({ agent: 'Planner', action: `Created new task: ${task.title}`, time: 'Just now' });
    get().activateAgent('Planner');
  },
  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((t) => t.id === id ? { ...t, ...updates } : t)
    }));
    get().addActivity({ agent: 'Execution', action: `Updated task ${id}`, time: 'Just now' });
    get().activateAgent('Execution');
  },
  deleteTask: (id) => {
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
  },
  selectedTasks: [],
  setSelectedTasks: (ids) => set({ selectedTasks: ids }),
  toggleTaskSelection: (id) => set((state) => ({
    selectedTasks: state.selectedTasks.includes(id)
      ? state.selectedTasks.filter((t) => t !== id)
      : [...state.selectedTasks, id]
  })),

  // Risks
  risks: [
    {
      id: '1',
      title: 'Potential Deadline Conflict',
      description: 'Beta Release milestone has 3 tasks still pending with deadline in 5 days',
      severity: 'high',
      affectedTasks: ['1-1-2', '1-2'],
      predictedImpact: 'May delay beta release by 2-3 days',
      recommendations: ['Parallelize UI polish and security audit', 'Request additional resources', 'Reduce scope of color scheme update'],
      confidence: 85,
      detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      resolved: false,
    },
    {
      id: '2',
      title: 'Resource Bottleneck',
      description: 'Mike Johnson is assigned to 3 concurrent high-priority tasks',
      severity: 'medium',
      affectedTasks: ['1-1-1', '1-1-2'],
      predictedImpact: 'Potential burnout and quality issues',
      recommendations: ['Redistribute tasks to other team members', 'Prioritize tasks by deadline'],
      confidence: 72,
      detectedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      resolved: false,
    },
    {
      id: '3',
      title: 'Blocked Task Cascade',
      description: 'Promotional posts task blocked, may affect marketing campaign timeline',
      severity: 'medium',
      affectedTasks: ['2-3'],
      predictedImpact: 'Marketing launch could slip by 1 week',
      recommendations: ['Investigate blocker reason', 'Prepare alternative launch strategy'],
      confidence: 68,
      detectedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      resolved: false,
    },
  ],
  addRisk: (risk) => {
    const newRisk = { ...risk, id: generateId() };
    set((state) => ({ risks: [...state.risks, newRisk] }));
    get().addNotification({
      agent: 'Risk',
      title: 'New Risk Detected',
      message: risk.title,
      type: 'warning',
      read: false,
    });
    get().activateAgent('Risk', 3000);
  },
  resolveRisk: (id) => {
    set((state) => ({
      risks: state.risks.map((r) => r.id === id ? { ...r, resolved: true } : r)
    }));
    get().addActivity({ agent: 'Risk', action: `Resolved risk: ${get().risks.find(r => r.id === id)?.title}`, time: 'Just now' });
  },

  // Team
  team: [
    { id: '1', name: 'Sarah Chen', email: 'sarah@octoops.dev', role: 'Project Lead', avatar: '👩‍💼' },
    { id: '2', name: 'Mike Johnson', email: 'mike@octoops.dev', role: 'Senior Developer', avatar: '👨‍💻' },
    { id: '3', name: 'Emma Wilson', email: 'emma@octoops.dev', role: 'Technical Writer', avatar: '👩‍🎨' },
    { id: '4', name: 'David Lee', email: 'david@octoops.dev', role: 'Security Engineer', avatar: '🧑‍🔧' },
    { id: '5', name: 'Lisa Parker', email: 'lisa@octoops.dev', role: 'Marketing Manager', avatar: '👩‍💻' },
    { id: '6', name: 'John Smith', email: 'john@octoops.dev', role: 'Designer', avatar: '👨‍🎨' },
  ],
  addTeamMember: (member) => {
    const newMember = { ...member, id: generateId() };
    set((state) => ({ team: [...state.team, newMember] }));
    get().addActivity({ agent: 'Communication', action: `Added team member: ${member.name}`, time: 'Just now' });
    get().activateAgent('Communication');
  },
  removeTeamMember: (id) => {
    const member = get().team.find((m) => m.id === id);
    set((state) => ({ team: state.team.filter((m) => m.id !== id) }));
    if (member) {
      get().addActivity({ agent: 'Communication', action: `Removed team member: ${member.name}`, time: 'Just now' });
    }
  },

  // Activities
  activities: [
    { id: '1', agent: 'Risk', action: 'Detected potential deadline conflict for Launch Feature', time: '2m ago', timestamp: new Date(Date.now() - 2 * 60 * 1000) },
    { id: '2', agent: 'Execution', action: 'Task "Design Review" marked complete by Sarah', time: '5m ago', timestamp: new Date(Date.now() - 5 * 60 * 1000) },
    { id: '3', agent: 'Communication', action: 'Sent deadline reminder to 3 team members', time: '12m ago', timestamp: new Date(Date.now() - 12 * 60 * 1000) },
    { id: '4', agent: 'Planner', action: 'Updated timeline after milestone completion', time: '18m ago', timestamp: new Date(Date.now() - 18 * 60 * 1000) },
    { id: '5', agent: 'Recommendation', action: 'Suggested parallelizing 2 independent tasks', time: '25m ago', timestamp: new Date(Date.now() - 25 * 60 * 1000) },
  ],
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
  activateAgent: (agent, duration = 2000) => {
    get().setAgentState(agent, 'active');
    setTimeout(() => get().setAgentState(agent, 'idle'), duration);
  },
}));
