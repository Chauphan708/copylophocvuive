import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Student, Team, HistoryEntry } from '../types';
import { MinusIcon, ExclamationTriangleIcon } from '../components/Icons';
import Avatar from '../components/Avatar';

interface WatchlistProps {
  teams: Team[];
  history: HistoryEntry[];
}

const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
};

const pageTransition = {
    type: 'tween' as const,
    ease: 'anticipate' as const,
    duration: 0.5,
};

// Helper to get year and week number for a date
const getWeekIdentifier = (date: Date): string => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    // Calculate full weeks to nearest Thursday
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${weekNo}`;
};


type WatchlistTier = 'yellow' | 'orange' | 'red';
interface WatchlistStudent {
    student: Student;
    team: Team;
    incidents: HistoryEntry[];
    tier: WatchlistTier;
    isSpecial: boolean;
}

const Watchlist: React.FC<WatchlistProps> = ({ teams, history }) => {

    const studentsOnWatchlist = useMemo((): WatchlistStudent[] => {
        const studentMap = new Map<string, { student: Student, team: Team }>();
        teams.forEach(team => {
            team.students.forEach(student => {
                studentMap.set(student.name, { student, team });
            });
        });

        const now = new Date();
        const currentWeekId = getWeekIdentifier(now);
        const lastWeekId = getWeekIdentifier(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
        const weekBeforeLastId = getWeekIdentifier(new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000));

        const weeklyIncidents = new Map<string, Map<string, HistoryEntry[]>>(); // Map<studentName, Map<weekId, incidents[]>>

        history.forEach(entry => {
            if (entry.points < 0) {
                const weekId = getWeekIdentifier(new Date(entry.timestamp));
                if (!weeklyIncidents.has(entry.studentName)) {
                    weeklyIncidents.set(entry.studentName, new Map());
                }
                const studentWeeklyMap = weeklyIncidents.get(entry.studentName)!;
                if (!studentWeeklyMap.has(weekId)) {
                    studentWeeklyMap.set(weekId, []);
                }
                studentWeeklyMap.get(weekId)!.push(entry);
            }
        });

        const watchlist: WatchlistStudent[] = [];

        for (const [studentName, studentData] of studentMap.entries()) {
            const studentWeeklyMap = weeklyIncidents.get(studentName);
            const currentWeekIncidents = studentWeeklyMap?.get(currentWeekId) || [];

            if (currentWeekIncidents.length < 2) continue;

            let tier: WatchlistTier;
            if (currentWeekIncidents.length >= 4) tier = 'red';
            else if (currentWeekIncidents.length === 3) tier = 'orange';
            else tier = 'yellow';

            // Check for special conditions
            let isSpecial = false;
            const lastWeekIncidents = studentWeeklyMap?.get(lastWeekId) || [];
            const weekBeforeLastIncidents = studentWeeklyMap?.get(weekBeforeLastId) || [];
            
            // Condition 1: Incident in 3 consecutive weeks
            if (currentWeekIncidents.length > 0 && lastWeekIncidents.length > 0 && weekBeforeLastIncidents.length > 0) {
                isSpecial = true;
            }

            // Condition 2: Same behavior in 2 consecutive weeks
            if (!isSpecial && currentWeekIncidents.length > 0 && lastWeekIncidents.length > 0) {
                const currentReasons = new Set(currentWeekIncidents.map(i => i.reason));
                const lastWeekReasons = new Set(lastWeekIncidents.map(i => i.reason));
                for (const reason of currentReasons) {
                    if (lastWeekReasons.has(reason)) {
                        isSpecial = true;
                        break;
                    }
                }
            }

            watchlist.push({
                ...studentData,
                incidents: currentWeekIncidents,
                tier,
                isSpecial,
            });
        }

        return watchlist.sort((a, b) => b.incidents.length - a.incidents.length);

    }, [teams, history]);

    const tierConfig = {
        yellow: { borderColor: 'border-yellow-400', textColor: 'text-yellow-600', label: '2 lần' },
        orange: { borderColor: 'border-orange-500', textColor: 'text-orange-600', label: '3 lần' },
        red: { borderColor: 'border-red-600', textColor: 'text-red-700', label: '4+ lần' },
        special: { borderColor: 'border-violet-500', textColor: 'text-violet-600', label: 'Vi phạm lặp lại' }
    };

    return (
        <motion.div
            key="watchlist"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="space-y-6"
        >
            <h2 className="text-3xl font-bold text-slate-700 flex items-center gap-3">
                <ExclamationTriangleIcon className="w-8 h-8 text-amber-500" />
                Học sinh cần lưu ý (Tuần này)
            </h2>
            
            {studentsOnWatchlist.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl shadow-md">
                    <p className="text-xl text-slate-500">Tuần này không có học sinh nào cần lưu ý đặc biệt.</p>
                </div>
            ) : (
                 <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {studentsOnWatchlist.map(({ student, team, incidents, tier, isSpecial }) => {
                            const config = tierConfig[tier];
                            const displayConfig = isSpecial ? tierConfig.special : config;

                            return (
                                <motion.div
                                    key={student.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className={`bg-white rounded-xl shadow-lg border-t-8 ${displayConfig.borderColor}`}
                                >
                                    <div className="p-4 flex items-center gap-4 border-b border-slate-200">
                                        <Avatar
                                            avatar={student.avatar}
                                            className={`w-12 h-12 rounded-full ${team.color} text-white font-bold text-2xl flex-shrink-0`}
                                        />
                                        <div>
                                            <h3 className="font-bold text-xl text-slate-800">{student.name}</h3>
                                            <p className="text-slate-500 font-semibold">{team.name}</p>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h4 className={`font-bold ${displayConfig.textColor} mb-2`}>
                                            {isSpecial ? displayConfig.label : `${incidents.length} lần cần cố gắng`}
                                        </h4>
                                        <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                            {incidents.map(incident => (
                                                <li key={incident.id} className="flex justify-between items-center text-sm bg-slate-50 p-2 rounded-md">
                                                    <span className="text-slate-600">{incident.reason}</span>
                                                    <span className="font-bold text-red-500 flex items-center gap-1">
                                                        <MinusIcon className="w-3 h-3" /> {Math.abs(incident.points)}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    );
};

export default Watchlist;
