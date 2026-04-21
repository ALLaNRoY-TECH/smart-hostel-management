# Smart Hostel Management System - Full Stack Edition

## Prerequisites
1. **Node.js** installed on your system.
2. **MySQL Server** installed and running on your local machine (e.g., via XAMPP, WAMP, or standalone MySQL).

## Step 1: Database Setup
1. Open your MySQL client (e.g., phpMyAdmin, MySQL Workbench, or CLI).
2. Execute the entire contents of the `server/schema.sql` file. This will:
   - Create the `hostel_management` database.
   - Create all tables in 3NF (students, admins, rooms, complaints, allocations, activity_logs).
   - Insert dummy user data for testing.

## Step 2: Backend Configuration
1. Navigate to the `server` folder.
2. Open the `.env` file and update `DB_PASSWORD` if your local MySQL root user has a password. (Leave it blank if you use XAMPP default).
3. Open a terminal and run the following commands to start the backend API:
```bash
cd server
node server.js
```
The backend will run on `http://localhost:5000`.

## Step 3: Frontend Startup
1. Open a new, separate terminal in the root project folder.
2. Run the frontend development server:
```bash
npm run dev
```
3. Open `http://localhost:5173` in your browser.

## Test Credentials
- **Student Login:** `student@test.com` / `password`
- **Admin Login:** `admin@test.com` / `password`
