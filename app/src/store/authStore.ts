import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { generateInviteCode } from '../lib/inviteCode';
import type { Profile, Couple } from '../types';

interface AuthState {
  ready: boolean; // has the initial session check completed?
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  couple: Couple | null;
  partner: Profile | null;
  loading: boolean;
  error: string | null;

  init: () => void;
  clearError: () => void;
  signUp: (email: string, password: string, displayName: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  createCoupleSpace: () => Promise<boolean>;
  joinCoupleSpace: (code: string) => Promise<boolean>;
  leaveCoupleSpace: () => Promise<boolean>;
  refreshCoupleData: () => Promise<void>;
}

function mapProfile(row: { id: string; display_name: string; avatar_emoji: string }): Profile {
  return { id: row.id, displayName: row.display_name, avatarEmoji: row.avatar_emoji };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  ready: false,
  session: null,
  user: null,
  profile: null,
  couple: null,
  partner: null,
  loading: false,
  error: null,

  init: () => {
    if (!supabase) {
      set({ ready: true });
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      set({ session: data.session, user: data.session?.user ?? null, ready: true });
      if (data.session?.user) get().refreshCoupleData();
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null });
      if (session?.user) get().refreshCoupleData();
      else set({ profile: null, couple: null, partner: null });
    });
  },

  clearError: () => set({ error: null }),

  signUp: async (email, password, displayName) => {
    if (!supabase) return false;
    set({ loading: true, error: null });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName || 'Yo' } },
    });
    if (error) {
      set({ loading: false, error: translateAuthError(error.message) });
      return false;
    }
    if (data.user && displayName) {
      await supabase.from('profiles').update({ display_name: displayName }).eq('id', data.user.id);
    }
    set({ loading: false });
    return true;
  },

  signIn: async (email, password) => {
    if (!supabase) return false;
    set({ loading: true, error: null });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ loading: false, error: translateAuthError(error.message) });
      return false;
    }
    set({ loading: false });
    return true;
  },

  signOut: async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    set({ session: null, user: null, profile: null, couple: null, partner: null });
  },

  createCoupleSpace: async () => {
    const { user } = get();
    if (!supabase || !user) return false;
    set({ loading: true, error: null });
    const code = generateInviteCode();
    const { data: couple, error } = await supabase
      .from('couples')
      .insert({ invite_code: code, created_by: user.id })
      .select()
      .single();
    if (error || !couple) {
      set({ loading: false, error: 'No se pudo crear el espacio. Inténtalo de nuevo.' });
      return false;
    }
    const { error: memberError } = await supabase
      .from('couple_members')
      .insert({ couple_id: couple.id, user_id: user.id });
    if (memberError) {
      set({ loading: false, error: 'No se pudo crear el espacio. Inténtalo de nuevo.' });
      return false;
    }
    set({ loading: false, couple: { id: couple.id, inviteCode: couple.invite_code } });
    return true;
  },

  joinCoupleSpace: async (code) => {
    if (!supabase) return false;
    set({ loading: true, error: null });
    const { error } = await supabase.rpc('join_couple', { code: code.trim().toUpperCase() });
    if (error) {
      set({ loading: false, error: translateJoinError(error.message) });
      return false;
    }
    await get().refreshCoupleData();
    set({ loading: false });
    return true;
  },

  leaveCoupleSpace: async () => {
    const { user, couple } = get();
    if (!supabase || !user || !couple) return false;
    set({ loading: true, error: null });
    const { error } = await supabase
      .from('couple_members')
      .delete()
      .eq('couple_id', couple.id)
      .eq('user_id', user.id);
    if (error) {
      set({ loading: false, error: 'No se pudo salir del espacio. Inténtalo de nuevo.' });
      return false;
    }
    set({ loading: false, couple: null, partner: null });
    return true;
  },

  refreshCoupleData: async () => {
    const { user } = get();
    if (!supabase || !user) return;

    const { data: profileRow } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (profileRow) set({ profile: mapProfile(profileRow) });

    const { data: membership } = await supabase
      .from('couple_members')
      .select('couple_id, couples(id, invite_code)')
      .eq('user_id', user.id)
      .maybeSingle();

    const coupleRow = membership?.couples as unknown as { id: string; invite_code: string } | null;
    if (!coupleRow) {
      set({ couple: null, partner: null });
      return;
    }
    set({ couple: { id: coupleRow.id, inviteCode: coupleRow.invite_code } });

    const { data: members } = await supabase
      .from('couple_members')
      .select('user_id, profiles(id, display_name, avatar_emoji)')
      .eq('couple_id', coupleRow.id);

    const partnerRow = (members || [])
      .map((m) => m.profiles as unknown as { id: string; display_name: string; avatar_emoji: string } | null)
      .find((p) => p && p.id !== user.id);
    set({ partner: partnerRow ? mapProfile(partnerRow) : null });
  },
}));

function translateAuthError(message: string): string {
  if (message.includes('already registered')) return 'Ese correo ya tiene una cuenta. Prueba a iniciar sesión.';
  if (message.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos.';
  if (message.includes('Password should be')) return 'La contraseña debe tener al menos 6 caracteres.';
  if (message.includes('valid email')) return 'Escribe un correo electrónico válido.';
  return 'Algo ha fallado. Inténtalo de nuevo.';
}

function translateJoinError(message: string): string {
  if (message.includes('Código no válido')) return 'Ese código no existe. Revísalo con tu pareja.';
  if (message.includes('ya tiene dos personas')) return 'Ese espacio ya tiene dos personas.';
  if (message.includes('Ya estás')) return 'Ya formas parte de ese espacio.';
  return 'No se pudo unir al espacio. Inténtalo de nuevo.';
}

export { isSupabaseConfigured };
