import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Team, Student } from '../types';
import StudentCard from './StudentCard';
import { StarIcon } from './Icons';
import AnimatedScore from './AnimatedScore';

interface LeaderboardProps {
  teams: Team[];
  onSelectStudent: (student: Student) => void;
}

const calculateTeamScore = (students: Student[]): number => {
  return students.reduce((total, student) => total + student.score, 0);
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const } },
};


const Leaderboard: React.FC<LeaderboardProps> = ({ teams, onSelectStudent }) => {
  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) => calculateTeamScore(b.students) - calculateTeamScore(a.students));
  }, [teams]);

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {sortedTeams.map((team) => {
        const teamScore = calculateTeamScore(team.students);
        return (
          <motion.div key={team.id} variants={itemVariants} className="bg-white rounded-xl shadow-lg p-5 flex flex-col">
            <div className={`p-4 rounded-t-lg text-white ${team.color}`}>
              <h3 className="text-xl font-bold truncate">{team.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <StarIcon className="w-6 h-6" />
                <span className="text-2xl font-bold">
                  <AnimatedScore score={teamScore} /> điểm
                </span>
              </div>
            </div>
            <div className="flex-grow bg-slate-50 p-4 rounded-b-lg space-y-3">
              <AnimatePresence>
                {team.students.map((student) => (
                  <StudentCard
                    key={student.id}
                    student={student}
                    teamColor={team.color}
                    onSelectStudent={onSelectStudent}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default Leaderboard;
