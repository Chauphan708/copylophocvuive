import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SchoolYear } from '../types';

interface SchoolYearModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number | null, data: Omit<SchoolYear, 'id'>) => void;
  schoolYear: SchoolYear | null;
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

const toDateInputValue = (date: Date | string) => {
    if (typeof date === 'string') return date;
    const local = new Date(date);
    local.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return local.toJSON().slice(0,10);
};

const SchoolYearModal: React.FC<SchoolYearModalProps> = ({ isOpen, onClose, onSave, schoolYear }) => {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(toDateInputValue(new Date()));
  const [endDate, setEndDate] = useState(toDateInputValue(new Date(new Date().setFullYear(new Date().getFullYear() + 1))));

  useEffect(() => {
    if (isOpen) {
        if (schoolYear) {
            setName(schoolYear.name);
            setStartDate(schoolYear.startDate);
            setEndDate(schoolYear.endDate);
        } else {
            setName('');
            setStartDate(toDateInputValue(new Date()));
            setEndDate(toDateInputValue(new Date(new Date().setFullYear(new Date().getFullYear() + 1))));
        }
    }
  }, [schoolYear, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && startDate && endDate) {
        onSave(schoolYear ? schoolYear.id : null, { name: name.trim(), startDate, endDate });
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
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8" 
            onClick={(e) => e.stopPropagation()}
            variants={modalVariants}
          >
            <h2 className="text-2xl font-bold text-slate-800 text-center mb-6">
              {schoolYear ? 'Chỉnh sửa Năm học' : 'Thêm Năm học Mới'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="schoolYearName" className="block text-sm font-medium text-slate-700 mb-1">Tên năm học</label>
                <input
                  id="schoolYearName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-400 focus:border-transparent transition bg-white text-black"
                  placeholder="Ví dụ: Năm học 2024-2025"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 mb-1">Ngày bắt đầu</label>
                    <input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-400 focus:border-transparent transition bg-white text-black"
                    required
                    />
                </div>
                <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 mb-1">Ngày kết thúc</label>
                    <input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-400 focus:border-transparent transition bg-white text-black"
                    required
                    />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onClose} className="bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 transition">
                  Huỷ
                </button>
                <button type="submit" className="bg-sky-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-600 transition">
                  Lưu
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SchoolYearModal;
