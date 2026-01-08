# Deployment Guide

This guide covers deploying the Workflow Builder application to production.

## Table of Contents

1. [Local Deployment (Docker)](#local-deployment-docker)
2. [Production Considerations](#production-considerations)
3. [Environment Variables](#environment-variables)
4. [Database Setup (Neon)](#database-setup-neon)
5. [CI/CD Pipeline](#cicd-pipeline-optional)
6. [Monitoring & Logging](#monitoring--logging-optional)

## Local Deployment (Docker)

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- At least 4GB RAM available
- 10GB disk space

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd "Full Stack Engineering Assignment"
```

2. **Set up environment variables**

Create `backend/.env`:
```env
DATABASE_URL=postgresql+asyncpg://user:password@host/dbname
GOOGLE_API_KEY=your_gemini_api_key
SERPAPI_API_KEY=your_serpapi_key  # Optional
CHROMA_DB_PATH=/app/chroma_db
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:8000
```

3. **Build and run**
```bash
docker-compose up --build
```

4. **Access the application**
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Production Considerations

### 1. Use Production-Ready Settings

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: workflow-backend-prod
    restart: unless-stopped
    ports:
      - "8000:8000"
    volumes:
      - chroma_data:/app/chroma_db
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
      - SERPAPI_API_KEY=${SERPAPI_API_KEY}
      - CHROMA_DB_PATH=/app/chroma_db
      - FRONTEND_URL=${FRONTEND_URL}
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - workflow-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
      args:
        - VITE_API_URL=${VITE_API_URL}
    container_name: workflow-frontend-prod
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - workflow-network

volumes:
  chroma_data:
    driver: local

networks:
  workflow-network:
    driver: bridge
```

### 2. Create Production Frontend Dockerfile

Create `frontend/Dockerfile.prod`:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

Create `frontend/nginx.conf`:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # React Router support
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy (if needed)
    location /api {
        proxy_pass http://backend:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. Update Backend for Production

Modify `backend/app/main.py` for production:

```python
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

app = FastAPI(
    title="Workflow Builder API",
    version="1.0.0",
    docs_url="/docs" if os.getenv("ENV") != "production" else None,
    redoc_url="/redoc" if os.getenv("ENV") != "production" else None
)

# CORS
origins = os.getenv("FRONTEND_URL", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gzip compression
app.add_middleware(GZipMiddleware, minimum_size=1000)
```

## Environment Variables

### Backend (.env)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| DATABASE_URL | Yes | PostgreSQL connection string | `postgresql+asyncpg://user:pass@host/db` |
| GOOGLE_API_KEY | Yes | Google Gemini API key | `AIza...` |
| SERPAPI_API_KEY | No | SerpAPI key for web search | `abc123...` |
| CHROMA_DB_PATH | Yes | ChromaDB storage path | `/app/chroma_db` |
| FRONTEND_URL | No | Allowed frontend origin | `https://app.example.com` |
| ENV | No | Environment mode | `production` |

### Frontend (.env)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| VITE_API_URL | Yes | Backend API URL | `https://api.example.com` |

## Database Setup (Neon)

### 1. Create Neon Account

1. Go to [neon.tech](https://neon.tech)
2. Sign up for free tier (includes 10GB storage)
3. Create a new project

### 2. Get Connection String

1. Go to your project dashboard
2. Click "Connection Details"
3. Copy the connection string
4. **Important**: Modify for async driver:
   ```
   From: postgresql://user:pass@host/db
   To:   postgresql+asyncpg://user:pass@host/db
   ```

### 3. Configure Database

The application will automatically create tables on first run. To manually initialize:

```bash
# Inside backend container
docker-compose exec backend python -c "from app.core.database import init_db; init_db()"
```

### 4. Database Migrations (Optional)

For production, consider using Alembic:

```bash
# Install Alembic
pip install alembic

# Initialize
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Initial migration"

# Apply migration
alembic upgrade head
```

## CI/CD Pipeline (Optional)

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Login to DockerHub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      
      - name: Build and push backend
        uses: docker/build-push-action@v4
        with:
          context: ./backend
          push: true
          tags: yourusername/workflow-backend:latest
      
      - name: Build and push frontend
        uses: docker/build-push-action@v4
        with:
          context: ./frontend
          file: ./frontend/Dockerfile.prod
          push: true
          tags: yourusername/workflow-frontend:latest
          build-args: |
            VITE_API_URL=${{ secrets.API_URL }}
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /app
            docker-compose pull
            docker-compose up -d
```

## Monitoring & Logging (Optional)

### 1. Application Logs

View logs:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend
```

### 2. Health Checks

Backend provides a health endpoint:
```bash
curl http://localhost:8000/health
```

### 3. Prometheus Metrics (Future Enhancement)

Add to `backend/requirements.txt`:
```
prometheus-fastapi-instrumentator==6.1.0
```

Add to `backend/app/main.py`:
```python
from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI()
Instrumentator().instrument(app).expose(app)
```

### 4. Error Tracking with Sentry (Optional)

```bash
pip install sentry-sdk[fastapi]
```

```python
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn="your-sentry-dsn",
    integrations=[FastApiIntegration()],
    traces_sample_rate=1.0,
)
```

## Production Checklist

- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] API keys validated (Gemini, SerpAPI)
- [ ] CORS origins restricted to production URLs
- [ ] HTTPS enabled (use reverse proxy like Nginx)
- [ ] Health checks configured
- [ ] Logging configured
- [ ] Backup strategy for ChromaDB data
- [ ] Database backup strategy
- [ ] Error tracking setup (optional)
- [ ] Monitoring setup (optional)
- [ ] Load testing performed
- [ ] Security headers configured
- [ ] Rate limiting implemented (optional)

## Troubleshooting Production Issues

### Database Connection Errors

```bash
# Test database connectivity
docker-compose exec backend python -c "
from app.core.database import engine
import asyncio
async def test():
    async with engine.begin() as conn:
        result = await conn.execute('SELECT 1')
        print('Database OK')
asyncio.run(test())
"
```

### ChromaDB Permissions

```bash
# Fix permissions
docker-compose down
sudo chown -R 1000:1000 ./backend/chroma_db
docker-compose up -d
```

### High Memory Usage

```bash
# Limit container memory
docker-compose.yml:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
```

## Scaling Recommendations

1. **Backend Scaling**: Run multiple workers with Gunicorn
2. **Database**: Use Neon's autoscaling features
3. **Load Balancer**: Add Nginx or Traefik in front
4. **Caching**: Add Redis for session/response caching
5. **CDN**: Serve frontend static assets via CloudFlare or similar

## Security Best Practices

1. **Never commit `.env` files**
2. **Use secrets management** (AWS Secrets Manager, HashiCorp Vault)
3. **Enable HTTPS** with Let's Encrypt
4. **Implement rate limiting** on API endpoints
5. **Regular dependency updates** with Dependabot
6. **Database backups** scheduled daily
7. **API key rotation** every 90 days
8. **Monitor for security vulnerabilities**

---

For more details, see:
- [README.md](README.md) - General documentation
- [QUICKSTART.md](QUICKSTART.md) - Quick setup guide
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
