#!/bin/bash

# Gonad NFT - Docker Management Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${PURPLE}🏝️  Gonad NFT Docker Manager${NC}"
    echo "=================================="
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

show_help() {
    print_header
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  deploy      Deploy production environment"
    echo "  dev         Deploy development environment"
    echo "  stop        Stop all services"
    echo "  restart     Restart all services"
    echo "  logs        Show application logs"
    echo "  db-studio   Open database studio"
    echo "  health      Check application health"
    echo "  status      Show container status"
    echo "  cleanup     Clean up Docker resources"
    echo "  backup      Backup database"
    echo "  restore     Restore database from backup"
    echo "  help        Show this help message"
    echo ""
}

deploy_production() {
    print_status "Deploying production environment..."
    ./deploy.sh
}

deploy_development() {
    print_status "Deploying development environment..."
    ./dev-deploy.sh
}

stop_services() {
    print_status "Stopping all services..."
    docker-compose down
    docker-compose --profile dev down
    print_success "All services stopped"
}

restart_services() {
    print_status "Restarting services..."
    docker-compose restart
    docker-compose --profile dev restart 2>/dev/null || true
    print_success "Services restarted"
}

show_logs() {
    echo "Which logs would you like to see?"
    echo "1) Production logs"
    echo "2) Development logs"
    echo "3) Both"
    read -p "Choose (1-3): " choice
    
    case $choice in
        1) docker-compose logs -f gonad-app ;;
        2) docker-compose --profile dev logs -f gonad-dev ;;
        3) docker-compose logs -f && docker-compose --profile dev logs -f ;;
        *) print_error "Invalid choice" ;;
    esac
}

open_db_studio() {
    if docker-compose ps gonad-app | grep -q "Up"; then
        print_status "Opening database studio for production..."
        docker-compose exec gonad-app npx prisma studio
    elif docker-compose --profile dev ps gonad-dev | grep -q "Up"; then
        print_status "Opening database studio for development..."
        docker-compose --profile dev exec gonad-dev npx prisma studio
    else
        print_error "No running containers found. Please deploy first."
    fi
}

check_health() {
    print_status "Checking application health..."
    
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        print_success "Production app (port 3000) is healthy!"
    else
        print_warning "Production app (port 3000) is not responding"
    fi
    
    if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        print_success "Development app (port 3001) is healthy!"
    else
        print_warning "Development app (port 3001) is not responding"
    fi
}

show_status() {
    print_status "Container status:"
    echo ""
    echo "Production containers:"
    docker-compose ps
    echo ""
    echo "Development containers:"
    docker-compose --profile dev ps
}

backup_database() {
    print_status "Creating database backup..."
    mkdir -p ./backups
    timestamp=$(date +%Y%m%d_%H%M%S)
    
    if [ -f "./data/production.db" ]; then
        cp ./data/production.db "./backups/production_${timestamp}.db"
        print_success "Production database backed up to ./backups/production_${timestamp}.db"
    fi
    
    if [ -f "./data/dev.db" ]; then
        cp ./data/dev.db "./backups/dev_${timestamp}.db"
        print_success "Development database backed up to ./backups/dev_${timestamp}.db"
    fi
}

restore_database() {
    print_status "Available backups:"
    ls -la ./backups/*.db 2>/dev/null || { print_error "No backups found"; return 1; }
    
    read -p "Enter backup filename to restore: " backup_file
    
    if [ ! -f "./backups/$backup_file" ]; then
        print_error "Backup file not found"
        return 1
    fi
    
    read -p "Restore to production (p) or development (d)? " env_choice
    
    case $env_choice in
        p|P) 
            cp "./backups/$backup_file" "./data/production.db"
            print_success "Production database restored"
            ;;
        d|D) 
            cp "./backups/$backup_file" "./data/dev.db"
            print_success "Development database restored"
            ;;
        *) print_error "Invalid choice" ;;
    esac
}

cleanup() {
    print_status "Running cleanup..."
    ./cleanup.sh
}

# Main script logic
case "${1:-help}" in
    deploy)
        deploy_production
        ;;
    dev)
        deploy_development
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    logs)
        show_logs
        ;;
    db-studio)
        open_db_studio
        ;;
    health)
        check_health
        ;;
    status)
        show_status
        ;;
    backup)
        backup_database
        ;;
    restore)
        restore_database
        ;;
    cleanup)
        cleanup
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
