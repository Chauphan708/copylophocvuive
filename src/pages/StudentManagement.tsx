import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Student, Team, CustomAvatar } from '../types';
import { PencilIcon, TrashIcon, UsersIcon, PlusIcon } from '../components/Icons';
import AddTeamModal from '../components/AddTeamModal';
import EditTeamModal from '../components/EditTeamModal';
import EditStudentModal from '../components/EditStudentModal';
import BulkAddStudentModal from '../components/BulkAddStudentModal';
import Avatar from '../components/Avatar';

interface StudentManagementProps {
  teams: Team[];
  onUpdateStudent: (studentId: number, name: string, teamId: number, avatar: string) => void;
  onDeleteStudent: (studentId: number) => void;
  onAddTeam: (name: string, color: string) => void;
  onUpdateTeam: (teamId: number, newName: string, newColor: string) => void;
  onDeleteTeam: (teamId: number) => void;
  onBulkAddStudent: (names: string[], teamId: number) => void;
  customAvatars: CustomAvatar[];
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


const StudentManagement: React.FC<StudentManagementProps> = ({
    teams,
    onUpdateStudent,
    onDeleteStudent,
    onAddTeam,
    onUpdateTeam,
    onDeleteTeam,
    onBulkAddStudent,
    customAvatars
}) => {
    const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false);
    const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false);
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);

    const handleDeleteStudent = (studentId: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xoá học sinh này?')) {
            onDeleteStudent(studentId);
        }
    };

    const handleDeleteTeam = (teamId: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xoá tổ này? Mọi học sinh trong tổ cũng sẽ bị xoá.')) {
            onDeleteTeam(teamId);
        }
    };

    return (
        <motion.div
            key="students"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="space-y-6"
        >
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                 <h2 className="text-3xl font-bold text-slate-700">Quản lý Học Sinh & Tổ</h2>
                 <div className="flex gap-2">
                    <button
                        onClick={() => setIsAddTeamModalOpen(true)}
                        className="flex items-center justify-center gap-2 bg-sky-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-sky-600 transition-colors duration-200 shadow-md"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Thêm Tổ
                    </button>
                    <button
                        onClick={() => setIsBulkAddModalOpen(true)}
                        className="flex items-center justify-center gap-2 bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-emerald-600 transition-colors duration-200 shadow-md"
                    >
                        <UsersIcon className="w-5 h-5" />
                        Thêm Hàng Loạt
                    </button>
                 </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence>
                {teams.map(team => (
                    <motion.div
                        key={team.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white rounded-xl shadow-lg flex flex-col"
                    >
                        <div className={`p-3 rounded-t-lg text-white ${team.color} flex justify-between items-center`}>
                            <h3 className="text-xl font-bold truncate">{team.name}</h3>
                            <div className="flex gap-1">
                                <button onClick={() => setEditingTeam(team)} className="p-2 rounded-full hover:bg-white/20 transition-colors" aria-label="Sửa tổ">
                                    <PencilIcon className="w-5 h-5"/>
                                </button>
                                <button onClick={() => handleDeleteTeam(team.id)} className="p-2 rounded-full hover:bg-white/20 transition-colors" aria-label="Xoá tổ">
                                    <TrashIcon className="w-5 h-5"/>
                                </button>
                            </div>
                        </div>
                        <ul className="divide-y divide-slate-100 p-2 flex-grow">
                             {team.students.map(student => (
                                <li key={student.id} className="flex items-center justify-between py-2 px-1 group">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Avatar 
                                            avatar={student.avatar}
                                            className={`w-8 h-8 rounded-full ${team.color} text-white font-bold text-sm flex-shrink-0`}
                                        />
                                        <span className="font-semibold text-slate-700 truncate">{student.name}</span>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                         <button onClick={() => setEditingStudent(student)} className="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-100 rounded-full transition" aria-label="Sửa học sinh">
                                            <PencilIcon className="w-5 h-5"/>
                                        </button>
                                        <button onClick={() => handleDeleteStudent(student.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full transition" aria-label="Xoá học sinh">
                                            <TrashIcon className="w-5 h-5"/>
                                        </button>
                                    </div>
                                </li>
                             ))}
                             {team.students.length === 0 && (
                                <li className="text-center text-slate-400 py-4">Chưa có học sinh</li>
                             )}
                        </ul>
                    </motion.div>
                ))}
                </AnimatePresence>
            </div>
            
            <AddTeamModal 
                isOpen={isAddTeamModalOpen}
                onClose={() => setIsAddTeamModalOpen(false)}
                onAddTeam={onAddTeam}
            />
            <EditTeamModal 
                isOpen={!!editingTeam}
                onClose={() => setEditingTeam(null)}
                team={editingTeam}
                onUpdateTeam={onUpdateTeam}
            />
            <EditStudentModal
                isOpen={!!editingStudent}
                onClose={() => setEditingStudent(null)}
                student={editingStudent}
                teams={teams}
                onUpdateStudent={onUpdateStudent}
                customAvatars={customAvatars}
            />
            <BulkAddStudentModal
                isOpen={isBulkAddModalOpen}
                onClose={() => setIsBulkAddModalOpen(false)}
                teams={teams}
                onBulkAdd={onBulkAddStudent}
            />
        </motion.div>
    );
};

export default StudentManagement;
