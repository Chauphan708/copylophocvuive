import React from 'react';
import { motion } from 'framer-motion';
import { ChartBarIcon, UsersIcon, ClipboardListIcon, PencilSquareIcon, ExclamationTriangleIcon, CalendarDaysIcon, AcademicCapIcon, PhotoIcon, CubeTransparentIcon } from './Icons';
import type { Page } from '../types';


interface NavItemProps {
  page: Page;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  children: React.ReactNode;
  icon: React.ReactNode;
}

const NavItem: React.FC<NavItemProps> = ({ page, currentPage, setCurrentPage, children, icon }) => {
  const isActive = currentPage === page;
  return (
    <button
      onClick={() => setCurrentPage(page)}
      className={`relative flex items-center gap-2 px-3 sm:px-4 py-3 rounded-md transition-colors duration-200 ${
        isActive ? 'text-sky-600' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700'
      }`}
    >
      {icon}
      <span className="font-semibold text-sm sm:text-base">{children}</span>
      {isActive && (
        <motion.div
          layoutId="active-nav-indicator"
          className="absolute bottom-0 left-0 right-0 h-1 bg-sky-500 rounded-t-full"
          initial={false}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
    </button>
  );
};

interface NavbarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage }) => {
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-2 sm:px-6 lg:p-8">
        <div className="flex items-center justify-center sm:justify-start flex-wrap">
          <NavItem
            page="dashboard"
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            icon={<ChartBarIcon className="w-5 h-5" />}
          >
            Bảng Thi Đua
          </NavItem>
          <NavItem
            page="record"
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            icon={<PencilSquareIcon className="w-5 h-5" />}
          >
            Ghi nhận
          </NavItem>
          <NavItem
            page="attendance"
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            icon={<CalendarDaysIcon className="w-5 h-5" />}
          >
            Điểm Danh
          </NavItem>
          <NavItem
            page="random"
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            icon={<CubeTransparentIcon className="w-5 h-5" />}
          >
            Gọi Tên
          </NavItem>
           <NavItem
            page="watchlist"
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            icon={<ExclamationTriangleIcon className="w-5 h-5" />}
          >
            Cần lưu ý
          </NavItem>
          <NavItem
            page="students"
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            icon={<UsersIcon className="w-5 h-5" />}
          >
            Học Sinh
          </NavItem>
          <NavItem
            page="behaviors"
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            icon={<ClipboardListIcon className="w-5 h-5" />}
          >
            Hành Vi
          </NavItem>
           <NavItem
            page="avatars"
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            icon={<PhotoIcon className="w-5 h-5" />}
          >
            Avatar
          </NavItem>
          <NavItem
            page="schoolYears"
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            icon={<AcademicCapIcon className="w-5 h-5" />}
          >
            Năm Học
          </NavItem>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;