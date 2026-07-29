import { useState } from 'react';
import { Inbox, Trash2, CheckSquare, CalendarDays, StickyNote, Bell } from 'lucide-react';
import { useStore } from '../../store/store';
import { PageHeader } from '../../components/layout/PageHeader';
import { Input } from '../../components/ui/Field';
import { IconButton } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';

const CONVERT_OPTIONS = [
  { type: 'task' as const, icon: CheckSquare, label: 'Tarea' },
  { type: 'event' as const, icon: CalendarDays, label: 'Evento' },
  { type: 'note' as const, icon: StickyNote, label: 'Nota' },
  { type: 'reminder' as const, icon: Bell, label: 'Recordatorio' },
];

export function InboxPage() {
  const items = useStore((s) => s.inboxItems);
  const addInboxItem = useStore((s) => s.addInboxItem);
  const deleteInboxItem = useStore((s) => s.deleteInboxItem);
  const convertInboxItem = useStore((s) => s.convertInboxItem);
  const [text, setText] = useState('');

  const submit = () => {
    if (!text.trim()) return;
    addInboxItem(text.trim());
    setText('');
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 sm:px-6 md:pt-10">
      <PageHeader title="Bandeja de entrada" back subtitle="Apunta cualquier cosa en 2 segundos" />

      <Input
        autoFocus
        placeholder="Escribe algo y pulsa Enter..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        className="mb-5"
      />

      {items.length === 0 ? (
        <EmptyState icon={<Inbox className="text-zinc-300" />} title="Bandeja vacía" subtitle="Todo lo que apuntes aquí podrás convertirlo luego en tarea, evento, nota o recordatorio." />
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Card key={item.id} className="p-3">
              <p className="mb-2 text-sm text-zinc-800 dark:text-zinc-100">{item.text}</p>
              <div className="flex flex-wrap items-center gap-1.5">
                {CONVERT_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.type}
                      onClick={() => convertInboxItem(item.id, opt.type)}
                      className="flex items-center gap-1 rounded-full border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-500 transition-colors hover:border-accent hover:text-accent dark:border-zinc-700"
                    >
                      <Icon size={12} /> {opt.label}
                    </button>
                  );
                })}
                <IconButton size="sm" onClick={() => deleteInboxItem(item.id)} className="ml-auto text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30">
                  <Trash2 size={14} />
                </IconButton>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
