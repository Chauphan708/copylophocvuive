import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Behavior } from '../types';
import { PlusIcon, MinusIcon, PencilIcon, TrashIcon } from '../components/Icons';

type BehaviorType = 'positive' | 'negative';

interface BehaviorCardProps {
  title: string;
  type: BehaviorType;
  behaviors: Behavior[];
  onAdd: (type: BehaviorType, description: string, points: number) => void;
  onUpdate: (type: BehaviorType, id: number, description: string, points: number) => void;
  onDelete: (type: BehaviorType, id: number) => void;
}

const BehaviorForm: React.FC<{
    type: BehaviorType,
    onSubmit: (description: string, points: number) => void,
    editingBehavior: Behavior | null,
    onCancelEdit: () => void,
}> = ({ type, onSubmit, editingBehavior, onCancelEdit }) => {
    const [description, setDescription] = useState('');
    const [points, setPoints] = useState(5);

    useEffect(() => {
        if (editingBehavior) {
            setDescription(editingBehavior.description);
            setPoints(Math.abs(editingBehavior.points));
        } else {
            setDescription('');
            setPoints(5);
        }
    }, [editingBehavior]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (description.trim()) {
            onSubmit(description.trim(), points);
            if (!editingBehavior) {
                setDescription('');
                setPoints(5);
            }
        }
    };
    
    const isPositive = type === 'positive';
    const accentColor = isPositive ? 'emerald' : 'red';
    
    return (
        <form onSubmit={handleSubmit} className="p-4 bg-white rounded-lg space-y-3 mb-4 border border-slate-200">
            <h4 className="font-bold text-slate-600">{editingBehavior ? 'Đang chỉnh sửa' : 'Thêm hành vi mới'}</h4>
            <input 
                type="text" 
                placeholder="Nội dung hành vi"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-${accentColor}-400 focus:border-transparent transition bg-white text-black`}
                required
            />
            <div className="flex items-center gap-2">
                <label htmlFor="points" className="font-medium text-slate-700">Điểm:</label>
                <input 
                    type="number" 
                    value={points}
                    onChange={(e) => setPoints(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className={`w-20 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-${accentColor}-400 focus:border-transparent transition bg-white text-black`}
                    min="1"
                    required
                />
            </div>
            <div className="flex gap-2">
                <button type="submit" className={`flex-grow bg-${accentColor}-500 text-white font-bold py-2 px-4 rounded-md hover:bg-${accentColor}-600 transition`}>
                    {editingBehavior ? 'Lưu thay đổi' : 'Thêm'}
                </button>
                {editingBehavior && (
                    <button type="button" onClick={onCancelEdit} className="bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-md hover:bg-slate-300 transition">
                        Huỷ
                    </button>
                )}
            </div>
        </form>
    )
}

const BehaviorCard: React.FC<BehaviorCardProps> = ({ title, type, behaviors, onAdd, onUpdate, onDelete }) => {
    const [editingBehavior, setEditingBehavior] = useState<Behavior | null>(null);
    const isPositive = type === 'positive';
    const cardColor = isPositive ? 'border-emerald-500' : 'border-red-500';
    const textColor = isPositive ? 'text-emerald-600' : 'text-red-600';
  
    const handleFormSubmit = (description: string, points: number) => {
        if (editingBehavior) {
            onUpdate(type, editingBehavior.id, description, points);
            setEditingBehavior(null);
        } else {
            onAdd(type, description, points);
        }
    };

    return (
        <div className={`bg-white rounded-xl shadow-lg p-6 ${cardColor} border-t-4`}>
            <h3 className={`text-2xl font-bold mb-4 ${textColor}`}>{title}</h3>
            <BehaviorForm 
                type={type}
                onSubmit={handleFormSubmit}
                editingBehavior={editingBehavior}
                onCancelEdit={() => setEditingBehavior(null)}
            />
            <ul className="space-y-3">
                <AnimatePresence>
                {behaviors.map(behavior => (
                    <motion.li 
                        key={behavior.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                        className="flex justify-between items-center bg-slate-50 p-3 rounded-md"
                    >
                        <span className="text-slate-700 flex-grow pr-2">{behavior.description}</span>
                        <div className="flex items-center flex-shrink-0">
                            <div className={`flex items-center justify-center gap-1 font-bold ${textColor} px-3 py-1 rounded-full text-sm`}>
                                {isPositive ? <PlusIcon className="w-4 h-4" /> : <MinusIcon className="w-4 h-4" />}
                                {Math.abs(behavior.points)}
                            </div>
                            <div className="ml-2 flex gap-1">
                                <button onClick={() => setEditingBehavior(behavior)} className="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-100 rounded-full transition" aria-label="Sửa">
                                    <PencilIcon className="w-5 h-5" />
                                </button>
                                <button onClick={() => onDelete(type, behavior.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full transition" aria-label="Xoá">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </motion.li>
                ))}
                </AnimatePresence>
            </ul>
        </div>
    );
};


interface BehaviorManagementProps {
    behaviors: { positive: Behavior[], negative: Behavior[] };
    onAdd: (type: BehaviorType, description: string, points: number) => void;
    onUpdate: (type: BehaviorType, id: number, description: string, points: number) => void;
    onDelete: (type: BehaviorType, id: number) => void;
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

const BehaviorManagement: React.FC<BehaviorManagementProps> = ({ behaviors, onAdd, onUpdate, onDelete }) => {
  return (
    <motion.div
      key="behaviors"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="space-y-8"
    >
        <h2 className="text-3xl font-bold text-slate-700">Quản lý Hành Vi</h2>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <BehaviorCard 
                title="Việc Làm Tốt"
                type="positive"
                behaviors={behaviors.positive}
                onAdd={onAdd}
                onUpdate={onUpdate}
                onDelete={onDelete}
            />
            <BehaviorCard 
                title="Cần Cố Gắng"
                type="negative"
                behaviors={behaviors.negative}
                onAdd={onAdd}
                onUpdate={onUpdate}
                onDelete={onDelete}
            />
        </div>
    </motion.div>
  );
};

export default BehaviorManagement;
