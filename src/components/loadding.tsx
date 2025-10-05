import React from 'react';
import { TrophyIcon } from './Icons';

const Loading: React.FC = () => (
  <div className="fixed inset-0 bg-slate-100 flex flex-col items-center justify-center z-50">
    <TrophyIcon className="w-24 h-24 text-amber-400 animate-pulse" />
    <h1 className="text-3xl font-bold text-slate-700 mt-4">Lớp Học Vui Vẻ</h1>
    <p className="text-lg text-slate-500 mt-2">Đang tải dữ liệu, vui lòng chờ...</p>
  </div>
);

export default Loading;
