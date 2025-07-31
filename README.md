# HealthTick Scheduler

A custom calendar system for HealthTick coaches to schedule onboarding and follow-up calls with clients. Built with React, TypeScript, Tailwind CSS, and Firebase.

## Live Demo

**Deployed at:** https://healthtick-scheduler.web.app

## Features

- **Daily Calendar View**: View one day at a time with 20-minute time slots from 10:30 AM to 7:30 PM
- **Smart Booking System**: Book onboarding calls (40 min, one-time) and follow-up calls (20 min, weekly recurring)
- **Overlap Prevention**: Intelligent logic prevents booking conflicts
- **Client Management**: Search and select from 20 pre-configured clients
- **Beautiful UI**: Modern, responsive design with dark/light mode
- **Real-time Updates**: Immediate UI updates when bookings are made or deleted
- **Firebase Integration**: Persistent data storage with Firestore

## How to Run the App

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Firebase project (for full functionality)

### Installation & Setup

1. **Clone the repository:**
```bash
git clone <repository-url>
cd healthtick-scheduler
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up Firebase (Optional but recommended):**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore Database
   - Create a `.env` file in the root directory with your Firebase configuration:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

4. **Start the development server:**
```bash
npm start
```

5. **Open [http://localhost:3000](http://localhost:3000) to view it in the browser.**

### Building for Production

```bash
npm run build
```

### Deployment

The app is currently deployed on Firebase Hosting. To deploy updates:

```bash
npm run build
firebase deploy
```

## Firebase Schema Description

### Collections

#### `clients` Collection
Stores client information for booking appointments.

```typescript
{
  id: string;           // Auto-generated document ID
  name: string;         // Client's full name
  phone: string;        // Client's phone number
}
```

**Sample Data:**
```json
{
  "id": "client1",
  "name": "John Smith",
  "phone": "+1-555-0123"
}
```

#### `bookings` Collection
Stores all booking appointments with detailed information.

```typescript
{
  id: string;                    // Auto-generated document ID
  clientId: string;              // Reference to client document
  clientName: string;            // Client's name (denormalized for performance)
  clientPhone: string;           // Client's phone (denormalized for performance)
  callType: 'onboarding' | 'followup';  // Type of call
  date: string;                  // Date in YYYY-MM-DD format
  time: string;                  // Time in HH:mm format (e.g., "14:30")
  startTime: string;             // ISO datetime string for start
  endTime: string;               // ISO datetime string for end
  isRecurring: boolean;          // Whether this is a recurring booking
  recurringDayOfWeek?: number;   // Day of week (0-6, Sunday-Saturday) for recurring
  createdAt: string;             // ISO datetime string
  updatedAt: string;             // ISO datetime string
}
```

**Sample Booking Data:**
```json
{
  "id": "booking1",
  "clientId": "client1",
  "clientName": "John Smith",
  "clientPhone": "+1-555-0123",
  "callType": "onboarding",
  "date": "2024-01-15",
  "time": "14:30",
  "startTime": "2024-01-15T14:30:00.000Z",
  "endTime": "2024-01-15T15:10:00.000Z",
  "isRecurring": false,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

**Sample Recurring Booking:**
```json
{
  "id": "booking2",
  "clientId": "client2",
  "clientName": "Jane Doe",
  "clientPhone": "+1-555-0456",
  "callType": "followup",
  "date": "2024-01-15",
  "time": "16:00",
  "startTime": "2024-01-15T16:00:00.000Z",
  "endTime": "2024-01-15T16:20:00.000Z",
  "isRecurring": true,
  "recurringDayOfWeek": 1,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents for demo purposes
    // In production, implement proper authentication and authorization
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Assumptions Made

### Business Logic Assumptions

1. **Business Hours**: Operating hours are 10:30 AM to 7:30 PM daily
2. **Time Slots**: 20-minute intervals for all time slots
3. **Call Types**: 
   - Onboarding calls: 40 minutes (one-time only)
   - Follow-up calls: 20 minutes (weekly recurring)
4. **Recurring Pattern**: Weekly recurrence on the same day of the week
5. **Overlap Prevention**: No overlapping bookings allowed (strict conflict checking)
6. **Time Zone**: All times handled in the user's local timezone

### Technical Assumptions

1. **Client Data**: Using a static list of 20 pre-configured clients
2. **Authentication**: No user authentication required for demo (open access)
3. **Data Persistence**: Firebase Firestore for real-time data storage
4. **UI State**: Local React state with Firebase synchronization
5. **Responsive Design**: Mobile-first approach with breakpoints for all devices
6. **Error Handling**: Graceful error handling with user-friendly messages

### User Experience Assumptions

1. **Calendar Navigation**: Users view one day at a time with navigation arrows
2. **Booking Flow**: Modal-based booking interface with client search
3. **Visual Feedback**: Clear visual indicators for booked vs. available slots
4. **Accessibility**: Keyboard navigation and screen reader support
5. **Dark Mode**: Toggle between light and dark themes
6. **Loading States**: Loading indicators for async operations

### Data Management Assumptions

1. **Denormalization**: Client data duplicated in bookings for performance
2. **Real-time Updates**: Immediate UI updates when data changes
3. **Conflict Resolution**: Prevent booking conflicts at the application level
4. **Data Validation**: Client-side validation with Firebase security rules
5. **Backup Strategy**: Firebase handles data backup and recovery

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Backend**: Firebase Firestore
- **Hosting**: Firebase Hosting
- **Build Tool**: Create React App

## Project Structure

```
src/
├── components/          
│   ├── Calendar.tsx     # Main calendar view
│   └── BookingModal.tsx # Booking form modal
├── config/              # Configuration files
│   └── firebase.ts      # Firebase setup
├── data/                # Static data
│   └── clients.ts       # Client list
├── types/               # TypeScript definitions
│   └── index.ts         # Type interfaces
├── utils/               # Utility functions
│   └── dateUtils.ts     # Date and time helpers
├── App.tsx              # Main app component
├── index.tsx            # App entry point
└── index.css            # Global styles
``` 