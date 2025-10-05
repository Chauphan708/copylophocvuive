import React from 'react';
import { SparklesIcon, ShieldCheckIcon, BoltIcon, SunIcon, CrownIcon } from './components/Icons';

export const POINT_OPTIONS = [5, 10, 15];

export const LEVELS: { name: string; score: number; icon: React.FC<{className?: string}>; color: string; }[] = [
  { name: 'Siêu Tinh Anh', score: 500, icon: CrownIcon, color: 'text-violet-500' },
  { name: 'Tinh Anh', score: 300, icon: SunIcon, color: 'text-orange-500' },
  { name: 'Tiến Bộ', score: 150, icon: BoltIcon, color: 'text-sky-500' },
  { name: 'Nỗ Lực', score: 50, icon: ShieldCheckIcon, color: 'text-emerald-500' },
  { name: 'Khởi Đầu', score: 0, icon: SparklesIcon, color: 'text-slate-500' },
].sort((a, b) => b.score - a.score); // Important to have it sorted descending

export const getLevelForScore = (score: number) => {
  return LEVELS.find(level => score >= level.score) || LEVELS[LEVELS.length - 1];
};

export const TEAM_COLORS = [
    { name: 'Red', value: 'bg-red-500' },
    { name: 'Blue', value: 'bg-sky-500' },
    { name: 'Green', value: 'bg-emerald-500' },
    { name: 'Yellow', value: 'bg-amber-500' },
    { name: 'Purple', value: 'bg-violet-500' },
    { name: 'Pink', value: 'bg-pink-500' },
    { name: 'Indigo', value: 'bg-indigo-500' },
    { name: 'Teal', value: 'bg-teal-500' },
];

export const AVATAR_OPTIONS = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮',
  '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦄', '🐝', '🐛', '🦋', '🐌',
  '🐞', '🐢', '🐍', '🐙', '🐠', '🐳', '⭐', '☀️', '🚀', '🤖', '👽', '👑'
];