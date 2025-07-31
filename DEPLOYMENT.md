# Deployment Guide

This guide will help you deploy the HealthTick Scheduler to Vercel or Netlify for your submission.

## Prerequisites

1. **GitHub Repository**: Make sure your code is pushed to a GitHub repository
2. **Firebase Project**: Ensure your Firebase project is set up and Firestore is enabled
3. **Environment Variables**: Have your Firebase configuration ready

## Option 1: Deploy to Vercel (Recommended)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy
```bash
# From your project directory
vercel

# Follow the prompts:
# - Set up and deploy? → Yes
# - Which scope? → Select your account
# - Link to existing project? → No
# - Project name? → healthtick-scheduler (or press Enter for default)
# - Directory? → ./ (press Enter for current directory)
# - Override settings? → No
```

### Step 4: Configure Environment Variables
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add your Firebase environment variables:
   ```
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

### Step 5: Redeploy
```bash
vercel --prod
```

## Option 2: Deploy to Netlify

### Step 1: Build the Project
```bash
npm run build
```

### Step 2: Deploy via Netlify UI
1. Go to [netlify.com](https://netlify.com)
2. Sign up/Login with your GitHub account
3. Click "New site from Git"
4. Choose your GitHub repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
6. Click "Deploy site"

### Step 3: Configure Environment Variables
1. Go to Site settings → Environment variables
2. Add your Firebase environment variables (same as above)

### Step 4: Redeploy
Netlify will automatically redeploy when you push changes to your repository.

## Option 3: Deploy via Netlify CLI

### Step 1: Install Netlify CLI
```bash
npm install -g netlify-cli
```

### Step 2: Login
```bash
netlify login
```

### Step 3: Deploy
```bash
# Build first
npm run build

# Deploy
netlify deploy --prod --dir=build
```

## Post-Deployment Checklist

### ✅ Verify Functionality
1. **Calendar View**: Check that the daily calendar loads correctly
2. **Time Slots**: Verify 20-minute slots from 10:30 AM to 7:30 PM
3. **Booking Flow**: Test booking both onboarding and follow-up calls
4. **Client Search**: Test the searchable client selection
5. **Overlap Prevention**: Try to book overlapping calls (should be blocked)
6. **Recurring Logic**: Book a follow-up call and check if it appears on the same day next week
7. **Delete Functionality**: Test deleting bookings

### ✅ Firebase Integration
1. **Data Persistence**: Create a booking and refresh the page (should persist)
2. **Real-time Updates**: Open in multiple tabs and verify updates sync
3. **Error Handling**: Check console for any Firebase connection errors

### ✅ UI/UX Verification
1. **Responsive Design**: Test on different screen sizes
2. **Loading States**: Verify loading indicators work
3. **Error Messages**: Test error scenarios and verify user-friendly messages
4. **Accessibility**: Check keyboard navigation and screen reader compatibility

## Troubleshooting

### Common Issues

**Build Fails**
- Check that all dependencies are in `package.json`
- Verify TypeScript compilation passes locally
- Check for any missing imports or syntax errors

**Firebase Connection Issues**
- Verify environment variables are set correctly
- Check that Firestore is enabled in your Firebase project
- Ensure security rules allow read/write access

**Environment Variables Not Loading**
- Make sure variables start with `REACT_APP_`
- Redeploy after adding environment variables
- Check that variables are set for production environment

### Getting Help
- Check the browser console for error messages
- Review the `FIREBASE_SETUP.md` and `TROUBLESHOOTING.md` files
- Verify your Firebase project configuration

## Final Submission Checklist

- [ ] Code pushed to GitHub repository
- [ ] README.md includes setup instructions
- [ ] Firebase schema documented
- [ ] Assumptions clearly stated
- [ ] App deployed and accessible
- [ ] All functionality working correctly
- [ ] No console errors
- [ ] Responsive design verified
- [ ] Overlap prevention tested
- [ ] Recurring logic verified

## Deployment URLs

After deployment, you'll get URLs like:
- **Vercel**: `https://healthtick-scheduler.vercel.app`
- **Netlify**: `https://your-project-name.netlify.app`

Make sure to test the deployed version thoroughly before submitting! 