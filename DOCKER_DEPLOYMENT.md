# 🐳 Docker Deployment Guide

Complete Docker setup for Gonad NFT with one-click deployment, volume mounts, and easy management.

## 🚀 Quick Start

### One-Click Production Deployment
```bash
./deploy.sh
```

### One-Click Development Deployment
```bash
./dev-deploy.sh
```

## 📋 Prerequisites

- **Docker** (v20.10+): [Install Docker](https://docs.docker.com/get-docker/)
- **Docker Compose** (v2.0+): [Install Docker Compose](https://docs.docker.com/compose/install/)

## 🏗️ Architecture

### Production Setup
- **Container**: `gonad-nft-app`
- **Port**: `3000`
- **Database**: SQLite mounted as volume (`./data/production.db`)
- **Build**: Optimized production build
- **Volumes**:
  - `./data:/app/data` - Database persistence
  - `./.next:/app/.next` - Build artifacts access

### Development Setup
- **Container**: `gonad-nft-dev`
- **Port**: `3001`
- **Database**: SQLite mounted as volume (`./data/dev.db`)
- **Build**: Development with hot reload
- **Volumes**:
  - `.:/app` - Full source code mount
  - `/app/node_modules` - Node modules persist in container

## 📁 Volume Mounts

### Database Volume
```bash
./data/
├── production.db    # Production database
├── dev.db          # Development database
└── backups/        # Database backups
```

### Application Volume
```bash
./.next/            # Next.js build artifacts
├── standalone/     # Production build
├── static/         # Static assets
└── server.js       # Server entry point
```

## 🛠️ Management Commands

### Using the Management Script
```bash
./docker-manage.sh [command]
```

**Available Commands:**
- `deploy` - Deploy production environment
- `dev` - Deploy development environment
- `stop` - Stop all services
- `restart` - Restart all services
- `logs` - Show application logs
- `db-studio` - Open database studio
- `health` - Check application health
- `status` - Show container status
- `backup` - Backup database
- `restore` - Restore database from backup
- `cleanup` - Clean up Docker resources

### Manual Docker Commands

**Production:**
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Database shell
docker-compose exec gonad-app npx prisma studio
```

**Development:**
```bash
# Build and start with dev profile
docker-compose --profile dev up -d

# View logs
docker-compose --profile dev logs -f gonad-dev

# Stop
docker-compose --profile dev down
```

## 🌍 Environment Variables

Create `.env.docker.local` (automatically created by deploy scripts):

```bash
# Database (mounted as volume)
DATABASE_URL="file:./data/production.db"

# WalletConnect Project ID
NEXT_PUBLIC_WC_PROJECT_ID="your-project-id"

# Security (auto-generated secure secrets)
JWT_SECRET="your-secure-jwt-secret"
NEXTAUTH_SECRET="your-secure-nextauth-secret"

# App Configuration
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="production"
```

## 📊 Service URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Production App** | http://localhost:3000 | Main application |
| **Development App** | http://localhost:3001 | Dev with hot reload |
| **Health Check** | http://localhost:3000/api/health | Service health |
| **Database Studio** | Dynamic | Prisma Studio interface |

## 🗄️ Database Management

### Backup Database
```bash
./docker-manage.sh backup
```

### Restore Database
```bash
./docker-manage.sh restore
```

### Manual Database Operations
```bash
# Access database in production
docker-compose exec gonad-app npx prisma studio

# Run migrations
docker-compose exec gonad-app npx prisma db push

# Seed data
docker-compose exec gonad-app npx prisma db seed
```

## 🔧 Development Features

- **Hot Reload**: Code changes reflect immediately
- **Volume Mounting**: Full source code mounted
- **Separate Database**: Development database isolation
- **Port Separation**: Production (3000) vs Development (3001)

## 📦 Build Process

### Production Build
1. **Multi-stage build** for optimization
2. **Standalone output** for Docker compatibility
3. **Non-root user** for security
4. **Health checks** for reliability

### Development Build
1. **Single stage** for speed
2. **Full source mount** for development
3. **Hot reload enabled**
4. **Debug-friendly** setup

## 🛡️ Security Features

- **Non-root containers** - Runs as `nextjs` user
- **Minimal base images** - Alpine Linux
- **Health checks** - Automatic service monitoring
- **Secure secrets** - Auto-generated JWT secrets
- **Read-only containers** - Immutable runtime

## 🔍 Troubleshooting

### Check Container Status
```bash
./docker-manage.sh status
```

### View Logs
```bash
./docker-manage.sh logs
```

### Health Check
```bash
./docker-manage.sh health
# OR
curl http://localhost:3000/api/health
```

### Database Issues
```bash
# Check database file exists
ls -la ./data/

# Reset database
docker-compose exec gonad-app npx prisma db push --force-reset
docker-compose exec gonad-app npx prisma db seed
```

### Container Issues
```bash
# Restart services
./docker-manage.sh restart

# Clean rebuild
./docker-manage.sh cleanup
./docker-manage.sh deploy
```

## 🚚 Deployment to Production

### Local Production
```bash
./deploy.sh
```

### Remote Server
```bash
# Copy project to server
scp -r . user@server:/path/to/app/

# On server
cd /path/to/app/
./deploy.sh
```

### Environment Variables
Update `.env.docker.local` with production values:
- Set real WalletConnect Project ID
- Use secure JWT secrets
- Configure proper NEXTAUTH_URL

## 🧹 Cleanup

### Full Cleanup
```bash
./cleanup.sh
```

### Partial Cleanup
```bash
# Stop containers only
./docker-manage.sh stop

# Remove images only
docker rmi $(docker images "gonad-yellow-riff*" -q)
```

## 📈 Monitoring

### Health Endpoint
```json
GET /api/health
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "database": "connected"
}
```

### Docker Health Checks
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3
- **Start Period**: 40 seconds

## 🎯 Next Steps

1. **Deploy locally**: `./deploy.sh`
2. **Test whitelist flow**: Connect wallet and sign
3. **Check database**: `./docker-manage.sh db-studio`
4. **Monitor health**: `./docker-manage.sh health`
5. **Deploy to server**: Copy files and run `./deploy.sh`

Your Gonad NFT application is now fully containerized and production-ready! 🎉
