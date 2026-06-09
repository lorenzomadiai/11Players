interface StatBarProps {
  label: string;
  value: number;
  tone?: 'green' | 'gold' | 'red' | 'blue';
}

export default function StatBar({ label, value, tone = 'green' }: StatBarProps) {
  return (
    <div className="stat-bar">
      <div className="stat-bar__header">
        <span>{label}</span>
        <strong>{Math.round(value)}</strong>
      </div>
      <div className="stat-bar__track" aria-hidden="true">
        <span className={`stat-bar__fill stat-bar__fill--${tone}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
    </div>
  );
}
