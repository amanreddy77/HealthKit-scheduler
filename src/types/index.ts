export interface Client {
  id: string;
  name: string;
  phone: string;
}

export type CallType = 'onboarding' | 'followup';

export interface Booking {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  callType: CallType;
  date: string; // ISO date string
  time: string; // HH:mm format
  startTime: string; // ISO datetime string
  endTime: string; // ISO datetime string
  isRecurring: boolean;
  recurringDayOfWeek?: number; // 0-6 (Sunday-Saturday)
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot {
  time: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  booking?: Booking;
}

export interface BookingFormData {
  clientId: string;
  callType: CallType;
  date: string;
  time: string;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
} 