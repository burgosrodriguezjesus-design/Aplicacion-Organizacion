export function ProgressBar({ value, className = '', trackClassName = '', barClassName = '' }: { value: number; className?: string; trackClassName?: string; barClassName?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800 ${trackClassName} ${className}`}>
      <div
        className={`h-full rounded-full bg-accent transition-[width] duration-500 ease-out ${barClassName}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
