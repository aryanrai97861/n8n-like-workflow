#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Workflow Builder Setup Script${NC}"
echo -e "${BLUE}================================${NC}\n"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo "Please install Docker from: https://www.docker.com/get-started"
    exit 1
fi

echo -e "${GREEN}✓ Docker is installed${NC}"

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    echo "Please install Docker Compose"
    exit 1
fi

echo -e "${GREEN}✓ Docker Compose is installed${NC}\n"

# Check for backend .env file
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠ Backend .env file not found${NC}"
    echo "Copying from .env.example..."
    cp backend/.env.example backend/.env
    echo -e "${YELLOW}Please edit backend/.env with your API keys:${NC}"
    echo "  - DATABASE_URL (Get from: https://neon.tech)"
    echo "  - GOOGLE_API_KEY (Get from: https://makersuite.google.com/app/apikey)"
    echo ""
    read -p "Press Enter after updating backend/.env..."
fi

echo -e "${GREEN}✓ Backend .env exists${NC}"

# Check for frontend .env file
if [ ! -f "frontend/.env" ]; then
    echo -e "${YELLOW}⚠ Frontend .env file not found${NC}"
    echo "Copying from .env.example..."
    cp frontend/.env.example frontend/.env
    echo -e "${GREEN}✓ Frontend .env created${NC}"
fi

echo -e "${GREEN}✓ Frontend .env exists${NC}\n"

# Build and start containers
echo -e "${BLUE}Building and starting containers...${NC}\n"
docker-compose down
docker-compose up --build -d

echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}Setup Complete! 🎉${NC}"
echo -e "${GREEN}================================${NC}\n"

echo "Access your application:"
echo -e "  Frontend: ${BLUE}http://localhost:5173${NC}"
echo -e "  Backend API: ${BLUE}http://localhost:8000${NC}"
echo -e "  API Docs: ${BLUE}http://localhost:8000/docs${NC}\n"

echo "View logs:"
echo "  docker-compose logs -f\n"

echo "Stop services:"
echo "  docker-compose down\n"
