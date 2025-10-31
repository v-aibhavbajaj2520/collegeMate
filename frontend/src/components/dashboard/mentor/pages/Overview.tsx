import React, { useState, useEffect } from 'react';
import { MdCalendarToday, MdAccessTime, MdPerson } from 'react-icons/md';
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

const MentorOverview: React.FC = () => {
  const [todayBookings, setTodayBookings] = useState<Array<{
    id: string;
    studentName: string;
    studentEmail: string;
    time: string;
    endTime: string;
    bookingId: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [stats, setStats] = useState({
    todayCount: 0,
    totalBookings: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await api.get<{ success: boolean; data: BackendBooking[] }>('/api/bookings/mentor');
        
        if (response.data.success) {
          const today = new Date().toISOString().split('T')[0];
          const todayItems: typeof todayBookings = [];
          let totalBookings = 0;
          let totalRevenue = 0;

          response.data.data.forEach((booking) => {
            totalBookings++;
            if (booking.status === 'CONFIRMED') {
              totalRevenue += booking.totalPrice;
            }

            booking.items.forEach((item) => {
              // Date and time come from the slot, not the item directly
              const slotDate = item.slot?.date ? new Date(item.slot.date).toISOString().split('T')[0] : null;
              if (slotDate === today && booking.status === 'CONFIRMED') {
                todayItems.push({
                  id: `${booking.id}-${item.id}`,
                  studentName: booking.student.name,
                  studentEmail: booking.student.email,
                  time: item.slot?.startTime || item.startTime || '',
                  endTime: item.slot?.endTime || item.endTime || '',
                  bookingId: booking.id
                });
              }
            });
          });

          setTodayBookings(todayItems);
          setStats({
            todayCount: todayItems.length,
            totalBookings,
            totalRevenue
          });
        }
      } catch (err: any) {
        console.error('Error fetching bookings:', err);
        setError(err.response?.data?.message || 'Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
        <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
        <p className="text-gray-600 mt-2">Today's schedule and quick stats</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Bookings</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.todayCount}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <MdCalendarToday className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalBookings}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <MdAccessTime className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">₹{stats.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <MdPerson className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Today's Bookings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Today's Bookings</h2>
          <p className="text-gray-600 text-sm mt-1">Your confirmed bookings for today</p>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-500 mt-4">Loading bookings...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
            </div>
          ) : todayBookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No bookings scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todayBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {booking.studentName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{booking.studentName}</p>
                      <p className="text-sm text-gray-600">{booking.studentEmail}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatTime(booking.time)} - {formatTime(booking.endTime)}
                    </p>
                    <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 mt-1">
                      Confirmed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorOverview;

