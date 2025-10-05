import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Leaderboard from '../components/Leaderboard';
import HistoryLog from '../components/HistoryLog';
import DashboardFilters from '../components/DashboardFilters';
import IndividualLeaderboard from '../components/IndividualLeaderboard';
import HallOfFame from '../components/HallOfFame';
import type { Student, Team, HistoryEntry } from '../types';

interface DashboardProps {
  teams: Team[];
  history: HistoryEntry[];
  onSelectStudent: (student: Student) => void;
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

const Dashboard: React.FC<DashboardProps> = ({ teams, history, onSelectStudent }) => {
  const [filters, setFilters] = useState<{ date: string | null }>({ date: null });

  const filteredHistory = useMemo(() => {
    if (!filters.date) return history;
    
    // Create a date object in the local timezone from the YYYY-MM-DD string
    const parts = filters.date.split('-').map(Number);
    const selectedDate = new Date(parts[0], parts[1] - 1, parts[2]);

    const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0)).getTime();
    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999)).getTime();

    return history.filter(entry => {
        return entry.timestamp >= startOfDay && entry.timestamp <= endOfDay;
    });
  }, [history, filters.date]);

  const displayTeams = useMemo(() => {
    if (!filters.date) {
        return teams; // Show total scores from all time
    }

    const dailyScores = new Map<string, number>(); // studentName -> score for the day
    filteredHistory.forEach(entry => {
        dailyScores.set(entry.studentName, (dailyScores.get(entry.studentName) || 0) + entry.points);
    });

    // Reconstruct teams with daily scores, but only show teams/students with activity
    return teams.map(team => ({
        ...team,
        students: team.students
            .map(student => ({
                ...student,
                // Display the daily score, not the total score
                score: dailyScores.get(student.name) || 0,
            }))
            // Optional: filter out students with no score activity on that day
            // .filter(student => dailyScores.has(student.name))
    }))
    // Optional: filter out teams with no score activity on that day
    // .filter(team => team.students.length > 0);

  }, [teams, filters.date, filteredHistory]);

  return (
    <motion.div
        key="dashboard"
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="space-y-8"
    >
      <section>
          <DashboardFilters 
            filters={filters}
            onFilterChange={setFilters}
          />
      </section>

      <section id="leaderboard">
        <h2 className="text-3xl font-bold text-slate-700 mb-4">
          Bảng Xếp Hạng Thi Đua {filters.date ? ` - Ngày ${filters.date.split('-').reverse().join('/')}` : ''}
        </h2>
        <Leaderboard teams={displayTeams} onSelectStudent={onSelectStudent} />
      </section>

      <section id="details" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
            <IndividualLeaderboard teams={teams} history={history} />
        </div>
        <div className="lg:col-span-2 space-y-8">
            <HallOfFame teams={teams} history={history} />
            <HistoryLog history={filteredHistory} />
        </div>
      </section>
    </motion.div>
  );
};

export default Dashboard;
