import React from 'react';
import { TrophyIcon, ResetIcon } from './Icons';

interface HeaderProps {
    onResetData: () => void;
    activeSchoolYearName?: string;
}

const Header: React.FC<HeaderProps> = ({ onResetData, activeSchoolYearName }) => {

  // Hàm xử lý an toàn khi bấm nút Reset
  const handleSafeReset = () => {
    // LỚP BẢO VỆ 1: Hỏi xác nhận
    const isConfirmed = window.confirm(
        "CẢNH BÁO NGUY HIỂM!\n\nHành động này sẽ XÓA SẠCH toàn bộ điểm và lịch sử thi đua hiện tại về 0.\nDữ liệu sẽ KHÔNG THỂ khôi phục được nếu chưa sao lưu.\n\nBạn có chắc chắn muốn tiếp tục không?"
    );

    if (!isConfirmed) return;

    // LỚP BẢO VỆ 2: Yêu cầu nhập mật mã
    const code = window.prompt('Để xác nhận xóa, hãy nhập chính xác cụm từ sau vào ô bên dưới:\n\nxoa du lieu');

    // Kiểm tra mật mã
    if (code === "xoa du lieu") {
        onResetData();
    } else if (code !== null) { 
        // Nếu người dùng nhập sai (và không bấm Hủy)
        alert("Sai mã xác nhận! Dữ liệu vẫn an toàn.");
    }
  };

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
        
        {/* Nút Bắt đầu lại đã được bảo vệ */}
        <button 
          onClick={handleSafeReset}
          // Đổi màu từ đỏ (red-500) sang xám (slate-400) để bớt gây chú ý
          className="flex items-center gap-2 bg-slate-400 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-opacity-75 transition-all duration-200"
          aria-label="Bắt đầu lại tuần thi đua"
          title="Cần nhập mã xác nhận để thực hiện"
        >
          <ResetIcon className="w-5 h-5" />
          <span className="hidden sm:inline">Bắt đầu lại</span>
        </button>
      </div>
    </header>
  );
};

export default Header;