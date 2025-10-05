import React from 'react';

interface DashboardFiltersProps {
  filters: { date: string | null };
  onFilterChange: React.Dispatch<React.SetStateAction<{ date: string | null }>>;
}

const toDateInputValue = (date: Date) => {
    const local = new Date(date);
    local.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return local.toJSON().slice(0,10);
};

const DashboardFilters: React.FC<DashboardFiltersProps> = ({ filters, onFilterChange }) => {
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-t-4 border-slate-500">
        <h3 className="text-xl font-bold text-slate-600 mb-4">Bộ lọc hiển thị</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
                <label htmlFor="dateFilter" className="block text-sm font-medium text-slate-700 mb-1">
                    Xem điểm thi đua theo ngày
                </label>
                <input 
                    id="dateFilter" 
                    type="date"
                    value={filters.date || toDateInputValue(new Date())}
                    onChange={e => onFilterChange({ date: e.target.value })}
                    className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-400 focus:border-transparent transition bg-white text-black"
                />
            </div>
             <button
                onClick={() => onFilterChange({ date: null })}
                className="w-full bg-slate-500 text-white font-bold py-3 px-6 rounded-md hover:bg-slate-600 transition-colors duration-200"
            >
                Xem Toàn Bộ Lịch Sử
            </button>
        </div>
    </div>
  );
};

export default DashboardFilters;
