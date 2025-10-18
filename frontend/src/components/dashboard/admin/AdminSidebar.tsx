import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  MdDashboard, 
  MdPeople, 
  MdSchool, 
  MdAnalytics, 
  MdSettings, 
  MdLogout,
  MdClose,
  MdNotifications,
  MdReport,
  MdPayment,
  MdCalendarToday
} from 'react-icons/md';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  activeTab, 
  onTabChange, 
  isOpen, 
  onToggle 
}) => {
  const { user, logout } = useAuth();

  const adminMenuItems = [
    { id: 'overview', label: 'Dashboard', icon: MdDashboard },
    { id: 'bookings', label: 'Bookings', icon: MdCalendarToday },
    { id: 'students', label: 'Enrolled Students', icon: MdPeople },
    { id: 'mentors', label: 'Mentors', icon: MdSchool },
    { id: 'analytics', label: 'Analytics', icon: MdAnalytics },
    { id: 'reports', label: 'Reports', icon: MdReport },
    { id: 'payments', label: 'Payments', icon: MdPayment },
    { id: 'notifications', label: 'Notifications', icon: MdNotifications },
    { id: 'settings', label: 'Settings', icon: MdSettings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-72
          bg-[#172234] shadow-2xl
          flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          transition-transform duration-300 ease-in-out
        `}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-center h-20 px-6 border-b border-gray-700">
          <img 
            src="/logo.svg" 
            alt="CollegeMate" 
            className="h-10 w-10"
          />
          <span className="ml-3 text-white text-xl font-bold">Admin Panel</span>
        </div>

        {/* Go to Website CTA */}
        <div className="px-6 py-4">
          <Link
            to="/"
            onClick={onToggle}
            className="w-full flex items-center justify-center px-4 py-3 border-2 border-white/20 text-white rounded-lg font-medium transition-all duration-300 hover:bg-white/10 hover:border-white/40 group"
          >
            <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go to Website
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-6 py-4 space-y-2">
          {adminMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`
                  relative flex items-center px-4 py-4 rounded-xl text-sm font-medium transition-all duration-300 group
                  ${isActive 
                    ? 'bg-blue-600/20 text-white shadow-lg shadow-blue-600/20' 
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full"></div>
                )}
                
                <span className={`mr-4 transition-transform group-hover:scale-110 ${isActive ? 'text-blue-400' : ''}`}>
                  <Icon className="w-5 h-5" />
                </span>
                <span className="font-medium">{item.label}</span>
                
                {/* Active glow effect */}
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/10 to-transparent"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Info Section */}
        <div className="p-6 border-t border-gray-700">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="ml-4">
              <p className="text-white font-semibold text-sm">{user?.name}</p>
              <p className="text-gray-400 text-xs">Administrator</p>
            </div>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={() => {
              logout();
              onToggle();
            }}
            className="w-full mt-4 flex items-center justify-center px-4 py-2 text-gray-300 hover:bg-red-600/20 hover:text-red-400 rounded-lg transition-all duration-200 group"
          >
            <MdLogout className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;

