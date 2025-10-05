import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Team } from '../types';
import { TEAM_COLORS } from '../constants';

interface EditTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
  onUpdateTeam: (teamId: number, newName: string, newColor: string) => void;
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

const EditTeamModal: React.FC<EditTeamModalProps> = ({ isOpen, onClose, team, onUpdateTeam }) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    if (team) {
      setName(team.name);
      setSelectedColor(team.color);
    }
  }, [team]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (team && name.trim()) {
      onUpdateTeam(team.id, name.trim(), selectedColor);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && team && (
        <motion.div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" 
          onClick={onClose}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={backdropVariants}
        >
          <motion.div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8" 
            onClick={(e) => e.stopPropagation()}
            variants={modalVariants}
          >
            <h2 className="text-2xl font-bold text-slate-800 text-center mb-6">Chỉnh sửa thông tin tổ</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="teamName" className="block text-sm font-medium text-slate-700 mb-1">Tên tổ</label>
                <input
                  id="teamName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-400 focus:border-transparent transition bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Chọn màu</label>
                <div className="grid grid-cols-5 gap-3">
                    {TEAM_COLORS.map(color => (
                        <div key={color.value} className="flex flex-col items-center">
                            <button
                                type="button"
                                onClick={() => setSelectedColor(color.value)}
                                className={`w-10 h-10 rounded-full ${color.value} transition-transform hover:scale-110 ${selectedColor === color.value ? 'ring-4 ring-offset-2 ring-sky-500' : ''}`}
                                aria-label={`Chọn màu ${color.name}`}
                            />
                        </div>
                    ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onClose} className="bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 transition">
                  Huỷ
                </button>
                <button type="submit" className="bg-sky-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 transition">
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditTeamModal;
