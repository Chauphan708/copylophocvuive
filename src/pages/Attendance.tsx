import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Team } from '../types';
import Avatar from '../components/Avatar';

type AttendanceStatus = 'present' | 'excused' | 'unexcused';

interface AttendanceProps {
  teams: Team[];
  attendance: Record<string, Record<number, AttendanceStatus>>;
  onSaveAttendance: (dateKey: string, dayAttendance: Map<number, AttendanceStatus>) => void;
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

const toDateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const fromDateKey = (dateKey: string): Date => {
    const [year, month, day] = dateKey.split('-').map(Number);
    return new Date(year, month - 1, day);
};

const toDateInputValue = (date: Date) => {
    const local = new Date(date);
    local.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return local.toJSON().slice(0,10);
};

const Attendance: React.FC<AttendanceProps> = ({ teams, attendance, onSaveAttendance }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [dayAttendance, setDayAttendance] = useState<Map<number, AttendanceStatus>>(new Map());

    const allStudents = useMemo(() => teams.flatMap(t => t.students), [teams]);
    const dateKey = useMemo(() => toDateKey(selectedDate), [selectedDate]);

    useEffect(() => {
        const newDayAttendance = new Map<number, AttendanceStatus>();
        const savedAttendanceForDay = attendance[dateKey] || {};
        
        allStudents.forEach(student => {
            newDayAttendance.set(student.id, savedAttendanceForDay[student.id] || 'present');
        });
        setDayAttendance(newDayAttendance);

    }, [dateKey, allStudents, attendance]);

    const handleStatusChange = (studentId: number, status: AttendanceStatus) => {
        setDayAttendance(prev => new Map(prev).set(studentId, status));
    };
    
    const handleSave = () => {
        onSaveAttendance(dateKey, dayAttendance);
    };

    const summary = useMemo(() => {
        const total = allStudents.length;
        let present = 0;
        let excused = 0;
        let unexcused = 0;
        dayAttendance.forEach(status => {
            if (status === 'present') present++;
            else if (status === 'excused') excused++;
            else if (status === 'unexcused') unexcused++;
        });
        return { total, present, excused, unexcused };
    }, [dayAttendance, allStudents]);

    const statusConfig: Record<AttendanceStatus, { label: string; bg: string; text: string; border: string }> = {
        present: { label: 'Có mặt', bg: 'bg-emerald-500', text: 'text-white', border: 'border-emerald-500' },
        excused: { label: 'KP', bg: 'bg-sky-500', text: 'text-white', border: 'border-sky-500' },
        unexcused: { label: 'CP', bg: 'bg-red-500', text: 'text-white', border: 'border-red-500' },
    };

    return (
        <motion.div
            key="attendance"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="space-y-6"
        >
            <h2 className="text-3xl font-bold text-slate-700">Điểm danh</h2>

            <div className="bg-white p-4 rounded-xl shadow-md sticky top-[72px] z-20">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div>
                        <label htmlFor="attendanceDate" className="block text-sm font-medium text-slate-700 mb-1">Chọn ngày</label>
                        <input
                            id="attendanceDate"
                            type="date"
                            value={toDateInputValue(selectedDate)}
                            onChange={e => setSelectedDate(fromDateKey(e.target.value))}
                            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-400 bg-white text-black"
                        />
                    </div>
                     <div className="text-center md:text-left font-semibold text-slate-600 bg-slate-50 p-3 rounded-md">
                        Sĩ số: <span className="font-bold text-slate-800">{summary.present}/{summary.total}</span> | 
                        Vắng KP: <span className="font-bold text-sky-600">{summary.excused}</span> | 
                        Vắng CP: <span className="font-bold text-red-600">{summary.unexcused}</span>
                    </div>
                 </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {teams.map(team => (
                    <div key={team.id} className="bg-white rounded-xl shadow-lg">
                        <h3 className={`text-xl font-bold p-3 rounded-t-lg text-white ${team.color}`}>
                            {team.name}
                        </h3>
                        <ul className="divide-y divide-slate-100 p-2">
                            {team.students.map(student => {
                                const currentStatus = dayAttendance.get(student.id) || 'present';
                                return (
                                    <li key={student.id} className="flex items-center justify-between py-2 px-1">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Avatar 
                                                avatar={student.avatar}
                                                className={`w-8 h-8 rounded-full ${team.color} text-white font-bold text-sm flex-shrink-0`}
                                            />
                                            <span className="font-semibold text-slate-700 truncate">{student.name}</span>
                                        </div>
                                        <div className="flex gap-1 flex-shrink-0">
                                            {Object.keys(statusConfig).map(s => {
                                                const status = s as AttendanceStatus;
                                                const config = statusConfig[status];
                                                const isSelected = currentStatus === status;
                                                return (
                                                    <button
                                                        key={status}
                                                        onClick={() => handleStatusChange(student.id, status)}
                                                        className={`w-12 text-xs font-bold py-2 rounded-md transition-all duration-200 ${
                                                            isSelected ? `${config.bg} ${config.text} shadow-sm` : `bg-white text-slate-500 hover:bg-slate-100 border border-slate-200`
                                                        }`}
                                                        title={config.label}
                                                    >
                                                        {config.label}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>
             <div className="flex justify-center mt-6">
                <button
                    onClick={handleSave}
                    className="bg-sky-500 text-white font-bold py-3 px-12 rounded-lg hover:bg-sky-600 transition-transform hover:scale-105 shadow-lg"
                >
                    Lưu Điểm Danh
                </button>
            </div>
        </motion.div>
    );
};

export default Attendance;
