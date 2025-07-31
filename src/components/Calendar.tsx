import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Phone, Trash2, Repeat, Grid, List } from 'lucide-react';
import { formatDate, formatTime } from '../utils/dateUtils';
import { TimeSlot, Booking } from '../types';

interface CalendarProps {
  selectedDate: Date;
  timeSlots: TimeSlot[];
  allBookings: Booking[];
  onDateChange: (date: Date) => void;
  onTimeSlotClick: (time: string) => void;
  onDeleteBooking: (bookingId: string) => void;
  onNavigateDate: (direction: 'prev' | 'next') => void;
}

const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  timeSlots,
  allBookings,
  onDateChange,
  onTimeSlotClick,
  onDeleteBooking,
  onNavigateDate,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      onDateChange(newDate);
    }
  };

  const getBookingClass = (callType: string) => {
    return callType === 'onboarding' 
      ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-l-4 border-blue-500 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800/40 dark:hover:to-blue-700/40 shadow-sm' 
      : 'bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 border-l-4 border-emerald-500 hover:from-emerald-100 hover:to-emerald-200 dark:hover:from-emerald-800/40 dark:hover:to-emerald-700/40 shadow-sm';
  };

  const getCallTypeLabel = (callType: string) => {
    return callType === 'onboarding' ? 'Onboarding' : 'Follow-up';
  };

  const getCallTypeColor = (callType: string) => {
    return callType === 'onboarding' ? 'text-blue-700 dark:text-blue-300' : 'text-emerald-700 dark:text-emerald-300';
  };

  const getCallTypeBg = (callType: string) => {
    return callType === 'onboarding' ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-emerald-100 dark:bg-emerald-900/40';
  };

  const isRecurringDisplay = (slot: TimeSlot, selectedDate: Date) => {
    if (!slot.isBooked || !slot.booking || slot.booking.callType !== 'followup' || !slot.booking.isRecurring) {
      return false;
    }

    const bookingDate = new Date(slot.booking.startTime);
    const isSameDayOfWeek = selectedDate.getDay() === bookingDate.getDay();
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const weeksDiff = Math.round((selectedDate.getTime() - bookingDate.getTime()) / msPerWeek);

    return isSameDayOfWeek && weeksDiff >= 1;
  };

  // Calendar view functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getBookingsForDay = (date: Date) => {
    // Get all bookings for the specific day from the allBookings array
    return allBookings.filter(booking => {
      const bookingDate = new Date(booking.startTime);
      return bookingDate.toDateString() === date.toDateString();
    });
  };

  const isToday = (date: Date) => {
    return date.toDateString() === new Date().toDateString();
  };

  const isSelectedDay = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const isPastDay = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  const handleDayClick = (date: Date) => {
    onDateChange(date);
    setViewMode('list');
  };

  const handleTimeSlotClick = (time: string) => {
    // Prevent booking on past days
    if (isPastDay(selectedDate)) {
      return;
    }
    onTimeSlotClick(time);
  };

  const days = getDaysInMonth(selectedDate);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white dark:bg-gray-900 shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700 w-full transition-colors duration-300">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
            <button
              onClick={() => onNavigateDate('prev')}
              className="p-1.5 sm:p-2 lg:p-3 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
              aria-label="Previous day"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
            
            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
              <div className="p-1.5 sm:p-2 lg:p-3 rounded-full bg-white/20 backdrop-blur-sm">
                <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white tracking-tight truncate">
                  {formatDate(selectedDate)}
                </h2>
                <p className="text-blue-100 text-xs sm:text-sm font-medium hidden sm:block truncate">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long' })}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => onNavigateDate('next')}
              className="p-1.5 sm:p-2 lg:p-3 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
              aria-label="Next day"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-white/20 rounded-lg p-1 backdrop-blur-sm">
              <button
                onClick={() => setViewMode('list')}
                className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <List className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                List
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                  viewMode === 'calendar' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <Grid className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                Calendar
              </button>
            </div>
            
            {/* Date Picker */}
            <div className="relative">
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={handleDateInputChange}
                className="w-28 sm:w-32 lg:w-40 pl-2 sm:pl-3 lg:pl-4 pr-6 sm:pr-8 lg:pr-10 py-1.5 sm:py-2 lg:py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200 text-xs sm:text-sm text-white placeholder-white/70"
                style={{ colorScheme: 'dark' }}
              />
              <CalendarIcon className="absolute right-1.5 sm:right-2 lg:right-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-white/70" />
            </div>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="p-2 sm:p-3 lg:p-6">
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2 sm:mb-3">
            {dayNames.map(day => (
              <div key={day} className="p-1 sm:p-2 lg:p-3 text-center text-xs lg:text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
            {days.map((day, index) => {
              if (!day) {
                return <div key={index} className="h-12 sm:h-16 lg:h-20 bg-gray-50 dark:bg-gray-800 rounded-lg"></div>;
              }
              
              const dayBookings = getBookingsForDay(day);
              const hasBookings = dayBookings.length > 0;
              const isPast = isPastDay(day);
              
              return (
                <div
                  key={index}
                  onClick={() => handleDayClick(day)}
                  className={`h-12 sm:h-16 lg:h-20 p-1 sm:p-2 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    isPast
                      ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 opacity-60 cursor-not-allowed'
                      : isToday(day) 
                      ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30' 
                      : isSelectedDay(day)
                      ? 'border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/30'
                      : hasBookings
                      ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/30'
                      : 'border-gray-100 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                    <span className={`text-xs lg:text-sm font-medium ${
                      isPast ? 'text-gray-400 dark:text-gray-500' :
                      isToday(day) ? 'text-blue-700 dark:text-blue-300' : 
                      isSelectedDay(day) ? 'text-purple-700 dark:text-purple-300' : 
                      'text-gray-700 dark:text-gray-200'
                    }`}>
                      {day.getDate()}
                    </span>
                    {hasBookings && (
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
                    )}
                  </div>
                  
                  {hasBookings && (
                    <div className="space-y-0.5 sm:space-y-1">
                      {dayBookings.slice(0, 2).map((booking, idx) => (
                        <div
                          key={idx}
                          className={`text-xs px-0.5 sm:px-1 py-0.5 rounded truncate ${
                            booking.callType === 'onboarding'
                              ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                              : 'bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200'
                          }`}
                        >
                          {booking.clientName}
                        </div>
                      ))}
                      {dayBookings.length > 2 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                          +{dayBookings.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="p-2 sm:p-3 lg:p-6">
          <div className="space-y-1 sm:space-y-2">
            {timeSlots.map((slot) => {
              const isRecurring = isRecurringDisplay(slot, selectedDate);
              const displayBooking = slot.isBooked && slot.booking ? slot.booking : null;
              const isPast = isPastDay(selectedDate);

              return (
                <div
                  key={slot.time}
                  className={`p-2 sm:p-3 lg:p-5 rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-[1.02] ${
                    isPast
                      ? 'bg-gray-100 dark:bg-gray-700 border-l-4 border-gray-300 dark:border-gray-600 opacity-60 cursor-not-allowed'
                      : displayBooking
                      ? `${getBookingClass(displayBooking.callType)} ${isRecurring ? 'opacity-90' : ''}`
                      : slot.isBooked
                      ? 'bg-gray-50 dark:bg-gray-800 border-l-4 border-gray-200 dark:border-gray-600 opacity-60'
                      : 'bg-white dark:bg-gray-800 border-l-4 border-gray-100 dark:border-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600 cursor-pointer hover:border-gray-300 dark:hover:border-gray-500 shadow-sm hover:shadow-md'
                  }`}
                  onClick={() => !slot.isBooked && !isRecurring && !isPast && handleTimeSlotClick(slot.time)}
                >
                  {displayBooking ? (
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between w-full space-y-2 sm:space-y-3 lg:space-y-0">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 lg:space-x-3 xl:space-x-4">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className="p-1.5 sm:p-2 rounded-full bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm">
                            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
                          </div>
                          <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-lg">
                            {formatTime(slot.time)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className="p-1.5 sm:p-2 rounded-full bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm">
                            <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
                          </div>
                          <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm sm:text-lg truncate">
                            {displayBooking.clientName}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className="p-1.5 sm:p-2 rounded-full bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm">
                            <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
                          </div>
                          <span className="text-gray-600 dark:text-gray-300 font-medium text-xs sm:text-sm">
                            {displayBooking.clientPhone}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 lg:space-x-3">
                        <span className={`px-2 sm:px-3 lg:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold ${getCallTypeBg(displayBooking.callType)} ${getCallTypeColor(displayBooking.callType)} shadow-sm`}>
                          {getCallTypeLabel(displayBooking.callType)} ({displayBooking.callType === 'onboarding' ? '40 min' : '20 min'})
                          {displayBooking.isRecurring && (
                            <span className="ml-1 sm:ml-2">
                              <Repeat className="w-3 h-3 sm:w-4 sm:h-4 inline-block" /> Recurring
                            </span>
                          )}
                        </span>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteBooking(displayBooking.id);
                          }}
                          className="p-1.5 sm:p-2 lg:p-3 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm hover:shadow-md"
                          title="Delete booking"
                        >
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </div>
                  ) : slot.isBooked ? (
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="p-1.5 sm:p-2 rounded-full bg-gray-100 dark:bg-gray-700">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500" />
                      </div>
                      <span className="text-gray-500 dark:text-gray-400 font-semibold text-sm sm:text-lg">
                        {formatTime(slot.time)}
                      </span>
                      <span className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm font-medium">
                        ••• (booking continues)
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer">
                      <div className="p-1.5 sm:p-2 rounded-full bg-blue-100 dark:bg-blue-900/40">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-200 font-semibold text-sm sm:text-lg">
                        {formatTime(slot.time)}
                      </span>
                      <span className={`text-xs sm:text-sm font-semibold ${isPast ? 'text-gray-400 dark:text-gray-500' : 'text-blue-600 dark:text-blue-400'}`}>
                        {isPast ? 'Past Date' : 'Available'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-t border-gray-200 dark:border-gray-600">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-2 sm:space-y-3 lg:space-y-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 lg:space-x-4 xl:space-x-6 text-xs sm:text-sm">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-l-4 border-blue-500 rounded-lg"></div>
              <span className="text-gray-700 dark:text-gray-200 font-semibold">Onboarding Call (40 min)</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 border-l-4 border-emerald-500 rounded-lg"></div>
              <span className="text-gray-700 dark:text-gray-200 font-semibold">Follow-up Call (20 min)</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Repeat className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400" />
              <span className="text-gray-700 dark:text-gray-200 font-semibold">Recurring Follow-up</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
            <span>Has bookings</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;