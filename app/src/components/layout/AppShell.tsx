import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { SideNav } from './SideNav';
import { BottomNav } from './BottomNav';
import { Fab } from './Fab';
import { QuickAddSheet } from '../QuickAdd/QuickAddSheet';
import { GlobalSearch } from '../Search/GlobalSearch';
import { TaskEditorSheet } from '../editors/TaskEditorSheet';
import { EventEditorSheet } from '../editors/EventEditorSheet';
import { GoalEditorSheet } from '../editors/GoalEditorSheet';
import { HabitEditorSheet } from '../editors/HabitEditorSheet';
import { NoteEditorSheet } from '../editors/NoteEditorSheet';
import { AssistantSheet } from '../Assistant/AssistantSheet';
import { useTheme } from '../../hooks/useTheme';
import { useUiStore } from '../../store/uiStore';

export function AppShell() {
  useTheme();
  const setSearchOpen = useUiStore((s) => s.setSearchOpen);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setSearchOpen]);

  return (
    <div className="min-h-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <SideNav />
      <main className="min-h-full pb-24 md:ml-60 md:pb-8">
        <Outlet />
      </main>
      <BottomNav />
      <Fab />
      <QuickAddSheet />
      <GlobalSearch />
      <TaskEditorSheet />
      <EventEditorSheet />
      <GoalEditorSheet />
      <HabitEditorSheet />
      <NoteEditorSheet />
      <AssistantSheet />
    </div>
  );
}
