import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Team, Behavior } from '../types';
import { PlusIcon, MinusIcon, CheckIcon } from '../components/Icons';

interface RecordBehaviorProps {
  teams: Team[];
  behaviors: { positive: Behavior[], negative: Behavior[] };
  onBatchUpdateScore: (studentIds: number[], points: number, reason: string) => void;
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

const CustomCheckbox: React.FC<{
    checked: boolean;
    isIndeterminate?: boolean;
    onChange: () => void;
    label: string;
    id: string;
}> = ({ checked, isIndeterminate = false, onChange, label, id }) => {
    return (
        <div className="flex items-center">
            <input
                id={id}
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={onChange}
            />
            <label htmlFor={id} className="flex items-center cursor-pointer">
                <div
                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                        checked || isIndeterminate
                            ? 'bg-sky-500 border-sky-500'
                            : 'bg-white border-slate-300'
                    }`}
                >
                    {isIndeterminate && !checked && <MinusIcon className="w-4 h-4 text-white" />}
                    {checked && <CheckIcon className="w-5 h-5 text-white" />}
                </div>
                <span className="ml-3 text-slate-700 font-semibold">{label}</span>
            </label>
        </div>
    );
};

const RecordBehavior: React.FC<RecordBehaviorProps> = ({ teams, behaviors, onBatchUpdateScore }) => {
    const [selectedStudentIds, setSelectedStudentIds] = useState<Set<number>>(new Set());

    const allStudentIds = useMemo(() => teams.flatMap(t => t.students.map(s => s.id)), [teams]);
    const areAllSelected = allStudentIds.length > 0 && selectedStudentIds.size === allStudentIds.length;

    const handleSelectStudent = (id: number) => {
        setSelectedStudentIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleSelectTeam = (teamId: number) => {
        const teamStudentIds = teams.find(t => t.id === teamId)?.students.map(s => s.id) || [];
        const areAllInTeamSelected = teamStudentIds.every(id => selectedStudentIds.has(id));

        setSelectedStudentIds(prev => {
            const newSet = new Set(prev);
            if (areAllInTeamSelected) {
                teamStudentIds.forEach(id => newSet.delete(id));
            } else {
                teamStudentIds.forEach(id => newSet.add(id));
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        if (areAllSelected) {
            setSelectedStudentIds(new Set());
        } else {
            setSelectedStudentIds(new Set(allStudentIds));
        }
    };

    const handleBehaviorClick = (points: number, reason: string) => {
        if (selectedStudentIds.size === 0) {
            alert("Vui lòng chọn ít nhất một học sinh để ghi nhận.");
            return;
        }
        onBatchUpdateScore(Array.from(selectedStudentIds), points, reason);
        setSelectedStudentIds(new Set());
    };

    return (
        <motion.div
            key="record"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="space-y-6"
        >
            <div className="sticky top-[72px] z-20 bg-slate-100/80 backdrop-blur-sm -mx-8 px-8 py-4">
                <div className="container mx-auto bg-white rounded-xl shadow-md p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-700">
                        Đã chọn: <span className="text-sky-600">{selectedStudentIds.size}</span> học sinh
                    </h2>
                    <button
                        onClick={handleSelectAll}
                        className={`font-semibold py-2 px-4 rounded-md transition-colors ${
                            areAllSelected
                                ? 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                                : 'bg-sky-500 text-white hover:bg-sky-600'
                        }`}
                    >
                        {areAllSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 -mt-6 pt-6">
                <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-slate-500 xl:col-span-1">
                    <h3 className="text-2xl font-bold mb-4 text-slate-600">Chọn học sinh</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
                        {teams.map(team => {
                            const teamStudentIds = team.students.map(s => s.id);
                            const selectedInTeamCount = teamStudentIds.filter(id => selectedStudentIds.has(id)).length;
                            const isTeamChecked = selectedInTeamCount > 0 && selectedInTeamCount === team.students.length;
                            const isTeamIndeterminate = selectedInTeamCount > 0 && selectedInTeamCount < team.students.length;

                            return (
                                <div key={team.id} className="border border-slate-200 rounded-lg p-3 break-inside-avoid">
                                    <CustomCheckbox
                                        id={`team-${team.id}`}
                                        checked={isTeamChecked}
                                        isIndeterminate={isTeamIndeterminate}
                                        onChange={() => handleSelectTeam(team.id)}
                                        label={team.name}
                                    />
                                    <div className="pl-9 mt-3 space-y-2">
                                        {team.students.map(student => (
                                            <CustomCheckbox
                                                key={student.id}
                                                id={`student-${student.id}`}
                                                checked={selectedStudentIds.has(student.id)}
                                                onChange={() => handleSelectStudent(student.id)}
                                                label={student.name}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-8 xl:col-span-1">
                    {/* Positive Behaviors */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-emerald-500">
                        <h3 className="text-2xl font-bold mb-4 text-emerald-600">Việc Làm Tốt</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {behaviors.positive.map(b => (
                                <button
                                    key={b.id}
                                    onClick={() => handleBehaviorClick(b.points, b.description)}
                                    disabled={selectedStudentIds.size === 0}
                                    className="text-left p-3 bg-emerald-50 rounded-md hover:bg-emerald-100 transition disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    <p className="font-semibold text-emerald-800">{b.description}</p>
                                    <div className="flex items-center gap-1 font-bold text-emerald-600 mt-1">
                                        <PlusIcon className="w-4 h-4"/>
                                        {b.points} điểm
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* Negative Behaviors */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-red-500">
                        <h3 className="text-2xl font-bold mb-4 text-red-600">Cần Cố Gắng</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {behaviors.negative.map(b => (
                                <button
                                    key={b.id}
                                    onClick={() => handleBehaviorClick(b.points, b.description)}
                                    disabled={selectedStudentIds.size === 0}
                                    className="text-left p-3 bg-red-50 rounded-md hover:bg-red-100 transition disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    <p className="font-semibold text-red-800">{b.description}</p>
                                    <div className="flex items-center gap-1 font-bold text-red-600 mt-1">
                                        <MinusIcon className="w-4 h-4"/>
                                        {Math.abs(b.points)} điểm
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default RecordBehavior;
