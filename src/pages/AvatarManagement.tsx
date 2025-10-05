import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CustomAvatar } from '../types';
import { AVATAR_OPTIONS } from '../constants';
import Avatar from '../components/Avatar';
import { TrashIcon, PhotoIcon } from '../components/Icons';

interface AvatarManagementProps {
    customAvatars: CustomAvatar[];
    onAddAvatar: (base64Data: string) => void;
    onDeleteAvatar: (id: number) => void;
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

const AvatarManagement: React.FC<AvatarManagementProps> = ({ customAvatars, onAddAvatar, onDeleteAvatar }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Simple validation
        if (!file.type.startsWith('image/')) {
            alert('Vui lòng chỉ chọn file hình ảnh.');
            return;
        }
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            alert('Kích thước file không được vượt quá 2MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            onAddAvatar(reader.result as string);
        };
        reader.onerror = (error) => {
            console.error("Error reading file:", error);
            alert("Đã có lỗi xảy ra khi đọc file.");
        };
        reader.readAsDataURL(file);

        // Reset file input
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };
    
    const handleDelete = (id: number) => {
        if(window.confirm('Bạn có chắc chắn muốn xoá avatar này?')) {
            onDeleteAvatar(id);
        }
    }

    return (
        <motion.div
            key="avatars"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="space-y-8"
        >
            <h2 className="text-3xl font-bold text-slate-700">Quản lý Avatar</h2>

            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-sky-500">
                <h3 className="text-2xl font-bold mb-4 text-sky-600">Avatar Tải Lên</h3>
                 <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/png, image/jpeg, image/gif, image/webp"
                        className="hidden"
                    />
                    <button
                        onClick={triggerFileInput}
                        className="aspect-square w-full bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:bg-sky-50 hover:border-sky-400 hover:text-sky-600 transition-colors"
                    >
                        <PhotoIcon className="w-8 h-8" />
                        <span className="text-xs font-semibold mt-1 text-center">Tải lên</span>
                    </button>
                     <AnimatePresence>
                    {customAvatars.map(avatar => (
                        <motion.div
                            key={avatar.id}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="relative group aspect-square"
                        >
                            <Avatar avatar={avatar.data} className="w-full h-full rounded-lg bg-slate-100 text-3xl" />
                            <button
                                onClick={() => handleDelete(avatar.id)}
                                className="absolute top-0 right-0 m-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                aria-label="Xoá avatar"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
                    </AnimatePresence>
                 </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-slate-500">
                <h3 className="text-2xl font-bold mb-4 text-slate-600">Avatar Mặc Định</h3>
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-4">
                    {AVATAR_OPTIONS.map(avatar => (
                        <div key={avatar} className="aspect-square">
                           <Avatar avatar={avatar} className="w-full h-full rounded-lg bg-slate-100 text-3xl" />
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default AvatarManagement;
