import React from 'react';
import type { HistoryEntry } from '../types';
import { PlusIcon, MinusIcon } from './Icons';
import { motion, AnimatePresence } from 'framer-motion';

interface HistoryLogProps {
  history: HistoryEntry[];
}

const HistoryLog: React.FC<HistoryLogProps> = ({ history }) => {

  // --- START: Chức năng xuất CSV ---
  const handleExportCSV = () => {
    if (history.length === 0) return;

    // 1. Tạo tiêu đề cho file CSV
    const headers = ['Tên học sinh', 'Lý do', 'Điểm', 'Tổ', 'Thời gian'];
    
    // 2. Chuyển đổi dữ liệu (đảm bảo xử lý dấu phẩy, dấu ngoặc kép trong dữ liệu)
    const csvContent = [
      headers.join(','), // Dòng tiêu đề
      ...history.map(entry => {
        const studentName = `"${entry.studentName.replace(/"/g, '""')}"`;
        const reason = `"${entry.reason.replace(/"/g, '""')}"`;
        const points = entry.points;
        const teamName = `"${entry.teamName.replace(/"/g, '""')}"`;
        const timestamp = `"${new Date(entry.timestamp).toLocaleString('vi-VN')}"`;
        return [studentName, reason, points, teamName, timestamp].join(',');
      })
    ].join('\n'); // Nối mỗi dòng bằng ký tự xuống dòng

    // 3. Tạo Blob và kích hoạt tải file
    // Thêm \uFEFF (BOM) để Excel có thể đọc file UTF-8 (tiếng Việt có dấu)
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.href = url;
    link.setAttribute('download', 'lich_su_ghi_nhan.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  // --- END: Chức năng xuất CSV ---

  return (
    // --- GIỮ NGUYÊN CSS GỐC ĐỂ CÓ THANH CUỘN ---
    <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-slate-500 h-[420px] flex flex-col">
      
      {/* --- THÊM NÚT XUẤT FILE VÀO ĐÂY --- */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-3">
        <h3 className="text-2xl font-bold text-slate-600">Lịch sử Ghi nhận</h3>
        <button
          onClick={handleExportCSV}
          disabled={history.length === 0}
          className="flex items-center justify-center gap-2 bg-emerald-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {/* Bạn có thể thêm Icon tải về nếu muốn */}
          Xuất File (CSV)
        </button>
      </div>
      {/* --- KẾT THÚC THÊM NÚT --- */}
      
      {history.length === 0 ? (
        <div className="flex-grow flex items-center justify-center text-slate-400">
          <p>Chưa có ghi nhận nào.</p>
        </div>
      ) : (
        // --- GIỮ NGUYÊN CSS GỐC ĐỂ CÓ THANH CUỘN ---
        <ul className="space-y-3 overflow-y-auto flex-grow pr-2">
          <AnimatePresence initial={false}>
            {history.map((entry) => (
              <motion.li
                key={entry.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className="flex items-start justify-between bg-slate-50 p-3 rounded-md"
              >
                <div>
                  <p className="font-semibold text-slate-800">{entry.studentName}</p>
                  <p className="text-sm text-slate-500">{entry.reason}</p>
                   <p className="text-xs text-slate-400 mt-1">
                    {new Date(entry.timestamp).toLocaleString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                   </p>
                </div>
                <div className={`flex items-center gap-1 font-bold text-sm px-3 py-1 rounded-full flex-shrink-0 ${
                    entry.points > 0
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {entry.points > 0 ? <PlusIcon className="w-4 h-4" /> : <MinusIcon className="w-4 h-4" />}
                  {Math.abs(entry.points)}
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
};

export default HistoryLog;