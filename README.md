# HealthTick Scheduler

A custom calendar system for HealthTick coaches to schedule onboarding and follow-up calls with clients. Built with React, TypeScript, Tailwind CSS, and Firebase.

## Features

- **Daily Calendar View**: View one day at a time with 20-minute time slots from 10:30 AM to 7:30 PM
- **Smart Booking System**: Book onboarding calls (40 min, one-time) and follow-up calls (20 min, weekly recurring)
- **Overlap Prevention**: Intelligent logic prevents booking conflicts
- **Client Management**: Search and select from 20 pre-configured clients
- **Beautiful UI**: Modern, responsive design with intuitive user experience
- **Real-time Updates**: Immediate UI updates when bookings are made or deleted

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Backend**: Firebase Firestore (configured but using local state for demo)
- **Build Tool**: Create React App

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd healthtick-scheduler
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Building for Production

```bash
npm run build
```

## Firebase Configuration

### Environment Variables

Create a `.env` file in the root directory with your Firebase configuration:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### Firestore Schema

#### Collections

**clients**
```typescript
{
  id: string;
  name: string;
  phone: string;
}
```

**bookings**
```typescript
{
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  callType: 'onboarding' | 'followup';
  date: string; // ISO date string (YYYY-MM-DD)
  time: string; // HH:mm format
  startTime: string; // ISO datetime string
  endTime: string; // ISO datetime string
  isRecurring: boolean;
  recurringDayOfWeek?: number; // 0-6 (Sunday-Saturday)
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
}
```

### Data Structure Design

The booking system uses a hybrid approach:

1. **One-time bookings**: Stored with specific date
2. **Recurring bookings**: Stored with `isRecurring: true` and `recurringDayOfWeek`
3. **Overlap prevention**: Calculated dynamically when viewing any date

## Business Logic

### Call Types

| Call Type | Duration | Recurrence | Description |
|-----------|----------|------------|-------------|
| Onboarding | 40 minutes | One-time only | Initial client consultation |
| Follow-up | 20 minutes | Weekly recurring | Regular check-ins |

### Overlap Prevention

The system prevents overlapping bookings by:

1. Checking time conflicts for the same day
2. Considering recurring bookings that fall on the selected day
3. Validating both start and end times don't overlap

### Recurring Logic

- Follow-up calls automatically repeat on the same weekday/time each week
- When viewing any date, the system shows both one-time and relevant recurring calls
- Recurring bookings are stored once but displayed on all matching weekdays

## Project Structure

```
src/
├── components/          # React components
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

## Assumptions Made

1. **Time Zone**: All times are handled in the local timezone
2. **Business Hours**: 10:30 AM to 7:30 PM (configurable in `dateUtils.ts`)
3. **Slot Duration**: 20-minute intervals (configurable)
4. **Client Data**: Using static client list (can be moved to Firebase)
5. **Recurring Pattern**: Weekly recurrence only (same day of week)
6. **Booking Conflicts**: No overlapping bookings allowed
7. **UI State**: Currently using local state (can be connected to Firebase)

## Future Enhancements

- [ ] Firebase integration for real-time data persistence
- [ ] User authentication and authorization
- [ ] Multiple coach support
- [ ] Email/SMS notifications
- [ ] Calendar export functionality
- [ ] Advanced recurring patterns (bi-weekly, monthly)
- [ ] Booking templates
- [ ] Analytics and reporting

## Deployment

### Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

### Netlify

1. Build the project:
```bash
npm run build
```

2. Deploy the `build` folder to Netlify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is created for the HealthTick Web Developer Intern position. 