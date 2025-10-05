import React, { useEffect, useRef } from 'react';
import { motion, useSpring, useTransform, useAnimation } from 'framer-motion';

interface AnimatedScoreProps {
  score: number;
}

const AnimatedScore: React.FC<AnimatedScoreProps> = ({ score }) => {
  const spring = useSpring(score, {
    mass: 0.8,
    stiffness: 100,
    damping: 15,
  });

  const rounded = useTransform(spring, (latest) => Math.round(latest));
  
  const controls = useAnimation();
  const prevScore = useRef(score);

  useEffect(() => {
    spring.set(score);
    
    // Animate only when the score value actually changes
    if (score !== prevScore.current) {
      const isIncrease = score > prevScore.current;
      
      controls.start({
        scale: isIncrease ? [1, 1.3, 1] : [1, 0.7, 1],
        textShadow: isIncrease
          ? [
              "0px 0px 0px rgba(16, 185, 129, 0)",
              "0px 0px 10px rgba(16, 185, 129, 0.7)",
              "0px 0px 0px rgba(16, 185, 129, 0)",
            ]
          : [
              "0px 0px 0px rgba(239, 68, 68, 0)",
              "0px 0px 10px rgba(239, 68, 68, 0.7)",
              "0px 0px 0px rgba(239, 68, 68, 0)",
            ],
        transition: { duration: 0.5, ease: "easeOut" },
      });
    }
    
    // Update the ref to the current score for the next render
    prevScore.current = score;

  }, [score, spring, controls]);

  return (
    <motion.span animate={controls} style={{ display: 'inline-block' }}>
      {rounded}
    </motion.span>
  );
};

export default AnimatedScore;
