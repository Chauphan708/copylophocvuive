
import React from 'react';
import type { Behavior } from '../types';
import { PlusIcon, MinusIcon } from './Icons';

interface RulesCardProps {
  title: string;
  behaviors: Behavior[];
  isPositive: boolean;
}

const RulesCard: React.FC<RulesCardProps> = ({ title, behaviors, isPositive }) => {
  const cardColor = isPositive ? 'border-emerald-500' : 'border-red-500';
  const textColor = isPositive ? 'text-emerald-600' : 'text-red-600';
  const iconBgColor = isPositive ? 'bg-emerald-100' : 'bg-red-100';

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${cardColor} border-t-4`}>
      <h3 className={`text-2xl font-bold mb-4 ${textColor}`}>{title}</h3>
      <ul className="space-y-3">
        {behaviors.map((behavior) => (
          <li key={behavior.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-md">
            <span className="text-slate-700">{behavior.description}</span>
            <div className={`flex items-center justify-center gap-1 font-bold ${textColor} ${iconBgColor} px-3 py-1 rounded-full text-sm`}>
                {isPositive ? <PlusIcon className="w-4 h-4" /> : <MinusIcon className="w-4 h-4" />}
                {Math.abs(behavior.points)} điểm
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RulesCard;