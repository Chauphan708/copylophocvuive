import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
  message: string | null;
}

const Toast: React.FC<ToastProps> = ({ message }) => {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-md"
        >
          <div className="bg-slate-800 text-white font-semibold py-3 px-6 rounded-full shadow-lg text-center">
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export default Toast;
