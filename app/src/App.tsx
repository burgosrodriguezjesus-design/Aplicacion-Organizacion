import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { TodayPage } from './pages/Today/TodayPage';
import { CalendarPage } from './pages/Calendar/CalendarPage';
import { TasksPage } from './pages/Tasks/TasksPage';
import { GoalsPage } from './pages/Goals/GoalsPage';
import { MorePage } from './pages/More/MorePage';
import { HabitsPage } from './pages/More/HabitsPage';
import { NotesPage } from './pages/More/NotesPage';
import { InboxPage } from './pages/More/InboxPage';
import { RemindersPage } from './pages/More/RemindersPage';
import { RoutinesPage } from './pages/More/RoutinesPage';
import { StatsPage } from './pages/More/StatsPage';
import { SettingsPage } from './pages/More/SettingsPage';
import { CouplePage } from './pages/More/CouplePage';
import { FocusPage } from './pages/Focus/FocusPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<TodayPage />} />
          <Route path="/calendario" element={<CalendarPage />} />
          <Route path="/tareas" element={<TasksPage />} />
          <Route path="/objetivos" element={<GoalsPage />} />
          <Route path="/mas" element={<MorePage />} />
          <Route path="/mas/habitos" element={<HabitsPage />} />
          <Route path="/mas/notas" element={<NotesPage />} />
          <Route path="/mas/bandeja" element={<InboxPage />} />
          <Route path="/mas/recordatorios" element={<RemindersPage />} />
          <Route path="/mas/rutinas" element={<RoutinesPage />} />
          <Route path="/mas/estadisticas" element={<StatsPage />} />
          <Route path="/mas/ajustes" element={<SettingsPage />} />
          <Route path="/mas/pareja" element={<CouplePage />} />
          <Route path="/foco/:taskId" element={<FocusPage />} />
          <Route path="/foco" element={<FocusPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
