import React from 'react';
import { TrophyIcon } from './Icons';

interface HeaderProps {
    onResetData: () => void; // Vẫn giữ prop này để không bị lỗi ở App.tsx, dù không dùng nữa
    activeSchoolYearName?: string;
}

const Header: React.FC<HeaderProps> = ({ onResetData, activeSchoolYearName }) => {

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center justify-center gap-4">
          <TrophyIcon className="w-12 h-12 text-amber-400" />
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-slate-800">Lớp Học Vui Vẻ</h1>
            <p className="text-md sm:text-lg text-slate-500 mt-1">{activeSchoolYearName || 'Bảng Thi Đua Lớp 5A'}</p>
          </div>
        </div>
        
        {/* Nút Bắt đầu lại đã bị xóa hoàn toàn khỏi giao diện */}
      </div>
    </header>
  );
};

export default Header;