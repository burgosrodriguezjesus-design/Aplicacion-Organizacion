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

Es una aplicación **local-first**: todos los datos se guardan en el dispositivo (localStorage), por lo que funciona sin conexión desde el primer momento. Todavía no incluye backend, cuentas de usuario ni sincronización entre dispositivos — es el siguiente paso natural si se quiere multi-dispositivo.

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
