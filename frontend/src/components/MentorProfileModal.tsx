import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import api from '../utils/api';

// Extended Mentor interface for modal
interface Mentor {
  id: number;
  backendId?: string; // Backend ID for API calls
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

interface Slot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  status: 'AVAILABLE' | 'BOOKED' | 'CLOSED';
}

interface CartSuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  mentorName: string;
  slotTime: string;
  onGoToCart: () => void;
}

interface MentorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentor: Mentor | null;
}

// Cart Success Popup Component
const CartSuccessPopup: React.FC<CartSuccessPopupProps> = ({ isOpen, onClose, mentorName, slotTime, onGoToCart }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[60]"
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Added to Cart!</h3>
                <div className="space-y-2 mb-6 text-gray-600">
                  <p><span className="font-semibold">Mentor:</span> {mentorName}</p>
                  <p><span className="font-semibold">Time:</span> {slotTime}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                  >
                    Continue Browsing
                  </button>
                  <button
                    onClick={onGoToCart}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                  >
                    Go to Cart
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

const MentorProfileModal: React.FC<MentorProfileModalProps> = ({ isOpen, onClose, mentor }) => {
  const { user } = useAuth();
  const { addItemToCart } = useCart();
  const navigate = useNavigate();
  
  const [showSlots, setShowSlots] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [cartPopupData, setCartPopupData] = useState<{ mentorName: string; slotTime: string } | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [dateSelected, setDateSelected] = useState(false);

  // Get minimum date (at least 48 hours from now)
  const getMinDate = () => {
    const date = new Date();
    date.setHours(date.getHours() + 48);
    return date.toISOString().split('T')[0];
  };

  // Fetch available slots when date is selected
  useEffect(() => {
    const fetchSlots = async () => {
      if (!showSlots || !mentor?.backendId || !dateSelected || !selectedDate) {
        setSlots([]);
        return;
      }

      try {
        setLoadingSlots(true);
        const url = `/api/slots/mentor/${mentor.backendId}?date=${selectedDate}`;
        
        const response = await api.get<{ success: boolean; data: { slots: Slot[] } }>(url);
        
        if (response.data.success) {
          setSlots(response.data.data.slots || []);
        }
      } catch (err: any) {
        console.error('Error fetching slots:', err);
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [showSlots, mentor?.backendId, dateSelected, selectedDate]);

  const handleSelectDate = () => {
    if (!selectedDate) {
      alert('Please select a date first');
      return;
    }
    setDateSelected(true);
  };

  // Reset slots when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowSlots(false);
      setSlots([]);
      setShowCartPopup(false);
      setCartPopupData(null);
      setSelectedDate('');
      setDateSelected(false);
    }
  }, [isOpen]);

  // Early return after all hooks
  if (!mentor) return null;

  // Use actual mentor data, show empty state if not available
  const mentorData = {
    about: mentor.about || `Experienced ${mentor.specialization} professional with ${mentor.experience} of industry experience. Passionate about helping students achieve their academic and career goals through personalized mentorship.`,
    achievements: mentor.achievements || [],
    skills: mentor.skills || [],
    hobbies: mentor.hobbies || [],
    title: mentor.title || `${mentor.specialization} Expert`,
    universityCredentials: mentor.universityCredentials || `${mentor.degree} from ${mentor.university}`
  };

  const handleViewSlots = () => {
    if (!user || user.role !== 'USER') {
      alert('Please login as a user to view available slots');
      navigate('/login');
      return;
    }
    setShowSlots(true);
  };

  const handleAddToCart = async (slotId: string) => {
    if (!user || user.role !== 'USER') {
      alert('Please login as a user to add items to cart');
      navigate('/login');
      return;
    }

    const slot = slots.find(s => s.id === slotId);
    if (!slot) return;

    try {
      setAddingToCart(slotId);
      const success = await addItemToCart(slotId);
      
      if (success) {
        // Format time for popup
        const formatTime = (time: string) => {
          const [hours, minutes] = time.split(':');
          const hour = parseInt(hours || '0');
          const ampm = hour >= 12 ? 'PM' : 'AM';
          const displayHour = hour % 12 || 12;
          return `${displayHour}:${minutes} ${ampm}`;
        };

        const formatDate = (dateString: string) => {
          const date = new Date(dateString);
          return date.toLocaleDateString('en-US', { 
            weekday: 'short',
            month: 'short', 
            day: 'numeric' 
          });
        };

        const slotTime = `${formatDate(slot.date)} at ${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`;
        
        setCartPopupData({
          mentorName: mentor.name,
          slotTime: slotTime
        });
        setShowCartPopup(true);
        
        // Refresh slots to update availability
        const refreshUrl = `/api/slots/mentor/${mentor.backendId}?date=${selectedDate}`;
        const response = await api.get<{ success: boolean; data: { slots: Slot[] } }>(refreshUrl);
        if (response.data.success) {
          setSlots(response.data.data.slots || []);
        }
      } else {
        alert('Failed to add slot to cart. Please try again.');
      }
    } catch (err: any) {
      console.error('Error adding to cart:', err);
      alert(err.response?.data?.message || 'Failed to add slot to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  const handleGoToCart = () => {
    setShowCartPopup(false);
    onClose();
    navigate('/dashboard/bookings');
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours || '0');
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
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
                        
                        {/* View Available Slots Button */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            if (showSlots) {
                              setShowSlots(false);
                            } else {
                              handleViewSlots();
                            }
                          }}
                          className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{showSlots ? 'Hide Slots' : 'View Available Slots'}</span>
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
                          {mentorData.achievements.length > 0 ? (
                            <ol className="space-y-2">
                              {mentorData.achievements.map((achievement, index) => (
                                <li key={index} className="text-white/90 text-sm flex items-start">
                                  <span className="text-blue-300 font-bold mr-2">{index + 1}.</span>
                                  {achievement}
                                </li>
                              ))}
                            </ol>
                          ) : (
                            <p className="text-white/60 text-sm italic">No achievements added yet.</p>
                          )}
                        </motion.div>

                        {/* Skills */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6, duration: 0.5 }}
                          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6"
                        >
                          <h3 className="text-xl font-bold text-white mb-4">Skills</h3>
                          {mentorData.skills.length > 0 ? (
                            <ul className="space-y-2">
                              {mentorData.skills.map((skill, index) => (
                                <li key={index} className="text-white/90 text-sm flex items-center">
                                  <span className="text-blue-300 mr-2">•</span>
                                  {skill}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-white/60 text-sm italic">No skills added yet.</p>
                          )}
                        </motion.div>
                      </div>

                      {/* Hobbies */}
                      {!showSlots && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7, duration: 0.5 }}
                          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6"
                        >
                          <h3 className="text-xl font-bold text-white mb-4">Hobbies</h3>
                          {mentorData.hobbies.length > 0 ? (
                            <ul className="space-y-2">
                              {mentorData.hobbies.map((hobby, index) => (
                                <li key={index} className="text-white/90 text-sm flex items-center">
                                  <span className="text-blue-300 mr-2">•</span>
                                  {hobby}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-white/60 text-sm italic">No hobbies added yet.</p>
                          )}
                        </motion.div>
                      )}

                      {/* Available Slots Section */}
                      {showSlots && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 w-full"
                        >
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">Available Slots</h3>
                            <button
                              onClick={() => {
                                setShowSlots(false);
                                setSelectedDate('');
                                setDateSelected(false);
                                setSlots([]);
                              }}
                              className="text-white/70 hover:text-white text-sm font-medium px-3 py-1 rounded hover:bg-white/10 transition-colors"
                            >
                              Close
                            </button>
                          </div>

                          {/* Date Selection */}
                          <div className="mb-4">
                            <label htmlFor="slot-date" className="block text-sm font-medium text-white mb-2">
                              Select Date <span className="text-red-400">*</span>
                            </label>
                            <div className="flex gap-3 items-center">
                              <input
                                type="date"
                                id="slot-date"
                                value={selectedDate}
                                min={getMinDate()}
                                onChange={(e) => {
                                  setSelectedDate(e.target.value);
                                  setDateSelected(false); // Reset selection when date changes
                                  setSlots([]); // Clear slots when date changes
                                }}
                                className="flex-1 px-4 py-2 rounded-lg bg-white/90 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                              />
                              <button
                                onClick={handleSelectDate}
                                disabled={!selectedDate || loadingSlots}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
                              >
                                Select
                              </button>
                            </div>
                            <p className="text-xs text-white/60 mt-1">
                              * Please select a date (at least 48 hours in advance) and click "Select" to view available slots
                            </p>
                          </div>
                          
                          {!dateSelected ? (
                            <div className="text-center py-12">
                              <div className="inline-block bg-white/10 rounded-full p-4 mb-4">
                                <svg className="w-12 h-12 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <p className="text-white/70 text-sm">Please select a date and click "Select" to view available slots</p>
                            </div>
                          ) : loadingSlots ? (
                            <div className="flex items-center justify-center py-12">
                              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-400"></div>
                              <span className="ml-3 text-white">Loading slots...</span>
                            </div>
                          ) : slots.length === 0 ? (
                            <div className="text-center py-12">
                              <p className="text-white/70 text-sm">
                                No available slots for the selected date. Please try another date.
                              </p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                              {slots.map((slot) => (
                                <motion.div
                                  key={slot.id}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 hover:bg-white/20 transition-colors"
                                >
                                  <div className="text-white text-sm space-y-1 mb-3">
                                    <p className="font-semibold">{formatDate(slot.date)}</p>
                                    <p className="text-xs text-white/80">
                                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                    </p>
                                    <p className="text-blue-300 font-medium">₹{slot.price.toFixed(0)}</p>
                                  </div>
                                  <button
                                    onClick={() => handleAddToCart(slot.id)}
                                    disabled={addingToCart === slot.id || slot.status !== 'AVAILABLE'}
                                    className={`w-full px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                                      addingToCart === slot.id
                                        ? 'bg-gray-500 text-white cursor-wait'
                                        : slot.status !== 'AVAILABLE'
                                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    }`}
                                  >
                                    {addingToCart === slot.id ? (
                                      <span className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-3 w-3 border-t border-b border-white mr-1"></div>
                                        Adding...
                                      </span>
                                    ) : slot.status !== 'AVAILABLE' ? (
                                      'Unavailable'
                                    ) : (
                                      'Add to Cart'
                                    )}
                                  </button>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
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
  return (
    <>
      {ReactDOM.createPortal(
        modalContent,
        document.getElementById('modal-root')!
      )}
      {/* Cart Success Popup */}
      {cartPopupData && (
        <CartSuccessPopup
          isOpen={showCartPopup}
          onClose={() => setShowCartPopup(false)}
          mentorName={cartPopupData.mentorName}
          slotTime={cartPopupData.slotTime}
          onGoToCart={handleGoToCart}
        />
      )}
    </>
  );
};

export default MentorProfileModal;