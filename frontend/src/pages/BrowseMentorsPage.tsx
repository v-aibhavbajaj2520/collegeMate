import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';
import MentorProfileModal from '../components/MentorProfileModal';
import api from '../utils/api';

// Backend Mentor interface
interface BackendMentor {
  id: string;
  name: string;
  email: string;
  role: string;
  pricePerSlot: number | null;
  bio: string | null;
  expertise: string[];
  interests: string[];
  skills: string[];
  achievements: string[];
  categoryId: string | null;
  category: {
    id: string;
    name: string;
    pricePerSlot: number;
  } | null;
  collegeId: string | null;
  college: {
    id: string;
    name: string;
  } | null;
  courseId: string | null;
  course: {
    id: string;
    name: string;
  } | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    mentorBookings?: number;
  };
}

// Frontend Mentor interface
interface Mentor {
  id: number;
  backendId: string; // Store the actual backend ID for API calls
  name: string;
  university: string;
  degree: string;
  rating: number;
  image: string;
  filter: string;
  experience: string;
  specialization: string;
  // Additional fields for modal
  about?: string;
  achievements?: string[];
  skills?: string[];
  hobbies?: string[];
  title?: string;
  universityCredentials?: string;
}

// MentorCard component (reusing from MeetYourMentors)
const MentorCard = ({ mentor, onViewProfile }: { mentor: Mentor; onViewProfile: (mentor: Mentor) => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="bg-[rgba(46,48,49,1)] rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
    >
      {/* HR Line */}
      <hr className="border-gray-600" />
      
      {/* Mentor Image */}
      <div className="relative h-48 flex items-center justify-center p-6">
        <motion.img
          src={mentor.image}
          alt={mentor.name}
          className="w-[90%] h-36 rounded-lg object-cover shadow-lg border-[1px] border-white mx-auto"
          whileHover={{ scale: 1.05 }}
        />
        <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
          <div className="flex items-center space-x-1">
            <span className="text-xs font-medium">⭐ {mentor.rating}</span>
          </div>
        </div>
      </div>

      {/* HR Line between image and name */}
      <hr className="border-gray-600" />

      {/* Mentor Info */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2">{mentor.name}</h3>
        <div className="flex items-center text-blue-400 mb-2">
          <span className="text-sm font-normal">{mentor.university}</span>
        </div>
        <p className="text-gray-300 text-sm font-normal mb-3">{mentor.degree}</p>
        <p className="text-gray-400 text-xs font-normal mb-4">
          {mentor.experience} experience • {mentor.specialization}
        </p>
        
        {/* Rating */}
        <div className="flex items-center mb-4">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className={`text-sm ${
                i < Math.floor(mentor.rating)
                  ? 'text-yellow-400'
                  : i < mentor.rating
                  ? 'text-yellow-200'
                  : 'text-gray-300'
              }`}
            >
              ⭐
            </span>
          ))}
          <span className="ml-2 text-sm text-gray-300">({mentor.rating})</span>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onViewProfile(mentor)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
        >
          Click to Know More
        </motion.button>
      </div>
    </motion.div>
  );
};

const BrowseMentorsPage = () => {
  const [allMentors, setAllMentors] = useState<Mentor[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<Mentor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);

  // Helper function to calculate experience from createdAt date
  const calculateExperience = (createdAt: string): string => {
    const daysSinceJoin = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
    const years = Math.floor(daysSinceJoin / 365);
    const months = Math.floor((daysSinceJoin % 365) / 30);
    
    if (years > 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    } else if (months > 0) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    } else {
      return 'Less than a month';
    }
  };

  // Helper function to generate a unique numeric ID from string
  const generateNumericId = (id: string): number => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      const char = id.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  };

  // Transform backend mentor to frontend format
  const transformMentor = (backendMentor: BackendMentor): Mentor => {
    // Generate filter from university name (lowercase, no spaces)
    const universityFilter = backendMentor.college?.name
      ?.toLowerCase()
      .replace(/\s+/g, '')
      .substring(0, 10) || 'general';

    // Calculate experience
    const experience = calculateExperience(backendMentor.createdAt);

    // Get specialization from category or expertise
    const specialization = backendMentor.category?.name || 
                          (backendMentor.expertise && backendMentor.expertise[0]) || 
                          'General Mentoring';

    // Generate rating (default to 4.5, can be improved with actual rating system)
    // For now, use a simple formula based on bookings
    const bookingCount = backendMentor._count?.mentorBookings || 0;
    const rating = bookingCount > 10 ? 4.8 : bookingCount > 5 ? 4.5 : 4.3;

    // Create about text from bio or generate from experience
    const about = backendMentor.bio || 
      `Experienced ${specialization} professional with ${experience} of industry experience. Passionate about helping students achieve their academic and career goals through personalized mentorship.`;

    return {
      id: generateNumericId(backendMentor.id),
      backendId: backendMentor.id, // Store the actual backend ID
      name: backendMentor.name,
      university: backendMentor.college?.name || 'Not specified',
      degree: backendMentor.course?.name || 'Not specified',
      rating: rating,
      image: `https://i.pravatar.cc/150?u=${backendMentor.id}`,
      filter: universityFilter,
      experience: experience,
      specialization: specialization,
      // Additional fields for modal
      about: about,
      achievements: backendMentor.achievements && backendMentor.achievements.length > 0 
        ? backendMentor.achievements 
        : undefined,
      skills: backendMentor.skills && backendMentor.skills.length > 0 
        ? backendMentor.skills 
        : undefined,
      hobbies: backendMentor.interests && backendMentor.interests.length > 0 
        ? backendMentor.interests 
        : undefined,
      title: `${specialization} Expert`,
      universityCredentials: `${backendMentor.course?.name || 'Degree'} from ${backendMentor.college?.name || 'University'}`
    };
  };

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch mentors data from API
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await api.get<{ success: boolean; data: BackendMentor[]; count: number }>('/api/mentors/public');
        
        if (response.data.success && response.data.data) {
          // Transform backend data to frontend format
          const transformedMentors = response.data.data.map(transformMentor);
          setAllMentors(transformedMentors);
          setFilteredMentors(transformedMentors);
          
          // If no mentors found
          if (transformedMentors.length === 0) {
            setError('No verified mentors found in the database.');
          }
        } else {
          setError('Failed to fetch mentors. Please try again later.');
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch mentors. Please make sure the backend server is running.';
        setError(errorMessage);
        console.error('Error fetching mentors:', err);
        
        // Log more details for debugging
        if (err.response) {
          console.error('Response status:', err.response.status);
          console.error('Response data:', err.response.data);
        } else if (err.request) {
          console.error('Request made but no response received. Is the backend server running?');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  // Live search functionality
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredMentors(allMentors);
    } else {
      const filtered = allMentors.filter(mentor =>
        (mentor.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (mentor.university || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (mentor.degree || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (mentor.specialization || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMentors(filtered);
    }
  }, [searchTerm, allMentors]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Modal handlers
  const handleViewProfile = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMentor(null);
  };

  // Scroll lock effect when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to reset the style when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-blue-50 to-yellow-50">
      {/* Main Heading */}
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl lg:text-6xl font-bold text-black mb-6">
              Browse Mentors
            </h1>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search for mentors"
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-blue-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-lg transition-all duration-300"
              />
            </div>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading mentors...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg max-w-md mx-auto">
                {error}
              </div>
            </div>
          )}

          {/* Results Count */}
          {!loading && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8"
            >
              <p className="text-gray-600 text-lg">
                {searchTerm ? `Found ${filteredMentors.length} mentor${filteredMentors.length !== 1 ? 's' : ''} matching "${searchTerm}"` : `Showing all ${filteredMentors.length} mentors`}
              </p>
            </motion.div>
          )}

          {/* No Results */}
          {!loading && !error && filteredMentors.length === 0 && searchTerm && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">
                No mentors found matching "{searchTerm}". Try a different search term.
              </div>
            </div>
          )}

          {/* Mentor Grid */}
          {!loading && !error && filteredMentors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredMentors.map((mentor) => (
                <MentorCard key={mentor.id} mentor={mentor} onViewProfile={handleViewProfile} />
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Mentor Profile Modal */}
      <MentorProfileModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mentor={selectedMentor}
      />
    </div>
  );
};

export default BrowseMentorsPage;
