import { format, addMinutes, parseISO, isSameDay, getDay } from 'date-fns';
import { TimeSlot, Booking } from '../types';

// Generate time slots from 10:30 AM to 7:30 PM with 20-minute intervals
export const generateTimeSlots = (date: Date): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startTime = new Date(date);
  startTime.setHours(10, 30, 0, 0); // 10:30 AM
  
  const endTime = new Date(date);
  endTime.setHours(19, 30, 0, 0); // 7:30 PM
  
  let currentTime = new Date(startTime);
  
  while (currentTime < endTime) {
    const slotEndTime = addMinutes(currentTime, 20);
    
    slots.push({
      time: format(currentTime, 'HH:mm'),
      startTime: currentTime.toISOString(),
      endTime: slotEndTime.toISOString(),
      isBooked: false,
    });
    
    currentTime = slotEndTime;
  }
  
  return slots;
};

// Check if two time ranges overlap
export const isTimeOverlap = (
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean => {
  const s1 = parseISO(start1);
  const e1 = parseISO(end1);
  const s2 = parseISO(start2);
  const e2 = parseISO(end2);
  
  const overlaps = s1 < e2 && s2 < e1;
  
  return overlaps;
};

// Check if a booking overlaps with existing bookings
export const hasOverlap = (newBooking: Booking, existingBookings: Booking[]): boolean => {
  return existingBookings.some(existing => {
    if (existing.isRecurring && newBooking.isRecurring) {
      return existing.recurringDayOfWeek === newBooking.recurringDayOfWeek &&
             isTimeOverlap(newBooking.startTime, newBooking.endTime, existing.startTime, existing.endTime);
    }
    
    if (!existing.isRecurring && !newBooking.isRecurring) {
      return isSameDay(parseISO(existing.date), parseISO(newBooking.date)) &&
             isTimeOverlap(newBooking.startTime, newBooking.endTime, existing.startTime, existing.endTime);
    }
    
    if (existing.isRecurring && !newBooking.isRecurring) {
      const existingDayOfWeek = getDay(parseISO(existing.date));
      const newDayOfWeek = getDay(parseISO(newBooking.date));
      return existingDayOfWeek === newDayOfWeek &&
             isTimeOverlap(newBooking.startTime, newBooking.endTime, existing.startTime, existing.endTime);
    }
    
    if (!existing.isRecurring && newBooking.isRecurring) {
      const existingDayOfWeek = getDay(parseISO(existing.date));
      const newDayOfWeek = getDay(parseISO(newBooking.date));
      return existingDayOfWeek === newDayOfWeek &&
             isTimeOverlap(newBooking.startTime, newBooking.endTime, existing.startTime, existing.endTime);
    }
    
    return false;
  });
};

// Check if a new booking would overlap with existing bookings
export const wouldOverlap = (
  startTime: string,
  endTime: string,
  date: string,
  isRecurring: boolean,
  recurringDayOfWeek: number | undefined,
  existingBookings: Booking[]
): boolean => {
  const hasOverlap = existingBookings.some(existing => {
    if (existing.isRecurring && isRecurring) {
      const sameDay = existing.recurringDayOfWeek === recurringDayOfWeek;
      const timeOverlap = isTimeOverlap(startTime, endTime, existing.startTime, existing.endTime);
      return sameDay && timeOverlap;
    }
    
    if (!existing.isRecurring && !isRecurring) {
      const sameDay = isSameDay(parseISO(existing.date), parseISO(date));
      const timeOverlap = isTimeOverlap(startTime, endTime, existing.startTime, existing.endTime);
      return sameDay && timeOverlap;
    }
    
    if (existing.isRecurring && !isRecurring) {
      const existingDayOfWeek = getDay(parseISO(existing.date));
      const newDayOfWeek = getDay(parseISO(date));
      const sameDay = existingDayOfWeek === newDayOfWeek;
      const timeOverlap = isTimeOverlap(startTime, endTime, existing.startTime, existing.endTime);
      return sameDay && timeOverlap;
    }
    
    if (!existing.isRecurring && isRecurring) {
      const existingDayOfWeek = getDay(parseISO(existing.date));
      const newDayOfWeek = recurringDayOfWeek;
      const sameDay = existingDayOfWeek === newDayOfWeek;
      const timeOverlap = isTimeOverlap(startTime, endTime, existing.startTime, existing.endTime);
      return sameDay && timeOverlap;
    }
    
    return false;
  });

  return hasOverlap;
};

// Get bookings for a specific date (including one-time recurrence for next week)
export const getBookingsForDate = (date: Date, allBookings: Booking[]): Booking[] => {
  const dayOfWeek = getDay(date);
  const dateString = format(date, 'yyyy-MM-dd');
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const result: Booking[] = [];

  allBookings.forEach(booking => {
    // Include bookings for the exact date (recurring or non-recurring)
    if (booking.date === dateString) {
      result.push(booking);
    }
    // Include recurring follow-up bookings for the exact next week
    else if (booking.isRecurring && booking.recurringDayOfWeek === dayOfWeek) {
      const bookingDate = parseISO(booking.date);
      const weeksDiff = Math.round((date.getTime() - bookingDate.getTime()) / msPerWeek);
      if (weeksDiff === 1) {
        const newStartTime = new Date(`${dateString}T${booking.time}:00`).toISOString();
        const newEndTime = calculateEndTime(newStartTime, booking.callType);
        result.push({
          ...booking,
          id: `${booking.id}-${dateString}`, // Unique ID for recurring instance
          date: dateString,
          startTime: newStartTime,
          endTime: newEndTime,
        });
      }
    }
  });

  return result;
};

// Populate time slots with bookings
export const populateTimeSlots = (slots: TimeSlot[], bookings: Booking[]): TimeSlot[] => {
  return slots.map(slot => {
    const overlappingBooking = bookings.find(b => {
      const bookingStart = parseISO(b.startTime);
      const bookingEnd = parseISO(b.endTime);
      const slotStart = parseISO(slot.startTime);
      const slotEnd = parseISO(slot.endTime);
      
      const overlaps = slotStart < bookingEnd && slotEnd > bookingStart;
      
      return overlaps;
    });
    
    if (overlappingBooking) {
      const bookingStart = parseISO(overlappingBooking.startTime);
      const slotStart = parseISO(slot.startTime);
      const isStartingSlot = Math.abs(bookingStart.getTime() - slotStart.getTime()) < 60000;
      
      return {
        ...slot,
        isBooked: true,
        booking: isStartingSlot ? overlappingBooking : undefined,
        isBookingContinuation: !isStartingSlot,
      };
    }
    
    return slot;
  });
};

// Helper function to check if a slot can accommodate a booking of given duration
export const canAccommodateBooking = (
  slotStartTime: string,
  callType: 'onboarding' | 'followup',
  slots: TimeSlot[],
  existingBookings: Booking[]
): boolean => {
  const duration = getCallDuration(callType);
  const startTime = parseISO(slotStartTime);
  const endTime = addMinutes(startTime, duration);
  
  const requiredSlots = Math.ceil(duration / 20);
  const slotIndex = slots.findIndex(s => s.startTime === slotStartTime);
  
  if (slotIndex === -1 || slotIndex + requiredSlots > slots.length) {
    return false;
  }
  
  for (let i = slotIndex; i < slotIndex + requiredSlots; i++) {
    if (slots[i].isBooked) {
      return false;
    }
  }
  
  return !wouldOverlap(
    startTime.toISOString(),
    endTime.toISOString(),
    format(startTime, 'yyyy-MM-dd'),
    false,
    undefined,
    existingBookings
  );
};

// Format date for display
export const formatDate = (date: Date): string => {
  return format(date, 'EEEE, MMMM d, yyyy');
};

// Format time for display
export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

// Get call duration in minutes
export const getCallDuration = (callType: 'onboarding' | 'followup'): number => {
  return callType === 'onboarding' ? 40 : 20;
};

// Calculate end time based on start time and call type
export const calculateEndTime = (startTime: string, callType: 'onboarding' | 'followup'): string => {
  const duration = getCallDuration(callType);
  const endTime = addMinutes(parseISO(startTime), duration);
  return endTime.toISOString();
};