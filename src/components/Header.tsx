import React from 'react';
import { TrophyIcon, ResetIcon } from './Icons';

interface HeaderProps {
    onResetData: () => void;
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
        <button 
          onClick={onResetData}
          className="flex items-center gap-2 bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 transition-all duration-200"
          aria-label="Bắt đầu lại tuần thi đua"
        >
          <ResetIcon className="w-5 h-5" />
          <span className="hidden sm:inline">Bắt đầu lại</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
