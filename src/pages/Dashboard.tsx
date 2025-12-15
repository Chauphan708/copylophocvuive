import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Leaderboard from '../components/Leaderboard';
import HistoryLog from '../components/HistoryLog';
import IndividualLeaderboard from '../components/IndividualLeaderboard';
import HallOfFame from '../components/HallOfFame';
import type { Student, Team, HistoryEntry } from '../types';

interface DashboardProps {
  teams: Team[];
  history: HistoryEntry[];
  onSelectStudent: (student: Student) => void;
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

const Dashboard: React.FC<DashboardProps> = ({ teams, history, onSelectStudent }) => {
    // viewMode: 'week' (xem theo tuần) hoặc 'all' (tất cả thời gian)
    const [viewMode, setViewMode] = useState<'week' | 'all'>('week');
    
    // weekOffset: 0 là tuần này, -1 là tuần trước, -2 là tuần trước nữa...
    const [weekOffset, setWeekOffset] = useState(0);

    // Tính toán ngày bắt đầu và kết thúc của tuần dựa trên weekOffset
    const { startDate, endDate, label } = useMemo(() => {
        const now = new Date();
        // Điều chỉnh về ngày hiện tại theo offset tuần
        const targetDate = new Date(now.setDate(now.getDate() + (weekOffset * 7)));
        
        // Tìm ngày Thứ 2 đầu tuần (Giả sử tuần bắt đầu từ Thứ 2)
        const day = targetDate.getDay();
        const diff = targetDate.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        
        const start = new Date(targetDate.setDate(diff));
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);

        let dateLabel = '';
        if (weekOffset === 0) dateLabel = 'Tuần Này';
        else if (weekOffset === -1) dateLabel = 'Tuần Trước';
        else if (weekOffset === 1) dateLabel = 'Tuần Sau';
        else dateLabel = `Tuần: ${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}`;

        return { startDate: start, endDate: end, label: dateLabel };
    }, [weekOffset]);

    // Lọc lịch sử dựa trên chế độ xem
    const filteredHistory = useMemo(() => {
        if (viewMode === 'all') return history;

        const startTime = startDate.getTime();
        const endTime = endDate.getTime();

        return history.filter(entry => {
            return entry.timestamp >= startTime && entry.timestamp <= endTime;
        });
    }, [history, viewMode, startDate, endDate]);

    // Tính điểm hiển thị
    const displayTeams = useMemo(() => {
        // Nếu xem tất cả, trả về teams gốc (đã có tổng điểm)
        if (viewMode === 'all') return teams;

        // Nếu xem theo tuần, tính lại điểm từ filteredHistory
        const weeklyScores = new Map<string, number>(); 
        filteredHistory.forEach(entry => {
            weeklyScores.set(entry.studentName, (weeklyScores.get(entry.studentName) || 0) + entry.points);
        });

        return teams.map(team => ({
            ...team,
            students: team.students.map(student => ({
                ...student,
                // Ghi đè điểm bằng điểm tính trong tuần
                score: weeklyScores.get(student.name) || 0,
            }))
        }));

    }, [teams, viewMode, filteredHistory]);

    return (
        <motion.div
            key="dashboard"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="space-y-8"
        >
            {/* Thanh điều khiển Bộ lọc */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('week')}
                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                            viewMode === 'week' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        Theo Tuần
                    </button>
                    <button
                        onClick={() => setViewMode('all')}
                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                            viewMode === 'all' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        Tất Cả
                    </button>
                </div>

                {viewMode === 'week' && (
                    <div className="flex items-center gap-4 bg-sky-50 px-4 py-2 rounded-lg border border-sky-100">
                        <button 
                            onClick={() => setWeekOffset(prev => prev - 1)}
                            className="p-1 hover:bg-sky-200 rounded-full text-sky-600 transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                        </button>
                        
                        <div className="text-center min-w-[150px]">
                            <span className="block text-sky-800 font-bold text-lg">{label}</span>
                            <span className="block text-sky-500 text-xs font-medium">
                                {startDate.toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit'})} - {endDate.toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit'})}
                            </span>
                        </div>

                        <button 
                            onClick={() => setWeekOffset(prev => prev + 1)}
                            className="p-1 hover:bg-sky-200 rounded-full text-sky-600 transition"
                            disabled={weekOffset >= 1} // Không cho xem tương lai quá xa nếu muốn
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            <section id="leaderboard">
                <h2 className="text-3xl font-bold text-slate-700 mb-4">
                    Bảng Xếp Hạng Thi Đua
                </h2>
                <Leaderboard teams={displayTeams} onSelectStudent={onSelectStudent} />
            </section>

            <section id="details" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-8">
                    {/* Bảng xếp hạng cá nhân (Đã có tính năng thu gọn) */}
                    <IndividualLeaderboard teams={displayTeams} history={filteredHistory} />
                </div>
                <div className="lg:col-span-2 space-y-8">
                    <HallOfFame teams={displayTeams} history={filteredHistory} />
                    <HistoryLog history={filteredHistory} />
                </div>
            </section>
        </motion.div>
    );
};

export default Dashboard;