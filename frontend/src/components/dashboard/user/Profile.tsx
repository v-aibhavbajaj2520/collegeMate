import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../../utils/api';
import { useAuth } from '../../../contexts/AuthContext';
import { MdEmail, MdPhone, MdSchool, MdPerson, MdClose } from 'react-icons/md';

interface College {
  id: string;
  name: string;
}

interface Course {
  id: string;
  name: string;
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
  photo: string | null;
  age: number | null;
  phone: string | null;
  school10th: string | null;
  school12th: string | null;
  collegesInterested: string[];
  coursesInterested: string[];
}

const Profile: React.FC = () => {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [colleges, setColleges] = useState<College[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    phone: '',
    school10th: '',
    school12th: '',
    collegesInterested: [] as string[],
    coursesInterested: [] as string[],
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [collegeSearch, setCollegeSearch] = useState('');
  const [courseSearch, setCourseSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch colleges and courses separately with better error handling
        try {
          const collegesRes = await api.get<{ success: boolean; data: College[] }>('/api/colleges');
          if (collegesRes.data.success && collegesRes.data.data) {
            setColleges(collegesRes.data.data);
            console.log('Colleges fetched:', collegesRes.data.data.length);
          } else {
            console.warn('Colleges response not successful:', collegesRes.data);
          }
        } catch (err: any) {
          console.error('Error fetching colleges:', err);
          setError(`Failed to fetch colleges: ${err.response?.data?.message || err.message}`);
        }

        try {
          const coursesRes = await api.get<{ success: boolean; data: Course[] }>('/api/courses');
          if (coursesRes.data.success && coursesRes.data.data) {
            setCourses(coursesRes.data.data);
            console.log('Courses fetched:', coursesRes.data.data.length);
          } else {
            console.warn('Courses response not successful:', coursesRes.data);
          }
        } catch (err: any) {
          console.error('Error fetching courses:', err);
          setError(`Failed to fetch courses: ${err.response?.data?.message || err.message}`);
        }

        // Fetch user profile
        try {
          console.log('Fetching user profile from /api/auth/me...');
          const profileRes = await api.get<{ success: boolean; user: UserProfile }>('/api/auth/me');
          console.log('Profile response received:', profileRes.data);
          if (profileRes.data.success && profileRes.data.user) {
            const profile = profileRes.data.user;
            setFormData({
              name: profile.name || '',
              age: profile.age?.toString() || '',
              phone: profile.phone || '',
              school10th: profile.school10th || '',
              school12th: profile.school12th || '',
              collegesInterested: profile.collegesInterested || [],
              coursesInterested: profile.coursesInterested || [],
            });
            if (profile.photo) {
              setPhotoPreview(profile.photo);
            }
          }
        } catch (err: any) {
          console.error('Error fetching profile:', err);
          const errorMessage = err.response?.data?.message || err.message;
          // Check if it's an authentication error
          if (err.response?.status === 401 || err.response?.status === 403 || 
              errorMessage?.toLowerCase().includes('token') || 
              errorMessage?.toLowerCase().includes('expired') ||
              errorMessage?.toLowerCase().includes('invalid')) {
            setError('Your session has expired. Please login again.');
            // Clear any stale tokens
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Redirect will be handled by api interceptor
          } else {
            setError(`Failed to fetch profile: ${errorMessage}`);
          }
        }
      } catch (err: any) {
        console.error('Error in fetchData:', err);
        setError(err.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.college-dropdown') && !target.closest('.college-input')) {
        setShowCollegeDropdown(false);
      }
      if (!target.closest('.course-dropdown') && !target.closest('.course-input')) {
        setShowCourseDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
    setSuccess('');
  };

  const handleCollegeToggle = (collegeId: string) => {
    setFormData(prev => {
      const isSelected = prev.collegesInterested.includes(collegeId);
      return {
        ...prev,
        collegesInterested: isSelected
          ? prev.collegesInterested.filter(id => id !== collegeId)
          : [...prev.collegesInterested, collegeId]
      };
    });
    setError('');
    setSuccess('');
  };

  const handleCourseToggle = (courseId: string) => {
    setFormData(prev => {
      const isSelected = prev.coursesInterested.includes(courseId);
      return {
        ...prev,
        coursesInterested: isSelected
          ? prev.coursesInterested.filter(id => id !== courseId)
          : [...prev.coursesInterested, courseId]
      };
    });
    setError('');
    setSuccess('');
  };

  const removeCollege = (collegeId: string) => {
    setFormData(prev => ({
      ...prev,
      collegesInterested: prev.collegesInterested.filter(id => id !== collegeId)
    }));
  };

  const removeCourse = (courseId: string) => {
    setFormData(prev => ({
      ...prev,
      coursesInterested: prev.coursesInterested.filter(id => id !== courseId)
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!formData.name || formData.name.trim() === '') {
        setError('Name is required');
        setSaving(false);
        return;
      }

      const formDataToSend = new FormData();
      
      // Always send name (required)
      formDataToSend.append('name', formData.name.trim());
      
      // Send optional fields only if they have values
      if (formData.age && formData.age.trim() !== '') {
        formDataToSend.append('age', formData.age.trim());
      }
      if (formData.phone && formData.phone.trim() !== '') {
        formDataToSend.append('phone', formData.phone.trim());
      }
      if (formData.school10th && formData.school10th.trim() !== '') {
        formDataToSend.append('school10th', formData.school10th.trim());
      }
      if (formData.school12th && formData.school12th.trim() !== '') {
        formDataToSend.append('school12th', formData.school12th.trim());
      }
      
      // Always send arrays (even if empty) as JSON strings
      // This ensures backend always receives valid arrays
      const collegesArray = Array.isArray(formData.collegesInterested) 
        ? formData.collegesInterested 
        : [];
      const coursesArray = Array.isArray(formData.coursesInterested) 
        ? formData.coursesInterested 
        : [];
      
      formDataToSend.append('collegesInterested', JSON.stringify(collegesArray));
      formDataToSend.append('coursesInterested', JSON.stringify(coursesArray));
      
      // Add photo if provided
      if (photoFile) {
        // Validate file size (5MB limit)
        if (photoFile.size > 5 * 1024 * 1024) {
          setError('Photo size must be less than 5MB');
          setSaving(false);
          return;
        }
        // Validate file type
        if (!photoFile.type.startsWith('image/')) {
          setError('Please select a valid image file');
          setSaving(false);
          return;
        }
        formDataToSend.append('photo', photoFile);
      }

      console.log('Submitting profile update...');
      console.log('Colleges:', collegesArray);
      console.log('Courses:', coursesArray);

      const response = await api.put<{ success: boolean; message: string; user: UserProfile }>(
        '/api/auth/update-profile',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        setSuccess('Profile updated successfully!');
        // Update photo preview if photo was updated
        if (response.data.user.photo) {
          setPhotoPreview(response.data.user.photo);
        }
        // Update user context with new data
        if (user && response.data.user) {
          login({ 
            ...user, 
            name: response.data.user.name
          }, localStorage.getItem('token') || '');
        }
        // Clear photo file since it's been uploaded
        setPhotoFile(null);
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update profile';
      
      // Check if it's an authentication error
      if (err.response?.status === 401 || err.response?.status === 403 || 
          errorMessage?.toLowerCase().includes('token') || 
          errorMessage?.toLowerCase().includes('expired') ||
          errorMessage?.toLowerCase().includes('invalid')) {
        setError('Your session has expired. Please login again.');
        // Clear any stale tokens
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirect will be handled by api interceptor
      } else {
        // Show specific error message from backend
        setError(errorMessage);
      }
    } finally {
      setSaving(false);
    }
  };

  const getSelectedColleges = () => {
    return colleges.filter(college => formData.collegesInterested.includes(college.id));
  };

  const getSelectedCourses = () => {
    return courses.filter(course => formData.coursesInterested.includes(course.id));
  };

  const filteredColleges = colleges.length > 0 ? colleges.filter(college =>
    college.name.toLowerCase().includes(collegeSearch.toLowerCase()) &&
    !formData.collegesInterested.includes(college.id)
  ) : [];

  const filteredCourses = courses.length > 0 ? courses.filter(course =>
    course.name.toLowerCase().includes(courseSearch.toLowerCase()) &&
    !formData.coursesInterested.includes(course.id)
  ) : [];

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 mt-4">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-2">Manage your personal information and preferences</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">{success}</p>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <div className="flex items-center space-x-6 mb-8">
            <div className="relative">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-4 border-blue-500"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors">
                <MdPerson className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Profile Photo</h2>
              <p className="text-gray-600 text-sm">Upload a profile picture (max 5MB)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="flex items-center px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg">
                <MdEmail className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-gray-700">{user?.email}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                min="1"
                max="100"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter your age"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <MdPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            {/* 10th School */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                10th School
              </label>
              <div className="relative">
                <MdSchool className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="school10th"
                  value={formData.school10th}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your 10th school name"
                />
              </div>
            </div>

            {/* 12th School */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                12th School
              </label>
              <div className="relative">
                <MdSchool className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="school12th"
                  value={formData.school12th}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your 12th school name"
                />
              </div>
            </div>
          </div>

          {/* Colleges Interested - Better UI */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Colleges Interested In
            </label>
            
            {/* Selected Colleges as Tags */}
            {getSelectedColleges().length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {getSelectedColleges().map((college) => (
                  <span
                    key={college.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {college.name}
                    <button
                      type="button"
                      onClick={() => removeCollege(college.id)}
                      className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200 focus:outline-none"
                    >
                      <MdClose className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Dropdown for selecting colleges */}
            <div className="relative college-input">
              <input
                type="text"
                placeholder={colleges.length === 0 ? "No colleges available. Admin needs to add colleges first." : "Search and select colleges..."}
                value={collegeSearch}
                onChange={(e) => {
                  setCollegeSearch(e.target.value);
                  setShowCollegeDropdown(true);
                }}
                onFocus={() => {
                  if (colleges.length > 0) {
                    setShowCollegeDropdown(true);
                  }
                }}
                disabled={colleges.length === 0}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  colleges.length === 0 ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              />
              
              {showCollegeDropdown && filteredColleges.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto college-dropdown">
                  {filteredColleges.map((college) => (
                    <div
                      key={college.id}
                      onClick={() => {
                        handleCollegeToggle(college.id);
                        setCollegeSearch('');
                        setShowCollegeDropdown(false);
                      }}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      {college.name}
                    </div>
                  ))}
                </div>
              )}
              {showCollegeDropdown && filteredColleges.length === 0 && collegeSearch && colleges.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg college-dropdown">
                  <div className="px-4 py-2 text-gray-500">No colleges found matching "{collegeSearch}"</div>
                </div>
              )}
              {showCollegeDropdown && colleges.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg college-dropdown">
                  <div className="px-4 py-2 text-yellow-600">No colleges available. Please ask admin to add colleges.</div>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {colleges.length === 0 
                ? "No colleges in database. Admin needs to add colleges first."
                : "Type to search and click to select colleges"}
            </p>
          </div>

          {/* Courses Interested - Better UI */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Courses Interested In
            </label>
            
            {/* Selected Courses as Tags */}
            {getSelectedCourses().length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {getSelectedCourses().map((course) => (
                  <span
                    key={course.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                  >
                    {course.name}
                    <button
                      type="button"
                      onClick={() => removeCourse(course.id)}
                      className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-purple-200 focus:outline-none"
                    >
                      <MdClose className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Dropdown for selecting courses */}
            <div className="relative course-input">
              <input
                type="text"
                placeholder={courses.length === 0 ? "No courses available. Admin needs to add courses first." : "Search and select courses..."}
                value={courseSearch}
                onChange={(e) => {
                  setCourseSearch(e.target.value);
                  setShowCourseDropdown(true);
                }}
                onFocus={() => {
                  if (courses.length > 0) {
                    setShowCourseDropdown(true);
                  }
                }}
                disabled={courses.length === 0}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  courses.length === 0 ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              />
              
              {showCourseDropdown && filteredCourses.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto course-dropdown">
                  {filteredCourses.map((course) => (
                    <div
                      key={course.id}
                      onClick={() => {
                        handleCourseToggle(course.id);
                        setCourseSearch('');
                        setShowCourseDropdown(false);
                      }}
                      className="px-4 py-2 hover:bg-purple-50 cursor-pointer transition-colors"
                    >
                      {course.name}
                    </div>
                  ))}
                </div>
              )}
              {showCourseDropdown && filteredCourses.length === 0 && courseSearch && courses.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg course-dropdown">
                  <div className="px-4 py-2 text-gray-500">No courses found matching "{courseSearch}"</div>
                </div>
              )}
              {showCourseDropdown && courses.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg course-dropdown">
                  <div className="px-4 py-2 text-yellow-600">No courses available. Please ask admin to add courses.</div>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {courses.length === 0 
                ? "No courses in database. Admin needs to add courses first."
                : "Type to search and click to select courses"}
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Profile;
