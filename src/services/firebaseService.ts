import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Booking, Client } from '../types';

// Collection names
const CLIENTS_COLLECTION = 'clients';
const BOOKINGS_COLLECTION = 'bookings';

// Client operations
export const addClient = async (client: Omit<Client, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, CLIENTS_COLLECTION), client);
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const getClients = async (): Promise<Client[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, CLIENTS_COLLECTION));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Client[];
  } catch (error) {
    throw error;
  }
};

// Booking operations
export const addBooking = async (booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    // Filter out undefined values before sending to Firestore
    const cleanBooking = Object.fromEntries(
      Object.entries(booking).filter(([_, value]) => value !== undefined)
    );
    
    const bookingData = {
      ...cleanBooking,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), bookingData);
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const getBookings = async (): Promise<Booking[]> => {
  try {
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    })) as Booking[];
  } catch (error) {
    throw error;
  }
};

export const getBookingsForDate = async (date: string): Promise<Booking[]> => {
  try {
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      where('date', '==', date)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    })) as Booking[];
  } catch (error) {
    throw error;
  }
};

export const deleteBooking = async (bookingId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, BOOKINGS_COLLECTION, bookingId));
  } catch (error) {
    throw error;
  }
};

// Initialize with sample data
export const initializeSampleData = async (): Promise<void> => {
  try {
    // Check if clients already exist
    const existingClients = await getClients();
    if (existingClients.length === 0) {
      // Add sample clients
      const { clients } = await import('../data/clients');
      for (const client of clients) {
        const { id, ...clientData } = client;
        await addClient(clientData);
      }
    }
  } catch (error) {
    // Silent error handling for production
  }
}; 