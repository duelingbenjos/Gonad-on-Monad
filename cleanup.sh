#!/bin/bash

# Gonad NFT - Cleanup Script
set -e

echo "🧹 Cleaning up Gonad NFT Docker environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Stop and remove containers
print_status "Stopping containers..."
docker-compose down --remove-orphans

# Stop development containers too
print_status "Stopping development containers..."
docker-compose --profile dev down --remove-orphans

# Remove images
print_status "Removing Docker images..."
docker rmi $(docker images "gonad-yellow-riff*" -q) 2>/dev/null || print_warning "No Gonad images to remove"

# Clean up Docker system (optional)
read -p "Do you want to clean up unused Docker resources? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Cleaning up Docker system..."
    docker system prune -f
    print_success "Docker system cleaned"
fi

# Ask about data directory
read -p "Do you want to remove the database data directory? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Removing data directory..."
    rm -rf ./data
    print_success "Data directory removed"
else
    print_status "Data directory preserved"
fi

print_success "🎉 Cleanup complete!"
