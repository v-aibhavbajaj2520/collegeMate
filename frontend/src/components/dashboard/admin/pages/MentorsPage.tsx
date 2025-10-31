import React, { useState, useEffect } from 'react';
import { 
  MdSearch, 
  MdFilterList, 
  MdAdd,
  MdEdit,
  MdDelete,
  MdEmail,
  MdStar,
  MdVisibility,
  MdBlock
} from 'react-icons/md';
import ResponsiveTable from '../../shared/ResponsiveTable';
import api from '../../../../utils/api';

interface BackendMentor {
  id: string;
  name: string;
  email: string;
  role: string;
  pricePerSlot: number | null;
  bio: string | null;
  expertise: string[];
  categoryId: string | null;
  category: {
    id: string;
    name: string;
    pricePerSlot: number;
  } | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    mentorSlots?: number;
    mentorBookings?: number;
  };
}

interface Mentor {
  id: string;
  name: string;
  email: string;
  specialization: string;
  experience: string;
  pricePerSlot: number | null;
  totalBookings: number;
  status: 'active' | 'inactive' | 'pending';
  joinDate: string;
  lastActive: string;
  category?: string;
  expertise: string[];
}

interface Category {
  id: string;
  name: string;
  pricePerSlot: number;
}

interface MentorFormData {
  name: string;
  email: string;
  categoryId: string;
  price?: number;
  bio?: string;
  expertise: string[];
}

const AdminMentorsPage: React.FC = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [specializationFilter, setSpecializationFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMentor, setEditingMentor] = useState<Mentor | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [formData, setFormData] = useState<MentorFormData>({
    name: '',
    email: '',
    categoryId: '',
    price: undefined,
    bio: '',
    expertise: []
  });
  const [expertiseInput, setExpertiseInput] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await api.get<{ success: boolean; data: Category[] }>('/api/categories');
        if (response.data.success) {
          setCategories(response.data.data);
        }
      } catch (err: any) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch mentors from backend
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get<{ success: boolean; data: BackendMentor[]; count: number }>('/api/mentors');
        
        if (response.data.success) {
          // Transform backend data to frontend format
          const transformedMentors: Mentor[] = response.data.data.map((backendMentor) => {
            const daysSinceJoin = Math.floor((Date.now() - new Date(backendMentor.createdAt).getTime()) / (1000 * 60 * 60 * 24));
            const yearsExperience = Math.floor(daysSinceJoin / 365);
            
            return {
              id: backendMentor.id,
              name: backendMentor.name,
              email: backendMentor.email,
              specialization: backendMentor.category?.name || backendMentor.expertise[0] || 'General',
              experience: yearsExperience > 0 ? `${yearsExperience} years` : `${Math.floor(daysSinceJoin / 30)} months`,
              pricePerSlot: backendMentor.pricePerSlot || backendMentor.category?.pricePerSlot || null,
              totalBookings: backendMentor._count?.mentorBookings || 0,
              status: backendMentor.isVerified ? 'active' : 'pending',
              joinDate: new Date(backendMentor.createdAt).toISOString().split('T')[0],
              lastActive: new Date(backendMentor.updatedAt).toISOString().split('T')[0],
              category: backendMentor.category?.name,
              expertise: backendMentor.expertise
            };
          });

          setMentors(transformedMentors);
          setFilteredMentors(transformedMentors);
        }
      } catch (err: any) {
        console.error('Error fetching mentors:', err);
        setError(err.response?.data?.message || 'Failed to fetch mentors');
      } finally {
      setLoading(false);
      }
    };

    fetchMentors();
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
    setEditingMentor(null);
    setFormData({
      name: '',
      email: '',
      categoryId: '',
      price: undefined,
      bio: '',
      expertise: []
    });
    setExpertiseInput('');
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleEditMentor = (mentor: Mentor) => {
    setEditingMentor(mentor);
    // Find the original backend mentor to get categoryId
    api.get<{ success: boolean; data: BackendMentor }>(`/api/mentors/${mentor.id}`).then(response => {
      if (response.data.success) {
        const backendMentor = response.data.data;
        setFormData({
          name: mentor.name,
          email: mentor.email,
          categoryId: backendMentor.categoryId || '',
          price: mentor.pricePerSlot || undefined,
          bio: backendMentor.bio || '',
          expertise: mentor.expertise || []
        });
        setExpertiseInput('');
        setFormErrors({});
        setShowAddModal(true);
      }
    });
  };

  const handleAddExpertise = () => {
    if (expertiseInput.trim() && !formData.expertise.includes(expertiseInput.trim())) {
      setFormData({
        ...formData,
        expertise: [...formData.expertise, expertiseInput.trim()]
      });
      setExpertiseInput('');
    }
  };

  const handleRemoveExpertise = (index: number) => {
    setFormData({
      ...formData,
      expertise: formData.expertise.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setSubmitting(true);

    // Validation
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    if (!formData.categoryId) errors.categoryId = 'Category is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSubmitting(false);
      return;
    }

    try {
      const payload: any = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        categoryId: formData.categoryId
      };

      if (formData.price !== undefined && formData.price > 0) {
        payload.price = formData.price;
      }
      if (formData.bio?.trim()) {
        payload.bio = formData.bio.trim();
      }
      if (formData.expertise.length > 0) {
        payload.expertise = formData.expertise;
      }

      if (editingMentor) {
        // Update mentor
        await api.put(`/api/mentors/${editingMentor.id}`, payload);
        alert('Mentor updated successfully!');
      } else {
        // Create mentor
        await api.post('/api/mentors', payload);
        alert('Mentor created successfully!');
      }

      setShowAddModal(false);
      refreshMentors();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.errors || 'Failed to save mentor';
      if (typeof errorMessage === 'string') {
        alert(errorMessage);
      } else {
        setFormErrors(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMentor = async (mentorId: string) => {
    if (window.confirm('Are you sure you want to remove this mentor? This action cannot be undone.')) {
      try {
        await api.delete(`/api/mentors/${mentorId}`);
      setMentors(mentors.filter(mentor => mentor.id !== mentorId));
        setFilteredMentors(filteredMentors.filter(mentor => mentor.id !== mentorId));
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete mentor');
      }
    }
  };

  const refreshMentors = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ success: boolean; data: BackendMentor[]; count: number }>('/api/mentors');
      
      if (response.data.success) {
        const transformedMentors: Mentor[] = response.data.data.map((backendMentor) => {
          const daysSinceJoin = Math.floor((Date.now() - new Date(backendMentor.createdAt).getTime()) / (1000 * 60 * 60 * 24));
          const yearsExperience = Math.floor(daysSinceJoin / 365);
          
          return {
            id: backendMentor.id,
            name: backendMentor.name,
            email: backendMentor.email,
            specialization: backendMentor.category?.name || backendMentor.expertise[0] || 'General',
            experience: yearsExperience > 0 ? `${yearsExperience} years` : `${Math.floor(daysSinceJoin / 30)} months`,
            pricePerSlot: backendMentor.pricePerSlot || backendMentor.category?.pricePerSlot || null,
            totalBookings: backendMentor._count?.mentorBookings || 0,
            status: backendMentor.isVerified ? 'active' : 'pending',
            joinDate: new Date(backendMentor.createdAt).toISOString().split('T')[0],
            lastActive: new Date(backendMentor.updatedAt).toISOString().split('T')[0],
            category: backendMentor.category?.name,
            expertise: backendMentor.expertise
          };
        });

        setMentors(transformedMentors);
        setFilteredMentors(transformedMentors);
      }
    } catch (err: any) {
      console.error('Error refreshing mentors:', err);
    } finally {
      setLoading(false);
    }
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <MdStar className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Mentors</p>
              <p className="text-2xl font-bold text-gray-900">{mentors.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <MdVisibility className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Mentors</p>
              <p className="text-2xl font-bold text-gray-900">
                {mentors.filter(m => m.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
              <MdBlock className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold text-gray-900">
                {mentors.filter(m => m.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <MdEmail className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">
                {mentors.reduce((sum, mentor) => sum + mentor.totalBookings, 0)}
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
      <ResponsiveTable>
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Mentors ({filteredMentors.length})
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
                  Mentor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category/Specialization
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price/Slot
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bookings
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
              ) : error ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-red-500">
                    {error}
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
                    <td className="px-4 py-3 whitespace-nowrap">
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
                    <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <MdEmail className="w-4 h-4 mr-2 text-gray-400" />
                          {mentor.email}
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{mentor.specialization}</div>
                      {mentor.expertise && mentor.expertise.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {mentor.expertise.slice(0, 2).join(', ')}
                          {mentor.expertise.length > 2 && '...'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {mentor.experience}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {mentor.pricePerSlot ? `₹${mentor.pricePerSlot.toFixed(2)}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {mentor.totalBookings}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
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

      {/* Add/Edit Mentor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">
              {editingMentor ? 'Edit Mentor' : 'Add New Mentor'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter mentor name"
                />
                {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter email address"
                  disabled={!!editingMentor}
                />
                {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                {editingMentor && <p className="text-gray-500 text-xs mt-1">Email cannot be changed</p>}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                {loadingCategories ? (
                  <div className="text-gray-500 text-sm">Loading categories...</div>
                ) : (
                  <>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.categoryId ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} (₹{cat.pricePerSlot.toFixed(2)}/slot)
                        </option>
                      ))}
                    </select>
                    {formErrors.categoryId && <p className="text-red-500 text-sm mt-1">{formErrors.categoryId}</p>}
                  </>
                )}
              </div>

              {/* Price Per Slot (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Per Slot (Optional)
                </label>
                <input
                  type="number"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Leave empty to use category default price"
                  min="0"
                  step="0.01"
                />
                <p className="text-gray-500 text-xs mt-1">
                  If not set, will use the category's default price
                </p>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio (Optional)
                </label>
                <textarea
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter mentor bio/description"
                  rows={3}
                  maxLength={500}
                />
                <p className="text-gray-500 text-xs mt-1">
                  {formData.bio?.length || 0}/500 characters
                </p>
              </div>

              {/* Expertise */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Areas of Expertise (Optional)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={expertiseInput}
                    onChange={(e) => setExpertiseInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddExpertise();
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter expertise area and press Enter"
                  />
                  <button
                    type="button"
                    onClick={handleAddExpertise}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Add
                  </button>
                </div>
                {formData.expertise.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.expertise.map((exp, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {exp}
                        <button
                          type="button"
                          onClick={() => handleRemoveExpertise(index)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4">
              <button 
                  type="button"
                onClick={() => setShowAddModal(false)}
                  className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  disabled={submitting}
              >
                Cancel
              </button>
              <button 
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting}
              >
                  {submitting ? 'Saving...' : editingMentor ? 'Update Mentor' : 'Create Mentor'}
              </button>
            </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMentorsPage;
