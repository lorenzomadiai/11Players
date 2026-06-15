import { Moon, Sun } from 'lucide-react';

interface AppHeaderProps {
  theme: 'dark' | 'light';
  onThemeToggle: () => void;
  onReset: () => void;
}

export default function AppHeader({ theme, onThemeToggle, onReset }: AppHeaderProps) {
  const isDark = theme === 'dark';

  return (
    <header className="app-header">
      <button className="brand-lockup" type="button" onClick={onReset} title="Back to home">
        <span className="brand-mark">XI</span>
        <div>
          <p className="eyebrow">Fantasy tournament sandbox</p>
          <h1>Dream World Cup XI</h1>
        </div>
      </button>

      <div className="header-actions">
        <button
          className="icon-button"
          type="button"
          onClick={onThemeToggle}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
