
import React, { useState } from 'react';
import { SalesProvider } from './context/SalesContext';
import { EmployeeProvider, useEmployees } from './context/EmployeeContext';
import { EmployeeView } from './components/EmployeeView';
import { AdminLogin } from './components/AdminLogin';
import { EmployeeLogin } from './components/EmployeeLogin';
import { AdminView } from './components/AdminView';

const Layout = ({ children, user, onLogout }: { children: React.ReactNode, user?: string, onLogout?: () => void }) => (
  <div className="min-h-screen container mx-auto px-4 py-8">
    <header className="text-center p-4 my-6 flex flex-col md:flex-row justify-between items-center gap-4">
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
        نظام إدارة نقاط البيع
      </h1>
      {user && onLogout && (
        <div className="flex items-center gap-4 bg-slate-800 p-2 rounded-full">
          <span className="text-slate-300 pr-4">مرحباً, {user}</span>
          <button onClick={onLogout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full transition">
            تسجيل الخروج
          </button>
        </div>
      )}
    </header>
    <main>
      {children}
    </main>
  </div>
);

function App() {
  const { state: { currentUser }, logout: logoutEmployee } = useEmployees();
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [authScreen, setAuthScreen] = useState<'employee' | 'admin'>('employee');

  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    setAuthScreen('employee'); // Reset for next time
  };
  
  const handleLogout = () => {
    if (currentUser) {
        logoutEmployee();
    }
    if (isAdminAuthenticated) {
        setIsAdminAuthenticated(false);
    }
  };

  if (currentUser) {
    return (
      <Layout user={currentUser.name} onLogout={handleLogout}>
        <EmployeeView />
      </Layout>
    );
  }

  if (isAdminAuthenticated) {
    return (
      <Layout user="المدير" onLogout={handleLogout}>
        <AdminView />
      </Layout>
    );
  }

  // Not authenticated, show login screens
  return (
    <Layout>
      {authScreen === 'employee' ? (
        <EmployeeLogin 
          onAdminLoginClick={() => setAuthScreen('admin')}
        />
      ) : (
        <AdminLogin
          onLoginSuccess={handleAdminLoginSuccess}
          onEmployeeLoginClick={() => setAuthScreen('employee')}
        />
      )}
    </Layout>
  );
}

// Wrap App in providers
const AppWrapper = () => (
    <SalesProvider>
        <EmployeeProvider>
            <App />
        </EmployeeProvider>
    </SalesProvider>
);

export default AppWrapper;
