import { create } from 'zustand';

export interface CanvasElement {
  id: string;
  type: 'button' | 'text' | 'input' | 'card' | 'container' | 'image' | 'chart' | 'navbar' | 'footer';
  props: Record<string, any>;
  children?: string[];
  parentId?: string;
}

interface CanvasState {
  elements: Record<string, CanvasElement>;
  selectedElementId: string | null;
  history: Record<string, CanvasElement>[];
  historyIndex: number;
  
  addElement: (element: Omit<CanvasElement, 'id'>) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  removeElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  undo: () => void;
  redo: () => void;
  saveHistory: () => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  elements: {
    'root': { id: 'root', type: 'container', props: { className: 'p-8 min-h-screen bg-white' }, children: [] }
  },
  selectedElementId: null,
  history: [],
  historyIndex: -1,

  addElement: (element) => {
    const id = Math.random().toString(36).substring(7);
    const newElement = { ...element, id };
    
    set((state) => {
      const parentId = element.parentId || 'root';
      const parent = state.elements[parentId];
      
      return {
        elements: {
          ...state.elements,
          [id]: newElement,
          [parentId]: {
            ...parent,
            children: [...(parent.children || []), id]
          }
        }
      };
    });
    get().saveHistory();
  },

  updateElement: (id, updates) => {
    set((state) => ({
      elements: {
        ...state.elements,
        [id]: { ...state.elements[id], ...updates }
      }
    }));
    get().saveHistory();
  },

  removeElement: (id) => {
    set((state) => {
      const { [id]: _, ...rest } = state.elements;
      // Also need to remove from parent's children list
      const newState = { ...rest };
      Object.keys(newState).forEach(key => {
        if (newState[key].children?.includes(id)) {
          newState[key] = {
            ...newState[key],
            children: newState[key].children?.filter(cid => cid !== id)
          };
        }
      });
      return { elements: newState, selectedElementId: state.selectedElementId === id ? null : state.selectedElementId };
    });
    get().saveHistory();
  },

  selectElement: (id) => set({ selectedElementId: id }),

  saveHistory: () => {
    const { elements, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ ...elements });
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      set({ elements: history[historyIndex - 1], historyIndex: historyIndex - 1 });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      set({ elements: history[historyIndex + 1], historyIndex: historyIndex + 1 });
    }
  }
}));
