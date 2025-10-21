#!/bin/bash

# Gonad NFT - Development Deployment Script
set -e

echo "🛠️  Starting Gonad NFT Development Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker and try again."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

# Create data directory for database persistence
print_status "Creating data directory..."
mkdir -p ./data
chmod 755 ./data

# Create development environment file if it doesn't exist
if [ ! -f ".env.docker.local" ]; then
    print_status "Creating development environment file..."
    cat > .env.docker.local << EOF
# Development Environment Variables
DATABASE_URL="file:./data/dev.db"
NEXT_PUBLIC_WC_PROJECT_ID="gonad-demo-project-id"
JWT_SECRET="dev-jwt-secret-$(date +%s)"
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="dev-nextauth-secret-$(date +%s)"
NODE_ENV="development"
EOF
    print_success "Created .env.docker.local for development"
else
    print_status "Using existing .env.docker.local"
fi

# Build and start development services
print_status "Building Docker images..."
docker-compose --profile dev build --no-cache

print_status "Starting development services..."
docker-compose --profile dev up -d

# Wait for services to be healthy
print_status "Waiting for development server to start..."
sleep 15

# Check if dev app is healthy
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    print_success "Development server is healthy!"
else
    print_warning "Development server may still be starting up..."
fi

# Set up database if needed
print_status "Setting up development database..."
docker-compose --profile dev exec gonad-dev npx prisma db push --accept-data-loss
docker-compose --profile dev exec gonad-dev npx prisma db seed

print_success "🎉 Development environment ready!"
echo ""
echo "📋 Development Service Information:"
echo "   🌐 Application: http://localhost:3001"
echo "   💾 Database: ./data/dev.db"
echo "   📊 Health Check: http://localhost:3001/api/health"
echo "   🔥 Hot Reload: Enabled"
echo ""
echo "🛠️  Development Commands:"
echo "   📜 View logs: docker-compose --profile dev logs -f gonad-dev"
echo "   🛑 Stop services: docker-compose --profile dev down"
echo "   🗄️  Database studio: docker-compose --profile dev exec gonad-dev npx prisma studio"
echo "   🔄 Restart: docker-compose --profile dev restart gonad-dev"
echo ""
print_success "Development environment is running with hot reload! 🔥"
