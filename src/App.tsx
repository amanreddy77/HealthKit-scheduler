import React, { useState, useEffect } from 'react';
import { CalendarIcon, Moon, Sun, AlertTriangle } from 'lucide-react';
import Calendar from './components/Calendar';
import BookingModal from './components/BookingModal';
import { generateTimeSlots, populateTimeSlots, getBookingsForDate, calculateEndTime, wouldOverlap } from './utils/dateUtils';
import { Booking, BookingFormData } from './types';
import { getBookings, getClients, addBooking, deleteBooking } from './services/firebaseService';
import { format } from 'date-fns';

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [conflictMessage, setConflictMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [bookingsData, clientsData] = await Promise.all([
          getBookings(),
          getClients()
        ]);
        setBookings(bookingsData);
        setClients(clientsData);
      } catch (error) {
        // Silent error handling for production
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Load dark mode preference from localStorage on initial load
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      const isDark = JSON.parse(savedDarkMode);
      setDarkMode(isDark);
      // Apply dark mode immediately
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  // Save dark mode preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const timeSlots = generateTimeSlots(selectedDate);
  const dateBookings = getBookingsForDate(selectedDate, bookings);
  const populatedTimeSlots = populateTimeSlots(timeSlots, dateBookings);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleTimeSlotClick = (time: string) => {
    // Check if the slot is already booked
    const slot = populatedTimeSlots.find(s => s.time === time);
    if (slot && slot.isBooked) {
      setConflictMessage('❌ This time slot is already booked.');
      setShowConflictDialog(true);
      return;
    }
    
    setSelectedTimeSlot(time);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (!isSubmitting) {
      setIsModalOpen(false);
      setSelectedTimeSlot(null);
    }
  };

  const handleCloseConflictDialog = () => {
    setShowConflictDialog(false);
    setConflictMessage('');
  };

  const handleBookingSubmit = async (bookingData: BookingFormData) => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate required data
      if (!selectedTimeSlot || !bookingData.clientId) {
        throw new Error('Missing required booking information');
      }

      // Find the selected client
      const selectedClient = clients.find(c => c.id === bookingData.clientId);
      if (!selectedClient) {
        throw new Error('Selected client not found');
      }

      // Create start time
      const startTime = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${selectedTimeSlot}:00`).toISOString();
      const endTime = calculateEndTime(startTime, bookingData.callType);
      const date = format(selectedDate, 'yyyy-MM-dd');

      // Check for overlaps
      if (wouldOverlap(startTime, endTime, date, false, undefined, bookings)) {
        setConflictMessage('❌ This time slot conflicts with an existing booking. Please choose a different time.');
        setShowConflictDialog(true);
        return;
      }

      // Create the booking object
      const newBooking = {
        clientId: bookingData.clientId,
        clientName: selectedClient.name,
        clientPhone: selectedClient.phone,
        callType: bookingData.callType,
        date,
        time: selectedTimeSlot,
        startTime,
        endTime,
        isRecurring: bookingData.callType === 'followup',
        recurringDayOfWeek: bookingData.callType === 'followup' ? selectedDate.getDay() : undefined,
      };

      const bookingId = await addBooking(newBooking);

      const bookingWithId = {
        ...newBooking,
        id: bookingId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Update local state
      setBookings(prev => {
        const exists = prev.some(b => b.id === bookingId);
        if (exists) {
          return prev;
        }
        return [...prev, bookingWithId];
      });
      
      handleCloseModal();
      
    } catch (error) {
      setConflictMessage('❌ Failed to create booking. Please try again.');
      setShowConflictDialog(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    try {
      await deleteBooking(bookingId);
      
      // Update local state
      setBookings(prev => prev.filter(b => b.id !== bookingId));
      
    } catch (error) {
      setConflictMessage('❌ Failed to delete booking. Please try again.');
      setShowConflictDialog(true);
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setSelectedDate(newDate);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400 mx-auto mb-6"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">HealthTick Scheduler</h2>
          <p className="text-gray-600 dark:text-gray-300">Loading your professional scheduling experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-10 transition-colors duration-300">
        <div className="w-full px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 lg:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
              <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
                <CalendarIcon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
                  HealthTick Scheduler
                </h1>
                <p className="text-gray-600 dark:text-gray-300 font-medium text-xs sm:text-sm lg:text-base truncate">
                  Professional client scheduling & management
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end space-x-2 lg:space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-xs lg:text-sm text-gray-600 dark:text-gray-300">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">System Online</span>
              </div>
              <div className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full">
                <span className="text-green-700 dark:text-green-300 font-semibold text-xs lg:text-sm">
                  {bookings.length} Active Bookings
                </span>
              </div>
              
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 lg:py-6 xl:py-8">
        <div className="mb-3 sm:mb-4 lg:mb-6 xl:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-3 sm:mb-4 lg:mb-6 space-y-3 lg:space-y-0">
            <div className="mb-0 lg:mb-0">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
                Schedule Management
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm lg:text-base">
                Manage onboarding and follow-up calls with your clients efficiently
              </p>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
                <span className="text-blue-700 dark:text-blue-300 font-semibold text-xs lg:text-sm">
                  Today: {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="w-full">
          <Calendar
            selectedDate={selectedDate}
            timeSlots={populatedTimeSlots}
            allBookings={bookings}
            onDateChange={handleDateChange}
            onTimeSlotClick={handleTimeSlotClick}
            onDeleteBooking={handleDeleteBooking}
            onNavigateDate={navigateDate}
          />
        </div>
        
        {isModalOpen && (
          <BookingModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSubmit={handleBookingSubmit}
            selectedDate={selectedDate}
            selectedTime={selectedTimeSlot || ''}
            clients={clients}
          />
        )}

        {/* Conflict Warning Dialog */}
        {showConflictDialog && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 lg:p-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl shadow-2xl max-w-sm sm:max-w-md w-full animate-fade-in-up transition-colors duration-300">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 sm:px-6 py-3 sm:py-4 rounded-t-2xl sm:rounded-t-3xl flex-shrink-0">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="p-1.5 sm:p-2 rounded-full bg-white/20 backdrop-blur-sm">
                    <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">
                      Booking Conflict
                    </h2>
                    <p className="text-red-100 text-xs sm:text-sm font-medium">
                      Unable to complete booking
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6">
                <p className="text-gray-700 dark:text-gray-200 text-sm sm:text-base mb-4 sm:mb-6">
                  {conflictMessage}
                </p>
                
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={handleCloseConflictDialog}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-lg sm:rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm sm:text-base"
                  >
                    OK, I Understand
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 sm:mt-10 lg:mt-12 xl:mt-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50 transition-colors duration-300">
        <div className="w-full px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 lg:py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-2 sm:space-y-3 lg:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-4 lg:space-x-6 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              <span>© 2024 HealthTick Scheduler</span>
              <span className="hidden sm:inline">•</span>
              <span>Professional Scheduling Solution</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <span>Built with React & Firebase</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;