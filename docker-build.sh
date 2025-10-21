#!/bin/bash

# Docker Build Script with Retry Logic
# =====================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
MAX_RETRIES=3
RETRY_COUNT=0
BUILD_TARGET=${1:-gonad-app}

echo -e "${BLUE}🐳 Docker Build Script${NC}"
echo "================================"
echo -e "${BLUE}Target:${NC} $BUILD_TARGET"
echo -e "${BLUE}Max Retries:${NC} $MAX_RETRIES"
echo ""

# Function to perform build with retry logic
build_with_retry() {
    local target=$1
    local retry_count=0
    
    while [ $retry_count -lt $MAX_RETRIES ]; do
        echo -e "${BLUE}[ATTEMPT $((retry_count + 1))/$MAX_RETRIES]${NC} Building Docker image: $target"
        
        if docker-compose build --no-cache $target; then
            echo -e "${GREEN}[SUCCESS]${NC} Docker build completed successfully!"
            return 0
        else
            retry_count=$((retry_count + 1))
            if [ $retry_count -lt $MAX_RETRIES ]; then
                echo -e "${YELLOW}[RETRY]${NC} Build failed, retrying in 10 seconds..."
                sleep 10
                
                # Clean up any partial builds
                echo -e "${BLUE}[INFO]${NC} Cleaning up partial builds..."
                docker system prune -f || true
            else
                echo -e "${RED}[ERROR]${NC} Build failed after $MAX_RETRIES attempts"
                return 1
            fi
        fi
    done
}

# Main execution
echo -e "${BLUE}[INFO]${NC} Starting build process..."

# Clean up any existing containers/images that might be in a bad state
echo -e "${BLUE}[INFO]${NC} Cleaning Docker cache..."
docker system prune -f || true

# Perform the build with retry logic
if build_with_retry $BUILD_TARGET; then
    echo ""
    echo -e "${GREEN}🎉 Build completed successfully!${NC}"
    echo ""
    
    # Show image info
    echo -e "${BLUE}Docker Images:${NC}"
    docker images | grep -E "(REPOSITORY|gonad)" || echo "No Gonad images found"
    
    exit 0
else
    echo ""
    echo -e "${RED}❌ Build failed after all retries${NC}"
    echo ""
    echo -e "${YELLOW}Troubleshooting tips:${NC}"
    echo "1. Check your internet connection"
    echo "2. Try running: docker system prune -a"
    echo "3. Check if npm registry is accessible"
    echo "4. Consider using --build-arg to specify different npm registry"
    echo ""
    exit 1
fi
