import React, { useState } from 'react';
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
  const [activeTab, setActiveTab] = useState('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <MentorOverview />;
      case 'students':
        return <MyStudents />;
      case 'schedule':
        return <MentorSchedule />;
      case 'courses':
        return <MentorCourses />;
      case 'sessions':
        return <MentorSessions />;
      case 'reviews':
        return <MentorReviews />;
      case 'earnings':
        return <MentorEarnings />;
      case 'analytics':
        return <MentorAnalytics />;
      case 'notifications':
        return <MentorNotifications />;
      case 'settings':
        return <MentorSettings />;
      default:
        return <MentorOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Fixed Sidebar */}
      <MentorSidebar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Mentor Header */}
        <MentorHeader onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Page Content */}
        <main className="flex-1">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default MentorLayout;

