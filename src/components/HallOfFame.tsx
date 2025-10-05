import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Team, HistoryEntry } from '../types';
import { MedalIcon } from './Icons';
import Avatar from './Avatar';

interface HallOfFameProps {
  teams: Team[];
  history: HistoryEntry[];
}

type Period = 'week' | 'month';

const getStartDate = (period: Period): Date => {
    const now = new Date();
    if (period === 'week') {
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        const monday = new Date(now.setDate(diff));
        monday.setHours(0, 0, 0, 0);
        return monday;
    }
    // month
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    firstDay.setHours(0, 0, 0, 0);
    return firstDay;
};

const HallOfFame: React.FC<HallOfFameProps> = ({ teams, history }) => {
    const [period, setPeriod] = useState<Period>('week');

    const rankedStudents = useMemo(() => {
        const allStudents = teams.flatMap(team => team.students.map(s => ({...s, teamName: team.name, teamColor: team.color})));
        
        const startDate = getStartDate(period);
        const periodHistory = history.filter(entry => entry.timestamp >= startDate.getTime() && entry.points > 0);

        const scores: { [key: string]: number } = {};
        for (const entry of periodHistory) {
            scores[entry.studentName] = (scores[entry.studentName] || 0) + entry.points;
        }

        const studentsWithPeriodScores = allStudents.map(student => ({
            ...student,
            periodScore: scores[student.name] || 0,
        })).filter(s => s.periodScore > 0);

        return studentsWithPeriodScores.sort((a, b) => b.periodScore - a.periodScore);

    }, [teams, history, period]);

    const top5 = rankedStudents.slice(0, 5);
    const top3 = top5.slice(0, 3);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-amber-400">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
        <h3 className="text-2xl font-bold text-amber-600">Bảng Vinh Danh</h3>
        <div className="flex self-start sm:self-center bg-slate-100 rounded-lg p-1 mt-2 sm:mt-0">
            {(['Tuần', 'Tháng'] as const).map(p => {
            const value = p === 'Tuần' ? 'week' : 'month';
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
      </div>
      
      {top5.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-slate-400">
            <p>Chưa có học sinh nào đạt thành tích trong {period === 'week' ? 'tuần' : 'tháng'} này.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            {/* Podium for Top 3 */}
            <div className="flex justify-center items-end gap-2 sm:gap-4 pt-4 min-h-[200px]">
                {/* 2nd Place */}
                {top3[1] && (
                    <PodiumPlace student={top3[1]} rank={2} />
                )}
                {/* 1st Place */}
                {top3[0] && (
                     <PodiumPlace student={top3[0]} rank={1} />
                )}
                {/* 3rd Place */}
                {top3[2] && (
                     <PodiumPlace student={top3[2]} rank={3} />
                )}
            </div>

            {/* List for 4th and 5th */}
            <div className="space-y-3">
                {top5.slice(3).map((student, index) => (
                    <motion.div
                        key={student.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                    >
                         <span className="font-bold text-lg w-6 text-center text-slate-400">
                            {index + 4}
                        </span>
                        <Avatar
                            avatar={student.avatar}
                            className={`w-10 h-10 rounded-full ${student.teamColor} text-white font-bold text-base flex-shrink-0`}
                        />
                        <div className="flex-grow min-w-0">
                            <p className="font-semibold text-slate-700 truncate">{student.name}</p>
                            <p className="text-sm text-slate-500 truncate">{student.teamName}</p>
                        </div>
                        <div className="font-bold text-amber-600 text-lg">
                            +{student.periodScore}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

const PodiumPlace: React.FC<{student: any, rank: 1 | 2 | 3}> = ({ student, rank }) => {
    const rankConfig = {
        1: { height: 'h-40', color: 'bg-amber-400', textColor: 'text-amber-500', medalColor: 'text-amber-400' },
        2: { height: 'h-32', color: 'bg-slate-400', textColor: 'text-slate-500', medalColor: 'text-slate-400' },
        3: { height: 'h-24', color: 'bg-amber-600', textColor: 'text-amber-700', medalColor: 'text-amber-600' }
    };
    const config = rankConfig[rank];

    return (
        <motion.div 
            className="flex flex-col items-center gap-2 w-1/3"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 150, delay: 0.5 - rank * 0.1 }}
        >
            <div className="relative">
                <Avatar 
                    avatar={student.avatar}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full ${student.teamColor} text-white font-bold text-2xl sm:text-3xl flex-shrink-0 border-4 border-white shadow-md`}
                />
                 <MedalIcon className={`absolute -top-2 -right-2 w-8 h-8 ${config.medalColor}`} />
            </div>
            <p className="font-bold text-slate-800 text-center text-sm sm:text-base truncate w-full">{student.name}</p>
            <div className={`w-full ${config.height} ${config.color} rounded-t-lg flex flex-col items-center justify-center p-2 text-white shadow-inner`}>
                <span className="text-3xl sm:text-4xl font-black drop-shadow-md">{rank}</span>
                <span className="font-bold text-sm sm:text-lg">+{student.periodScore}</span>
            </div>
        </motion.div>
    )
}

export default HallOfFame;
