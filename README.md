# Plasma Connect

Plasma Connect is a complete full-stack web platform that connects plasma donors, recipients, hospitals, and blood banks with real-time request tracking and location-based matching.

## Tech Stack
- Frontend: React.js (Create React App), Tailwind CSS, Axios, React Router, Leaflet (OpenStreetMap)
- Backend: Node.js, Express.js, JWT Authentication, Bcrypt, REST API
- Database: MySQL, Sequelize ORM

## User Roles
- Admin
- Donor
- User (Recipient)
- Hospital
- Blood Bank

## Implemented Modules
- Authentication: register/login, JWT, role-based access control
- User Module: donor search, send request, track status, request history
- Donor Module: availability toggle, incoming requests, accept/reject, donation history
- Admin Module: user management, donor management, system statistics, block/unblock
- Hospital Module: emergency requests, track requests, history
- Blood Bank Module: manage stock, accept/decline requests, request logs
- Matching Logic: blood group + availability + distance (Haversine)
- Notifications: basic in-app notification feed

## Clean Folder Structure
```text
PLASMA CONNECT WEB/
  backend/
    db/
      migrations/
      migrate.js
      migrationRunner.js
    docs/
      API_ROUTES.md
      ER_DIAGRAM.md
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      seeders/
      services/
      utils/
      app.js
    .env.example
    package.json
    server.js

  frontend/
    public/
      index.html
      plasma-connect.svg
    src/
      api/
      components/
      contexts/
      layouts/
      pages/
        admin/
        auth/
        bloodbank/
        donor/
        hospital/
        user/
      utils/
      App.jsx
      index.css
      index.js
    .env.example
    package.json
    postcss.config.js
    tailwind.config.js
```

## Database Design
- ER Diagram: `backend/docs/ER_DIAGRAM.md`
- Schema source of truth: `backend/db/migrations/`

## API Route Structure
Detailed routes are documented in:
- `backend/docs/API_ROUTES.md`

## Backend Structure
- Controllers: `backend/src/controllers`
- Middleware: `backend/src/middleware`
- Routes: `backend/src/routes`
- Services: `backend/src/services`
- Models: `backend/src/models`

## Environment Configuration

### Backend (`backend/.env`)
Copy from `backend/.env.example`:
```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=plasma_connect
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_LOGGING=false
JWT_SECRET=replace_this_with_a_long_secure_secret
JWT_EXPIRES_IN=7d
```

### Frontend (`frontend/.env`)
Copy from `frontend/.env.example`:
```env
REACT_APP_API_BASE_URL=http://localhost:5000/api/v1
FAST_REFRESH=false
```

## Step-by-Step Setup
1. Create database tables in MySQL:
   - Run migrations: `npm run db:migrate`
2. Backend setup:
   - `cd backend`
   - `cp .env.example .env`
   - Update DB credentials and JWT secret
   - `npm install`
   - `npm run db:migrate`
   - `npm run dev`
3. Frontend setup:
   - `cd ../frontend`
   - `cp .env.example .env`
   - `npm install`
   - `npm start`
4. Open app:
   - `http://localhost:3000`

## Default Seed Accounts
Password for all: `Password@123`
- `admin@plasma.local`
- `donor1@plasma.local`
- `user1@plasma.local`
- `hospital1@plasma.local`
- `bloodbank1@plasma.local`
