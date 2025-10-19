import React, { useState, useEffect } from 'react';
import { 
  MdSearch, 
  MdFilterList, 
  MdAdd,
  MdEdit,
  MdDelete,
  MdEmail,
  MdPhone,
  MdStar,
  MdVisibility,
  MdBlock
} from 'react-icons/md';
import ResponsiveTable from '../../shared/ResponsiveTable';

interface Mentor {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  experience: number;
  rating: number;
  totalStudents: number;
  status: 'active' | 'inactive' | 'pending';
  joinDate: string;
  lastActive: string;
}

const AdminMentorsPage: React.FC = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [specializationFilter, setSpecializationFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [, setEditingMentor] = useState<Mentor | null>(null);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockMentors: Mentor[] = [
      {
        id: '1',
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@university.edu',
        phone: '+1 (555) 123-4567',
        specialization: 'Computer Science',
        experience: 8,
        rating: 4.8,
        totalStudents: 45,
        status: 'active',
        joinDate: '2023-06-15',
        lastActive: '2024-01-15'
      },
      {
        id: '2',
        name: 'Prof. Michael Chen',
        email: 'michael.chen@university.edu',
        phone: '+1 (555) 234-5678',
        specialization: 'Data Science',
        experience: 12,
        rating: 4.9,
        totalStudents: 62,
        status: 'active',
        joinDate: '2023-04-20',
        lastActive: '2024-01-14'
      },
      {
        id: '3',
        name: 'Dr. Emily Davis',
        email: 'emily.davis@university.edu',
        phone: '+1 (555) 345-6789',
        specialization: 'Business Administration',
        experience: 6,
        rating: 4.7,
        totalStudents: 38,
        status: 'pending',
        joinDate: '2024-01-10',
        lastActive: '2024-01-13'
      },
      {
        id: '4',
        name: 'Prof. David Brown',
        email: 'david.brown@university.edu',
        phone: '+1 (555) 456-7890',
        specialization: 'Engineering',
        experience: 15,
        rating: 4.9,
        totalStudents: 78,
        status: 'active',
        joinDate: '2023-02-28',
        lastActive: '2024-01-15'
      },
      {
        id: '5',
        name: 'Dr. Lisa Wang',
        email: 'lisa.wang@university.edu',
        phone: '+1 (555) 567-8901',
        specialization: 'Physics',
        experience: 10,
        rating: 4.6,
        totalStudents: 52,
        status: 'inactive',
        joinDate: '2023-08-12',
        lastActive: '2024-01-05'
      }
    ];

    setTimeout(() => {
      setMentors(mockMentors);
      setFilteredMentors(mockMentors);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter mentors based on search and filters
  useEffect(() => {
    let filtered = mentors;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(mentor =>
        (mentor.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (mentor.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (mentor.specialization || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(mentor => mentor.status === statusFilter);
    }

    // Specialization filter
    if (specializationFilter !== 'all') {
      filtered = filtered.filter(mentor => mentor.specialization === specializationFilter);
    }

    setFilteredMentors(filtered);
  }, [mentors, searchTerm, statusFilter, specializationFilter]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
      inactive: { bg: 'bg-red-100', text: 'text-red-800', label: 'Inactive' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const uniqueSpecializations = [...new Set(mentors.map(mentor => mentor.specialization))];

  const handleAddMentor = () => {
    setShowAddModal(true);
  };

  const handleEditMentor = (mentor: Mentor) => {
    setEditingMentor(mentor);
  };

  const handleDeleteMentor = (mentorId: string) => {
    if (window.confirm('Are you sure you want to remove this mentor?')) {
      setMentors(mentors.filter(mentor => mentor.id !== mentorId));
    }
  };

  const handleToggleStatus = (mentorId: string) => {
    setMentors(mentors.map(mentor => 
      mentor.id === mentorId 
        ? { ...mentor, status: mentor.status === 'active' ? 'inactive' : 'active' }
        : mentor
    ));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Mentors</h1>
          <p className="text-gray-600 mt-2">Add, edit, and manage mentor accounts</p>
        </div>
        <button 
          onClick={handleAddMentor}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <MdAdd className="w-4 h-4 mr-2" />
          Add Mentor
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <MdStar className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="ml-3 md:ml-4 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600">Total Mentors</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{mentors.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <MdVisibility className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="ml-3 md:ml-4 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600">Active Mentors</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">
                {mentors.filter(m => m.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <MdBlock className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="ml-3 md:ml-4 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600">Pending Approval</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">
                {mentors.filter(m => m.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <MdEmail className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="ml-3 md:ml-4 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">
                {mentors.reduce((sum, mentor) => sum + mentor.totalStudents, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search mentors..."
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>

          {/* Specialization Filter */}
          <select
            value={specializationFilter}
            onChange={(e) => setSpecializationFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[150px]"
          >
            <option value="all">All Specializations</option>
            {uniqueSpecializations.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Mentors Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Mentors ({filteredMentors.length})
            </h2>
            <div className="flex items-center space-x-2">
              <MdFilterList className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500">Filtered results</span>
            </div>
          </div>
        </div>
        
        <ResponsiveTable>
          <table className="w-full" style={{ minWidth: '800px' }}>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mentor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specialization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Students
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
              ) : filteredMentors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    No mentors found
                  </td>
                </tr>
              ) : (
                filteredMentors.map((mentor) => (
                  <tr key={mentor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {mentor.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{mentor.name}</div>
                          <div className="text-sm text-gray-500">ID: {mentor.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="flex items-center text-sm text-gray-900">
                          <MdEmail className="w-4 h-4 mr-2 text-gray-400" />
                          {mentor.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MdPhone className="w-4 h-4 mr-2 text-gray-400" />
                          {mentor.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {mentor.specialization}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {mentor.experience} years
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MdStar className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="text-sm text-gray-900">{mentor.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {mentor.totalStudents}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(mentor.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleEditMentor(mentor)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <MdEdit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(mentor.id)}
                          className={`${mentor.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                        >
                          <MdBlock className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteMentor(mentor.id)}
                          className="text-red-600 hover:text-red-900"
                        >
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

      {/* Add Mentor Modal - Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Mentor</h3>
            <p className="text-gray-600 mb-4">This would open a form to add a new mentor.</p>
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Mentor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMentorsPage;
