#!/bin/bash

# Gonad NFT - One-Click Deployment Script
set -e

echo "🚀 Starting Gonad NFT Deployment..."

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

# Create environment file if it doesn't exist
if [ ! -f ".env.docker.local" ]; then
    print_status "Creating environment file..."
    cat > .env.docker.local << EOF
# Docker Environment Variables
DATABASE_URL="file:./data/production.db"
NEXT_PUBLIC_WC_PROJECT_ID="gonad-demo-project-id"
JWT_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NODE_ENV="production"
EOF
    print_success "Created .env.docker.local with random secrets"
else
    print_status "Using existing .env.docker.local"
fi

# Build and start services
print_status "Building Docker images..."
docker-compose build --no-cache

print_status "Starting services..."
docker-compose up -d

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."
sleep 10

# Check if app is healthy
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    print_success "Application is healthy!"
else
    print_warning "Application may still be starting up..."
fi

# Set up database if needed
print_status "Setting up database..."
docker-compose exec gonad-app npx prisma db push --accept-data-loss
docker-compose exec gonad-app npx prisma db seed

print_success "🎉 Deployment complete!"
echo ""
echo "📋 Service Information:"
echo "   🌐 Application: http://localhost:3000"
echo "   💾 Database: ./data/production.db"
echo "   📊 Health Check: http://localhost:3000/api/health"
echo ""
echo "🛠️  Management Commands:"
echo "   📜 View logs: docker-compose logs -f"
echo "   🛑 Stop services: docker-compose down"
echo "   🗄️  Database shell: docker-compose exec gonad-app npx prisma studio"
echo "   🔄 Restart: docker-compose restart"
echo ""
print_success "Gonad NFT is now running! 🚀"
