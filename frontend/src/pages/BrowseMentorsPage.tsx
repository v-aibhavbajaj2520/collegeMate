import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';
import MentorProfileModal from '../components/MentorProfileModal';

// Mentor interface
interface Mentor {
  id: number;
  name: string;
  university: string;
  degree: string;
  rating: number;
  image: string;
  filter: string;
  experience: string;
  specialization: string;
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

  // Mock data for development (replace with actual API call)
  const mockMentors: Mentor[] = [
    {
      id: 1,
      name: "Vaibhav Bajaj",
      university: "IILM University",
      degree: "Bachelors of Technology - Computer Science",
      rating: 4.5,
      image: "https://i.pravatar.cc/150?u=vaibhav",
      filter: "iilm",
      experience: "3 years",
      specialization: "Web Development"
    },
    {
      id: 2,
      name: "Sarah Johnson",
      university: "Sharda University",
      degree: "Bachelors of Pharmacy",
      rating: 5,
      image: "https://i.pravatar.cc/150?u=sarah",
      filter: "sharda",
      experience: "2 years",
      specialization: "Pharmaceutical Research"
    },
    {
      id: 3,
      name: "Raj Patel",
      university: "IIT Delhi",
      degree: "Masters in Computer Science",
      rating: 4.8,
      image: "https://i.pravatar.cc/150?u=raj",
      filter: "iit",
      experience: "5 years",
      specialization: "Machine Learning"
    },
    {
      id: 4,
      name: "Priya Sharma",
      university: "NSUT Delhi",
      degree: "Bachelors of Technology - Electronics",
      rating: 4.7,
      image: "https://i.pravatar.cc/150?u=priya",
      filter: "nsut",
      experience: "4 years",
      specialization: "Electronics Engineering"
    },
    {
      id: 5,
      name: "Amit Kumar",
      university: "IILM University",
      degree: "Bachelors of Business Administration",
      rating: 4.3,
      image: "https://i.pravatar.cc/150?u=amit",
      filter: "iilm",
      experience: "2 years",
      specialization: "Business Management"
    },
    {
      id: 6,
      name: "Neha Singh",
      university: "Sharda University",
      degree: "Masters in Psychology",
      rating: 4.9,
      image: "https://i.pravatar.cc/150?u=neha",
      filter: "sharda",
      experience: "3 years",
      specialization: "Clinical Psychology"
    }
  ];

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch mentors data
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);
        // For now, using mock data. Replace with actual API call:
        // const response = await axios.get('/api/mentors');
        // setAllMentors(response.data);
        
        // Using mock data for development
        setAllMentors(mockMentors);
        setFilteredMentors(mockMentors);
        setError('');
      } catch (err) {
        setError('Failed to fetch mentors. Please try again later.');
        console.error('Error fetching mentors:', err);
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
        mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.degree.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
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
