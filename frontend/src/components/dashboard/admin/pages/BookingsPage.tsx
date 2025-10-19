import React, { useState, useEffect } from 'react';
import { 
  MdSearch, 
  MdFilterList, 
  MdDownload,
  MdVisibility,
  MdEdit,
  MdDelete
} from 'react-icons/md';
import ResponsiveTable from '../../shared/ResponsiveTable';

interface Booking {
  id: string;
  mentorName: string;
  studentName: string;
  studentEmail: string;
  college: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  amount: number;
  createdAt: string;
}

const AdminBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [collegeFilter, setCollegeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockBookings: Booking[] = [
      {
        id: '1',
        mentorName: 'Dr. Sarah Johnson',
        studentName: 'John Doe',
        studentEmail: 'john.doe@mit.edu',
        college: 'MIT',
        date: '2024-01-15',
        time: '10:00 AM',
        status: 'confirmed',
        amount: 50,
        createdAt: '2024-01-10T09:00:00Z'
      },
      {
        id: '2',
        mentorName: 'Prof. Michael Chen',
        studentName: 'Jane Smith',
        studentEmail: 'jane.smith@stanford.edu',
        college: 'Stanford',
        date: '2024-01-15',
        time: '11:30 AM',
        status: 'pending',
        amount: 50,
        createdAt: '2024-01-12T14:30:00Z'
      },
      {
        id: '3',
        mentorName: 'Dr. Emily Davis',
        studentName: 'Alex Wilson',
        studentEmail: 'alex.wilson@harvard.edu',
        college: 'Harvard',
        date: '2024-01-16',
        time: '2:00 PM',
        status: 'completed',
        amount: 50,
        createdAt: '2024-01-08T11:15:00Z'
      },
      {
        id: '4',
        mentorName: 'Prof. David Brown',
        studentName: 'Maria Garcia',
        studentEmail: 'maria.garcia@berkeley.edu',
        college: 'UC Berkeley',
        date: '2024-01-16',
        time: '3:30 PM',
        status: 'cancelled',
        amount: 50,
        createdAt: '2024-01-14T16:45:00Z'
      },
      {
        id: '5',
        mentorName: 'Dr. Lisa Wang',
        studentName: 'David Kim',
        studentEmail: 'david.kim@caltech.edu',
        college: 'Caltech',
        date: '2024-01-17',
        time: '9:00 AM',
        status: 'confirmed',
        amount: 50,
        createdAt: '2024-01-13T10:20:00Z'
      }
    ];

    setTimeout(() => {
      setBookings(mockBookings);
      setFilteredBookings(mockBookings);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter bookings based on search and filters
  useEffect(() => {
    let filtered = bookings;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        (booking.mentorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (booking.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (booking.studentEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (booking.college || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // College filter
    if (collegeFilter !== 'all') {
      filtered = filtered.filter(booking => booking.college === collegeFilter);
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter(booking => booking.date === dateFilter);
    }

    setFilteredBookings(filtered);
  }, [bookings, searchTerm, statusFilter, collegeFilter, dateFilter]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmed' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
      completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completed' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const uniqueColleges = [...new Set(bookings.map(booking => booking.college))];

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Bookings</h1>
          <p className="text-gray-600 mt-2">Manage and monitor all booking requests</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <MdDownload className="w-4 h-4 mr-2" />
          Export Data
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[150px]"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>

          {/* College Filter */}
          <select
            value={collegeFilter}
            onChange={(e) => setCollegeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[150px]"
          >
            <option value="all">All Colleges</option>
            {uniqueColleges.map(college => (
              <option key={college} value={college}>{college}</option>
            ))}
          </select>

          {/* Date Filter */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[150px]"
          />
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Bookings ({filteredBookings.length})
            </h2>
            <div className="flex items-center space-x-2">
              <MdFilterList className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500">Filtered results</span>
            </div>
          </div>
        </div>
        
        <ResponsiveTable>
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mentor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  College
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    No bookings found
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{booking.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {booking.mentorName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{booking.mentorName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{booking.studentName}</div>
                        <div className="text-sm text-gray-500">{booking.studentEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.college}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{booking.date}</div>
                        <div className="text-sm text-gray-500">{booking.time}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${booking.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <MdVisibility className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <MdEdit className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <MdDelete className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </ResponsiveTable>
      </div>
    </div>
  );
};

export default AdminBookingsPage;

