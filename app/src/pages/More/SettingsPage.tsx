import { useState, type ReactNode } from 'react';
import { Trash2, Plus, RotateCcw } from 'lucide-react';
import { useStore } from '../../store/store';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Input, Select, Label } from '../../components/ui/Field';
import { Button, IconButton } from '../../components/ui/Button';

const ACCENT_COLORS = ['#6366f1', '#0ea5e9', '#22c55e', '#f97316', '#ec4899', '#8b5cf6', '#ef4444', '#14b8a6'];
const AVATAR_OPTIONS = ['🙂', '😎', '🚀', '🌟', '🦊', '🐱', '🌱', '⚡'];

export function SettingsPage() {
  const profile = useStore((s) => s.profile);
  const updateProfile = useStore((s) => s.updateProfile);
  const categories = useStore((s) => s.categories);
  const addCategory = useStore((s) => s.addCategory);
  const updateCategory = useStore((s) => s.updateCategory);
  const deleteCategory = useStore((s) => s.deleteCategory);
  const resetDemoData = useStore((s) => s.resetDemoData);
  const clearAllData = useStore((s) => s.clearAllData);
  const [newCategory, setNewCategory] = useState('');

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 sm:px-6 md:pt-10 pb-10">
      <PageHeader title="Ajustes" back subtitle="Haz que la app se sienta tuya" />

      <Section title="Perfil">
        <Input placeholder="Tu nombre" value={profile.name} onChange={(e) => updateProfile({ name: e.target.value })} />
        <div className="mt-3 flex flex-wrap gap-2">
          {AVATAR_OPTIONS.map((a) => (
            <button
              key={a}
              onClick={() => updateProfile({ avatarEmoji: a })}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border text-lg transition-colors ${profile.avatarEmoji === a ? 'border-accent bg-accent/10' : 'border-zinc-200 dark:border-zinc-700'}`}
            >
              {a}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Apariencia">
        <Label>Tema</Label>
        <div className="mb-3 flex gap-1.5">
          {(['light', 'dark', 'system'] as const).map((t) => (
            <button
              key={t}
              onClick={() => updateProfile({ theme: t })}
              className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium capitalize transition-colors ${profile.theme === t ? 'border-accent bg-accent/10 text-accent' : 'border-zinc-200 text-zinc-500 dark:border-zinc-700'}`}
            >
              {t === 'light' ? 'Claro' : t === 'dark' ? 'Oscuro' : 'Sistema'}
            </button>
          ))}
        </div>
        <Label>Color principal</Label>
        <div className="flex flex-wrap gap-2">
          {ACCENT_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => updateProfile({ accentColor: c })}
              className={`h-9 w-9 rounded-full ring-2 ring-offset-2 ring-offset-white transition-transform hover:scale-105 dark:ring-offset-zinc-950 ${profile.accentColor === c ? '' : 'ring-transparent'}`}
              style={{ backgroundColor: c, boxShadow: profile.accentColor === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : undefined }}
            />
          ))}
        </div>
      </Section>

      <Section title="Horario habitual">
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Me despierto</Label><Input type="time" value={profile.usualWake} onChange={(e) => updateProfile({ usualWake: e.target.value })} /></div>
          <div><Label>Me acuesto</Label><Input type="time" value={profile.usualSleep} onChange={(e) => updateProfile({ usualSleep: e.target.value })} /></div>
        </div>
        <div className="mt-3">
          <Label>Primer día de la semana</Label>
          <Select value={profile.weekStartsOn} onChange={(e) => updateProfile({ weekStartsOn: Number(e.target.value) as 0 | 1 })}>
            <option value={1}>Lunes</option>
            <option value={0}>Domingo</option>
          </Select>
        </div>
      </Section>

      <Section title="Modo foco / Pomodoro">
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Trabajo (min)</Label><Input type="number" min={5} value={profile.pomodoroWork} onChange={(e) => updateProfile({ pomodoroWork: Number(e.target.value) })} /></div>
          <div><Label>Descanso (min)</Label><Input type="number" min={1} value={profile.pomodoroBreak} onChange={(e) => updateProfile({ pomodoroBreak: Number(e.target.value) })} /></div>
        </div>
      </Section>

      <Section title="Notificaciones">
        <label className="flex items-center justify-between">
          <span className="text-sm text-zinc-600 dark:text-zinc-300">Recordatorios y alertas</span>
          <button
            onClick={() => updateProfile({ notificationsEnabled: !profile.notificationsEnabled })}
            className={`h-6 w-11 shrink-0 rounded-full transition-colors ${profile.notificationsEnabled ? 'bg-accent' : 'bg-zinc-200 dark:bg-zinc-700'}`}
          >
            <span className={`block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow transition-transform ${profile.notificationsEnabled ? 'translate-x-[22px]' : ''}`} />
          </button>
        </label>
      </Section>

      <Section title="Categorías">
        <div className="space-y-1.5">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center gap-2 rounded-lg px-1 py-1">
              <span>{c.icon}</span>
              <input
                value={c.name}
                onChange={(e) => updateCategory(c.id, { name: e.target.value })}
                className="flex-1 bg-transparent text-sm text-zinc-700 outline-none dark:text-zinc-200"
              />
              <span className="h-4 w-4 rounded-full" style={{ backgroundColor: c.color }} />
              <IconButton size="sm" onClick={() => deleteCategory(c.id)} className="text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"><Trash2 size={14} /></IconButton>
            </div>
          ))}
          <div className="flex gap-1.5 pt-1">
            <Input
              placeholder="Nueva categoría..."
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && newCategory.trim()) { addCategory(newCategory.trim(), '#64748b', '📌'); setNewCategory(''); } }}
            />
            <IconButton onClick={() => { if (newCategory.trim()) { addCategory(newCategory.trim(), '#64748b', '📌'); setNewCategory(''); } }}><Plus size={16} /></IconButton>
          </div>
        </div>
      </Section>

      <Section title="Datos">
        <p className="mb-3 text-xs text-zinc-400">
          Todos tus datos se guardan solo en este dispositivo (almacenamiento local), por lo que la app funciona sin conexión. Aún no hay sincronización en la nube ni cuentas — se puede añadir más adelante.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={resetDemoData}><RotateCcw size={14} /> Restaurar datos de ejemplo</Button>
          <Button variant="danger" size="sm" onClick={() => { if (confirm('¿Borrar todos tus datos? Esta acción no se puede deshacer.')) clearAllData(); }}>
            <Trash2 size={14} /> Borrar todos los datos
          </Button>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="mb-4 p-4">
      <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</h3>
      {children}
    </Card>
  );
}
