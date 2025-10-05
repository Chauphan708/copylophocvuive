import React from 'react';
import type { HistoryEntry } from '../types';
import { PlusIcon, MinusIcon } from './Icons';
import { motion, AnimatePresence } from 'framer-motion';

interface HistoryLogProps {
  history: HistoryEntry[];
}

const HistoryLog: React.FC<HistoryLogProps> = ({ history }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-slate-500 h-[420px] flex flex-col">
      <h3 className="text-2xl font-bold mb-4 text-slate-600">Lịch sử Ghi nhận</h3>
      {history.length === 0 ? (
        <div className="flex-grow flex items-center justify-center text-slate-400">
          <p>Chưa có ghi nhận nào.</p>
        </div>
      ) : (
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
