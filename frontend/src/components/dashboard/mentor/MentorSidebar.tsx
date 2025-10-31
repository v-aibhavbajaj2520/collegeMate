import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  MdDashboard, 
  MdPeople, 
  MdSettings, 
  MdLogout,
  MdClose,
  MdSchedule,
  MdBook,
  MdPerson
} from 'react-icons/md';

interface MentorSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const MentorSidebar: React.FC<MentorSidebarProps> = ({ 
  isOpen, 
  onToggle 
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const mentorMenuItems = [
    { id: 'overview', label: 'Overview', icon: MdDashboard, path: '/mentor/dashboard/overview' },
    { id: 'students', label: 'My Students', icon: MdPeople, path: '/mentor/dashboard/students' },
    { id: 'schedule', label: 'Schedule', icon: MdSchedule, path: '/mentor/dashboard/schedule' },
    { id: 'bookings', label: 'Bookings', icon: MdBook, path: '/mentor/dashboard/bookings' },
    { id: 'profile', label: 'Profile', icon: MdPerson, path: '/mentor/dashboard/profile' },
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
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:block
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div>
                <h2 className="text-xl font-bold gradient-text">Mentor Dashboard</h2>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <MdClose className="w-6 h-6" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {user?.name?.charAt(0).toUpperCase() || 'M'}
              </div>
              <div>
                <p className="text-base font-semibold text-gray-900">{user?.name}</p>
                <p className="text-sm text-gray-500">Mentor</p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {mentorMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={onToggle}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200
                    ${isActive
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => {
                logout();
                onToggle();
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200"
            >
              <MdLogout className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MentorSidebar;

