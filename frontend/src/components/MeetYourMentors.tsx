import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaGraduationCap } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import MentorProfileModal from './MentorProfileModal';
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

const MeetYourMentors = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [mentors, setMentors] = useState<Mentor[]>([]);
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

  // Fetch mentors data from API
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await api.get<{ success: boolean; data: BackendMentor[]; count: number }>('/api/mentors/public');
        
        if (response.data.success && response.data.data) {
          // Transform backend data to frontend format and limit to first 6 for homepage preview
          const transformedMentors = response.data.data
            .slice(0, 6)
            .map(transformMentor);
          setMentors(transformedMentors);
        } else {
          setError('Failed to fetch mentors.');
        }
      } catch (err: any) {
        console.error('Error fetching mentors:', err);
        setError('Failed to load mentors.');
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  // Generate dynamic filters based on actual colleges
  const getFilters = () => {
    const collegesMap = new Map<string, { name: string; count: number }>();
    
    mentors.forEach(mentor => {
      if (mentor.university && mentor.university !== 'Not specified') {
        const key = mentor.filter;
        const current = collegesMap.get(key) || { name: mentor.university, count: 0 };
        collegesMap.set(key, { name: current.name, count: current.count + 1 });
      }
    });

    const collegeFilters = Array.from(collegesMap.entries()).map(([key, value]) => ({
      key,
      label: value.name,
      count: value.count
    }));

    return [
      { key: 'all', label: 'See All', count: mentors.length },
      ...collegeFilters
    ];
  };

  const filters = getFilters();

  const filteredMentors = activeFilter === 'all' 
    ? mentors 
    : mentors.filter(mentor => mentor.filter === activeFilter);

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
    <section id="mentors" className="py-16 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl lg:text-4xl font-bold mb-4 text-[#000000]">
            Meet Your Mentors
          </h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto font-normal">
            Connect with current students and recent graduates who can guide you through your college journey
          </p>
        </motion.div>

        {/* Filter Buttons */}
        {!loading && mentors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-3 mb-8"
          >
            {filters.map((filter) => (
              <motion.button
                key={filter.key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveFilter(filter.key)}
                className={`px-4 py-2 rounded-full font-normal transition-all duration-300 text-sm ${
                  activeFilter === filter.key
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                }`}
              >
                {filter.label}
                <span className="ml-2 text-xs opacity-75">({filter.count})</span>
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading mentors...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <div className="text-red-600 text-sm">{error}</div>
          </div>
        )}

        {/* Mentor Cards */}
        {!loading && filteredMentors.length > 0 && (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          >
            {filteredMentors.map((mentor, index) => (
            <motion.div
              key={mentor.id}
              layout
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-[rgba(46,48,49,1)] rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
            >
              {/* HR Line */}
              <hr className="border-gray-600" />
              
              {/* Mentor Image */}
              <div className="relative h-36 flex items-center justify-center p-4">
                <motion.img
                  src={mentor.image}
                  alt={mentor.name}
                  className="w-[90%] h-28 rounded-lg object-cover shadow-lg border-[1px] border-white mx-auto"
                  whileHover={{ scale: 1.05 }}
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                  <div className="flex items-center space-x-1">
                    <FaStar className="text-yellow-400 text-xs" />
                    <span className="text-xs font-medium">{mentor.rating}</span>
                  </div>
                </div>
              </div>

              {/* HR Line between image and name */}
              <hr className="border-gray-600" />

              {/* Mentor Info */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-white mb-2">{mentor.name}</h3>
                <div className="flex items-center text-blue-400 mb-2">
                  <FaGraduationCap className="text-sm mr-2" />
                  <span className="text-sm font-normal">{mentor.university}</span>
                </div>
                <p className="text-gray-300 text-sm font-normal mb-2">{mentor.degree}</p>
                <p className="text-gray-400 text-xs font-normal mb-3">
                  {mentor.experience} experience • {mentor.specialization}
                </p>
                
                {/* Rating */}
                <div className="flex items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={`text-xs ${
                        i < Math.floor(mentor.rating)
                          ? 'text-yellow-400'
                          : i < mentor.rating
                          ? 'text-yellow-200'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-xs text-gray-300">({mentor.rating})</span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleViewProfile(mentor)}
                  className="w-full btn-primary text-sm py-2"
                >
                  Click to Know More
                </motion.button>
              </div>
            </motion.div>
          ))}
          </motion.div>
        )}

        {/* No Mentors Found */}
        {!loading && filteredMentors.length === 0 && mentors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No mentors found.</p>
          </div>
        )}

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link to="/mentors">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-outline text-base px-6 py-3"
            >
              View All Mentors
            </motion.button>
          </Link>
        </motion.div>
      </div>

      {/* Mentor Profile Modal */}
      <MentorProfileModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mentor={selectedMentor}
      />
    </section>
  );
};

export default MeetYourMentors;
