import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Team } from '../types';

interface BulkAddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: Team[];
  onBulkAdd: (names: string[], teamId: number) => void;
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

const BulkAddStudentModal: React.FC<BulkAddStudentModalProps> = ({ isOpen, onClose, teams, onBulkAdd }) => {
  const [names, setNames] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<number>(teams.length > 0 ? teams[0].id : 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nameList = names.split('\n').map(name => name.trim()).filter(Boolean);
    if (nameList.length > 0 && selectedTeamId) {
      onBulkAdd(nameList, selectedTeamId);
      setNames('');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" 
          onClick={onClose}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={backdropVariants}
        >
          <motion.div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 sm:p-8" 
            onClick={(e) => e.stopPropagation()}
            variants={modalVariants}
          >
            <h2 className="text-2xl font-bold text-slate-800 text-center mb-6">Thêm Học Sinh Hàng Loạt</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="studentNames" className="block text-sm font-medium text-slate-700 mb-1">
                  Danh sách học sinh (mỗi học sinh một dòng)
                </label>
                <textarea
                  id="studentNames"
                  value={names}
                  onChange={(e) => setNames(e.target.value)}
                  rows={8}
                  placeholder="Nguyễn Văn A&#10;Trần Thị B&#10;Lê Minh C"
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-400 focus:border-transparent transition bg-white text-black"
                  required
                />
              </div>
              <div>
                <label htmlFor="teamBulk" className="block text-sm font-medium text-slate-700 mb-1">Thêm vào tổ</label>
                <select
                  id="teamBulk"
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-400 focus:border-transparent transition bg-white text-black"
                >
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onClose} className="bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 transition">
                  Huỷ
                </button>
                <button type="submit" className="bg-sky-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 transition">
                  Thêm Học Sinh
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BulkAddStudentModal;
