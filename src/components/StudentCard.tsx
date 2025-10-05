import React from 'react';
import { motion } from 'framer-motion';
import type { Student } from '../types';
import { getLevelForScore } from '../constants';
import { StarIcon } from './Icons';
import AnimatedScore from './AnimatedScore';
import Avatar from './Avatar';

interface StudentCardProps {
  student: Student;
  teamColor: string;
  onSelectStudent: (student: Student) => void;
}

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9 },
};

const StudentCard: React.FC<StudentCardProps> = ({ student, teamColor, onSelectStudent }) => {
  const level = getLevelForScore(student.score);

  return (
    <motion.div
      layout
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={() => onSelectStudent(student)}
      className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-md hover:scale-105 transition-all duration-200"
    >
      <Avatar
        avatar={student.avatar}
        className={`w-10 h-10 rounded-full ${teamColor} text-white font-bold text-lg flex-shrink-0`}
      />
      <div className="flex-grow min-w-0">
        <p className="font-semibold text-slate-800 truncate">{student.name}</p>
        <div className="flex items-center gap-1 text-sm text-slate-500">
          <level.icon className={`w-4 h-4 ${level.color}`} />
          <span>{level.name}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 font-bold text-amber-500 text-lg">
        <StarIcon className="w-5 h-5" />
        <AnimatedScore score={student.score} />
      </div>
    </motion.div>
  );
};

export default StudentCard;
