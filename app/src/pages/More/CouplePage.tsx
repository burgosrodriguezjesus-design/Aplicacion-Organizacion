import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Copy, Check, LogOut, ShieldCheck, CalendarHeart } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Label } from '../../components/ui/Field';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuthStore } from '../../store/authStore';
import { isSupabaseConfigured } from '../../lib/supabaseClient';

export function CouplePage() {
  const ready = useAuthStore((s) => s.ready);
  const user = useAuthStore((s) => s.user);
  const couple = useAuthStore((s) => s.couple);

  return (
    <div className="mx-auto max-w-xl px-4 pt-6 sm:px-6 md:pt-10">
      <PageHeader title="Pareja" back subtitle="Un calendario compartido, solo para vosotros dos" />

      {!isSupabaseConfigured ? (
        <EmptyState
          icon={<Heart className="text-zinc-300" />}
          title="Todavía no está activado"
          subtitle="Esta función necesita configurarse una vez (cuenta gratuita de Supabase). Pídele a quien mantiene la app que la active."
        />
      ) : !ready ? (
        <p className="py-10 text-center text-sm text-zinc-400">Cargando...</p>
      ) : !user ? (
        <AuthForm />
      ) : !couple ? (
        <PairingForm />
      ) : (
        <CoupleDashboard />
      )}
    </div>
  );
}

function AuthForm() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [justSignedUp, setJustSignedUp] = useState(false);
  const signIn = useAuthStore((s) => s.signIn);
  const signUp = useAuthStore((s) => s.signUp);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const submit = async () => {
    if (mode === 'login') {
      await signIn(email, password);
    } else {
      const ok = await signUp(email, password, displayName);
      if (ok) setJustSignedUp(true);
    }
  };

  if (justSignedUp) {
    return (
      <EmptyState
        icon={<Check className="text-emerald-500" />}
        title="Revisa tu correo"
        subtitle={`Te hemos enviado un enlace de confirmación a ${email}. Ábrelo y vuelve aquí para continuar.`}
      />
    );
  }

  return (
    <Card className="p-5">
      <div className="mb-4 flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
        {(['login', 'signup'] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); clearError(); }}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              mode === m ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50' : 'text-zinc-400'
            }`}
          >
            {m === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {mode === 'signup' && (
          <div>
            <Label>Tu nombre</Label>
            <Input placeholder="Jesús" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
        )}
        <div>
          <Label>Correo</Label>
          <Input type="email" placeholder="tucorreo@ejemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label>Contraseña</Label>
          <Input type="password" placeholder="Al menos 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <Button variant="primary" fullWidth onClick={submit} disabled={loading || !email || !password}>
          {loading ? 'Un momento...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
        </Button>
      </div>

      <p className="mt-4 flex items-start gap-1.5 text-xs text-zinc-400">
        <ShieldCheck size={14} className="mt-0.5 shrink-0" />
        Solo tú y la persona con la que te vincules podéis ver este calendario. El resto de tu app (tareas, hábitos, notas...) sigue siendo privado y no pasa por aquí.
      </p>
    </Card>
  );
}

function PairingForm() {
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [code, setCode] = useState('');
  const createCoupleSpace = useAuthStore((s) => s.createCoupleSpace);
  const joinCoupleSpace = useAuthStore((s) => s.joinCoupleSpace);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  return (
    <Card className="p-5">
      <div className="mb-4 flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
        {(['create', 'join'] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); clearError(); }}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              tab === t ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50' : 'text-zinc-400'
            }`}
          >
            {t === 'create' ? 'Crear espacio' : 'Unirme con un código'}
          </button>
        ))}
      </div>

      {tab === 'create' ? (
        <div className="space-y-3">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Se generará un código único. Compártelo con tu pareja para que se una desde su móvil.
          </p>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <Button variant="primary" fullWidth onClick={() => createCoupleSpace()} disabled={loading}>
            {loading ? 'Creando...' : 'Crear espacio de pareja'}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <Label>Código de tu pareja</Label>
            <Input
              placeholder="Ej: A3F9K2"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="text-center text-lg font-semibold tracking-[0.2em]"
              maxLength={6}
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <Button variant="primary" fullWidth onClick={() => joinCoupleSpace(code)} disabled={loading || code.length < 6}>
            {loading ? 'Uniendo...' : 'Unirme'}
          </Button>
        </div>
      )}
    </Card>
  );
}

function CoupleDashboard() {
  const navigate = useNavigate();
  const couple = useAuthStore((s) => s.couple);
  const partner = useAuthStore((s) => s.partner);
  const profile = useAuthStore((s) => s.profile);
  const leaveCoupleSpace = useAuthStore((s) => s.leaveCoupleSpace);
  const signOut = useAuthStore((s) => s.signOut);
  const loading = useAuthStore((s) => s.loading);
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    if (!couple) return;
    navigator.clipboard?.writeText(couple.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!partner) {
    return (
      <Card className="p-5 text-center">
        <p className="mb-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Esperando a tu pareja</p>
        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">Comparte este código para que se una:</p>
        <button
          onClick={copyCode}
          className="mx-auto mb-4 flex items-center gap-2 rounded-2xl border-2 border-dashed border-accent/40 bg-accent/5 px-6 py-3 text-2xl font-bold tracking-[0.3em] text-accent"
        >
          {couple?.inviteCode}
          {copied ? <Check size={20} /> : <Copy size={20} />}
        </button>
        <Button variant="ghost" size="sm" onClick={() => leaveCoupleSpace()} disabled={loading}>Cancelar</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="flex items-center gap-3 p-5">
        <div className="flex -space-x-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-zinc-100 text-xl dark:border-zinc-900 dark:bg-zinc-800">
            {profile?.avatarEmoji || '🙂'}
          </span>
          <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-accent/10 text-xl dark:border-zinc-900">
            {partner.avatarEmoji}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-zinc-900 dark:text-zinc-50">{profile?.displayName} & {partner.displayName}</p>
          <p className="text-xs text-zinc-400">Vinculados · calendario compartido activo</p>
        </div>
        <Heart size={20} className="shrink-0 text-pink-400" fill="currentColor" />
      </Card>

      <button
        onClick={() => navigate('/calendario')}
        className="flex w-full items-center gap-3 rounded-2xl border border-zinc-200/80 bg-white p-4 text-left shadow-sm transition-colors hover:border-accent/40 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-pink-500 dark:bg-pink-950/40">
          <CalendarHeart size={19} />
        </span>
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Ver calendario compartido</p>
          <p className="text-xs text-zinc-400">Los eventos en pareja aparecen junto a los tuyos</p>
        </div>
      </button>

      <Card className="p-4">
        <button
          onClick={() => leaveCoupleSpace()}
          disabled={loading}
          className="flex w-full items-center gap-2 text-sm font-medium text-red-500"
        >
          <LogOut size={15} /> Salir del espacio compartido
        </button>
      </Card>

      <button onClick={() => signOut()} className="mx-auto block text-xs text-zinc-400 underline">
        Cerrar sesión
      </button>
    </div>
  );
}
