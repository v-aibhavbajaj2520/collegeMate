import React, { useState, useEffect } from 'react';
import { 
  MdSearch, 
  MdAdd,
  MdDelete,
  MdLibraryBooks,
  MdBook
} from 'react-icons/md';
import ResponsiveTable from '../../shared/ResponsiveTable';
import api from '../../../../utils/api';

interface College {
  id: string;
  name: string;
  createdAt: string;
}

interface Course {
  id: string;
  name: string;
  createdAt: string;
}

interface CollegeFormData {
  name: string;
}

interface CourseFormData {
  name: string;
}

const AdminCollegesAndCoursesPage: React.FC = () => {
  // Colleges state
  const [colleges, setColleges] = useState<College[]>([]);
  const [filteredColleges, setFilteredColleges] = useState<College[]>([]);
  const [collegeSearchTerm, setCollegeSearchTerm] = useState('');
  const [showCollegeModal, setShowCollegeModal] = useState(false);
  const [collegeFormData, setCollegeFormData] = useState<CollegeFormData>({ name: '' });
  const [collegeFormErrors, setCollegeFormErrors] = useState<Record<string, string>>({});
  const [collegeSubmitting, setCollegeSubmitting] = useState(false);

  // Courses state
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [courseSearchTerm, setCourseSearchTerm] = useState('');
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseFormData, setCourseFormData] = useState<CourseFormData>({ name: '' });
  const [courseFormErrors, setCourseFormErrors] = useState<Record<string, string>>({});
  const [courseSubmitting, setCourseSubmitting] = useState(false);

  // Loading and error states
  const [collegesLoading, setCollegesLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [collegesError, setCollegesError] = useState<string>('');
  const [coursesError, setCoursesError] = useState<string>('');

  // Fetch colleges from backend
  useEffect(() => {
    fetchColleges();
  }, []);

  // Fetch courses from backend
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchColleges = async () => {
    try {
      setCollegesLoading(true);
      setCollegesError('');
      const response = await api.get<{ success: boolean; data: College[] }>('/api/colleges');
      if (response.data.success) {
        setColleges(response.data.data);
        setFilteredColleges(response.data.data);
      }
    } catch (err: any) {
      console.error('Error fetching colleges:', err);
      setCollegesError(err.response?.data?.message || 'Failed to fetch colleges');
    } finally {
      setCollegesLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      setCoursesError('');
      const response = await api.get<{ success: boolean; data: Course[] }>('/api/courses');
      if (response.data.success) {
        setCourses(response.data.data);
        setFilteredCourses(response.data.data);
      }
    } catch (err: any) {
      console.error('Error fetching courses:', err);
      setCoursesError(err.response?.data?.message || 'Failed to fetch courses');
    } finally {
      setCoursesLoading(false);
    }
  };

  // Filter colleges based on search term
  useEffect(() => {
    if (collegeSearchTerm.trim() === '') {
      setFilteredColleges(colleges);
    } else {
      const filtered = colleges.filter(college =>
        college.name.toLowerCase().includes(collegeSearchTerm.toLowerCase())
      );
      setFilteredColleges(filtered);
    }
  }, [collegeSearchTerm, colleges]);

  // Filter courses based on search term
  useEffect(() => {
    if (courseSearchTerm.trim() === '') {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter(course =>
        course.name.toLowerCase().includes(courseSearchTerm.toLowerCase())
      );
      setFilteredCourses(filtered);
    }
  }, [courseSearchTerm, courses]);

  // College handlers
  const handleAddCollege = () => {
    setCollegeFormData({ name: '' });
    setCollegeFormErrors({});
    setShowCollegeModal(true);
  };

  const handleDeleteCollege = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this college? This action cannot be undone if mentors are assigned to it.')) {
      return;
    }

    try {
      await api.delete(`/api/colleges/${id}`);
      await fetchColleges();
    } catch (err: any) {
      console.error('Error deleting college:', err);
      alert(err.response?.data?.message || 'Failed to delete college');
    }
  };

  const handleCollegeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCollegeFormErrors({});
    setCollegeSubmitting(true);

    const errors: Record<string, string> = {};
    if (!collegeFormData.name.trim()) {
      errors.name = 'College name is required';
    }

    if (Object.keys(errors).length > 0) {
      setCollegeFormErrors(errors);
      setCollegeSubmitting(false);
      return;
    }

    try {
      await api.post('/api/colleges', collegeFormData);
      await fetchColleges();
      setShowCollegeModal(false);
      setCollegeFormData({ name: '' });
    } catch (err: any) {
      console.error('Error saving college:', err);
      const errorMessage = err.response?.data?.message || 'Failed to save college';
      setCollegeFormErrors({ general: errorMessage });
    } finally {
      setCollegeSubmitting(false);
    }
  };

  // Course handlers
  const handleAddCourse = () => {
    setCourseFormData({ name: '' });
    setCourseFormErrors({});
    setShowCourseModal(true);
  };

  const handleDeleteCourse = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone if mentors are assigned to it.')) {
      return;
    }

    try {
      await api.delete(`/api/courses/${id}`);
      await fetchCourses();
    } catch (err: any) {
      console.error('Error deleting course:', err);
      alert(err.response?.data?.message || 'Failed to delete course');
    }
  };

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCourseFormErrors({});
    setCourseSubmitting(true);

    const errors: Record<string, string> = {};
    if (!courseFormData.name.trim()) {
      errors.name = 'Course name is required';
    }

    if (Object.keys(errors).length > 0) {
      setCourseFormErrors(errors);
      setCourseSubmitting(false);
      return;
    }

    try {
      await api.post('/api/courses', courseFormData);
      await fetchCourses();
      setShowCourseModal(false);
      setCourseFormData({ name: '' });
    } catch (err: any) {
      console.error('Error saving course:', err);
      const errorMessage = err.response?.data?.message || 'Failed to save course';
      setCourseFormErrors({ general: errorMessage });
    } finally {
      setCourseSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manage Colleges & Courses</h1>
        <p className="text-gray-600 mt-2">Add and manage colleges and courses for mentors to select</p>
      </div>

      {/* Colleges Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <MdLibraryBooks className="w-6 h-6 mr-2 text-blue-600" />
              Colleges
            </h2>
            <p className="text-gray-600 mt-1 text-sm">Manage colleges that mentors can select</p>
          </div>
          <button 
            onClick={handleAddCollege}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <MdAdd className="w-4 h-4 mr-2" />
            Add College
          </button>
        </div>

        {/* Colleges Stats Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <MdLibraryBooks className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Colleges</p>
              <p className="text-2xl font-bold text-gray-900">{colleges.length}</p>
            </div>
          </div>
        </div>

        {/* Colleges Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search colleges..."
                value={collegeSearchTerm}
                onChange={(e) => setCollegeSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Colleges Table */}
        <ResponsiveTable>
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">All Colleges</h3>
          </div>
          
          <table className="w-full divide-y divide-gray-200" style={{ minWidth: '600px' }}>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  College Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {collegesLoading ? (
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : collegesError ? (
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-center text-red-500">
                    {collegesError}
                  </td>
                </tr>
              ) : filteredColleges.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-center text-gray-500">
                    No colleges found
                  </td>
                </tr>
              ) : (
                filteredColleges.map((college) => (
                  <tr key={college.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {college.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{college.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(college.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteCollege(college.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <MdDelete className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </ResponsiveTable>
      </div>

      {/* Courses Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <MdBook className="w-6 h-6 mr-2 text-green-600" />
              Courses
            </h2>
            <p className="text-gray-600 mt-1 text-sm">Manage courses that mentors can select</p>
          </div>
          <button 
            onClick={handleAddCourse}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <MdAdd className="w-4 h-4 mr-2" />
            Add Course
          </button>
        </div>

        {/* Courses Stats Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <MdBook className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
            </div>
          </div>
        </div>

        {/* Courses Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses..."
                value={courseSearchTerm}
                onChange={(e) => setCourseSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Courses Table */}
        <ResponsiveTable>
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">All Courses</h3>
          </div>
          
          <table className="w-full divide-y divide-gray-200" style={{ minWidth: '600px' }}>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {coursesLoading ? (
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : coursesError ? (
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-center text-red-500">
                    {coursesError}
                  </td>
                </tr>
              ) : filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-center text-gray-500">
                    No courses found
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {course.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{course.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(course.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <MdDelete className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </ResponsiveTable>
      </div>

      {/* Add College Modal */}
      {showCollegeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Add New College
            </h2>
            
            <form onSubmit={handleCollegeSubmit} className="space-y-4">
              {collegeFormErrors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {collegeFormErrors.general}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  College Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={collegeFormData.name}
                  onChange={(e) => setCollegeFormData({ ...collegeFormData, name: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    collegeFormErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., IIT Delhi, AIIMS, Harvard University"
                />
                {collegeFormErrors.name && <p className="text-red-500 text-sm mt-1">{collegeFormErrors.name}</p>}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCollegeModal(false);
                    setCollegeFormData({ name: '' });
                    setCollegeFormErrors({});
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={collegeSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {collegeSubmitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Add New Course
            </h2>
            
            <form onSubmit={handleCourseSubmit} className="space-y-4">
              {courseFormErrors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {courseFormErrors.general}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={courseFormData.name}
                  onChange={(e) => setCourseFormData({ ...courseFormData, name: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    courseFormErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Computer Science, Medicine, MBA"
                />
                {courseFormErrors.name && <p className="text-red-500 text-sm mt-1">{courseFormErrors.name}</p>}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCourseModal(false);
                    setCourseFormData({ name: '' });
                    setCourseFormErrors({});
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={courseSubmitting}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {courseSubmitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCollegesAndCoursesPage;

