import { create } from 'zustand';

export type QuickAddType = 'task' | 'event' | 'habit' | 'reminder' | 'note';

interface UiState {
  quickAddOpen: false | QuickAddType | 'menu';
  openQuickAdd: (type: QuickAddType | 'menu') => void;
  closeQuickAdd: () => void;

  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;

  focusTaskId: string | null;
  setFocusTaskId: (id: string | null) => void;

  editingTaskId: string | null;
  setEditingTaskId: (id: string | null) => void;
  editingEventId: string | null;
  setEditingEventId: (id: string | null) => void;
  editingGoalId: string | null;
  setEditingGoalId: (id: string | null) => void;
  editingHabitId: string | null;
  setEditingHabitId: (id: string | null) => void;
  editingNoteId: string | null;
  setEditingNoteId: (id: string | null) => void;

  assistantOpen: boolean;
  setAssistantOpen: (open: boolean) => void;

  newItemDate: string | null;
  setNewItemDate: (date: string | null) => void;
}

export const useUiStore = create<UiState>((set) => ({
  quickAddOpen: false,
  openQuickAdd: (type) => set({ quickAddOpen: type }),
  closeQuickAdd: () => set({ quickAddOpen: false }),

  searchOpen: false,
  setSearchOpen: (open) => set({ searchOpen: open }),

  focusTaskId: null,
  setFocusTaskId: (id) => set({ focusTaskId: id }),

  editingTaskId: null,
  setEditingTaskId: (id) => set({ editingTaskId: id }),
  editingEventId: null,
  setEditingEventId: (id) => set({ editingEventId: id }),
  editingGoalId: null,
  setEditingGoalId: (id) => set({ editingGoalId: id }),
  editingHabitId: null,
  setEditingHabitId: (id) => set({ editingHabitId: id }),
  editingNoteId: null,
  setEditingNoteId: (id) => set({ editingNoteId: id }),

  assistantOpen: false,
  setAssistantOpen: (open) => set({ assistantOpen: open }),

  newItemDate: null,
  setNewItemDate: (date) => set({ newItemDate: date }),
}));
