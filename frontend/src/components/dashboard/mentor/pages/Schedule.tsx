import React, { useState, useEffect } from 'react';
import { MdAdd, MdDelete, MdCheck, MdClose } from 'react-icons/md';
import api from '../../../../utils/api';

interface Slot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'CLOSED' | 'AVAILABLE' | 'BOOKED';
  price: number;
}

interface DaySlot {
  time: string;
  displayTime: string;
  slot?: Slot;
  isPast: boolean;
}

const MentorSchedule: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSlotTime, setNewSlotTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [bulkOperation, setBulkOperation] = useState<'open' | 'close' | null>(null);

  // Generate 30-minute time slots for a day (9 AM to 9 PM)
  const generateTimeSlots = (date: string): DaySlot[] => {
    const slots: DaySlot[] = [];
    const now = new Date();
    const selectedDateObj = new Date(date);
    const isToday = selectedDateObj.toISOString().split('T')[0] === now.toISOString().split('T')[0];

    for (let hour = 9; hour < 21; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const slotDateTime = new Date(`${date}T${time}:00`);
        
        slots.push({
          time,
          displayTime: formatTime(time),
          isPast: isToday && slotDateTime < now
        });
      }
    }
    return slots;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours || '0');
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const fetchSlotsForDate = async (date: string) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get<{ success: boolean; data: { slots: Slot[] } }>(
        `/api/slots/my-slots?date=${date}`
      );
      
      if (response.data.success) {
        setSlots(response.data.data.slots || []);
      }
    } catch (err: any) {
      console.error('Error fetching slots:', err);
      setError(err.response?.data?.message || 'Failed to fetch slots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlotsForDate(selectedDate);
    setSelectionMode(false);
    setSelectedSlots(new Set());
  }, [selectedDate]);

  const handleOpenSlot = async (time: string) => {
    try {
      setSubmitting(true);
      await api.post('/api/slots/open', {
        date: selectedDate,
        startTime: time
      });
      await fetchSlotsForDate(selectedDate);
      setShowAddModal(false);
      setNewSlotTime('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to open slot');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSlot = async (slotId: string) => {
    if (!window.confirm('Are you sure you want to close this slot?')) return;

    try {
      await api.delete(`/api/slots/close/${slotId}`);
      await fetchSlotsForDate(selectedDate);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to close slot');
    }
  };

  const handleBulkOpen = async () => {
    if (selectedSlots.size === 0) return;

    if (!window.confirm(`Open ${selectedSlots.size} slot(s)?`)) return;

    try {
      setSubmitting(true);
      const promises = Array.from(selectedSlots).map(time => 
        api.post('/api/slots/open', {
          date: selectedDate,
          startTime: time
        })
      );
      await Promise.all(promises);
      await fetchSlotsForDate(selectedDate);
      setSelectedSlots(new Set());
      setSelectionMode(false);
      setBulkOperation(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to open slots');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkClose = async () => {
    if (selectedSlots.size === 0) return;

    if (!window.confirm(`Close ${selectedSlots.size} slot(s)?`)) return;

    try {
      setSubmitting(true);
      const dateStr = new Date(selectedDate).toISOString().split('T')[0];
      const slotIds: string[] = [];
      
      selectedSlots.forEach(time => {
        const key = `${dateStr}T${time}`;
        const dbSlot = slotsMap.get(key);
        if (dbSlot && dbSlot.status !== 'BOOKED') {
          slotIds.push(dbSlot.id);
        }
      });

      const promises = slotIds.map(slotId => 
        api.delete(`/api/slots/close/${slotId}`)
      );
      await Promise.all(promises);
      await fetchSlotsForDate(selectedDate);
      setSelectedSlots(new Set());
      setSelectionMode(false);
      setBulkOperation(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to close slots');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSlotSelection = (time: string) => {
    const newSelected = new Set(selectedSlots);
    if (newSelected.has(time)) {
      newSelected.delete(time);
    } else {
      newSelected.add(time);
    }
    setSelectedSlots(newSelected);
  };

  const timeSlots = generateTimeSlots(selectedDate);
  const slotsMap = new Map(slots.map(slot => {
    const dateStr = new Date(slot.date).toISOString().split('T')[0];
    return [`${dateStr}T${slot.startTime}`, slot];
  }));

  const getSlotStatus = (slot: DaySlot): 'available' | 'booked' | 'closed' | 'past' => {
    if (slot.isPast) return 'past';
    const dateStr = new Date(selectedDate).toISOString().split('T')[0];
    const key = `${dateStr}T${slot.time}`;
    const dbSlot = slotsMap.get(key);
    if (dbSlot) {
      if (dbSlot.status === 'BOOKED') return 'booked';
      if (dbSlot.status === 'AVAILABLE') return 'available';
      return 'closed';
    }
    return 'closed';
  };

  const getSlotColor = (status: 'available' | 'booked' | 'closed' | 'past', isSelected: boolean) => {
    if (isSelected && selectionMode) {
      return 'bg-blue-300 border-blue-500 text-blue-900';
    }
    switch (status) {
      case 'available':
        return 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200';
      case 'booked':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'past':
        return 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed';
      default:
        return 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
          <p className="text-gray-600 mt-2">Manage your available time slots</p>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0]}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {!selectionMode ? (
            <>
              <button
                onClick={() => {
                  setSelectionMode(true);
                  setBulkOperation('open');
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <MdCheck className="w-5 h-5" />
                <span>Select to Open</span>
              </button>
              <button
                onClick={() => {
                  setSelectionMode(true);
                  setBulkOperation('close');
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <MdDelete className="w-5 h-5" />
                <span>Select to Close</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <MdAdd className="w-5 h-5" />
                <span>Open Single Slot</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  if (bulkOperation === 'open') handleBulkOpen();
                  else handleBulkClose();
                }}
                disabled={selectedSlots.size === 0 || submitting}
                className={`flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                  bulkOperation === 'open' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                <MdCheck className="w-5 h-5" />
                <span>{bulkOperation === 'open' ? 'Open' : 'Close'} {selectedSlots.size} Selected</span>
              </button>
              <button
                onClick={() => {
                  setSelectionMode(false);
                  setSelectedSlots(new Set());
                  setBulkOperation(null);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <MdClose className="w-5 h-5" />
                <span>Cancel</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Selection Info */}
      {selectionMode && (
        <div className={`rounded-lg p-4 ${
          bulkOperation === 'open' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-orange-50 border border-orange-200'
        }`}>
          <p className={`text-sm ${
            bulkOperation === 'open' ? 'text-green-800' : 'text-orange-800'
          }`}>
            <strong>Selection Mode:</strong> Click on slots to {bulkOperation === 'open' ? 'open' : 'close'} them. 
            {selectedSlots.size > 0 && ` ${selectedSlots.size} slot(s) selected.`}
          </p>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Slots must be opened at least 48 hours in advance. Each slot is 30 minutes long.
        </p>
      </div>

      {/* Slots Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 mt-4">Loading slots...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {timeSlots.map((daySlot, index) => {
              const status = getSlotStatus(daySlot);
              const dateStr = new Date(selectedDate).toISOString().split('T')[0];
              const key = `${dateStr}T${daySlot.time}`;
              const dbSlot = slotsMap.get(key);
              const isSelected = selectedSlots.has(daySlot.time);
              const canSelect = !daySlot.isPast && (
                (bulkOperation === 'open' && status === 'closed') ||
                (bulkOperation === 'close' && dbSlot && status !== 'booked' && status !== 'past')
              );

              return (
                <div
                  key={index}
                  className={`
                    p-4 rounded-lg border-2 transition-all relative
                    ${daySlot.isPast || (selectionMode && !canSelect && status === 'booked') 
                      ? 'cursor-not-allowed' 
                      : selectionMode && canSelect
                      ? 'cursor-pointer'
                      : status === 'closed' && !daySlot.isPast
                      ? 'cursor-pointer'
                      : ''
                    }
                    ${getSlotColor(status, isSelected)}
                    ${!daySlot.isPast && !selectionMode ? 'hover:shadow-md' : ''}
                  `}
                  onClick={() => {
                    if (selectionMode && canSelect) {
                      toggleSlotSelection(daySlot.time);
                    } else if (!selectionMode && status === 'closed' && !daySlot.isPast) {
                      setNewSlotTime(daySlot.time);
                      setShowAddModal(true);
                    }
                  }}
                >
                  {selectionMode && canSelect && (
                    <div className="absolute top-2 right-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleSlotSelection(daySlot.time);
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{daySlot.displayTime}</span>
                    {dbSlot && !selectionMode && status !== 'past' && status !== 'booked' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCloseSlot(dbSlot.id);
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <MdDelete className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {dbSlot && (
                    <div className="text-xs mt-2">
                      {status === 'booked' && (
                        <span className="inline-block px-2 py-1 bg-blue-200 text-blue-800 rounded-full">
                          Booked
                        </span>
                      )}
                      {status === 'available' && (
                        <span className="inline-block px-2 py-1 bg-green-200 text-green-800 rounded-full">
                          Available
                        </span>
                      )}
                      {dbSlot.price > 0 && (
                        <div className="mt-1 text-xs">₹{dbSlot.price.toFixed(2)}</div>
                      )}
                    </div>
                  )}
                  {!dbSlot && status !== 'past' && !selectionMode && (
                    <div className="text-xs text-gray-500 mt-2">Click to open</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Slot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Open New Slot</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Time <span className="text-red-500">*</span>
                </label>
                <select
                  value={newSlotTime}
                  onChange={(e) => setNewSlotTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a time slot</option>
                  {timeSlots
                    .filter(slot => !slot.isPast && getSlotStatus(slot) === 'closed')
                    .map(slot => (
                      <option key={slot.time} value={slot.time}>
                        {slot.displayTime}
                      </option>
                    ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Date: {new Date(selectedDate).toLocaleDateString()}
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewSlotTime('');
                  }}
                  className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleOpenSlot(newSlotTime)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  disabled={!newSlotTime || submitting}
                >
                  {submitting ? 'Opening...' : 'Open Slot'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorSchedule;

