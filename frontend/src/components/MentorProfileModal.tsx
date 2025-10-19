import React from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Extended Mentor interface for modal
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
  // Additional fields for modal
  about?: string;
  achievements?: string[];
  skills?: string[];
  hobbies?: string[];
  title?: string;
  universityCredentials?: string;
}

interface MentorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentor: Mentor | null;
}

const MentorProfileModal: React.FC<MentorProfileModalProps> = ({ isOpen, onClose, mentor }) => {
  if (!mentor) return null;

  // Default data for missing fields
  const mentorData = {
    about: mentor.about || `Experienced ${mentor.specialization} professional with ${mentor.experience} of industry experience. Passionate about helping students achieve their academic and career goals through personalized mentorship.`,
    achievements: mentor.achievements || [
      "Published 5 research papers in top-tier journals",
      "Led 3 successful startup projects",
      "Mentored 50+ students to successful placements",
      "Awarded 'Best Mentor' by University 2023"
    ],
    skills: mentor.skills || [
      "Web Development",
      "Machine Learning",
      "Data Structures & Algorithms",
      "Project Management",
      "Team Leadership",
      "Technical Writing"
    ],
    hobbies: mentor.hobbies || [
      "Photography",
      "Chess",
      "Hiking",
      "Reading Tech Blogs",
      "Cooking"
    ],
    title: mentor.title || `${mentor.specialization} Expert`,
    universityCredentials: mentor.universityCredentials || `${mentor.degree} from ${mentor.university}`
  };

  // The JSX for your modal, with the 'fixed' positioning
  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 1. The Backdrop with fixed positioning */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-40"
          />

          {/* 2. The Fixed Centering Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* 3. The Modal Panel itself (automatically centered) */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ 
                type: "spring", 
                damping: 25, 
                stiffness: 200,
                duration: 0.5 
              }}
              className="relative bg-[#2E3031] text-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto w-full max-w-6xl"
              style={{
                background: 'linear-gradient(180deg, #4690FE 0%, #2E3031 100%)'
              }}
            >
              {/* Close Button */}
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl z-50 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
              >
                ×
              </button>

              <div className="h-full flex flex-col p-8">
                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                    {/* Left Column - Profile Image & About */}
                    <div className="lg:col-span-1 space-y-6">
                      {/* Profile Image */}
                      <div className="flex justify-center">
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.2, duration: 0.5 }}
                          className="relative"
                        >
                          <img
                            src={mentor.image}
                            alt={mentor.name}
                            className="w-48 h-48 rounded-2xl object-cover shadow-2xl border-4 border-white/20"
                          />
                          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <span
                                    key={i}
                                    className={`text-lg ${
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
                                <span className="ml-2 text-sm font-medium text-gray-700">
                                  {mentor.rating}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </div>

                      {/* About Mentor */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="bg-white/10 backdrop-blur-sm rounded-2xl p-6"
                      >
                        <h3 className="text-xl font-bold text-white mb-4">About Mentor</h3>
                        <p className="text-white/90 text-sm leading-relaxed">
                          {mentorData.about}
                        </p>
                      </motion.div>
                    </div>

                    {/* Right Column - Details */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Header Section */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="flex justify-between items-start"
                      >
                        <div>
                          <h2 className="text-3xl font-bold text-white mb-2">{mentor.name}</h2>
                          <p className="text-blue-200 text-lg mb-1">{mentorData.title} | {mentor.specialization}</p>
                          <p className="text-white/80 text-sm">{mentorData.universityCredentials}</p>
                        </div>
                        
                        {/* Schedule Meeting Button */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Schedule Meeting</span>
                        </motion.button>
                      </motion.div>

                      {/* Content Sections */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Achievements */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5, duration: 0.5 }}
                          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6"
                        >
                          <h3 className="text-xl font-bold text-white mb-4">Achievements</h3>
                          <ol className="space-y-2">
                            {mentorData.achievements.map((achievement, index) => (
                              <li key={index} className="text-white/90 text-sm flex items-start">
                                <span className="text-blue-300 font-bold mr-2">{index + 1}.</span>
                                {achievement}
                              </li>
                            ))}
                          </ol>
                        </motion.div>

                        {/* Skills */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6, duration: 0.5 }}
                          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6"
                        >
                          <h3 className="text-xl font-bold text-white mb-4">Skills</h3>
                          <ul className="space-y-2">
                            {mentorData.skills.map((skill, index) => (
                              <li key={index} className="text-white/90 text-sm flex items-center">
                                <span className="text-blue-300 mr-2">•</span>
                                {skill}
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      </div>

                      {/* Hobbies */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                        className="bg-white/10 backdrop-blur-sm rounded-2xl p-6"
                      >
                        <h3 className="text-xl font-bold text-white mb-4">Hobbies</h3>
                        <ul className="space-y-2">
                          {mentorData.hobbies.map((hobby, index) => (
                            <li key={index} className="text-white/90 text-sm flex items-center">
                              <span className="text-blue-300 mr-2">•</span>
                              {hobby}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Footer - View Resume Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="mt-6"
                >
                  <div className="flex justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-white text-gray-800 hover:bg-gray-100 px-8 py-4 rounded-lg font-bold text-lg transition-colors shadow-lg flex items-center space-x-2"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>View Resume</span>
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  // Use the Portal to render the modal content into '#modal-root'
  return ReactDOM.createPortal(
    modalContent,
    document.getElementById('modal-root')!
  );
};

export default MentorProfileModal;