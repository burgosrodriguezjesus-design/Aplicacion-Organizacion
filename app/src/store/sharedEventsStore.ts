import { create } from 'zustand';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import type { SharedEvent } from '../types';

interface SharedEventRow {
  id: string;
  couple_id: string;
  created_by: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  notes: string;
  color: string;
  created_at: string;
  updated_at: string;
}

function mapRow(row: SharedEventRow): SharedEvent {
  return {
    id: row.id,
    coupleId: row.couple_id,
    createdBy: row.created_by,
    title: row.title,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    location: row.location,
    notes: row.notes,
    color: row.color,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

interface SharedEventsState {
  events: SharedEvent[];
  loading: boolean;
  channel: RealtimeChannel | null;

  subscribe: (coupleId: string) => Promise<void>;
  unsubscribe: () => void;
  addEvent: (coupleId: string, userId: string, event: Partial<SharedEvent> & { title: string; date: string }) => Promise<boolean>;
  updateEvent: (id: string, patch: Partial<SharedEvent>) => Promise<boolean>;
  deleteEvent: (id: string) => Promise<boolean>;
}

export const useSharedEventsStore = create<SharedEventsState>((set, get) => ({
  events: [],
  loading: false,
  channel: null,

  subscribe: async (coupleId) => {
    if (!supabase) return;
    get().unsubscribe();
    set({ loading: true });

    const { data } = await supabase.from('shared_events').select('*').eq('couple_id', coupleId);
    set({ events: (data || []).map(mapRow), loading: false });

    const channel = supabase
      .channel(`shared_events:${coupleId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shared_events', filter: `couple_id=eq.${coupleId}` },
        (payload) => {
          set((s) => {
            if (payload.eventType === 'DELETE') {
              return { events: s.events.filter((e) => e.id !== (payload.old as SharedEventRow).id) };
            }
            const row = mapRow(payload.new as SharedEventRow);
            const exists = s.events.some((e) => e.id === row.id);
            return { events: exists ? s.events.map((e) => (e.id === row.id ? row : e)) : [...s.events, row] };
          });
        },
      )
      .subscribe();

    set({ channel });
  },

  unsubscribe: () => {
    const { channel } = get();
    if (channel && supabase) supabase.removeChannel(channel);
    set({ channel: null, events: [] });
  },

  addEvent: async (coupleId, userId, event) => {
    if (!supabase) return false;
    const { error } = await supabase.from('shared_events').insert({
      couple_id: coupleId,
      created_by: userId,
      title: event.title,
      date: event.date,
      start_time: event.startTime || '09:00',
      end_time: event.endTime || '10:00',
      location: event.location || '',
      notes: event.notes || '',
      color: event.color || '#ec4899',
    });
    return !error;
  },

  updateEvent: async (id, patch) => {
    if (!supabase) return false;
    const payload: Record<string, unknown> = {};
    if (patch.title !== undefined) payload.title = patch.title;
    if (patch.date !== undefined) payload.date = patch.date;
    if (patch.startTime !== undefined) payload.start_time = patch.startTime;
    if (patch.endTime !== undefined) payload.end_time = patch.endTime;
    if (patch.location !== undefined) payload.location = patch.location;
    if (patch.notes !== undefined) payload.notes = patch.notes;
    if (patch.color !== undefined) payload.color = patch.color;
    const { error } = await supabase.from('shared_events').update(payload).eq('id', id);
    return !error;
  },

  deleteEvent: async (id) => {
    if (!supabase) return false;
    const { error } = await supabase.from('shared_events').delete().eq('id', id);
    return !error;
  },
}));
