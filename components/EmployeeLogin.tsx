
import React, { useState } from 'react';
import { useEmployees } from '../context/EmployeeContext';

interface EmployeeLoginProps {
    onAdminLoginClick: () => void;
}

export const EmployeeLogin: React.FC<EmployeeLoginProps> = ({ onAdminLoginClick }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useEmployees();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(username, password);
    if (!success) {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة.');
    }
    // On success, the App component will re-render automatically
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-slate-800 rounded-2xl shadow-2xl">
      <h2 className="text-3xl font-bold text-center text-cyan-400 mb-6">تسجيل دخول الموظف</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-1">اسم المستخدم</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
            required
            autoFocus
          />
        </div>
        <div>
          <label htmlFor="password_hash" className="block text-sm font-medium text-slate-300 mb-1">كلمة المرور</label>
          <input
            type="password"
            id="password_hash"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
            required
          />
        </div>
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <button
          type="submit"
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
        >
          دخول
        </button>
        <div className="text-center pt-4">
            <button type="button" onClick={onAdminLoginClick} className="text-sm text-slate-400 hover:text-cyan-400 transition">
                دخول الإدارة
            </button>
        </div>
      </form>
    </div>
  );
};
