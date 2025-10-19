import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MentorSidebar from './MentorSidebar';
import MentorHeader from './MentorHeader';

// Mentor specific components (you can create these later)
const MentorOverview = () => <div className="p-6">Mentor Overview Component</div>;
const MyStudents = () => <div className="p-6">My Students Component</div>;
const MentorSchedule = () => <div className="p-6">Mentor Schedule Component</div>;
const MentorCourses = () => <div className="p-6">Mentor Courses Component</div>;
const MentorSessions = () => <div className="p-6">Mentor Sessions Component</div>;
const MentorReviews = () => <div className="p-6">Mentor Reviews Component</div>;
const MentorEarnings = () => <div className="p-6">Mentor Earnings Component</div>;
const MentorAnalytics = () => <div className="p-6">Mentor Analytics Component</div>;
const MentorNotifications = () => <div className="p-6">Mentor Notifications Component</div>;
const MentorSettings = () => <div className="p-6">Mentor Settings Component</div>;

const MentorLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
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
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/mentor/dashboard/overview" replace />} />
            <Route path="/overview" element={<MentorOverview />} />
            <Route path="/students" element={<MyStudents />} />
            <Route path="/schedule" element={<MentorSchedule />} />
            <Route path="/courses" element={<MentorCourses />} />
            <Route path="/sessions" element={<MentorSessions />} />
            <Route path="/reviews" element={<MentorReviews />} />
            <Route path="/earnings" element={<MentorEarnings />} />
            <Route path="/analytics" element={<MentorAnalytics />} />
            <Route path="/notifications" element={<MentorNotifications />} />
            <Route path="/settings" element={<MentorSettings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default MentorLayout;

