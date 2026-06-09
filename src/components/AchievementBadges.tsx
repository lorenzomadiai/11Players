import { Award, Lock } from 'lucide-react';
import type { Achievement } from '../types/game';

interface AchievementBadgesProps {
  achievements: Achievement[];
}

export default function AchievementBadges({ achievements }: AchievementBadgesProps) {
  return (
    <div className="badges" aria-label="Achievement badges">
      {achievements.map((achievement) => (
        <div
          key={achievement.id}
          className={`badge ${achievement.earned ? 'badge--earned' : ''}`}
          title={achievement.description}
        >
          {achievement.earned ? <Award size={16} /> : <Lock size={16} />}
          <span>{achievement.label}</span>
        </div>
      ))}
    </div>
  );
}
