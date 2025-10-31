import React, { useState, useEffect } from 'react';
import { MdSearch, MdFilterList, MdCalendarToday, MdAccessTime } from 'react-icons/md';
import ResponsiveTable from '../../shared/ResponsiveTable';
import api from '../../../../utils/api';

interface Slot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
}

interface BookingItem {
  id: string;
  slotId: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  slot?: Slot;
}

interface BackendBooking {
  id: string;
  studentId: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
  items: BookingItem[];
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
}

interface Booking {
  id: string;
  bookingId: string;
  studentName: string;
  studentEmail: string;
  date: string;
  time: string;
  endTime: string;
  price: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
}

const MentorBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await api.get<{ success: boolean; data: BackendBooking[] }>('/api/bookings/mentor');
        
        if (response.data.success) {
          const transformedBookings: Booking[] = [];
          
          response.data.data.forEach((backendBooking) => {
            backendBooking.items.forEach((item) => {
              // Date and time come from the slot
              const slotDate = item.slot?.date ? new Date(item.slot.date).toISOString().split('T')[0] : '';
              transformedBookings.push({
                id: `${backendBooking.id}-${item.id}`,
                bookingId: backendBooking.id,
                studentName: backendBooking.student.name,
                studentEmail: backendBooking.student.email,
                date: slotDate,
                time: item.slot?.startTime || item.startTime || '',
                endTime: item.slot?.endTime || item.endTime || '',
                price: item.price,
                status: backendBooking.status,
                createdAt: backendBooking.createdAt
              });
            });
          });

          // Sort by date (most recent first)
          transformedBookings.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          setBookings(transformedBookings);
          setFilteredBookings(transformedBookings);
        }
      } catch (err: any) {
        console.error('Error fetching bookings:', err);
        setError(err.response?.data?.message || 'Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  useEffect(() => {
    let filtered = bookings;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.studentEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter(booking => booking.date === dateFilter);
    }

    setFilteredBookings(filtered);
  }, [bookings, searchTerm, statusFilter, dateFilter]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      CONFIRMED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmed' },
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
      COMPLETED: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completed' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours || '0');
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
        <p className="text-gray-600 mt-2">All your booking history</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
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
            <option value="CONFIRMED">Confirmed</option>
            <option value="PENDING">Pending</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="COMPLETED">Completed</option>
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
      <ResponsiveTable>
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Bookings ({filteredBookings.length})
            </h2>
            <div className="flex items-center space-x-2">
              <MdFilterList className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">Filtered results</span>
            </div>
          </div>
        </div>
        
        <table className="w-full divide-y divide-gray-200" style={{ minWidth: '800px' }}>
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Booked On
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-red-500">
                  {error}
                </td>
              </tr>
            ) : filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No bookings found
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {booking.studentName.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{booking.studentName}</div>
                        <div className="text-sm text-gray-500">{booking.studentEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <MdCalendarToday className="w-4 h-4 mr-2 text-gray-400" />
                      {new Date(booking.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <MdAccessTime className="w-4 h-4 mr-2 text-gray-400" />
                      {formatTime(booking.time)} - {formatTime(booking.endTime)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    ₹{booking.price.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {getStatusBadge(booking.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(booking.createdAt).toLocaleDateString()}
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

export default MentorBookings;

