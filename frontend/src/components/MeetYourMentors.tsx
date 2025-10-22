import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaGraduationCap } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import MentorProfileModal from './MentorProfileModal';

const MeetYourMentors = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  
  const mentors = [
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
  ];

  const filteredMentors = activeFilter === 'all' 
    ? mentors 
    : mentors.filter(mentor => mentor.filter === activeFilter);

  // Modal handlers
  const handleViewProfile = (mentor: any) => {
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

  const filters = [
    { key: 'all', label: 'See All', count: mentors.length },
    { key: 'iilm', label: 'IILM University', count: mentors.filter(m => m.filter === 'iilm').length },
    { key: 'sharda', label: 'Sharda University', count: mentors.filter(m => m.filter === 'sharda').length },
    { key: 'iit', label: 'IIT Delhi', count: mentors.filter(m => m.filter === 'iit').length },
    { key: 'nsut', label: 'NSUT Delhi', count: mentors.filter(m => m.filter === 'nsut').length }
  ];

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

        {/* Mentor Cards */}
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
