import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { Student, Team, HistoryEntry, SchoolYear, Page, CustomAvatar } from './types';
import Header from './components/Header';
import PointModal from './components/PointModal';
import Toast from './components/Toast';
import Navbar from './components/Navbar';

// Pages
import Dashboard from './pages/Dashboard';
import StudentManagement from './pages/StudentManagement';
import BehaviorManagement from './pages/BehaviorManagement';
import RecordBehavior from './pages/RecordBehavior';
import Watchlist from './pages/Watchlist';
import Attendance from './pages/Attendance';
import SchoolYearManagement from './pages/SchoolYearManagement';
import AvatarManagement from './pages/AvatarManagement';
import RandomStudent from './pages/RandomStudent';

const INITIAL_TEAMS: Team[] = [
  { id: 1, name: 'Tổ 1 - Đoàn Kết', students: [], color: 'bg-sky-500' },
  { id: 2, name: 'Tổ 2 - Chăm Ngoan', students: [], color: 'bg-emerald-500' },
  { id: 3, name: 'Tổ 3 - Học Giỏi', students: [], color: 'bg-amber-500' },
  { id: 4, name: 'Tổ 4 - Vui Vẻ', students: [], color: 'bg-red-500' },
];

const INITIAL_BEHAVIORS = {
  positive: [
    { id: 1, description: 'Hăng hái phát biểu', points: 10 },
    { id: 2, description: 'Giúp đỡ bạn bè', points: 15 },
    { id: 3, description: 'Hoàn thành tốt nhiệm vụ', points: 10 },
    { id: 4, description: 'Giữ gìn vệ sinh chung', points: 5 },
  ],
  negative: [
    { id: 1, description: 'Nói chuyện riêng', points: -5 },
    { id: 2, description: 'Không làm bài tập', points: -10 },
    { id: 3, description: 'Đi học muộn', points: -5 },
    { id: 4, description: 'Mất trật tự', points: -5 },
  ],
};

const INITIAL_SCHOOL_YEARS: SchoolYear[] = [
    { id: 1, name: "Năm học 2023-2024", startDate: "2023-09-05", endDate: "2024-05-25" }
]

type AttendanceStatus = 'present' | 'excused' | 'unexcused';

const App: React.FC = () => {
    const [activeSchoolYearId, setActiveSchoolYearId] = useState<number | null>(null);
    const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
    
    const [teams, setTeams] = useState<Team[]>([]);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [behaviors, setBehaviors] = useState(INITIAL_BEHAVIORS);
    const [attendance, setAttendance] = useState<Record<string, Record<number, AttendanceStatus>>>({});
    const [customAvatars, setCustomAvatars] = useState<CustomAvatar[]>([]);

    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isPointModalOpen, setIsPointModalOpen] = useState(false);

    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');

    const activeSchoolYear = schoolYears.find(sy => sy.id === activeSchoolYearId);
    const storageKeyPrefix = activeSchoolYearId ? `classroom_app_${activeSchoolYearId}` : null;

    // Load/Save School Year data
    useEffect(() => {
        try {
            const savedYears = localStorage.getItem('classroom_app_school_years');
            const savedActiveId = localStorage.getItem('classroom_app_active_school_year_id');

            if (savedYears) {
                setSchoolYears(JSON.parse(savedYears));
            } else {
                setSchoolYears(INITIAL_SCHOOL_YEARS);
            }

            if (savedActiveId) {
                setActiveSchoolYearId(JSON.parse(savedActiveId));
            } else {
                setActiveSchoolYearId(INITIAL_SCHOOL_YEARS[0]?.id || null);
            }
        } catch (error) {
            console.error("Failed to load school year data:", error);
            setSchoolYears(INITIAL_SCHOOL_YEARS);
            setActiveSchoolYearId(INITIAL_SCHOOL_YEARS[0]?.id || null);
        }
    }, []);

    // Load data for the active school year
    useEffect(() => {
        if (!storageKeyPrefix) return;
        try {
            const savedTeams = localStorage.getItem(`${storageKeyPrefix}_teams`);
            const savedHistory = localStorage.getItem(`${storageKeyPrefix}_history`);
            const savedBehaviors = localStorage.getItem(`${storageKeyPrefix}_behaviors`);
            const savedAttendance = localStorage.getItem(`${storageKeyPrefix}_attendance`);
            const savedAvatars = localStorage.getItem(`${storageKeyPrefix}_custom_avatars`);

            setTeams(savedTeams ? JSON.parse(savedTeams) : INITIAL_TEAMS);
            setHistory(savedHistory ? JSON.parse(savedHistory) : []);
            setBehaviors(savedBehaviors ? JSON.parse(savedBehaviors) : INITIAL_BEHAVIORS);
            setAttendance(savedAttendance ? JSON.parse(savedAttendance) : {});
            setCustomAvatars(savedAvatars ? JSON.parse(savedAvatars) : []);

        } catch (error) {
            console.error("Failed to load data for school year:", activeSchoolYearId, error);
        }
    }, [storageKeyPrefix, activeSchoolYearId]);

    // Save data for the active school year
    useEffect(() => {
        if (!storageKeyPrefix) return;
        try {
            localStorage.setItem(`${storageKeyPrefix}_teams`, JSON.stringify(teams));
            localStorage.setItem(`${storageKeyPrefix}_history`, JSON.stringify(history));
            localStorage.setItem(`${storageKeyPrefix}_behaviors`, JSON.stringify(behaviors));
            localStorage.setItem(`${storageKeyPrefix}_attendance`, JSON.stringify(attendance));
            localStorage.setItem(`${storageKeyPrefix}_custom_avatars`, JSON.stringify(customAvatars));
        } catch (error) {
            console.error("Failed to save data:", error);
        }
    }, [teams, history, behaviors, attendance, customAvatars, storageKeyPrefix]);
    
    // Save school year data
    useEffect(() => {
        try {
            localStorage.setItem('classroom_app_school_years', JSON.stringify(schoolYears));
            if (activeSchoolYearId) {
                localStorage.setItem('classroom_app_active_school_year_id', JSON.stringify(activeSchoolYearId));
            }
        } catch (error) {
            console.error("Failed to save school year data:", error);
        }
    }, [schoolYears, activeSchoolYearId])

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleSelectStudent = (student: Student) => {
        setSelectedStudent(student);
        setIsPointModalOpen(true);
    };

    const handleUpdateScore = useCallback((studentId: number, points: number, reason: string) => {
        setTeams(prevTeams => {
            const newTeams = prevTeams.map(team => ({
                ...team,
                students: team.students.map(student =>
                    student.id === studentId
                        ? { ...student, score: student.score + points }
                        : student
                ),
            }));

            const student = newTeams.flatMap(t => t.students).find(s => s.id === studentId);
            const team = newTeams.find(t => t.students.some(s => s.id === studentId));

            if (student && team) {
                const newHistoryEntry: HistoryEntry = {
                    id: `${Date.now()}-${studentId}`,
                    timestamp: Date.now(),
                    studentName: student.name,
                    teamName: team.name,
                    points,
                    reason,
                };
                setHistory(prevHistory => [newHistoryEntry, ...prevHistory]);
            }
            return newTeams;
        });
    }, []);
    
    const handleBatchUpdateScore = (studentIds: number[], points: number, reason: string) => {
        studentIds.forEach(id => handleUpdateScore(id, points, reason));
        showToast(`Đã ghi nhận "${reason}" for ${studentIds.length} học sinh.`);
    };

    const handleBulkAddStudent = (names: string[], teamId: number) => {
        setTeams(prevTeams => {
            const newStudents: Student[] = names.map(name => ({
                id: Date.now() + Math.random(), // Add random to avoid collision in fast loops
                name,
                score: 0,
                avatar: name.charAt(0).toUpperCase(),
            }));
             const newTeams = prevTeams.map(team =>
                team.id === teamId
                    ? { ...team, students: [...team.students, ...newStudents] }
                    : team
            );
            showToast(`Đã thêm ${names.length} học sinh mới.`);
            return newTeams;
        });
    };

    const handleUpdateStudent = (studentId: number, name: string, teamId: number, avatar: string) => {
        setTeams(prevTeams => {
            let studentToMove: Student | undefined;
            const teamsWithoutStudent = prevTeams.map(team => {
                const student = team.students.find(s => s.id === studentId);
                if (student) {
                    studentToMove = { ...student, name, avatar };
                    return { ...team, students: team.students.filter(s => s.id !== studentId) };
                }
                return team;
            });

            if (!studentToMove) return prevTeams;

            const newTeams = teamsWithoutStudent.map(team => {
                if (team.id === teamId) {
                    return { ...team, students: [...team.students, studentToMove!] };
                }
                return team;
            });
            showToast(`Đã cập nhật thông tin cho ${name}.`);
            return newTeams;
        });
    };

    const handleDeleteStudent = (studentId: number) => {
        setTeams(prevTeams => {
            const studentName = prevTeams.flatMap(t => t.students).find(s => s.id === studentId)?.name;
            const newTeams = prevTeams.map(team => ({
                ...team,
                students: team.students.filter(student => student.id !== studentId),
            }));
            if (studentName) showToast(`Đã xoá học sinh ${studentName}.`);
            return newTeams;
        });
    };
    
    const handleAddTeam = (name: string, color: string) => {
        const newTeam: Team = {
            id: Date.now(),
            name,
            students: [],
            color,
        };
        setTeams(prev => [...prev, newTeam]);
        showToast(`Đã thêm tổ ${name}.`);
    };

    const handleUpdateTeam = (teamId: number, newName: string, newColor: string) => {
        setTeams(prev => prev.map(team =>
            team.id === teamId ? { ...team, name: newName, color: newColor } : team
        ));
        showToast(`Đã cập nhật tổ ${newName}.`);
    };

    const handleDeleteTeam = (teamId: number) => {
        const teamName = teams.find(t => t.id === teamId)?.name;
        setTeams(prev => prev.filter(team => team.id !== teamId));
        if (teamName) showToast(`Đã xoá tổ ${teamName}.`);
    };
    
    const handleAddBehavior = (type: 'positive' | 'negative', description: string, points: number) => {
        setBehaviors(prev => {
            const newBehavior = {
                id: Date.now(),
                description,
                points: type === 'positive' ? points : -points
            };
            return {
                ...prev,
                [type]: [...prev[type], newBehavior]
            }
        });
        showToast(`Đã thêm hành vi mới.`);
    };

    const handleUpdateBehavior = (type: 'positive' | 'negative', id: number, description: string, points: number) => {
         setBehaviors(prev => ({
            ...prev,
            [type]: prev[type].map(b => b.id === id ? { ...b, description, points: type === 'positive' ? points : -points } : b)
         }));
         showToast(`Đã cập nhật hành vi.`);
    };

    const handleDeleteBehavior = (type: 'positive' | 'negative', id: number) => {
        setBehaviors(prev => ({
            ...prev,
            [type]: prev[type].filter(b => b.id !== id)
        }));
        showToast(`Đã xoá hành vi.`);
    };

    const handleSaveAttendance = (dateKey: string, dayAttendance: Map<number, AttendanceStatus>) => {
        setAttendance(prev => ({
            ...prev,
            [dateKey]: Object.fromEntries(dayAttendance)
        }));
        showToast(`Đã lưu điểm danh ngày ${dateKey.split('-').reverse().join('/')}.`);
    };
    
    const handleAddSchoolYear = (data: Omit<SchoolYear, 'id'>) => {
        const newYear: SchoolYear = { ...data, id: Date.now() };
        setSchoolYears(prev => [...prev, newYear]);
        showToast(`Đã thêm năm học mới: ${data.name}`);
    };

    const handleUpdateSchoolYear = (id: number, data: Omit<SchoolYear, 'id'>) => {
        setSchoolYears(prev => prev.map(sy => sy.id === id ? { ...data, id } : sy));
        showToast(`Đã cập nhật năm học: ${data.name}`);
    };

    const handleDeleteSchoolYear = (id: number) => {
        if (schoolYears.length <= 1) {
            showToast("Không thể xoá năm học cuối cùng.");
            return;
        }
        if (id === activeSchoolYearId) {
            showToast("Không thể xoá năm học đang hoạt động.");
            return;
        }
        if (window.confirm("Bạn có chắc muốn xoá năm học này? Mọi dữ liệu liên quan sẽ bị mất.")) {
            const yearName = schoolYears.find(sy => sy.id === id)?.name;
            setSchoolYears(prev => prev.filter(sy => sy.id !== id));
            localStorage.removeItem(`classroom_app_${id}_teams`);
            localStorage.removeItem(`classroom_app_${id}_history`);
            localStorage.removeItem(`classroom_app_${id}_behaviors`);
            localStorage.removeItem(`classroom_app_${id}_attendance`);
            localStorage.removeItem(`classroom_app_${id}_custom_avatars`);
            showToast(`Đã xoá năm học ${yearName}.`);
        }
    };

    const handleSetActiveSchoolYear = (id: number) => {
        setActiveSchoolYearId(id);
        showToast(`Đã chuyển sang năm học ${schoolYears.find(sy => sy.id === id)?.name}.`);
    };

    const handleAddCustomAvatar = (data: string) => {
        const newAvatar: CustomAvatar = { id: Date.now(), data };
        setCustomAvatars(prev => [...prev, newAvatar]);
        showToast("Đã thêm avatar mới.");
    };

    const handleDeleteCustomAvatar = (id: number) => {
        setCustomAvatars(prev => prev.filter(avatar => avatar.id !== id));
        showToast("Đã xoá avatar.");
    };

    const handleResetData = () => {
        if (window.confirm('Bạn có chắc chắn muốn bắt đầu lại tuần thi đua không? Tất cả điểm của học sinh sẽ được đặt lại về 0 và lịch sử sẽ bị xoá.')) {
            setTeams(prevTeams => prevTeams.map(team => ({
                ...team,
                students: team.students.map(student => ({ ...student, score: 0 })),
            })));
            setHistory([]);
            showToast('Đã bắt đầu lại tuần thi đua mới!');
        }
    };
    
    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <Dashboard teams={teams} history={history} onSelectStudent={handleSelectStudent} />;
            case 'record':
                return <RecordBehavior teams={teams} behaviors={behaviors} onBatchUpdateScore={handleBatchUpdateScore} />;
            case 'attendance':
                return <Attendance teams={teams} attendance={attendance} onSaveAttendance={handleSaveAttendance} />;
            case 'random':
                return <RandomStudent teams={teams} />;
            case 'watchlist':
                return <Watchlist teams={teams} history={history} />;
            case 'students':
                return <StudentManagement
                    teams={teams}
                    onUpdateStudent={handleUpdateStudent}
                    onDeleteStudent={handleDeleteStudent}
                    onAddTeam={handleAddTeam}
                    onUpdateTeam={handleUpdateTeam}
                    onDeleteTeam={handleDeleteTeam}
                    onBulkAddStudent={handleBulkAddStudent}
                    customAvatars={customAvatars}
                />;
            case 'behaviors':
                return <BehaviorManagement
                    behaviors={behaviors}
                    onAdd={handleAddBehavior}
                    onUpdate={handleUpdateBehavior}
                    onDelete={handleDeleteBehavior}
                />;
            case 'avatars':
                return <AvatarManagement
                    customAvatars={customAvatars}
                    onAddAvatar={handleAddCustomAvatar}
                    onDeleteAvatar={handleDeleteCustomAvatar}
                />;
            case 'schoolYears':
                return <SchoolYearManagement
                    schoolYears={schoolYears}
                    activeSchoolYearId={activeSchoolYearId}
                    onAdd={handleAddSchoolYear}
                    onUpdate={handleUpdateSchoolYear}
                    onDelete={handleDeleteSchoolYear}
                    onSetActive={handleSetActiveSchoolYear}
                />
            default:
                return <Dashboard teams={teams} history={history} onSelectStudent={handleSelectStudent} />;
        }
    }

    return (
        <div className="bg-slate-100 min-h-screen font-sans">
            <Header onResetData={handleResetData} activeSchoolYearName={activeSchoolYear?.name} />
            <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
            
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
               <AnimatePresence mode="wait">
                 {renderPage()}
               </AnimatePresence>
            </main>

            <AnimatePresence>
                {isPointModalOpen && (
                    <PointModal
                        isOpen={isPointModalOpen}
                        onClose={() => setIsPointModalOpen(false)}
                        student={selectedStudent}
                        onUpdateScore={(studentId, points, reason) => {
                            handleUpdateScore(studentId, points, reason);
                            showToast(`${points > 0 ? '+' : ''}${points} điểm cho ${selectedStudent?.name}: ${reason}`);
                        }}
                    />
                )}
            </AnimatePresence>

            <Toast message={toastMessage} />
        </div>
    );
};

export default App;
