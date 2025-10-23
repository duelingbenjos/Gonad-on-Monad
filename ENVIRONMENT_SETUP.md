# Environment Setup & Database Management

## Quick Start (Recommended)

Run the automated setup script:

```bash
./setup-env.sh
```

This script will:
- Create appropriate `.env` files for your environment
- Generate secure JWT secrets automatically
- Set up database directories
- Update `.gitignore` to protect sensitive files
- Guide you through WalletConnect configuration

## Manual Environment Setup

### 1. Copy Template Files

```bash
# For development
cp env.example .env

# For production
cp env.production.example .env.production
```

### 2. Generate Secure Secrets

```bash
# Generate JWT secret
openssl rand -base64 32

# Generate NextAuth secret  
openssl rand -base64 32
```

### 3. Configure WalletConnect

1. Visit [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a new project
3. Copy your Project ID
4. Add it to your `.env` file as `NEXT_PUBLIC_WC_PROJECT_ID`

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite database path | `file:./data/dev.db` |
| `NEXT_PUBLIC_WC_PROJECT_ID` | WalletConnect Project ID | `abc123def456...` |
| `JWT_SECRET` | JWT signing secret | `generated-secret-32-bytes` |
| `NEXTAUTH_URL` | Application URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | NextAuth secret | `generated-secret-32-bytes` |
| `NODE_ENV` | Environment type | `development` or `production` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Application port | `3000` |
| `HOSTNAME` | Bind hostname | `0.0.0.0` |
| `NEXT_TELEMETRY_DISABLED` | Disable Next.js telemetry | `1` |

## Database Operations

### Initial Setup

```bash
# 1. Create data directory
mkdir -p ./data

# 2. Initialize database (first time)
make db-init

# 3. Seed with sample data (optional)
make db-seed
```

### Database Management

```bash
# Apply schema changes
docker-compose exec gonad-app npx prisma db push

# Generate Prisma client
docker-compose exec gonad-app npx prisma generate

# Open database GUI
docker-compose exec gonad-app npx prisma studio

# Reset database (⚠️ destroys data)
make db-reset
```

### Database Migrations (Production)

```bash
# Create migration
docker-compose exec gonad-app npx prisma migrate dev --name your_migration_name

# Apply migrations
docker-compose exec gonad-app npx prisma migrate deploy

# Check migration status
docker-compose exec gonad-app npx prisma migrate status
```

## Docker Deployment

### Development Environment

```bash
# Option 1: Using script
./dev-deploy.sh

# Option 2: Using Docker Compose
docker-compose --profile dev up -d

# Option 3: Using Make
make deploy  # (after setting up .env)
```

**Development Features:**
- Hot reload enabled
- Runs on port 3001
- Uses `./data/dev.db`
- Source code mounted for live changes

### Production Environment

```bash
# Option 1: Using script  
./deploy.sh

# Option 2: Using Docker Compose
docker-compose up -d

# Option 3: Using Make
make deploy
```

**Production Features:**
- Optimized build
- Runs on port 3000
- Uses `./data/production.db`
- Standalone deployment

## Environment File Structure

### Development (.env)
```env
DATABASE_URL="file:./data/dev.db"
NEXT_PUBLIC_WC_PROJECT_ID="your-dev-project-id"
JWT_SECRET="dev-jwt-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-nextauth-secret"
NODE_ENV="development"
```

### Production (.env.production)
```env
DATABASE_URL="file:./data/production.db"
NEXT_PUBLIC_WC_PROJECT_ID="your-prod-project-id"
JWT_SECRET="super-secure-production-jwt"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="super-secure-production-secret"
NODE_ENV="production"
```

## Docker Management Commands

### Container Operations
```bash
# Check status
docker-compose ps
./docker-manage.sh status

# View logs
docker-compose logs -f
./docker-manage.sh logs

# Restart services
docker-compose restart
./docker-manage.sh restart

# Stop everything
docker-compose down
./docker-manage.sh stop
```

### Database Operations
```bash
# Backup databases
./docker-manage.sh backup

# Restore from backup
./docker-manage.sh restore

# Open database studio
./docker-manage.sh db-studio

# Check application health
./docker-manage.sh health
```

### Cleanup
```bash
# Clean Docker resources
docker system prune -f
./docker-manage.sh cleanup
```

## Security Best Practices

### Environment Variables
- ✅ Use different secrets for dev/staging/production
- ✅ Generate secrets with `openssl rand -base64 32`
- ✅ Never commit `.env*` files to git
- ✅ Use strong, unique JWT secrets
- ✅ Keep production secrets secure

### Database
- ✅ Regular automated backups
- ✅ Test restore procedures
- ✅ Use migrations for production schema changes
- ✅ Monitor database performance and size

### Docker
- ✅ Use multi-stage builds for production
- ✅ Run containers as non-root user
- ✅ Implement health checks
- ✅ Use specific image tags (not `latest`)

## Troubleshooting

### Environment Issues
```bash
# Check environment variables are loaded
docker-compose exec gonad-app env | grep -E "(JWT|DATABASE|NEXT_PUBLIC)"

# Rebuild with new environment
docker-compose build --no-cache
docker-compose up -d
```

### Database Issues
```bash
# Check database connectivity
docker-compose exec gonad-app npx prisma db pull

# Reset and reinitialize
make db-reset
make db-init
```

### Container Issues
```bash
# Check container logs
docker-compose logs --tail=50 gonad-app

# Check container health
curl -f http://localhost:3000/api/health

# Restart containers
docker-compose restart
```

## File Structure
```
├── .env                    # Development environment (not committed)
├── .env.production         # Production environment (not committed)
├── env.example             # Development template
├── env.production.example  # Production template
├── setup-env.sh           # Automated setup script
├── docker-compose.yml     # Docker configuration
├── data/                  # Database storage
│   ├── dev.db            # Development database
│   └── production.db     # Production database
└── backups/              # Database backups
```

This approach ensures:
- **Consistency**: Same environment variable names across all environments
- **Security**: No hardcoded secrets in configuration files
- **Flexibility**: Easy to switch between development and production
- **Maintainability**: Clear separation of concerns and documented processes
