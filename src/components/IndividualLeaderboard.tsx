import React, { useState, useMemo } from 'react';
import type { Team, HistoryEntry } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { TrophyIcon } from './Icons'; // Đảm bảo bạn có icon này hoặc thay bằng icon khác

interface IndividualLeaderboardProps {
    teams: Team[];
    history: HistoryEntry[]; // Có thể dùng để tính xu hướng tăng/giảm nếu cần sau này
}

const IndividualLeaderboard: React.FC<IndividualLeaderboardProps> = ({ teams }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // 1. Lấy tất cả học sinh từ các tổ và gộp thành 1 danh sách duy nhất
    const allStudents = useMemo(() => {
        const students = teams.flatMap(team => 
            team.students.map(s => ({ ...s, teamName: team.name, teamColor: team.color }))
        );
        // 2. Sắp xếp theo điểm từ cao xuống thấp
        return students.sort((a, b) => b.score - a.score);
    }, [teams]);

    // 3. Quyết định danh sách hiển thị (10 em hoặc tất cả)
    const displayedStudents = isExpanded ? allStudents : allStudents.slice(0, 10);

    return (
        <div className="bg-white rounded-xl shadow-lg border-t-4 border-amber-400 overflow-hidden">
            <div className="p-6 pb-2">
                <h3 className="text-2xl font-bold text-slate-700 flex items-center gap-2">
                    <TrophyIcon className="w-8 h-8 text-amber-500" />
                    Xếp Hạng Cá Nhân
                </h3>
                <p className="text-slate-500 text-sm mt-1">
                    Tổng số: {allStudents.length} học sinh
                </p>
            </div>

            <div className="p-4">
                <div className="space-y-3">
                    <AnimatePresence initial={false}>
                        {displayedStudents.map((student, index) => (
                            <motion.div
                                key={student.id}
                                layout
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className={`flex items-center justify-between p-3 rounded-lg border ${
                                    index < 3 ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-100'
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    {/* Huy hiệu thứ hạng */}
                                    <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${
                                        index === 0 ? 'bg-yellow-400 text-white shadow-md' :
                                        index === 1 ? 'bg-slate-300 text-slate-600' :
                                        index === 2 ? 'bg-amber-700 text-amber-100' :
                                        'bg-slate-100 text-slate-500'
                                    }`}>
                                        {index + 1}
                                    </div>
                                    
                                    <div>
                                        <p className="font-bold text-slate-700">{student.name}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full text-white ${student.teamColor}`}>
                                            {student.teamName}
                                        </span>
                                    </div>
                                </div>
                                <div className="font-bold text-xl text-amber-500">
                                    {student.score}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Nút Xem thêm / Thu gọn */}
                {allStudents.length > 10 && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full mt-4 py-2 text-sm font-semibold text-slate-500 hover:text-sky-600 hover:bg-slate-50 rounded-lg transition-colors border border-dashed border-slate-300"
                    >
                        {isExpanded ? 'Thu gọn danh sách' : `Xem thêm ${allStudents.length - 10} học sinh nữa...`}
                    </button>
                )}
            </div>
        </div>
    );
};

export default IndividualLeaderboard;