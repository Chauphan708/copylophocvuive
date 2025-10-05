import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SchoolYear } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon, CalendarDaysIcon } from '../components/Icons';
import SchoolYearModal from '../components/SchoolYearModal';

interface SchoolYearManagementProps {
  schoolYears: SchoolYear[];
  activeSchoolYearId: number | null;
  onAdd: (data: Omit<SchoolYear, 'id'>) => void;
  onUpdate: (id: number, data: Omit<SchoolYear, 'id'>) => void;
  onDelete: (id: number) => void;
  onSetActive: (id: number) => void;
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

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

const SchoolYearManagement: React.FC<SchoolYearManagementProps> = ({
    schoolYears,
    activeSchoolYearId,
    onAdd,
    onUpdate,
    onDelete,
    onSetActive
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSchoolYear, setEditingSchoolYear] = useState<SchoolYear | null>(null);

    const handleOpenAddModal = () => {
        setEditingSchoolYear(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (schoolYear: SchoolYear) => {
        setEditingSchoolYear(schoolYear);
        setIsModalOpen(true);
    };

    const handleSave = (id: number | null, data: Omit<SchoolYear, 'id'>) => {
        if (id) {
            onUpdate(id, data);
        } else {
            onAdd(data);
        }
    };

    return (
        <motion.div
            key="schoolYears"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="space-y-6"
        >
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h2 className="text-3xl font-bold text-slate-700">Quản lý Năm học</h2>
                <button
                    onClick={handleOpenAddModal}
                    className="flex items-center justify-center gap-2 bg-sky-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-sky-600 transition-colors duration-200 shadow-md"
                >
                    <PlusIcon className="w-5 h-5" />
                    Thêm Năm Học Mới
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {schoolYears.map(year => {
                        const isActive = year.id === activeSchoolYearId;
                        return (
                            <motion.div
                                key={year.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className={`bg-white rounded-xl shadow-lg border-l-8 transition-all duration-300 ${isActive ? 'border-emerald-500 scale-105 shadow-xl' : 'border-slate-300'}`}
                            >
                                <div className="p-4">
                                    <h3 className="text-xl font-bold text-slate-800">{year.name}</h3>
                                    <div className="flex items-center gap-2 text-slate-500 mt-2 text-sm">
                                        <CalendarDaysIcon className="w-4 h-4" />
                                        <span>{formatDate(year.startDate)} - {formatDate(year.endDate)}</span>
                                    </div>
                                    {isActive && (
                                        <div className="mt-3 inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 font-bold text-xs px-2 py-1 rounded-full">
                                            <CheckIcon className="w-4 h-4" />
                                            <span>Năm học hiện tại</span>
                                        </div>
                                    )}
                                </div>
                                <div className="bg-slate-50 p-2 flex justify-end gap-2 rounded-b-xl">
                                    <button
                                        onClick={() => onSetActive(year.id)}
                                        disabled={isActive}
                                        className="text-sm font-semibold text-emerald-600 bg-white border border-emerald-300 rounded-md px-3 py-1 hover:bg-emerald-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Đặt làm hiện tại
                                    </button>
                                    <button onClick={() => handleOpenEditModal(year)} className="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-100 rounded-full transition" aria-label="Sửa">
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => onDelete(year.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full transition" aria-label="Xoá">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            <SchoolYearModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                schoolYear={editingSchoolYear}
            />
        </motion.div>
    );
};

export default SchoolYearManagement;
