import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';

// --- Firebase Imports ---
import { db } from './firebase';
import { doc, onSnapshot, setDoc, updateDoc, getDoc } from 'firebase/firestore';

// --- Tạm thời thêm vào để debug, sau này có thể xóa đi ---
(window as any).db = db;
(window as any).doc = doc;
(window as any).setDoc = setDoc;
(window as any).getDoc = getDoc;
// ---------------------------------------------------------

// --- Local Type and Component Imports ---
import type { Student, Team, HistoryEntry, SchoolYear, Page, CustomAvatar } from './types';
import Header from './components/Header';
import PointModal from './components/PointModal';
import Toast from './components/Toast';
import Navbar from './components/Navbar';

// --- Page Imports ---
import Dashboard from './pages/Dashboard';
import StudentManagement from './pages/StudentManagement';
import BehaviorManagement from './pages/BehaviorManagement';
import RecordBehavior from './pages/RecordBehavior';
import Watchlist from './pages/Watchlist';
import Attendance from './pages/Attendance';
import SchoolYearManagement from './pages/SchoolYearManagement';
import AvatarManagement from './pages/AvatarManagement';
import RandomStudent from './pages/RandomStudent';

// --- Các giá trị khởi tạo ban đầu (dùng khi tạo năm học mới) ---
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
    // State của ứng dụng, không thay đổi nhiều
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
    const [isLoading, setIsLoading] = useState(true); // Thêm state loading

    const activeSchoolYear = schoolYears.find(sy => sy.id === activeSchoolYearId);

    // --- LOGIC MỚI: ĐỌC/GHI DỮ LIỆU VỚI FIRESTORE ---

    // 1. Đọc danh sách năm học và ID năm học đang hoạt động
    useEffect(() => {
        const metaRef = doc(db, 'appData', 'meta');
        const unsubscribe = onSnapshot(metaRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setSchoolYears(data.schoolYears || INITIAL_SCHOOL_YEARS);
                setActiveSchoolYearId(data.activeSchoolYearId || INITIAL_SCHOOL_YEARS[0]?.id || null);
            } else {
                // Nếu chưa có dữ liệu meta, tạo mới
                setSchoolYears(INITIAL_SCHOOL_YEARS);
                setActiveSchoolYearId(INITIAL_SCHOOL_YEARS[0]?.id || null);
                setDoc(metaRef, { 
                    schoolYears: INITIAL_SCHOOL_YEARS, 
                    activeSchoolYearId: INITIAL_SCHOOL_YEARS[0]?.id || null 
                });
            }
        });
        return () => unsubscribe(); // Hủy lắng nghe khi component unmount
    }, []);

    // 2. Lắng nghe và cập nhật dữ liệu của năm học đang hoạt động
    useEffect(() => {
        if (!activeSchoolYearId) return;
        setIsLoading(true);
        const yearDataRef = doc(db, 'schoolYears', String(activeSchoolYearId));
        
        const unsubscribe = onSnapshot(yearDataRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setTeams(data.teams || INITIAL_TEAMS);
                setHistory(data.history || []);
                setBehaviors(data.behaviors || INITIAL_BEHAVIORS);
                setAttendance(data.attendance || {});
                setCustomAvatars(data.customAvatars || []);
            } else {
                // Nếu là năm học mới chưa có dữ liệu, tạo document mới
                const initialData = {
                    teams: INITIAL_TEAMS,
                    history: [],
                    behaviors: INITIAL_BEHAVIORS,
                    attendance: {},
                    customAvatars: [],
                };
                setDoc(yearDataRef, initialData).then(() => {
                    // Cập nhật state sau khi tạo
                    setTeams(initialData.teams);
                    setHistory(initialData.history);
                    setBehaviors(initialData.behaviors);
                    setAttendance(initialData.attendance);
                    setCustomAvatars(initialData.customAvatars);
                });
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [activeSchoolYearId]);

    // Hàm tiện ích để cập nhật document của năm học hiện tại
    const updateYearData = useCallback(async (dataToUpdate: object) => {
        if (!activeSchoolYearId) return;
        const yearDataRef = doc(db, 'schoolYears', String(activeSchoolYearId));
        try {
            await updateDoc(yearDataRef, dataToUpdate);
        } catch (error) {
            console.error("Failed to update year data:", error);
            // Nếu lỗi do document chưa tồn tại, hãy tạo nó
            if ((error as any).code === 'not-found') {
                 await setDoc(yearDataRef, dataToUpdate);
            }
        }
    }, [activeSchoolYearId]);

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleSelectStudent = (student: Student) => {
        setSelectedStudent(student);
        setIsPointModalOpen(true);
    };

    // --- CÁC HÀM XỬ LÝ ĐÃ ĐƯỢC CẬP NHẬT ĐỂ GHI LÊN FIRESTORE ---

    const handleUpdateScore = useCallback(async (studentId: number, points: number, reason: string) => {
        const newTeams = teams.map(team => ({
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
            const newHistory = [newHistoryEntry, ...history];
            await updateYearData({ teams: newTeams, history: newHistory });
        }
    }, [teams, history, updateYearData]);
    
    const handleBatchUpdateScore = async (studentIds: number[], points: number, reason: string) => {
    // Nếu không có học sinh nào được chọn thì không làm gì cả
    if (studentIds.length === 0) return;

    // Dùng Set để kiểm tra ID học sinh nhanh hơn
    const studentIdSet = new Set(studentIds);
    const newHistoryEntries: HistoryEntry[] = [];

    // 1. Tính toán điểm mới cho tất cả học sinh trong một lần duyệt
    const newTeams = teams.map(team => ({
        ...team,
        students: team.students.map(student => {
            // Nếu ID của học sinh này nằm trong danh sách được chọn
            if (studentIdSet.has(student.id)) {
                // Tạo một bản ghi lịch sử cho học sinh này
                newHistoryEntries.push({
                    id: `${Date.now()}-${student.id}`,
                    timestamp: Date.now(),
                    studentName: student.name,
                    teamName: team.name,
                    points,
                    reason,
                });
                // Trả về thông tin học sinh với điểm đã được cập nhật
                return { ...student, score: student.score + points };
            }
            // Nếu không thì giữ nguyên thông tin học sinh
            return student;
        }),
    }));

    // 2. Cập nhật state và ghi lên Firestore MỘT LẦN DUY NHẤT
    // Đảo ngược các bản ghi mới để giữ đúng thứ tự thời gian khi thêm vào đầu mảng
    const newHistory = [...newHistoryEntries.reverse(), ...history];
    await updateYearData({ teams: newTeams, history: newHistory });

    // Hiển thị thông báo thành công
    showToast(`Đã ghi nhận "${reason}" cho ${studentIds.length} học sinh.`);
};

    const handleBulkAddStudent = async (names: string[], teamId: number) => {
        const newStudents: Student[] = names.map(name => ({
            id: Date.now() + Math.random(),
            name,
            score: 0,
            avatar: name.charAt(0).toUpperCase(),
        }));
        const newTeams = teams.map(team =>
            team.id === teamId
                ? { ...team, students: [...team.students, ...newStudents] }
                : team
        );
        await updateYearData({ teams: newTeams });
        showToast(`Đã thêm ${names.length} học sinh mới.`);
    };

    const handleUpdateStudent = async (studentId: number, name: string, teamId: number, avatar: string) => {
        let studentToMove: Student | undefined;
        const teamsWithoutStudent = teams.map(team => {
            const student = team.students.find(s => s.id === studentId);
            if (student) {
                studentToMove = { ...student, name, avatar };
                return { ...team, students: team.students.filter(s => s.id !== studentId) };
            }
            return team;
        });

        if (!studentToMove) return;

        const newTeams = teamsWithoutStudent.map(team => {
            if (team.id === teamId) {
                return { ...team, students: [...team.students, studentToMove!] };
            }
            return team;
        });
        await updateYearData({ teams: newTeams });
        showToast(`Đã cập nhật thông tin cho ${name}.`);
    };

    const handleDeleteStudent = async (studentId: number) => {
        const studentName = teams.flatMap(t => t.students).find(s => s.id === studentId)?.name;
        const newTeams = teams.map(team => ({
            ...team,
            students: team.students.filter(student => student.id !== studentId),
        }));
        await updateYearData({ teams: newTeams });
        if (studentName) showToast(`Đã xoá học sinh ${studentName}.`);
    };
    
    const handleAddTeam = async (name: string, color: string) => {
        const newTeam: Team = { id: Date.now(), name, students: [], color };
        const newTeams = [...teams, newTeam];
        await updateYearData({ teams: newTeams });
        showToast(`Đã thêm tổ ${name}.`);
    };

    const handleUpdateTeam = async (teamId: number, newName: string, newColor: string) => {
        const newTeams = teams.map(team =>
            team.id === teamId ? { ...team, name: newName, color: newColor } : team
        );
        await updateYearData({ teams: newTeams });
        showToast(`Đã cập nhật tổ ${newName}.`);
    };

    const handleDeleteTeam = async (teamId: number) => {
        const teamName = teams.find(t => t.id === teamId)?.name;
        const newTeams = teams.filter(team => team.id !== teamId);
        await updateYearData({ teams: newTeams });
        if (teamName) showToast(`Đã xoá tổ ${teamName}.`);
    };
    
    const handleAddBehavior = async (type: 'positive' | 'negative', description: string, points: number) => {
        const newBehavior = { id: Date.now(), description, points: type === 'positive' ? points : -points };
        const newBehaviors = { ...behaviors, [type]: [...behaviors[type], newBehavior] };
        await updateYearData({ behaviors: newBehaviors });
        showToast(`Đã thêm hành vi mới.`);
    };

    const handleUpdateBehavior = async (type: 'positive' | 'negative', id: number, description: string, points: number) => {
        const newBehaviors = {
            ...behaviors,
            [type]: behaviors[type].map(b => b.id === id ? { ...b, description, points: type === 'positive' ? points : -points } : b)
        };
        await updateYearData({ behaviors: newBehaviors });
        showToast(`Đã cập nhật hành vi.`);
    };

    const handleDeleteBehavior = async (type: 'positive' | 'negative', id: number) => {
        const newBehaviors = { ...behaviors, [type]: behaviors[type].filter(b => b.id !== id) };
        await updateYearData({ behaviors: newBehaviors });
        showToast(`Đã xoá hành vi.`);
    };

    const handleSaveAttendance = async (dateKey: string, dayAttendance: Map<number, AttendanceStatus>) => {
        const newAttendance = { ...attendance, [dateKey]: Object.fromEntries(dayAttendance) };
        await updateYearData({ attendance: newAttendance });
        // showToast: Logic này đã được xử lý bên trong component Attendance
    };
    
    // --- Các hàm quản lý năm học (cập nhật document 'appData/meta') ---
    const handleAddSchoolYear = async (data: Omit<SchoolYear, 'id'>) => {
        const newYear: SchoolYear = { ...data, id: Date.now() };
        const newSchoolYears = [...schoolYears, newYear];
        await setDoc(doc(db, 'appData', 'meta'), { schoolYears: newSchoolYears }, { merge: true });
        showToast(`Đã thêm năm học mới: ${data.name}`);
    };

    const handleUpdateSchoolYear = async (id: number, data: Omit<SchoolYear, 'id'>) => {
        const newSchoolYears = schoolYears.map(sy => sy.id === id ? { ...data, id } : sy);
        await setDoc(doc(db, 'appData', 'meta'), { schoolYears: newSchoolYears }, { merge: true });
        showToast(`Đã cập nhật năm học: ${data.name}`);
    };

    const handleDeleteSchoolYear = async (id: number) => {
        if (schoolYears.length <= 1) { showToast("Không thể xoá năm học cuối cùng."); return; }
        if (id === activeSchoolYearId) { showToast("Không thể xoá năm học đang hoạt động."); return; }
        
        if (window.confirm("Bạn có chắc muốn xoá năm học này? Mọi dữ liệu của năm học này trên server sẽ bị xoá vĩnh viễn.")) {
            const yearName = schoolYears.find(sy => sy.id === id)?.name;
            const newSchoolYears = schoolYears.filter(sy => sy.id !== id);
            
            // Cập nhật danh sách năm học
            await setDoc(doc(db, 'appData', 'meta'), { schoolYears: newSchoolYears }, { merge: true });

            // Xoá document của năm học đó (Lưu ý: Firebase không có hàm xoá trực tiếp, cần xử lý ở backend hoặc để trống)
            // Cách đơn giản là ghi đè bằng object rỗng
            await setDoc(doc(db, 'schoolYears', String(id)), {}); 
            showToast(`Đã xoá năm học ${yearName}.`);
        }
    };

    const handleSetActiveSchoolYear = async (id: number) => {
        await setDoc(doc(db, 'appData', 'meta'), { activeSchoolYearId: id }, { merge: true });
        showToast(`Đã chuyển sang năm học ${schoolYears.find(sy => sy.id === id)?.name}.`);
    };

    // --- Các hàm quản lý Avatar ---
    const handleAddCustomAvatar = async (data: string) => {
        const newAvatar: CustomAvatar = { id: Date.now(), data };
        const newCustomAvatars = [...customAvatars, newAvatar];
        await updateYearData({ customAvatars: newCustomAvatars });
        showToast("Đã thêm avatar mới.");
    };

    const handleDeleteCustomAvatar = async (id: number) => {
        const newCustomAvatars = customAvatars.filter(avatar => avatar.id !== id);
        await updateYearData({ customAvatars: newCustomAvatars });
        showToast("Đã xoá avatar.");
    };

    const handleResetData = async () => {
        // Logic xác nhận đã được chuyển vào Header.tsx, ở đây chỉ thực hiện lệnh xóa
        const resetTeams = teams.map(team => ({
            ...team,
            students: team.students.map(student => ({ ...student, score: 0 })),
        }));
        await updateYearData({ teams: resetTeams, history: [] });
        showToast('Đã bắt đầu lại tuần thi đua mới!');
    };
    
    const renderPage = () => {
        if (isLoading) {
            return <div className="text-center p-10">Đang tải dữ liệu từ server...</div>;
        }

        switch (currentPage) {
            case 'dashboard':
                return <Dashboard teams={teams} history={history} onSelectStudent={handleSelectStudent} />;
            case 'record':
                // QUAN TRỌNG: Truyền attendance vào đây
                return <RecordBehavior 
                    teams={teams} 
                    behaviors={behaviors} 
                    onBatchUpdateScore={handleBatchUpdateScore}
                    attendance={attendance} 
                />;
            case 'attendance':
                // QUAN TRỌNG: Truyền onBatchUpdateScore vào đây
                return <Attendance 
                    teams={teams} 
                    attendance={attendance} 
                    onSaveAttendance={handleSaveAttendance} 
                    onBatchUpdateScore={handleBatchUpdateScore}
                />;
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
//cập nhật v8