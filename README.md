# Car Detailing App

This project consists of a Node.js/Express backend and a React Native (Expo) mobile app.

## Prerequisites

*   Node.js installed
*   PostgreSQL installed and running
*   Expo Go app on your phone (or Android Studio/Xcode for simulation)

## Setup

### 1. Database
1.  Create a PostgreSQL database named `cardetailing`.
2.  Run the schema script in `backend/schema.sql` to create the tables.

### 2. Backend
1.  Navigate to the `backend` directory: `cd backend`
2.  Install dependencies: `npm install`
3.  Create a `.env` file (see `.env.example` or the code) with your DB credentials and JWT secret.
4.  Start the server: `npm start` (or `node server.js`)
    *   Server runs on `http://localhost:5000`

### 3. Mobile App
1.  Navigate to the `mobile` directory: `cd mobile`
2.  Install dependencies: `npm install`
3.  Start the Expo development server: `npx expo start`
4.  Scan the QR code with your phone or press `a` for Android Emulator / `i` for iOS Simulator.

## API Configuration
*   The mobile app is configured to connect to `http://10.0.2.2:5000/api` (Android Emulator localhost).
*   If running on a physical device, update `mobile/src/services/api.js` with your computer's local IP address (e.g., `http://192.168.1.X:5000/api`).
