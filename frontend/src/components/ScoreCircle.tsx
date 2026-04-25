'use client';

import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface ScoreCircleProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export default function ScoreCircle({ score, size = 'md', label }: ScoreCircleProps) {
  const sizeMap = { sm: 80, md: 120, lg: 180 };
  const dimension = sizeMap[size];

  const color =
    score >= 70 ? '#22c55e' : score >= 40 ? '#eab308' : '#ef4444';

  return (
    <div className="flex flex-col items-center gap-2">
      <div style={{ width: dimension, height: dimension }}>
        <CircularProgressbar
          value={score}
          text={`${score}`}
          styles={buildStyles({
            textSize: '24px',
            textColor: color,
            pathColor: color,
            trailColor: 'rgba(255, 255, 255, 0.1)',
            pathTransitionDuration: 1,
          })}
        />
      </div>
      {label && (
        <span className="text-sm text-slate-400 font-medium">{label}</span>
      )}
    </div>
  );
}
