# Admin Seeder Fix - Windows Docker Support

## Problem
On Windows, the admin seeder was failing with the docker-compose command using shell syntax:
```yaml
command: sh -c "node src/seeders/adminSeeder.js && node server.js"
```

## Root Causes
1. **Shell compatibility** - `sh -c` syntax can be problematic on Windows Docker Desktop
2. **Timing issues** - The seeder might run before database migrations complete
3. **Error handling** - Limited visibility into why the seeder was failing

## Solution
Replaced the shell command with a robust Node.js startup script that:

### 1. Created `backend/docker-startup.js`
- Waits for database connection with retry logic (5 attempts, 2-second intervals)
- Runs migrations properly
- Seeds admin user with better error handling
- Starts the HTTP server
- Graceful shutdown handling

### 2. Updated `backend/src/seeders/adminSeeder.js`
- Wrapped in try-catch block for better error reporting
- Added more detailed logging with visual indicators (✓, ✗)
- Better error messages with error details
- Works as standalone module and in startup script

### 3. Updated `docker-compose.yml`
- Changed command to: `command: node docker-startup.js`
- No shell dependencies
- Works on Windows, Linux, and macOS

## Features

### Database Retry Logic
```javascript
MAX_RETRIES = 5
RETRY_DELAY = 2000ms (2 seconds)
```
Automatically retries database connection up to 5 times with 2-second delays.

### Detailed Logging
```
🚀 Starting Plasma Connect backend...
⏳ Waiting for database...
✓ Database connection established
🔄 Running migrations...
✓ Migrations completed
👤 Seeding admin user...
✓ Admin user already exists (admin@plasma.local)
✓ Admin seeding completed
🎯 Starting HTTP server...
✓ Plasma Connect API running on port 8000
```

### Graceful Shutdown
Properly closes database connection on SIGTERM signal.

## Testing

### Start Docker
```bash
docker compose up -d
```

### Check logs
```bash
docker compose logs backend -f
```

### Verify services
```bash
docker compose ps
```

All services should show as "Up" with healthy status.

## Environment Variables

The admin seeder reads from `backend/.env.docker`:

```env
ADMIN_SEED_ENABLED=true              # Enable/disable seeder
ADMIN_SEED_NAME=System Admin         # Admin user name
ADMIN_SEED_EMAIL=admin@plasma.local  # Admin email
ADMIN_SEED_PASSWORD=Admin@123        # Admin password
ADMIN_SEED_PHONE=9999999999         # Admin phone
```

## Benefits

✅ **Windows Compatible** - Works on Windows Docker Desktop  
✅ **Robust** - Retry logic for database connections  
✅ **Better Visibility** - Clear logging with visual indicators  
✅ **Error Handling** - Detailed error messages for debugging  
✅ **Graceful Shutdown** - Proper cleanup on container stop  
✅ **Cross-platform** - Works on Windows, Linux, and macOS  

## Backward Compatibility

These changes are fully backward compatible. The startup script internally calls the same functions that the shell command was calling, so the behavior is identical.

## Troubleshooting

If you still see errors:

1. **Check database is healthy**
   ```bash
   docker compose ps mysql
   ```

2. **View full backend logs**
   ```bash
   docker compose logs backend --tail=100
   ```

3. **Rebuild Docker images**
   ```bash
   docker compose down
   docker compose up --build -d
   ```

4. **Clear Docker cache**
   ```bash
   docker compose down -v
   docker compose up -d
   ```

## Files Modified

- `docker-compose.yml` - Changed backend command
- `backend/docker-startup.js` - New startup script (created)
- `backend/src/seeders/adminSeeder.js` - Enhanced error handling

