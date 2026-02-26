[10:41 AM] Hari Babu
#!/bin/sh

echo "Running startup migrations..."

echo "Running seeders..."
node src/seeders/adminSeeder.js
node src/seeders/seed.js

echo "Starting server..."
exec node server.js
