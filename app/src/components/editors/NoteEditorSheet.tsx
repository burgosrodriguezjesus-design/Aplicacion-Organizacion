import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Sheet } from '../ui/Sheet';
import { Button, IconButton } from '../ui/Button';
import { Input, Textarea, Select, Label } from '../ui/Field';
import { useStore } from '../../store/store';
import { useUiStore } from '../../store/uiStore';
import type { NoteType } from '../../types';

const TYPE_LABELS: Record<NoteType, string> = { quick: 'Nota rápida', list: 'Lista', idea: 'Idea', apunte: 'Apunte' };

export function NoteEditorSheet() {
  const editingId = useUiStore((s) => s.editingNoteId);
  const setEditingId = useUiStore((s) => s.setEditingNoteId);
  const note = useStore((s) => s.notes.find((n) => n.id === editingId));
  const categories = useStore((s) => s.categories);
  const addNote = useStore((s) => s.addNote);
  const updateNote = useStore((s) => s.updateNote);
  const deleteNote = useStore((s) => s.deleteNote);

  const isNew = editingId === 'new';
  const open = editingId !== null;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<NoteType>('quick');
  const [categoryId, setCategoryId] = useState<string | undefined>();

  useEffect(() => {
    if (isNew) { setTitle(''); setContent(''); setType('quick'); setCategoryId(undefined); }
    else if (note) { setTitle(note.title); setContent(note.content); setType(note.type); setCategoryId(note.categoryId); }
  }, [editingId, isNew, note]);

  if (!open || (!isNew && !note)) return null;

  const close = () => setEditingId(null);

  const save = () => {
    if (!title.trim()) return;
    const payload = { title: title.trim(), content, type, categoryId };
    if (isNew) addNote(payload);
    else if (note) updateNote(note.id, payload);
    close();
  };

  const remove = () => { if (note) deleteNote(note.id); close(); };

  return (
    <Sheet
      open
      onClose={close}
      title={isNew ? 'Nueva nota' : 'Editar nota'}
      footer={
        <div className="flex gap-2">
          {!isNew && <IconButton onClick={remove} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"><Trash2 size={18} /></IconButton>}
          <Button variant="primary" fullWidth onClick={save} disabled={!title.trim()}>Guardar</Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Input autoFocus placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea placeholder="Escribe algo..." rows={6} value={content} onChange={(e) => setContent(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Tipo</Label>
            <Select value={type} onChange={(e) => setType(e.target.value as NoteType)}>
              {(Object.keys(TYPE_LABELS) as NoteType[]).map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
            </Select>
          </div>
          <div>
            <Label>Categoría</Label>
            <Select value={categoryId || ''} onChange={(e) => setCategoryId(e.target.value || undefined)}>
              <option value="">Sin categoría</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </Select>
          </div>
        </div>
      </div>
    </Sheet>
  );
}
