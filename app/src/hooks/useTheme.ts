import { useEffect } from 'react';
import { useStore } from '../store/store';

export function useTheme() {
  const theme = useStore((s) => s.profile.theme);
  const accentColor = useStore((s) => s.profile.accentColor);

  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      root.classList.toggle('dark', isDark);
    };
    apply();
    if (theme === 'system') {
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      mql.addEventListener('change', apply);
      return () => mql.removeEventListener('change', apply);
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accentColor);
  }, [accentColor]);
}
