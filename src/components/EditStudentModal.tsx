import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Student, Team, CustomAvatar } from '../types';
import { AVATAR_OPTIONS } from '../constants';
import Avatar from './Avatar';

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  teams: Team[];
  onUpdateStudent: (studentId: number, name: string, teamId: number, avatar: string) => void;
  customAvatars: CustomAvatar[];
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

const EditStudentModal: React.FC<EditStudentModalProps> = ({ isOpen, onClose, student, teams, onUpdateStudent, customAvatars }) => {
  const [name, setName] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<number>(0);
  const [selectedAvatar, setSelectedAvatar] = useState('');

  useEffect(() => {
    if (student) {
      setName(student.name);
      setSelectedAvatar(student.avatar);
      const studentTeam = teams.find(team => team.students.some(s => s.id === student.id));
      if (studentTeam) {
        setSelectedTeamId(studentTeam.id);
      }
    }
  }, [student, teams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (student && name.trim() && selectedTeamId) {
      onUpdateStudent(student.id, name.trim(), selectedTeamId, selectedAvatar);
      onClose();
    }
  };
  
  if (!student) return null;

  const letterAvatar = name.trim() ? name.trim().charAt(0).toUpperCase() : '?';

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
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8" 
            onClick={(e) => e.stopPropagation()}
            variants={modalVariants}
          >
            <h2 className="text-2xl font-bold text-slate-800 text-center mb-6">Chỉnh sửa thông tin học sinh</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="studentName" className="block text-sm font-medium text-slate-700 mb-1">Tên học sinh</label>
                <input
                  id="studentName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-400 focus:border-transparent transition bg-white text-black"
                  required
                />
              </div>
              <div>
                <label htmlFor="teamSelect" className="block text-sm font-medium text-slate-700 mb-1">Tổ</label>
                <select
                  id="teamSelect"
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
               <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Chọn Avatar</label>
                <div className="grid grid-cols-7 sm:grid-cols-8 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-lg">
                    <button
                        type="button"
                        onClick={() => setSelectedAvatar(letterAvatar)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold transition ${selectedAvatar === letterAvatar ? 'ring-2 ring-offset-2 ring-sky-500' : ''}`}
                    >
                         <Avatar avatar={letterAvatar} className="w-full h-full rounded-lg bg-slate-200 text-slate-700" />
                    </button>
                    {AVATAR_OPTIONS.map(avatar => (
                        <button
                            type="button"
                            key={avatar}
                            onClick={() => setSelectedAvatar(avatar)}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center text-2xl transition ${selectedAvatar === avatar ? 'ring-2 ring-offset-2 ring-sky-500' : ''}`}
                        >
                            <Avatar avatar={avatar} className="w-full h-full rounded-lg bg-slate-100" />
                        </button>
                    ))}
                    {customAvatars.map(avatar => (
                        <button
                            type="button"
                            key={avatar.id}
                            onClick={() => setSelectedAvatar(avatar.data)}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center text-2xl transition ${selectedAvatar === avatar.data ? 'ring-2 ring-offset-2 ring-sky-500' : ''}`}
                        >
                            <Avatar avatar={avatar.data} className="w-full h-full rounded-lg bg-slate-100" />
                        </button>
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

export default EditStudentModal;
