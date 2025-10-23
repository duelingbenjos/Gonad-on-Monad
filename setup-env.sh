#!/bin/bash

# Gonad NFT - Environment Setup Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${PURPLE}🏝️  Gonad NFT Environment Setup${NC}"
    echo "======================================"
}

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

generate_secret() {
    # Generate a secure random secret
    openssl rand -base64 32 2>/dev/null || echo "fallback-$(date +%s)-$(openssl rand -hex 16)"
}

setup_development_env() {
    print_status "Setting up development environment..."
    
    if [ -f ".env" ]; then
        print_warning ".env file already exists"
        read -p "Do you want to overwrite it? (y/N): " overwrite
        if [[ ! $overwrite =~ ^[Yy]$ ]]; then
            print_status "Keeping existing .env file"
            return 0
        fi
    fi

    # Get WalletConnect Project ID
    echo ""
    print_status "WalletConnect Project ID setup:"
    echo "You can get a free project ID from: https://cloud.walletconnect.com/"
    read -p "Enter your WalletConnect Project ID (or press Enter for demo): " wc_project_id
    wc_project_id=${wc_project_id:-"gonad-demo-project-id"}

    # Generate secrets
    jwt_secret=$(generate_secret)
    nextauth_secret=$(generate_secret)

    # Create .env file
    cat > .env << EOF
# Gonad NFT - Development Environment Variables
# Generated on $(date)

# Database Configuration
DATABASE_URL="file:./data/dev.db"

# WalletConnect Configuration
NEXT_PUBLIC_WC_PROJECT_ID="${wc_project_id}"

# JWT Authentication
JWT_SECRET="${jwt_secret}"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="${nextauth_secret}"

# Application Environment
NODE_ENV="development"

# Development Optimizations
NEXT_TELEMETRY_DISABLED=1
WATCHPACK_POLLING=true
EOF

    print_success "Created .env file for development"
}

setup_production_env() {
    print_status "Setting up production environment..."
    
    if [ -f ".env.production" ]; then
        print_warning ".env.production file already exists"
        read -p "Do you want to overwrite it? (y/N): " overwrite
        if [[ ! $overwrite =~ ^[Yy]$ ]]; then
            print_status "Keeping existing .env.production file"
            return 0
        fi
    fi

    # Get production details
    echo ""
    print_status "Production configuration setup:"
    
    read -p "Enter your production domain (e.g., https://yourdomain.com): " prod_domain
    while [[ -z "$prod_domain" ]]; do
        print_error "Production domain is required"
        read -p "Enter your production domain: " prod_domain
    done

    read -p "Enter your production WalletConnect Project ID: " prod_wc_id
    while [[ -z "$prod_wc_id" ]]; do
        print_error "Production WalletConnect Project ID is required"
        read -p "Enter your production WalletConnect Project ID: " prod_wc_id
    done

    # Generate strong production secrets
    jwt_secret=$(generate_secret)
    nextauth_secret=$(generate_secret)

    # Create .env.production file
    cat > .env.production << EOF
# Gonad NFT - Production Environment Variables
# Generated on $(date)

# Database Configuration
DATABASE_URL="file:./data/production.db"

# WalletConnect Configuration
NEXT_PUBLIC_WC_PROJECT_ID="${prod_wc_id}"

# JWT Authentication
JWT_SECRET="${jwt_secret}"

# NextAuth Configuration
NEXTAUTH_URL="${prod_domain}"
NEXTAUTH_SECRET="${nextauth_secret}"

# Application Environment
NODE_ENV="production"

# Production Optimizations
NEXT_TELEMETRY_DISABLED=1
EOF

    print_success "Created .env.production file for production"
    print_warning "Keep your production secrets secure and never commit .env.production to git!"
}

create_data_directory() {
    print_status "Creating data directory for database storage..."
    mkdir -p ./data
    chmod 755 ./data
    print_success "Data directory created: ./data"
}

setup_gitignore() {
    print_status "Updating .gitignore to protect environment files..."
    
    # Create .gitignore if it doesn't exist
    if [ ! -f ".gitignore" ]; then
        touch .gitignore
    fi

    # Add environment files to .gitignore if not already present
    env_patterns=(".env" ".env.local" ".env.production" ".env.*.local" "data/*.db")
    
    for pattern in "${env_patterns[@]}"; do
        if ! grep -q "^${pattern}$" .gitignore; then
            echo "${pattern}" >> .gitignore
            print_status "Added ${pattern} to .gitignore"
        fi
    done
    
    print_success ".gitignore updated to protect sensitive files"
}

show_next_steps() {
    echo ""
    print_success "🎉 Environment setup complete!"
    echo ""
    echo "📋 Next Steps:"
    echo ""
    echo "   📝 Development:"
    echo "      docker-compose --profile dev up -d"
    echo "      # OR"
    echo "      ./dev-deploy.sh"
    echo ""
    echo "   🚀 Production:"
    echo "      docker-compose up -d"
    echo "      # OR"
    echo "      ./deploy.sh"
    echo ""
    echo "   🗄️  Database:"
    echo "      make db-init    # Initialize schema"
    echo "      make db-seed    # Add sample data"
    echo ""
    echo "   📊 Management:"
    echo "      ./docker-manage.sh status   # Check status"
    echo "      ./docker-manage.sh logs     # View logs"
    echo "      ./docker-manage.sh backup   # Backup database"
    echo ""
    echo "📚 For detailed instructions, see: DOCKER_DATABASE_GUIDE.md"
}

# Main script
print_header
echo ""

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create data directory
create_data_directory

# Setup environment files
echo ""
echo "Which environment would you like to set up?"
echo "1) Development only"
echo "2) Production only" 
echo "3) Both development and production"
read -p "Choose (1-3): " env_choice

case $env_choice in
    1)
        setup_development_env
        ;;
    2)
        setup_production_env
        ;;
    3)
        setup_development_env
        setup_production_env
        ;;
    *)
        print_error "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

# Update .gitignore
setup_gitignore

# Show next steps
show_next_steps

print_success "Environment setup completed successfully! 🎉"
