import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import UserSidebar from './UserSidebar';
import DashboardHeader from './DashboardHeader';
import Bookings from '../user/Bookings';
import Enroll from '../user/Enroll';
import Profile from '../user/Profile';
import Settings from '../user/Settings';

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Fixed Sidebar */}
      <UserSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Dashboard Header */}
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Page Content */}
        <main className="flex-1 p-8">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard/bookings" replace />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/enroll" element={<Enroll />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
