import axios from 'axios';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'https://octoops-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const auth = {
  login: (identifier: string) => api.post('/auth/login', { identifier }),
  signup: (data: any) => api.post('/auth/signup', data),
};

export const projects = {
  create: (data: any) => api.post('/projects', data),
  get: (projectId?: string) => api.get('/projects', { params: { projectId } }),
  update: (data: any) => api.put('/projects', data),
  getUserProjects: (userId: string) => api.get('/projects/user', { params: { userId } }),
};

export const tasks = {
  getAll: (projectId?: string) => api.get('/tasks', { params: { projectId } }),
  create: (data: any) => api.post('/tasks', data),
  update: (id: string, data: any) => api.put(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
  submit: (id: string) => api.post(`/tasks/${id}/submit`),
  approve: (id: string) => api.post(`/tasks/${id}/approve`),
};

export const risks = {
  getAll: (projectId?: string) => api.get('/risks', { params: { projectId } }),
  create: (data: any) => api.post('/risks', data),
  update: (id: string, data: any) => api.put(`/risks/${id}`, data),
  delete: (id: string) => api.delete(`/risks/${id}`),
  resolve: (id: string, userId: string) => api.post(`/risks/${id}/resolve`, { userId }),
  analyze: (projectId: string, projectData: any) => api.post('/risks/analyze', { projectId, projectData }),
};

export const team = {
  getMembers: (projectId: string) => api.get('/team', { params: { projectId } }),
  invite: (data: any) => api.post('/team/invite', data),
  acceptInvite: (inviteCode: string, userName: string) => api.post('/team/accept', { inviteCode, userName }),
  removeMember: (userId: string, projectId: string) => api.delete('/team/member', { data: { userId, projectId } }),
  updateRole: (userId: string, role: string) => api.put('/team/member/role', { userId, role }),
  cancelInvite: (inviteId: string) => api.delete(`/team/invite/${inviteId}`),
};

export const settings = {
  get: (projectId: string) => api.get('/settings', { params: { projectId } }),
  update: (data: any) => api.put('/settings', data),
  updateNotifications: (projectId: string, notifications: any) => api.put('/settings/notifications', { projectId, notifications }),
  updateIntegrations: (projectId: string, integrations: any) => api.put('/settings/integrations', { projectId, integrations }),
  updateAI: (projectId: string, aiSettings: any) => api.put('/settings/ai', { projectId, aiSettings }),
};

export const ai = {
  analyzeImage: (formData: FormData) => {
    return api.post('/ai/analyze-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getTeamAssembly: (name: string, vision: string) => api.post('/ai/team-assembly', { name, description: vision }),
  generateTasks: (projectId: string) => api.post('/ai/generate-tasks', { projectId }),
  calculateHealthScore: (projectId: string) => api.post('/ai/health-score', { projectId }),
  getTaskRecommendations: (projectId: string) => api.get('/ai/task-recommendations', { params: { projectId } }),
};

export default api;
