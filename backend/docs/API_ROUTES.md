# API Route Structure

Base URL: `http://localhost:5000/api/v1`

## Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /auth/me`

## User & Recipient
- `GET /users/donors/search?bloodGroup=A+&latitude=17.44&longitude=78.39&radiusKm=20`
- `POST /users/requests`
- `GET /users/requests`
- `GET /users/requests/history`
- `GET /users/requests/:id`
- `GET /users/notifications`
- `PATCH /users/notifications/:id/read`

## Donor
- `PATCH /donors/availability`
- `GET /donors/requests`
- `PATCH /donors/requests/:id/respond`
- `GET /donors/history`

## Hospital
- `POST /hospitals/emergency-requests`
- `GET /hospitals/requests`
- `GET /hospitals/history`

## Blood Bank
- `GET /blood-banks/stocks`
- `PUT /blood-banks/stocks`
- `GET /blood-banks/requests`
- `PATCH /blood-banks/requests/:id/respond`
- `GET /blood-banks/request-logs`

## Admin
- `GET /admin/users`
- `GET /admin/users/:id`
- `PUT /admin/users/:id`
- `DELETE /admin/users/:id`
- `PATCH /admin/users/:id/block`
- `PATCH /admin/users/:id/unblock`
- `PATCH /admin/users/:id/reset-password`
- `GET /admin/requests`
- `GET /admin/stats`
