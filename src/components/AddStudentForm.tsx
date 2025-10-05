import React, { useState } from 'react';
import type { Team } from '../types';
import { UserPlusIcon } from './Icons';

interface AddStudentFormProps {
  teams: Team[];
  onAddStudent: (name: string, teamId: number) => void;
}

const AddStudentForm: React.FC<AddStudentFormProps> = ({ teams, onAddStudent }) => {
  const [name, setName] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<number>(teams.length > 0 ? teams[0].id : 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && selectedTeamId) {
      onAddStudent(name.trim(), selectedTeamId);
      setName('');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-sky-500">
      <h3 className="text-2xl font-bold mb-4 text-sky-600 flex items-center gap-2">
        <UserPlusIcon className="w-7 h-7" />
        Thêm Học Sinh Mới
      </h3>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tên học sinh"
          className="flex-grow p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-400 focus:border-transparent transition bg-white text-black"
        />
        <select
          value={selectedTeamId}
          onChange={(e) => setSelectedTeamId(Number(e.target.value))}
          className="p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-400 focus:border-transparent transition bg-white text-black"
        >
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-sky-500 text-white font-bold py-3 px-6 rounded-md hover:bg-sky-600 transition-colors duration-200 disabled:bg-slate-300"
          disabled={!name.trim()}
        >
          Thêm
        </button>
      </form>
    </div>
  );
};

export default AddStudentForm;