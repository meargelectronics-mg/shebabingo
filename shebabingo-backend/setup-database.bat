@echo off
echo Setting up ShebaBingo Database...
echo.

REM 1. Check PostgreSQL service
sc query postgresql* >nul 2>&1
if errorlevel 1 (
    echo ❌ PostgreSQL service not found
    echo Please start PostgreSQL from Windows Services
    pause
    exit /b 1
)

REM 2. Create database
echo Creating database 'shebabingo'...
psql -U postgres -c "CREATE DATABASE shebabingo;" 2>nul

if errorlevel 1 (
    echo ⚠️ Database might already exist, continuing...
)

REM 3. Run schema
echo Running schema.sql...
psql -U postgres -d shebabingo -f database/schema.sql

if errorlevel 1 (
    echo ❌ Failed to run schema
    echo Check database/schema.sql file exists
    pause
    exit /b 1
)

REM 4. Test
echo Testing connection...
node -e "
const { Pool } = require('pg');
const pool = new Pool({connectionString: 'postgresql://postgres:yourpassword@localhost:5432/shebabingo', ssl: false});
pool.query('SELECT 1 as test').then(() => {
  console.log('✅ Database setup complete!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
"

echo.
echo 🎉 Setup complete! Run: npm run dev
pause