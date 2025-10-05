import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Student } from '../types';
import { POINT_OPTIONS, getLevelForScore, LEVELS } from '../constants';
import { StarIcon, PlusIcon, MinusIcon } from './Icons';

interface PointModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onUpdateScore: (studentId: number, points: number, reason: string) => void;
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { type: 'spring' as const, damping: 15, stiffness: 200 } 
  },
  exit: { 
    opacity: 0, 
    y: 50, 
    scale: 0.9, 
    transition: { duration: 0.2 } 
  },
};

const PointModal: React.FC<PointModalProps> = ({ isOpen, onClose, student, onUpdateScore }) => {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (isOpen) {
      setReason('');
    }
  }, [isOpen]);

  if (!isOpen || !student) return null;

  const handleUpdate = (points: number) => {
    onUpdateScore(student.id, points, reason || (points > 0 ? 'Khen thưởng' : 'Cần cố gắng'));
    onClose();
  };

  const currentLevel = getLevelForScore(student.score);
  const nextLevel = currentLevel 
    ? LEVELS[LEVELS.indexOf(currentLevel) - 1] 
    : LEVELS[LEVELS.length - 1];
  
  const levelProgress = {
      current: 0,
      needed: 0,
      percentage: 0,
  };

  if (nextLevel) {
      const baseScore = currentLevel ? currentLevel.score : 0;
      levelProgress.current = student.score - baseScore;
      levelProgress.needed = nextLevel.score - baseScore;
      levelProgress.percentage = (levelProgress.current / levelProgress.needed) * 100;
  }

  return (
    <motion.div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" 
      onClick={onClose}
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={backdropVariants}
    >
      <motion.div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8 transform" 
        onClick={(e) => e.stopPropagation()}
        variants={modalVariants}
      >
        <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800">Ghi nhận cho học sinh</h2>
            <p className="text-3xl font-bold text-sky-600 mt-2">{student.name}</p>
            <div className="flex items-center justify-center gap-2 mt-2 text-xl text-amber-500 font-semibold">
                <StarIcon className="w-6 h-6" />
                <span>{student.score} điểm hiện tại</span>
            </div>
            {currentLevel && (
                <div className={`mt-2 inline-flex items-center gap-2 font-bold px-3 py-1 rounded-full ${currentLevel.color} bg-slate-100`}>
                    <currentLevel.icon className="w-5 h-5" />
                    <span>{currentLevel.name}</span>
                </div>
            )}
        </div>
        
        {nextLevel && (
            <div className="mt-6">
                <div className="flex justify-between items-center text-sm font-semibold text-slate-600 mb-1">
                    <span>Tiến độ lên cấp {nextLevel.name}</span>
                    <span>{levelProgress.current}/{levelProgress.needed}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <motion.div 
                        className="bg-gradient-to-r from-amber-300 to-amber-500 h-2.5 rounded-full" 
                        initial={{ width: 0 }}
                        animate={{ width: `${levelProgress.percentage}%` }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                    />
                </div>
            </div>
        )}

        <div className="mt-6">
          <label htmlFor="reason" className="block text-sm font-medium text-slate-700 mb-1">Lý do (không bắt buộc)</label>
          <input
            id="reason"
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="VD: Hăng hái phát biểu"
            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-400 focus:border-transparent transition bg-white text-black"
          />
        </div>

        <div className="mt-6 space-y-4">
            <div>
                <p className="font-semibold text-center text-emerald-600 mb-2">Cộng điểm thưởng</p>
                <div className="grid grid-cols-3 gap-3">
                    {POINT_OPTIONS.map(points => (
                    <button key={`add-${points}`} onClick={() => handleUpdate(points)} className="flex items-center justify-center gap-2 w-full bg-emerald-500 text-white font-bold py-3 rounded-lg hover:bg-emerald-600 transition-transform hover:scale-105">
                        <PlusIcon className="w-5 h-5" /> +{points}
                    </button>
                    ))}
                </div>
            </div>
             <div>
                <p className="font-semibold text-center text-red-600 mb-2">Trừ điểm nhắc nhở</p>
                <div className="grid grid-cols-3 gap-3">
                    {POINT_OPTIONS.map(points => (
                    <button key={`sub-${points}`} onClick={() => handleUpdate(-points)} className="flex items-center justify-center gap-2 w-full bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600 transition-transform hover:scale-105">
                        <MinusIcon className="w-5 h-5" /> -{points}
                    </button>
                    ))}
                </div>
            </div>
        </div>

        <div className="mt-8 text-center">
          <button onClick={onClose} className="bg-slate-200 text-slate-700 font-semibold py-2 px-6 rounded-lg hover:bg-slate-300 transition">
            Đóng
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PointModal;
