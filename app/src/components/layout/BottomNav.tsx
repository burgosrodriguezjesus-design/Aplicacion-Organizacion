import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from './nav';

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white/90 backdrop-blur-lg safe-bottom dark:border-zinc-800 dark:bg-zinc-950/90 md:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-between px-1">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.to} item={item} />
        ))}
      </div>
    </nav>
  );
}

function NavItem({ item }: { item: (typeof NAV_ITEMS)[number] }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={'end' in item ? item.end : false}
      className={({ isActive }) =>
        `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors ${
          isActive ? 'text-accent' : 'text-zinc-400 dark:text-zinc-500'
        }`
      }
    >
      <Icon size={22} strokeWidth={2} />
      {item.label}
    </NavLink>
  );
}
