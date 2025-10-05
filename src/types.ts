export interface Student {
  id: number;
  name: string;
  score: number;
  avatar: string;
}

export interface Team {
  id: number;
  name: string;
  students: Student[];
  color: string;
}

export interface Behavior {
  id: number;
  description: string;
  points: number;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  studentName: string;
  teamName: string;
  points: number;
  reason: string;
}

export interface SchoolYear {
  id: number;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

export interface CustomAvatar {
  id: number;
  data: string; // base64 string
}

export type Page = 'dashboard' | 'record' | 'attendance' | 'watchlist' | 'students' | 'behaviors' | 'schoolYears' | 'avatars' | 'random';