import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Team, HistoryEntry } from '../types';
import { TrophyIcon } from './Icons';
import Avatar from './Avatar';

interface IndividualLeaderboardProps {
  teams: Team[];
  history: HistoryEntry[];
}

type Period = 'total' | 'week' | 'month';

const getStartDate = (period: Period): Date => {
    const now = new Date();
    if (period === 'week') {
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        const monday = new Date(now.setDate(diff));
        monday.setHours(0, 0, 0, 0);
        return monday;
    }
    if (period === 'month') {
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        firstDay.setHours(0, 0, 0, 0);
        return firstDay;
    }
    return new Date(0); // For 'total', start from epoch
};

const IndividualLeaderboard: React.FC<IndividualLeaderboardProps> = ({ teams, history }) => {
    const [period, setPeriod] = useState<Period>('total');

    const rankedStudents = useMemo(() => {
        const allStudents = teams.flatMap(team => team.students.map(s => ({...s, teamColor: team.color})));
        
        if (period === 'total') {
            return [...allStudents].sort((a, b) => b.score - a.score);
        }

        const startDate = getStartDate(period);
        const periodHistory = history.filter(entry => entry.timestamp >= startDate.getTime());

        const scores: { [key: string]: number } = {};
        for (const entry of periodHistory) {
            scores[entry.studentName] = (scores[entry.studentName] || 0) + entry.points;
        }

        const studentsWithPeriodScores = allStudents.map(student => ({
            ...student,
            periodScore: scores[student.name] || 0,
        }));

        return studentsWithPeriodScores.sort((a, b) => b.periodScore - a.periodScore);

    }, [teams, history, period]);


  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-amber-500 h-full flex flex-col">
      <h3 className="text-2xl font-bold mb-4 text-amber-600">Xếp Hạng Cá Nhân</h3>
      <div className="flex justify-center bg-slate-100 rounded-lg p-1 mb-4">
        {(['Tổng', 'Tuần', 'Tháng'] as const).map(p => {
          const value = p === 'Tổng' ? 'total' : p === 'Tuần' ? 'week' : 'month';
          return (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-colors ${
                period === value ? 'bg-white shadow text-amber-600' : 'text-slate-500 hover:bg-slate-200'
              }`}
            >
              {p}
            </button>
          )
        })}
      </div>
      <ul className="space-y-3 overflow-y-auto flex-grow pr-2">
        <AnimatePresence>
            {rankedStudents.slice(0, 10).map((student, index) => (
                 <motion.li
                    key={student.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="flex items-center gap-3 p-2 bg-slate-50 rounded-md"
                >
                    <span className={`font-bold text-lg w-8 text-center ${
                        index === 0 ? 'text-amber-500' : index === 1 ? 'text-slate-500' : index === 2 ? 'text-amber-700' : 'text-slate-400'
                    }`}>
                        {index + 1}
                    </span>
                    <Avatar 
                        avatar={student.avatar}
                        className={`w-9 h-9 rounded-full ${student.teamColor} text-white font-bold text-base flex-shrink-0`}
                    />
                    <div className="flex-grow min-w-0">
                        <p className="font-semibold text-slate-700 truncate">{student.name}</p>
                    </div>
                    <div className="flex items-center gap-1 font-bold text-amber-600">
                        <TrophyIcon className="w-4 h-4" />
                        <span>{period === 'total' ? student.score : (student as any).periodScore}</span>
                    </div>
                 </motion.li>
            ))}
        </AnimatePresence>
      </ul>
    </div>
  );
};

export default IndividualLeaderboard;
