import React, { useState, useEffect } from 'react';
import { MdSave, MdEmail, MdCheck } from 'react-icons/md';
import api from '../../../../utils/api';
import { useAuth } from '../../../../contexts/AuthContext';

interface BackendMentor {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  expertise: string[];
  interests: string[];
  skills: string[];
  achievements: string[];
  pricePerSlot: number | null;
  categoryId: string | null;
  collegeId: string | null;
  courseId: string | null;
  category: {
    id: string;
    name: string;
    pricePerSlot: number;
  } | null;
  college: {
    id: string;
    name: string;
  } | null;
  course: {
    id: string;
    name: string;
  } | null;
}

interface Category {
  id: string;
  name: string;
  pricePerSlot: number;
}

interface College {
  id: string;
  name: string;
}

interface Course {
  id: string;
  name: string;
}

const MentorProfile: React.FC = () => {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    pricePerSlot: '',
    categoryId: '',
    collegeId: '',
    courseId: '',
    expertise: [] as string[],
    interests: [] as string[],
    skills: [] as string[],
    achievements: [] as string[]
  });
  const [inputValues, setInputValues] = useState({
    expertise: '',
    interests: '',
    skills: '',
    achievements: ''
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories, colleges, courses
        const [categoriesRes, collegesRes, coursesRes] = await Promise.all([
          api.get<{ success: boolean; data: Category[] }>('/api/categories'),
          api.get<{ success: boolean; data: College[] }>('/api/colleges'),
          api.get<{ success: boolean; data: Course[] }>('/api/courses')
        ]);
        
        if (categoriesRes.data.success) setCategories(categoriesRes.data.data);
        if (collegesRes.data.success) setColleges(collegesRes.data.data);
        if (coursesRes.data.success) setCourses(coursesRes.data.data);

        // Fetch mentor profile
        const mentorResponse = await api.get<{ success: boolean; data: BackendMentor }>('/api/mentors/me');
        if (mentorResponse.data.success) {
          const mentorData = mentorResponse.data.data;
          setFormData({
            name: mentorData.name,
            bio: mentorData.bio || '',
            pricePerSlot: mentorData.pricePerSlot?.toString() || '',
            categoryId: mentorData.categoryId || '',
            collegeId: mentorData.collegeId || '',
            courseId: mentorData.courseId || '',
            expertise: mentorData.expertise || [],
            interests: mentorData.interests || [],
            skills: mentorData.skills || [],
            achievements: mentorData.achievements || []
          });
        }
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError(err.response?.data?.message || 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-save when array fields change
  const handleArrayItemAdd = async (field: 'interests' | 'skills' | 'achievements', value: string) => {
    if (!value.trim()) return;
    
    const currentArray = formData[field];
    if (currentArray.length >= 5) {
      setError(`Maximum 5 ${field} allowed`);
      return;
    }
    
    if (currentArray.includes(value.trim())) {
      setError(`${field.charAt(0).toUpperCase() + field.slice(1)} already exists`);
      return;
    }

    setSaving({ ...saving, [field]: true });
    setError('');
    
    try {
      const newArray = [...currentArray, value.trim()];
      await api.put('/api/mentors/me', { [field]: newArray });
      
      setFormData({ ...formData, [field]: newArray });
      setInputValues({ ...inputValues, [field]: '' });
      setSuccess(`${field.charAt(0).toUpperCase() + field.slice(1)} added successfully!`);
      setTimeout(() => setSuccess(''), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to add ${field}`);
    } finally {
      setSaving({ ...saving, [field]: false });
    }
  };

  const handleArrayItemRemove = async (field: 'interests' | 'skills' | 'achievements', index: number) => {
    setSaving({ ...saving, [field]: true });
    setError('');
    
    try {
      const newArray = formData[field].filter((_, i) => i !== index);
      await api.put('/api/mentors/me', { [field]: newArray });
      
      setFormData({ ...formData, [field]: newArray });
      setSuccess(`${field.charAt(0).toUpperCase() + field.slice(1)} removed successfully!`);
      setTimeout(() => setSuccess(''), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to remove ${field}`);
    } finally {
      setSaving({ ...saving, [field]: false });
    }
  };

  // Handle expertise (similar but allow unlimited)
  const handleAddExpertise = () => {
    if (inputValues.expertise.trim() && !formData.expertise.includes(inputValues.expertise.trim())) {
      setFormData({
        ...formData,
        expertise: [...formData.expertise, inputValues.expertise.trim()]
      });
      setInputValues({ ...inputValues, expertise: '' });
    }
  };

  const handleRemoveExpertise = (index: number) => {
    setFormData({
      ...formData,
      expertise: formData.expertise.filter((_, i) => i !== index)
    });
  };

  // Auto-save when dropdown changes
  const handleDropdownChange = async (field: 'collegeId' | 'courseId', value: string) => {
    setSaving({ ...saving, [field]: true });
    setError('');
    
    try {
      await api.put('/api/mentors/me', { [field]: value || null });
      setFormData({ ...formData, [field]: value });
      setSuccess(`${field === 'collegeId' ? 'College' : 'Course'} updated successfully!`);
      setTimeout(() => setSuccess(''), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to update ${field}`);
    } finally {
      setSaving({ ...saving, [field]: false });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving({ ...saving, main: true });
    setError('');
    setSuccess('');

    try {
      const payload: any = {
        name: formData.name.trim(),
        expertise: formData.expertise,
        interests: formData.interests,
        skills: formData.skills,
        achievements: formData.achievements
      };

      if (formData.categoryId) payload.categoryId = formData.categoryId;
      if (formData.pricePerSlot) payload.price = parseFloat(formData.pricePerSlot);
      if (formData.bio.trim()) payload.bio = formData.bio.trim();
      if (formData.collegeId) payload.collegeId = formData.collegeId;
      if (formData.courseId) payload.courseId = formData.courseId;

      const response = await api.put<{ success: boolean; data: BackendMentor }>('/api/mentors/me', payload);
      
      if (response.data.success) {
        setSuccess('Profile updated successfully!');
        if (user) {
          login({ ...user, name: response.data.data.name }, localStorage.getItem('token') || '');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving({ ...saving, main: false });
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-2">Manage your profile information</p>
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg">
              <MdEmail className="w-5 h-5 text-gray-400 mr-2" />
              <span className="text-gray-700">{user?.email}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          {/* College */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">College</label>
            <select
              value={formData.collegeId}
              onChange={(e) => handleDropdownChange('collegeId', e.target.value)}
              disabled={saving.collegeId}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            >
              <option value="">Select a college</option>
              {colleges.map((college) => (
                <option key={college.id} value={college.id}>
                  {college.name}
                </option>
              ))}
            </select>
            {saving.collegeId && <p className="text-xs text-gray-500 mt-1">Saving...</p>}
          </div>

          {/* Course */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select
              value={formData.courseId}
              onChange={(e) => handleDropdownChange('courseId', e.target.value)}
              disabled={saving.courseId}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
            {saving.courseId && <p className="text-xs text-gray-500 mt-1">Saving...</p>}
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interests ({formData.interests.length}/5)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={inputValues.interests}
                onChange={(e) => setInputValues({ ...inputValues, interests: e.target.value })}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleArrayItemAdd('interests', inputValues.interests);
                  }
                }}
                disabled={formData.interests.length >= 5 || saving.interests}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                placeholder="Add interest and press Enter"
              />
              <button
                type="button"
                onClick={() => handleArrayItemAdd('interests', inputValues.interests)}
                disabled={formData.interests.length >= 5 || saving.interests || !inputValues.interests.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving.interests ? '...' : '+'}
              </button>
            </div>
            {formData.interests.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.interests.map((item, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => handleArrayItemRemove('interests', index)}
                      disabled={saving.interests}
                      className="ml-2 text-blue-600 hover:text-blue-800 disabled:opacity-50"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skills ({formData.skills.length}/5)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={inputValues.skills}
                onChange={(e) => setInputValues({ ...inputValues, skills: e.target.value })}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleArrayItemAdd('skills', inputValues.skills);
                  }
                }}
                disabled={formData.skills.length >= 5 || saving.skills}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                placeholder="Add skill and press Enter"
              />
              <button
                type="button"
                onClick={() => handleArrayItemAdd('skills', inputValues.skills)}
                disabled={formData.skills.length >= 5 || saving.skills || !inputValues.skills.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving.skills ? '...' : '+'}
              </button>
            </div>
            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((item, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => handleArrayItemRemove('skills', index)}
                      disabled={saving.skills}
                      className="ml-2 text-green-600 hover:text-green-800 disabled:opacity-50"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Achievements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Achievements ({formData.achievements.length}/5)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={inputValues.achievements}
                onChange={(e) => setInputValues({ ...inputValues, achievements: e.target.value })}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleArrayItemAdd('achievements', inputValues.achievements);
                  }
                }}
                disabled={formData.achievements.length >= 5 || saving.achievements}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                placeholder="Add achievement and press Enter"
              />
              <button
                type="button"
                onClick={() => handleArrayItemAdd('achievements', inputValues.achievements)}
                disabled={formData.achievements.length >= 5 || saving.achievements || !inputValues.achievements.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving.achievements ? '...' : '+'}
              </button>
            </div>
            {formData.achievements.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.achievements.map((item, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => handleArrayItemRemove('achievements', index)}
                      disabled={saving.achievements}
                      className="ml-2 text-purple-600 hover:text-purple-800 disabled:opacity-50"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} (₹{cat.pricePerSlot.toFixed(2)}/slot)
                </option>
              ))}
            </select>
          </div>

          {/* Price Per Slot */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price Per Slot (Optional)</label>
            <input
              type="number"
              value={formData.pricePerSlot}
              onChange={(e) => setFormData({ ...formData, pricePerSlot: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Leave empty to use category default"
              min="0"
              step="0.01"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              maxLength={500}
              placeholder="Tell students about yourself..."
            />
            <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/500 characters</p>
          </div>

          {/* Expertise */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Areas of Expertise</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={inputValues.expertise}
                onChange={(e) => setInputValues({ ...inputValues, expertise: e.target.value })}
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

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={saving.main}
            >
              <MdSave className="w-5 h-5" />
              <span>{saving.main ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MentorProfile;
