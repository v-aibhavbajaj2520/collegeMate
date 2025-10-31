import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MentorSidebar from './MentorSidebar';
import MentorHeader from './MentorHeader';
import MentorOverview from './pages/Overview';
import MyStudents from './pages/Students';
import MentorSchedule from './pages/Schedule';
import MentorBookings from './pages/Bookings';
import MentorProfile from './pages/Profile';

const MentorLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #EEFFFD 25%, #FFF9CE 100%)' }}>
      <div className="min-h-screen flex">
        {/* Fixed Sidebar */}
        <MentorSidebar 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)} 
        />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Mentor Header */}
          <MentorHeader onMenuClick={() => setSidebarOpen(true)} />
          
          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/mentor/dashboard/overview" replace />} />
              <Route path="/overview" element={<MentorOverview />} />
              <Route path="/students" element={<MyStudents />} />
              <Route path="/schedule" element={<MentorSchedule />} />
              <Route path="/bookings" element={<MentorBookings />} />
              <Route path="/profile" element={<MentorProfile />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
};

export default MentorLayout;

