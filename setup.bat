@echo off
REM Workflow Builder Setup Script for Windows

echo ================================
echo Workflow Builder Setup Script
echo ================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed
    echo Please install Docker from: https://www.docker.com/get-started
    exit /b 1
)
echo [OK] Docker is installed

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose is not installed
    echo Please install Docker Compose
    exit /b 1
)
echo [OK] Docker Compose is installed
echo.

REM Check for backend .env file
if not exist "backend\.env" (
    echo [WARNING] Backend .env file not found
    echo Copying from .env.example...
    copy "backend\.env.example" "backend\.env"
    echo.
    echo Please edit backend\.env with your API keys:
    echo   - DATABASE_URL (Get from: https://neon.tech^)
    echo   - GOOGLE_API_KEY (Get from: https://makersuite.google.com/app/apikey^)
    echo.
    pause
)
echo [OK] Backend .env exists

REM Check for frontend .env file
if not exist "frontend\.env" (
    echo [WARNING] Frontend .env file not found
    echo Copying from .env.example...
    copy "frontend\.env.example" "frontend\.env"
    echo [OK] Frontend .env created
)
echo [OK] Frontend .env exists
echo.

REM Build and start containers
echo Building and starting containers...
echo.
docker-compose down
docker-compose up --build -d

echo.
echo ================================
echo Setup Complete! 🎉
echo ================================
echo.

echo Access your application:
echo   Frontend: http://localhost:5173
echo   Backend API: http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo.

echo View logs:
echo   docker-compose logs -f
echo.

echo Stop services:
echo   docker-compose down
echo.

pause
