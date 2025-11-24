
import React, { useState } from 'react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onEmployeeLoginClick: () => void;
}

const ADMIN_PASSWORD = '2525';

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onEmployeeLoginClick }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setError('');
      onLoginSuccess();
    } else {
      setError('كلمة المرور غير صحيحة. الرجاء المحاولة مرة أخرى.');
      setPassword('');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-slate-800 rounded-2xl shadow-2xl">
        <h2 className="text-2xl font-bold text-center text-cyan-400 mb-6">دخول الإدارة</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">كلمة المرور</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white text-center focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                    autoFocus
                    required
                />
            </div>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg transition">
                دخول
            </button>
            <div className="text-center pt-4">
                <button type="button" onClick={onEmployeeLoginClick} className="text-sm text-slate-400 hover:text-cyan-400 transition">
                    العودة لتسجيل دخول الموظف
                </button>
            </div>
        </form>
    </div>
  );
};
