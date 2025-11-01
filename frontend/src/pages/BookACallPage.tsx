import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

interface Mentor {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  expertise: string[];
  category: {
    id: string;
    name: string;
    pricePerSlot: number;
  } | null;
  pricePerSlot: number | null;
}

interface Slot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  status: 'AVAILABLE' | 'BOOKED' | 'CLOSED';
}

const BookACallPage: React.FC = () => {
  const { user } = useAuth();
  const { addItemToCart } = useCart();
  const navigate = useNavigate();

  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [selectedMentorId, setSelectedMentorId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [loadingMentors, setLoadingMentors] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [formData, setFormData] = useState({
    mentorId: '',
    date: '',
    slotId: '',
    notes: '',
    phoneNumber: ''
  });

  // Fetch mentors on component mount
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoadingMentors(true);
        const response = await api.get<{ success: boolean; data: Mentor[] }>('/api/mentors/public');
        if (response.data.success) {
          setMentors(response.data.data);
        }
      } catch (err: any) {
        console.error('Error fetching mentors:', err);
        alert('Failed to fetch mentors. Please try again.');
      } finally {
        setLoadingMentors(false);
      }
    };
    fetchMentors();
  }, []);

  // Fetch available slots when mentor and date are selected
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!selectedMentorId || !selectedDate) {
        setAvailableSlots([]);
        setSelectedSlotId('');
        return;
      }

      try {
        setLoadingSlots(true);
        const response = await api.get<{ success: boolean; data: { slots: Slot[] } }>(
          `/api/slots/mentor/${selectedMentorId}?date=${selectedDate}`
        );
        
        if (response.data.success) {
          setAvailableSlots(response.data.data.slots || []);
        }
      } catch (err: any) {
        console.error('Error fetching slots:', err);
        alert(err.response?.data?.message || 'Failed to fetch available slots');
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    if (selectedMentorId && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedMentorId, selectedDate]);

  // Get minimum date (at least 48 hours from now)
  const getMinDate = () => {
    const date = new Date();
    date.setHours(date.getHours() + 48);
    return date.toISOString().split('T')[0];
  };

  // Get selected mentor details
  const selectedMentor = mentors.find(m => m.id === selectedMentorId);
  const selectedSlot = availableSlots.find(s => s.id === selectedSlotId);

  const handleAddToCart = async () => {
      if (!user || user.role !== 'USER') {
      alert('Please login as a user to book a call');
      navigate('/login');
      return;
    }

    if (!selectedSlotId) {
      alert('Please select a time slot');
      return;
    }

    try {
      setAddingToCart(true);
      const success = await addItemToCart(selectedSlotId);
      if (success) {
        alert('Slot added to cart successfully!');
        // Reset form
        setFormData({ mentorId: '', date: '', slotId: '', notes: '', phoneNumber: '' });
        setSelectedMentorId('');
        setSelectedDate('');
        setSelectedSlotId('');
        setAvailableSlots([]);
      } else {
        alert('Failed to add slot to cart');
      }
    } catch (err: any) {
      console.error('Error adding to cart:', err);
      alert(err.response?.data?.message || 'Failed to add slot to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleCheckout = async () => {
    // First add to cart, then navigate
    if (!selectedSlotId) {
      alert('Please select a time slot');
      return;
    }

    await handleAddToCart();
    // Navigate to cart - the cart component should show checkout
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
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Book a Call</h1>
          <p className="text-gray-300 text-lg">Schedule a session with our expert mentors</p>
        </motion.div>

        {/* Booking Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20"
        >
          <form className="space-y-6">
            {/* Mentor Selection */}
            <div>
              <label htmlFor="mentor" className="block text-sm font-medium text-white mb-2">
                Select Your Mentor <span className="text-red-400">*</span>
              </label>
              <select
                id="mentor"
                value={selectedMentorId}
                onChange={(e) => {
                  setSelectedMentorId(e.target.value);
                  setFormData({ ...formData, mentorId: e.target.value });
                  setSelectedDate('');
                  setSelectedSlotId('');
                  setAvailableSlots([]);
                }}
                className="w-full px-4 py-3 rounded-lg bg-white/90 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Choose a mentor...</option>
                {loadingMentors ? (
                  <option disabled>Loading mentors...</option>
                ) : (
                  mentors.map((mentor) => (
                    <option key={mentor.id} value={mentor.id}>
                      {mentor.name} {mentor.category && `- ${mentor.category.name}`}
                    </option>
                  ))
                )}
              </select>
              {selectedMentor && (
                <div className="mt-2 p-3 bg-white/5 rounded-lg">
                  <p className="text-sm text-gray-300">
                    <span className="font-semibold">{selectedMentor.name}</span>
                    {selectedMentor.category && (
                      <span className="text-gray-400"> • {selectedMentor.category.name}</span>
                    )}
                  </p>
                  {selectedMentor.bio && (
                    <p className="text-xs text-gray-400 mt-1">{selectedMentor.bio}</p>
                  )}
                  {selectedMentor.expertise && selectedMentor.expertise.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedMentor.expertise.map((skill, idx) => (
                        <span key={idx} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-blue-400 mt-2">
                    Price per slot: ₹{selectedMentor.pricePerSlot || selectedMentor.category?.pricePerSlot || 'N/A'}
                  </p>
                </div>
              )}
            </div>

            {/* Date Selection */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-white mb-2">
                Select Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                id="date"
                value={selectedDate}
                min={getMinDate()}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setFormData({ ...formData, date: e.target.value });
                  setSelectedSlotId('');
                  setAvailableSlots([]);
                }}
                className="w-full px-4 py-3 rounded-lg bg-white/90 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={!selectedMentorId}
              />
              <p className="text-xs text-gray-400 mt-1">
                * Slots must be booked at least 48 hours in advance
              </p>
            </div>

            {/* Time Slot Selection */}
            {selectedDate && selectedMentorId && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Select Time Slot <span className="text-red-400">*</span>
                </label>
                {loadingSlots ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-white">Loading available slots...</span>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                    <p className="text-yellow-200 text-sm">
                      {selectedDate && selectedMentorId 
                        ? 'No available slots for this date. Please try another date.'
                        : 'Please select a mentor and date first.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => {
                          setSelectedSlotId(slot.id);
                          setFormData({ ...formData, slotId: slot.id });
                        }}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          selectedSlotId === slot.id
                            ? 'bg-blue-500 border-blue-400 text-white'
                            : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        <div className="text-sm font-semibold">{formatTime(slot.startTime)}</div>
                        <div className="text-xs opacity-75">₹{slot.price.toFixed(0)}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Additional Details */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-white mb-2">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="+91 1234567890"
                className="w-full px-4 py-3 rounded-lg bg-white/90 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-white mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any specific topics you'd like to discuss..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-white/90 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Selected Slot Summary */}
            {selectedSlot && selectedMentor && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-blue-500/20 border border-blue-400/50 rounded-lg"
              >
                <h3 className="text-white font-semibold mb-2">Selected Slot Summary</h3>
                <div className="space-y-1 text-sm text-gray-200">
                  <p><span className="font-medium">Mentor:</span> {selectedMentor.name}</p>
                  <p><span className="font-medium">Date:</span> {formatDate(selectedSlot.date)}</p>
                  <p><span className="font-medium">Time:</span> {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}</p>
                  <p><span className="font-medium">Price:</span> ₹{selectedSlot.price.toFixed(2)}</p>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!selectedSlotId || addingToCart}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                {addingToCart ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Adding...
                  </>
                ) : (
                  'Add to Cart'
                )}
              </button>
              <button
                type="button"
                onClick={handleCheckout}
                disabled={!selectedSlotId || addingToCart}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Add to Cart & Checkout
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default BookACallPage;

