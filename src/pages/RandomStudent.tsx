import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Student, Team } from '../types';
import Avatar from '../components/Avatar';
import Confetti from '../components/Confetti';
import { CubeTransparentIcon, UsersIcon } from '../components/Icons';

interface RandomStudentProps {
  teams: Team[];
}

interface StudentWithTeam extends Student {
    teamColor: string;
    teamName: string;
}

type Mode = 'single' | 'double' | 'quad' | 'team';
type Result = StudentWithTeam[] | Team | null;
type SpinningItem = StudentWithTeam | Team;


const pageVariants = {
    initial: { opacity: 0, scale: 0.95 },
    in: { opacity: 1, scale: 1 },
    out: { opacity: 0, scale: 0.95 },
};

const pageTransition = {
    type: 'spring' as const,
    stiffness: 260,
    damping: 20
};

const RandomStudent: React.FC<RandomStudentProps> = ({ teams }) => {
  const [mode, setMode] = useState<Mode>('single');
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<Result>(null);
  const [spinningItems, setSpinningItems] = useState<SpinningItem[]>([]);
  
  const timeouts = useRef<number[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const allStudents = useMemo((): StudentWithTeam[] => {
    return teams.flatMap(team => 
      team.students.map(student => ({
        ...student,
        teamColor: team.color,
        teamName: team.name
      }))
    );
  }, [teams]);

  useEffect(() => {
    // Cleanup timeouts on component unmount
    return () => {
      timeouts.current.forEach(clearTimeout);
    };
  }, []);

    const playSuccessSound = () => {
        if (!audioCtxRef.current) return;
        const ctx = audioCtxRef.current;
        const now = ctx.currentTime;
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.25, now);
        masterGain.connect(ctx.destination);

        // Layer 1: Bright, fast arpeggio for the "win" feel
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            osc.connect(gainNode);
            gainNode.connect(masterGain);
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + i * 0.06);
            
            gainNode.gain.setValueAtTime(0, now + i * 0.06);
            gainNode.gain.linearRampToValueAtTime(0.8, now + i * 0.06 + 0.02); // Fast attack
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.5);
            
            osc.start(now + i * 0.06);
            osc.stop(now + i * 0.06 + 0.5);
        });

        // Layer 2: A shimmering noise burst for sparkle
        const noiseDuration = 0.4;
        const noiseSource = ctx.createBufferSource();
        const bufferSize = ctx.sampleRate * noiseDuration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1; // White noise
        }
        noiseSource.buffer = buffer;

        const bandpass = ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.setValueAtTime(800, now);
        bandpass.frequency.exponentialRampToValueAtTime(6000, now + noiseDuration * 0.8);
        bandpass.Q.value = 3;

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.2, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + noiseDuration);

        noiseSource.connect(bandpass);
        bandpass.connect(noiseGain);
        noiseGain.connect(masterGain);
        noiseSource.start(now);
        noiseSource.stop(now + noiseDuration);
    };

  const handleStartSpin = () => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];

    if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;

    const numToPick = mode === 'double' ? 2 : mode === 'quad' ? 4 : 1;
    const listToSpin = mode === 'team' ? teams : allStudents;
    
    if (listToSpin.length === 0) {
        alert("Không có đủ dữ liệu để quay.");
        return;
    }
    if (mode !== 'team' && listToSpin.length < numToPick) {
        alert(`Cần ít nhất ${numToPick} học sinh để quay.`);
        return;
    }
    
    setIsSpinning(true);
    setResult(null);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.1, ctx.currentTime);
    masterGain.connect(ctx.destination);

    const playTick = () => {
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
    };
    
    const totalDuration = 4000;
    let elapsed = 0;

    const finalizeSpin = () => {
        playSuccessSound();

        let finalResult: Result = null;
        switch(mode) {
            case 'single':
                finalResult = [allStudents[Math.floor(Math.random() * allStudents.length)]];
                break;
            case 'double':
            case 'quad':
                const numToSelect = mode === 'double' ? 2 : 4;
                const shuffled = [...allStudents].sort(() => 0.5 - Math.random());
                finalResult = shuffled.slice(0, numToSelect);
                break;
            case 'team':
                finalResult = teams[Math.floor(Math.random() * teams.length)];
                break;
        }
        setResult(finalResult);
        setIsSpinning(false);
        setSpinningItems([]);
    }

    const spin = () => {
        playTick();

        const numItems = mode === 'double' ? 2 : mode === 'quad' ? 4 : 1;
        const items = [];
        const list = mode === 'team' ? teams : allStudents;
        const usedIndexes = new Set<number>();

        for (let i = 0; i < numItems; i++) {
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * list.length);
            } while (usedIndexes.has(randomIndex) && list.length > numItems);
            usedIndexes.add(randomIndex);
            items.push(list[randomIndex]);
        }
        setSpinningItems(items);

        const progress = elapsed / totalDuration;
        const interval = 50 + Math.pow(progress, 3) * 400; 
        elapsed += interval;

        if (elapsed < totalDuration) {
           timeouts.current.push(window.setTimeout(spin, interval));
        } else {
           masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
           finalizeSpin();
        }
    };
    
    spin();
  };

  const renderInitialState = () => (
     <div className="text-center">
        <h2 className="text-4xl font-bold text-slate-700">Gọi Tên Ngẫu Nhiên</h2>
        <p className="text-slate-500 mt-2 mb-8">Chọn một chế độ và nhấn nút để bắt đầu!</p>
        
        <div className="flex flex-wrap justify-center bg-slate-100 rounded-lg p-1 my-4 max-w-lg mx-auto">
            {([
                { label: 'Gọi 1 HS', value: 'single' as Mode },
                { label: 'Gọi 2 HS', value: 'double' as Mode },
                { label: 'Gọi 4 HS', value: 'quad' as Mode },
                { label: 'Gọi 1 Tổ', value: 'team' as Mode }
            ]).map(item => (
                <button
                    key={item.value}
                    onClick={() => setMode(item.value)}
                    className={`flex-1 min-w-[100px] py-3 px-2 sm:px-4 rounded-md text-sm sm:text-base font-semibold transition-all duration-300 transform ${
                        mode === item.value ? 'bg-white shadow-md text-sky-600 scale-105' : 'text-slate-500 hover:bg-slate-200'
                    }`}
                >
                    {item.label}
                </button>
            ))}
        </div>

        <motion.button
            onClick={handleStartSpin}
            className="mt-8 bg-sky-500 text-white font-bold py-4 px-8 rounded-full shadow-lg text-2xl flex items-center gap-3 mx-auto"
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300 }}
        >
            <CubeTransparentIcon className="w-8 h-8"/>
            Bắt đầu quay
        </motion.button>
    </div>
  );
  
  const renderSpinningState = () => (
     <div className="flex flex-wrap items-center justify-center gap-8">
        {spinningItems.map((item, index) => (
             <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.07 }}
                className="text-center"
            >
                { 'students' in item ? ( // It's a Team
                    <div className={`w-48 h-48 rounded-2xl ${item.color} text-white mx-auto mb-4 border-8 border-white shadow-lg flex flex-col items-center justify-center p-4`}>
                        <UsersIcon className="w-16 h-16" />
                        <h3 className="text-3xl font-bold mt-2 text-center">{item.name}</h3>
                    </div>
                ) : ( // It's a Student
                    <>
                        <Avatar avatar={item.avatar} className={`w-40 h-40 rounded-full ${item.teamColor} text-white font-bold text-7xl mx-auto mb-4 border-8 border-white shadow-lg`} />
                        <h3 className="text-4xl font-bold text-slate-800">{item.name}</h3>
                    </>
                )}
            </motion.div>
        ))}
    </div>
  );
  
  const renderResultState = () => {
      if (!result) return null;

      const getButtonText = () => {
        switch(mode) {
            case 'single': return 'Gọi Lại 1 HS';
            case 'double': return 'Gọi Lại 2 HS';
            case 'quad': return 'Gọi Lại 4 HS';
            case 'team': return 'Gọi Lại 1 Tổ';
        }
      }

      return (
        <>
            <Confetti />
            <motion.div
                className="w-full"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', duration: 0.5, delay: 0.2 }}
            >
                {Array.isArray(result) && ( // Result is one or more students
                    <div className={`grid gap-4 sm:gap-6 w-full items-center ${
                        result.length === 4 ? 'grid-cols-2' :
                        result.length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
                        'grid-cols-1'
                    }`}>
                        {result.map((student) => {
                             const avatarSize = result.length === 1 ? 'w-40 h-40 sm:w-48 sm:h-48' : 'w-32 h-32 sm:w-40 sm:h-40';
                             const nameSize = result.length === 1 ? 'text-4xl sm:text-5xl' : 'text-3xl sm:text-4xl';
                             const avatarTextSize = result.length === 1 ? 'text-8xl' : 'text-6xl';

                            return (
                               <div key={student.id} className="text-center flex flex-col items-center">
                                    {result.length === 1 && <p className="text-2xl font-semibold text-amber-500">Học sinh được chọn là</p>}
                                    <Avatar avatar={student.avatar} className={`${avatarSize} rounded-full ${student.teamColor} text-white font-bold ${avatarTextSize} mx-auto my-4 border-8 border-white shadow-2xl`} />
                                    <h2 className={`${nameSize} font-black text-slate-800 drop-shadow-lg`}>{student.name}</h2>
                                    <p className={`mt-2 text-sm sm:text-base font-bold text-white px-3 py-1 inline-block rounded-full ${student.teamColor}`}>
                                        {student.teamName}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                )}
                {!Array.isArray(result) && ( // Result is a Team
                    <div className="text-center w-full">
                        <p className="text-2xl font-semibold text-amber-500">Tổ được chọn là</p>
                        <div className={`my-4 p-6 rounded-2xl ${result.color} text-white border-8 border-white shadow-2xl max-w-2xl mx-auto`}>
                            <h2 className="text-5xl sm:text-6xl font-black drop-shadow-lg">{result.name}</h2>
                            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-48 overflow-y-auto pr-2">
                                {result.students.map(student => (
                                    <div key={student.id} className="flex flex-col items-center text-center">
                                        <Avatar avatar={student.avatar} className="w-16 h-16 rounded-full bg-white/30 text-white font-bold text-2xl" />
                                        <p className="mt-1 font-semibold text-sm truncate w-full">{student.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                
                <motion.button
                    onClick={() => { setResult(null); }}
                    className="mt-12 bg-emerald-500 text-white font-bold py-3 px-6 rounded-full shadow-lg text-xl flex items-center gap-2 mx-auto"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <CubeTransparentIcon className="w-6 h-6"/>
                    {getButtonText()}
                </motion.button>
            </motion.div>
        </>
      )
  };

  return (
    <motion.div
      key="random"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 min-h-[70vh] flex items-center justify-center relative overflow-hidden"
    >
        <AnimatePresence mode="wait">
            {isSpinning && <motion.div key="spinning">{renderSpinningState()}</motion.div>}
            {!isSpinning && result && <motion.div key="result" className="w-full">{renderResultState()}</motion.div>}
            {!isSpinning && !result && <motion.div key="initial">{renderInitialState()}</motion.div>}
        </AnimatePresence>
    </motion.div>
  );
};

export default RandomStudent;
