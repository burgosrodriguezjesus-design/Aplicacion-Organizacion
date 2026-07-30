# Centro — tu organización personal en un solo lugar

Aplicación de organización personal: centro de control diario, calendario, tareas, hábitos, objetivos, notas, recordatorios, rutinas, modo foco y un asistente que te ayuda a planificar el día.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Zustand (estado + persistencia en `localStorage`)
- react-router-dom
- @dnd-kit (arrastrar y soltar)
- recharts (estadísticas)
- vite-plugin-pwa (funciona offline, instalable como app)

Es una aplicación **local-first**: todos los datos personales (tareas, hábitos, objetivos, notas...) se guardan en el dispositivo (localStorage), por lo que funciona sin conexión desde el primer momento y sin necesidad de cuenta.

La única parte que sí usa un backend es el **calendario compartido en pareja** (sección "Pareja"), construido sobre [Supabase](https://supabase.com) (Postgres + Auth + Realtime). Es totalmente opcional: si no se configura, el resto de la app funciona exactamente igual y esa sección simplemente muestra un aviso de "no activado".

### Activar el calendario compartido (opcional)

1. Crea un proyecto gratuito en [supabase.com](https://supabase.com).
2. En tu proyecto, abre **SQL Editor** → pega el contenido de `supabase/schema.sql` → **Run**. Crea las tablas, la seguridad a nivel de fila (RLS) y el canal en tiempo real.
3. En **Settings → API**, copia la **Project URL** y la clave **anon public**.
4. Local: copia `.env.example` a `.env.local` y pega ahí esos dos valores.
5. Desplegado (Vercel): en el proyecto → **Settings → Environment Variables**, añade `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con esos mismos valores, y vuelve a desplegar.

Con eso, cualquiera que abra la app podrá crear una cuenta, generar un código de invitación y vincularse con su pareja para compartir eventos del calendario. El resto de datos (tareas, hábitos, notas...) sigue siendo local y privado de cada persona.

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build de producción en dist/
```

## Estructura

```
src/
  types.ts            Modelo de datos (Task, Event, Habit, Goal, Note, Reminder, Routine, Category...)
  store/               Estado global (Zustand) + datos de ejemplo
  lib/                 Lógica pura: recurrencia, parser de lenguaje natural, planificador, estadísticas
  components/          UI reutilizable, editores (sheets), navegación, búsqueda global, asistente
  pages/               Hoy · Calendario · Tareas · Objetivos · Más (hábitos, notas, bandeja, rutinas...)
```

## Funcionalidades principales

- **Hoy**: línea temporal del día (arrastrable), progreso del día, próxima tarea/evento, hábitos, objetivo destacado y recordatorios.
- **Calendario**: vistas día/semana/mes, eventos recurrentes, y "Organizar mi día automáticamente".
- **Tareas**: creación rápida en lenguaje natural ("Estudiar electricidad mañana de 10 a 12"), prioridades, subtareas, categorías, repetición.
- **Objetivos**: diarios/semanales/mensuales/anuales divididos en pasos con progreso visual.
- **Hábitos**: rachas, mejor racha, % de cumplimiento y calendario tipo heatmap.
- **Más**: notas, bandeja de entrada (captura rápida convertible en tarea/evento/nota/recordatorio), recordatorios, rutinas de mañana/noche, estadísticas y ajustes.
- **Modo foco**: temporizador Pomodoro configurable por tarea.
- **Asistente**: comandos simples en español ("¿qué tengo que hacer hoy?", "organízame el día", "muéveme X al jueves") que nunca modifican datos sin confirmación explícita.
- **Búsqueda global**: `Cmd/Ctrl + K`.
- **Pareja**: cuenta con email/contraseña + calendario de eventos compartido en tiempo real con tu pareja (requiere configurar Supabase, ver arriba).
