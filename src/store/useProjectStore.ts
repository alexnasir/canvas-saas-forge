import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Project {
  id: string;
  name: string;
  description: string;
  updatedAt: string;
  thumbnail?: string;
}

interface ProjectState {
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'updatedAt'>) => void;
  deleteProject: (id: string) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      projects: [
        {
          id: '1',
          name: 'My Awesome SaaS',
          description: 'A revolutionary CRM for modern teams.',
          thumbnail: 'https://storage.googleapis.com/dala-prod-public-storage/generated-images/00f5583d-c5c4-4bce-afa3-837ccf9294ed/nasitu-dashboard-preview-89f0e614-1782597389099.webp',
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'E-commerce Store',
          description: 'Building the future of retail.',
          thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2430&auto=format&fit=crop',
          updatedAt: new Date().toISOString(),
        }
      ],
      addProject: (project) => set((state) => ({
        projects: [
          ...state.projects,
          {
            ...project,
            id: Math.random().toString(36).substring(7),
            updatedAt: new Date().toISOString(),
          }
        ]
      })),
      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter((p) => p.id !== id)
      })),
      updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map((p) => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p)
      })),
    }),
    {
      name: 'nasitu-projects',
    }
  )
);
