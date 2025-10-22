import React, { useState, useEffect } from 'react';
import {
  MdAttachMoney,
  MdSchool,
  MdCalendarToday,
  MdTrendingUp,
  MdTrendingDown
} from 'react-icons/md';
import ResponsiveTable from '../../shared/ResponsiveTable';

interface Booking {
  id: string;
  mentorName: string;
  studentName: string;
  college: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

const AdminDashboardPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockBookings: Booking[] = [
      {
        id: '1',
        mentorName: 'Dr. Sarah Johnson',
        studentName: 'John Doe',
        college: 'MIT',
        time: '10:00 AM',
        status: 'confirmed'
      },
      {
        id: '2',
        mentorName: 'Prof. Michael Chen',
        studentName: 'Jane Smith',
        college: 'Stanford',
        time: '11:30 AM',
        status: 'confirmed'
      },
      {
        id: '3',
        mentorName: 'Dr. Emily Davis',
        studentName: 'Alex Wilson',
        college: 'Harvard',
        time: '2:00 PM',
        status: 'pending'
      },
      {
        id: '4',
        mentorName: 'Prof. David Brown',
        studentName: 'Maria Garcia',
        college: 'UC Berkeley',
        time: '3:30 PM',
        status: 'confirmed'
      }
    ];

    setTimeout(() => {
      setBookings(mockBookings);
      setLoading(false);
    }, 1000);
  }, []);

  const totalBookings = bookings.length;
  const totalRevenue = bookings.filter(b => b.status === 'confirmed').length * 50; // $50 per booking
  const totalMentors = 12; // Mock data
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');

  const stats = [
    {
      title: 'Total Bookings',
      value: totalBookings,
      icon: MdCalendarToday,
      color: 'from-blue-500 to-blue-600',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Total Revenue',
      value: `$${totalRevenue}`,
      icon: MdAttachMoney,
      color: 'from-green-500 to-green-600',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Total Mentors',
      value: totalMentors,
      icon: MdSchool,
      color: 'from-purple-500 to-purple-600',
      change: '+2',
      changeType: 'positive'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1 text-sm">Overview of your platform's performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.changeType === 'positive' ? (
                      <MdTrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <MdTrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs last month</span>
                  </div>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Today's Bookings */}
      <ResponsiveTable>
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Today's Bookings</h2>
          <p className="text-gray-600 mt-1 text-sm">Confirmed bookings for today</p>
        </div>
        
        <table className="w-full divide-y divide-gray-200" style={{ minWidth: '600px' }}>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mentor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  College
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                    <td colSpan={5} className="px-4 py-3 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : confirmedBookings.length === 0 ? (
                <tr>
                    <td colSpan={5} className="px-4 py-3 text-center text-gray-500">
                    No confirmed bookings for today
                  </td>
                </tr>
              ) : (
                confirmedBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                          {booking.mentorName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{booking.mentorName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.studentName}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.college}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.time}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Confirmed
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
      </ResponsiveTable>
    </div>
  );
};

export default AdminDashboardPage;
