import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { TopNavbar } from './TopNavbar';

export const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col antialiased">
      <AppSidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <TopNavbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        <footer className="py-4 px-6 border-t border-slate-200/60 bg-white text-center text-xs text-slate-400">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Western University" className="w-5 h-5 object-contain" />
              <span>&copy; 2026 Western University &bull; APDO Operations Management System</span>
            </div>
            <span className="font-mono text-[11px] text-slate-500">PostgreSQL Schema &bull; BIGINT Keys &bull; REST-Ready</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
