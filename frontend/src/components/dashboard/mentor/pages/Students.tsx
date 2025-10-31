import React, { useState, useEffect } from 'react';
import { MdSearch, MdEmail, MdCalendarToday } from 'react-icons/md';
import ResponsiveTable from '../../shared/ResponsiveTable';
import api from '../../../../utils/api';

interface Student {
  id: string;
  name: string;
  email: string;
  bookingCount: number;
  lastBookingDate: string;
  totalSpent: number;
}

const MyStudents: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await api.get<{ success: boolean; data: any[] }>('/api/bookings/mentor');
        
        if (response.data.success) {
          // Aggregate students from bookings
          const studentMap = new Map<string, {
            id: string;
            name: string;
            email: string;
            bookingCount: number;
            lastBookingDate: string;
            totalSpent: number;
          }>();

          response.data.data.forEach((booking) => {
            const studentId = booking.student.id;
            if (!studentMap.has(studentId)) {
              studentMap.set(studentId, {
                id: studentId,
                name: booking.student.name,
                email: booking.student.email,
                bookingCount: 0,
                lastBookingDate: '',
                totalSpent: 0
              });
            }

            const student = studentMap.get(studentId)!;
            student.bookingCount++;
            student.totalSpent += booking.totalPrice;
            
            const bookingDate = new Date(booking.createdAt);
            if (!student.lastBookingDate || bookingDate > new Date(student.lastBookingDate)) {
              student.lastBookingDate = booking.createdAt;
            }
          });

          const studentsList = Array.from(studentMap.values()).sort((a, b) => 
            new Date(b.lastBookingDate).getTime() - new Date(a.lastBookingDate).getTime()
          );

          setStudents(studentsList);
          setFilteredStudents(studentsList);
        }
      } catch (err: any) {
        console.error('Error fetching students:', err);
        setError(err.response?.data?.message || 'Failed to fetch students');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Students</h1>
        <p className="text-gray-600 mt-2">Students who have booked sessions with you</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Students Table */}
      <ResponsiveTable>
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Students ({filteredStudents.length})
          </h2>
        </div>
        
        <table className="w-full divide-y divide-gray-200" style={{ minWidth: '700px' }}>
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Bookings
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Spent
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Booking
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
            ) : filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No students found
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <MdEmail className="w-4 h-4 mr-2 text-gray-400" />
                      {student.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.bookingCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    ₹{student.totalSpent.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <MdCalendarToday className="w-4 h-4 mr-2 text-gray-400" />
                      {new Date(student.lastBookingDate).toLocaleDateString()}
                    </div>
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

export default MyStudents;

