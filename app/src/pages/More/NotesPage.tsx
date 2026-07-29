import { useMemo, useState } from 'react';
import { Plus, StickyNote, Pin, Search } from 'lucide-react';
import { useStore } from '../../store/store';
import { useUiStore } from '../../store/uiStore';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Field';
import { EmptyState } from '../../components/ui/EmptyState';

const TYPE_ICON: Record<string, string> = { quick: '📝', list: '☑️', idea: '💡', apunte: '📚' };

export function NotesPage() {
  const notes = useStore((s) => s.notes);
  const togglePinNote = useStore((s) => s.togglePinNote);
  const setEditingNoteId = useUiStore((s) => s.setEditingNoteId);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? notes.filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)) : notes;
    return [...list].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt));
  }, [notes, query]);

  return (
    <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-6 md:pt-10">
      <PageHeader
        title="Notas"
        back
        subtitle={`${notes.length} notas`}
        action={<Button variant="primary" size="sm" onClick={() => setEditingNoteId('new')}><Plus size={16} /> Nueva</Button>}
      />

      <div className="relative mb-5">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <Input placeholder="Buscar notas..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<StickyNote className="text-zinc-300" />} title="Sin notas" subtitle="Apunta ideas, listas o apuntes rápidos." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((n) => (
            <Card key={n.id} className="relative p-4">
              <button onClick={() => setEditingNoteId(n.id)} className="block w-full pr-6 text-left">
                <p className="mb-1 font-semibold text-zinc-900 dark:text-zinc-50">{TYPE_ICON[n.type]} {n.title}</p>
                <p className="line-clamp-3 whitespace-pre-line text-sm text-zinc-500 dark:text-zinc-400">{n.content || 'Sin contenido'}</p>
              </button>
              <button
                onClick={() => togglePinNote(n.id)}
                className={`absolute right-3 top-3 rounded-full p-1 ${n.pinned ? 'text-accent' : 'text-zinc-300 hover:text-zinc-400'}`}
              >
                <Pin size={15} fill={n.pinned ? 'currentColor' : 'none'} />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
