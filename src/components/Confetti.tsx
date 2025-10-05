import React from 'react';
import { motion } from 'framer-motion';

const confettiColors = ['#fde68a', '#fca5a5', '#818cf8', '#6ee7b7', '#a78bfa', '#f472b6'];
const numConfetti = 150;

const ConfettiPiece: React.FC<{ i: number }> = ({ i }) => {
  const xStart = Math.random() * window.innerWidth;
  const yStart = -20;
  const duration = 3 + Math.random() * 2; // 3 to 5 seconds
  const delay = Math.random() * 1.5;
  const rotateStart = Math.random() * 360;
  const rotateEnd = rotateStart + (Math.random() - 0.5) * 720;
  const size = 8 + Math.random() * 6;
  const color = confettiColors[i % confettiColors.length];

  return (
    <motion.div
      style={{
        position: 'fixed',
        left: xStart,
        top: yStart,
        width: size,
        height: size,
        backgroundColor: color,
        rotate: rotateStart,
        zIndex: 100,
        borderRadius: '50%',
      }}
      animate={{
        y: window.innerHeight + 20,
        x: xStart + (Math.random() - 0.5) * 300,
        rotate: rotateEnd,
        opacity: [1, 1, 0],
      }}
      transition={{
        duration,
        delay,
        ease: 'linear',
      }}
    />
  );
};

const Confetti: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none">
      {Array.from({ length: numConfetti }).map((_, i) => (
        <ConfettiPiece key={i} i={i} />
      ))}
    </div>
  );
};

export default Confetti;
