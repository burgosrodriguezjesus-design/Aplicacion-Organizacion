import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Send } from 'lucide-react';
import { Sheet } from '../ui/Sheet';
import { Input } from '../ui/Field';
import { Button } from '../ui/Button';
import { useStore } from '../../store/store';
import { useUiStore } from '../../store/uiStore';
import { interpretCommand, type AssistantAction } from '../../lib/assistant';
import { todayKey } from '../../lib/date';

interface Message {
  id: string;
  from: 'user' | 'assistant';
  text: string;
  action?: AssistantAction;
  actionDone?: boolean;
}

const SUGGESTIONS = ['¿Qué tengo que hacer hoy?', 'Organízame el día', '¿Qué tareas tengo pendientes?', 'Quiero estudiar 2 horas esta tarde'];

export function AssistantSheet() {
  const open = useUiStore((s) => s.assistantOpen);
  const setOpen = useUiStore((s) => s.setAssistantOpen);
  const navigate = useNavigate();
  const tasks = useStore((s) => s.tasks);
  const events = useStore((s) => s.events);
  const updateTask = useStore((s) => s.updateTask);
  const updateEvent = useStore((s) => s.updateEvent);
  const addTask = useStore((s) => s.addTask);

  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', from: 'assistant', text: 'Hola, soy tu asistente. Puedo ayudarte a organizar tu día. Pregúntame algo o elige una sugerencia.' },
  ]);
  const [input, setInput] = useState('');

  const send = (text: string) => {
    if (!text.trim()) return;
    const today = todayKey();
    const reply = interpretCommand(text, { tasks, events, today }, {
      goToPlanner: () => { setOpen(false); navigate('/calendario?plan=1'); },
      findEventByName: (name) => events.find((e) => e.title.toLowerCase().includes(name.toLowerCase())),
      findTaskByName: (name) => tasks.find((t) => t.title.toLowerCase().includes(name.toLowerCase())),
      moveEventDate: (id, date) => updateEvent(id, { date }),
      moveTaskDate: (id, date) => updateTask(id, { date }),
      addTask: (t) => addTask(t),
    });
    setMessages((m) => [
      ...m,
      { id: crypto.randomUUID(), from: 'user', text },
      { id: crypto.randomUUID(), from: 'assistant', text: reply.text, action: reply.action },
    ]);
    setInput('');
  };

  const runAction = (msgId: string, action: AssistantAction) => {
    action.run();
    setMessages((m) => m.map((msg) => (msg.id === msgId ? { ...msg, actionDone: true } : msg)));
  };

  if (!open) return null;

  return (
    <Sheet open onClose={() => setOpen(false)} title="Asistente" maxWidth="max-w-lg">
      <div className="flex h-[60vh] flex-col">
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm ${
                m.from === 'user' ? 'bg-accent text-white' : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
              }`}>
                {m.text}
                {m.action && (
                  <div className="mt-2">
                    <Button size="sm" variant={m.actionDone ? 'secondary' : 'primary'} disabled={m.actionDone} onClick={() => runAction(m.id, m.action!)}>
                      {m.actionDone ? '✓ Hecho' : m.action.label}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mb-2 flex flex-wrap gap-1.5 pt-2">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => send(s)} className="rounded-full border border-zinc-200 px-2.5 py-1 text-xs text-zinc-500 hover:border-accent hover:text-accent dark:border-zinc-700">
              {s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-accent sm:block"><Sparkles size={16} /></span>
          <Input
            autoFocus
            placeholder="Escribe una orden..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send(input)}
          />
          <Button variant="primary" onClick={() => send(input)} disabled={!input.trim()}><Send size={16} /></Button>
        </div>
      </div>
    </Sheet>
  );
}
