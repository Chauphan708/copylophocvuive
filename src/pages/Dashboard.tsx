import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Leaderboard from '../components/Leaderboard';
import HistoryLog from '../components/HistoryLog';
// Bỏ DashboardFilters vì chúng ta sẽ thay bằng bộ lọc mới
// import DashboardFilters from '../components/DashboardFilters'; 
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

// --- BỘ LỌC MỚI ---
type FilterType = 'all' | 'month' | 'week' | 'day';

// Component nút lọc
const FilterButton: React.FC<{ label: string, isActive: boolean, onClick: () => void }> = 
    ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`font-semibold py-2 px-4 rounded-lg transition-colors ${
            isActive
                ? 'bg-sky-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 shadow-sm border border-slate-200'
        }`}
    >
        {label}
    </button>
);
// --- KẾT THÚC BỘ LỌC MỚI ---

const Dashboard: React.FC<DashboardProps> = ({ teams, history, onSelectStudent }) => {
  // State mới để quản lý bộ lọc
  const [filterType, setFilterType] = useState<FilterType>('all');

  // --- LOGIC LỌC MỚI ---
  const { filteredHistory, filterTitle } = useMemo(() => {
    const today = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;
    let filterTitle = '';

    if (filterType === 'day') {
        startDate = new Date(today);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999);
        filterTitle = ' - Hôm nay';
    } else if (filterType === 'week') {
        // Lấy ngày đầu tuần (Giả sử tuần bắt đầu từ Thứ 2)
        const firstDayOfWeek = today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1);
        startDate = new Date(today.setDate(firstDayOfWeek));
        startDate.setHours(0, 0, 0, 0);
        
        // Lấy ngày cuối tuần
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        filterTitle = ' - Tuần này';
    } else if (filterType === 'month') {
        // Lấy ngày đầu tháng
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
        
        // Lấy ngày cuối tháng
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        filterTitle = ' - Tháng này';
    }

    // Nếu là 'all' hoặc không có ngày, trả về toàn bộ lịch sử
    if (filterType === 'all' || !startDate || !endDate) {
        return { filteredHistory: history, filterTitle: '' };
    }

    const startTime = startDate.getTime();
    const endTime = endDate.getTime();

    // Lọc lịch sử theo khoảng thời gian
    const relevantHistory = history.filter(entry => {
        return entry.timestamp >= startTime && entry.timestamp <= endTime;
    });
    
    return { filteredHistory: relevantHistory, filterTitle };

  }, [history, filterType]);

  // --- LOGIC TÍNH ĐIỂM MỚI ---
  const displayTeams = useMemo(() => {
    // Nếu là 'all', trả về 'teams' gốc (đã chứa tổng điểm)
    if (filterType === 'all') {
        return teams;
    }

    // Nếu có lọc, tính toán lại điểm từ 'filteredHistory'
    const newScores = new Map<string, number>(); // studentName -> score
    filteredHistory.forEach(entry => {
        newScores.set(entry.studentName, (newScores.get(entry.studentName) || 0) + entry.points);
    });
    
    // Tạo lại mảng teams với điểm số mới
    return teams.map(team => ({
        ...team,
        students: team.students.map(student => ({
            ...student,
            // Gán điểm mới, nếu không có hoạt động thì gán 0
            score: newScores.get(student.name) || 0,
        }))
    }));

  }, [teams, filterType, filteredHistory]);
  // --- KẾT THÚC LOGIC MỚI ---

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
      {/* --- PHẦN BỘ LỌC ĐƯỢC THAY THẾ --- */}
      <section>
          <h3 className="text-xl font-bold text-slate-600 mb-3">Xem theo</h3>
          <div className="flex flex-wrap gap-2 sm:gap-3">
              <FilterButton
                  label="Tất cả"
                  isActive={filterType === 'all'}
                  onClick={() => setFilterType('all')}
              />
              <FilterButton
                  label="Tháng này"
                  isActive={filterType === 'month'}
                  onClick={() => setFilterType('month')}
              />
              <FilterButton
                  label="Tuần này"
                  isActive={filterType === 'week'}
                  onClick={() => setFilterType('week')}
              />
              <FilterButton
                  label="Hôm nay"
                  isActive={filterType === 'day'}
                  onClick={() => setFilterType('day')}
              />
          </div>
      </section>
      {/* --- KẾT THÚC PHẦN THAY THẾ --- */}

      <section id="leaderboard">
        {/* Tiêu đề được cập nhật để hiển thị bộ lọc */}
        <h2 className="text-3xl font-bold text-slate-700 mb-4">
          Bảng Xếp Hạng Thi Đua{filterTitle}
        </h2>
        <Leaderboard teams={displayTeams} onSelectStudent={onSelectStudent} />
      </section>

      <section id="details" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
            <IndividualLeaderboard teams={teams} history={history} />
        </div>
        <div className="lg:col-span-2 space-y-8">
            <HallOfFame teams={teams} history={history} />
            {/* Vẫn sử dụng filteredHistory để hiển thị log cho đúng */}
            <HistoryLog history={filteredHistory} />
        </div>
      </section>
    </motion.div>
  );
};

export default Dashboard;