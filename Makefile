# Gonad NFT - Docker Management Makefile
# =====================================

# Project settings
PROJECT_NAME = gonad-nft
DOCKER_COMPOSE = docker-compose
DEV_PROFILE = --profile dev
DATA_DIR = ./data
BACKUP_DIR = ./backups

# Colors for output
RED = \033[0;31m
GREEN = \033[0;32m
YELLOW = \033[1;33m
BLUE = \033[0;34m
PURPLE = \033[0;35m
NC = \033[0m

# Default target
.DEFAULT_GOAL := help

# Disable built-in rules and variables
.SUFFIXES:
MAKEFLAGS += --no-builtin-rules
MAKEFLAGS += --no-builtin-variables

#==============================================================================
# HELP & INFORMATION
#==============================================================================

.PHONY: help
help: ## Show this help message
	@echo -e "$(PURPLE)🏝️  Gonad NFT Docker Manager$(NC)"
	@echo "=================================="
	@echo ""
	@echo "Usage: make [TARGET]"
	@echo ""
	@echo -e "$(BLUE)Build & Deploy:$(NC)"
	@echo "  build           Build all Docker images"
	@echo "  build-prod      Build production Docker image"
	@echo "  build-dev       Build development Docker image"
	@echo "  deploy          Deploy production environment"
	@echo "  deploy-dev      Deploy development environment"
	@echo "  quick-start     Quick start - build and deploy production"
	@echo "  quick-dev       Quick dev start - build and deploy development"
	@echo ""
	@echo -e "$(BLUE)Container Management:$(NC)"
	@echo "  start           Start all containers (production)"
	@echo "  start-dev       Start development containers"
	@echo "  stop            Stop all containers"
	@echo "  restart         Restart all running containers"
	@echo "  restart-prod    Restart production containers only"
	@echo "  restart-dev     Restart development containers only"
	@echo ""
	@echo -e "$(BLUE)Database Operations:$(NC)"
	@echo "  db-setup        Database setup - push schema and seed data"
	@echo "  db-studio       Database studio - open Prisma Studio"
	@echo "  db-migrate      Database migrate - run Prisma migrations"
	@echo "  db-reset        Database reset - reset database and reseed"
	@echo "  db-backup       Database backup - create backup of databases"
	@echo ""
	@echo -e "$(BLUE)Monitoring & Logs:$(NC)"
	@echo "  logs            Show logs for all containers"
	@echo "  logs-prod       Show logs for production containers"
	@echo "  logs-dev        Show logs for development containers"
	@echo "  status          Show container status"
	@echo "  health          Check application health"
	@echo "  monitor         Monitor containers (watch status)"
	@echo ""
	@echo -e "$(BLUE)Cleanup & Maintenance:$(NC)"
	@echo "  clean           Clean up - stop containers and remove images"
	@echo "  clean-containers Remove all project containers"
	@echo "  clean-images    Remove all project Docker images"
	@echo "  clean-volumes   Remove all project Docker volumes"
	@echo "  clean-all       Remove everything (containers, images, volumes)"
	@echo "  reset           Reset everything and redeploy production"
	@echo ""
	@echo -e "$(BLUE)Utility & Shortcuts:$(NC)"
	@echo "  setup-env       Setup environment files and directories"
	@echo "  shell           Open shell in running production container"
	@echo "  shell-dev       Open shell in running development container"
	@echo "  update          Update application (rebuild and redeploy)"
	@echo "  info            Show project information and current status"
	@echo "  dev             Alias for deploy-dev"
	@echo "  prod            Alias for deploy"
	@echo "  up              Alias for start"
	@echo "  down            Alias for stop"

.PHONY: info
info: ## Show project information and current status
	@echo -e "$(PURPLE)🏝️  Gonad NFT Project Information$(NC)"
	@echo "===================================="
	@echo -e "$(BLUE)Project:$(NC) $(PROJECT_NAME)"
	@echo -e "$(BLUE)Data Directory:$(NC) $(DATA_DIR)"
	@echo -e "$(BLUE)Backup Directory:$(NC) $(BACKUP_DIR)"
	@echo ""
	@echo -e "$(BLUE)Available Services:$(NC)"
	@echo "  • Production App (port 3000)"
	@echo "  • Development App (port 3001)"
	@echo ""
	@echo -e "$(BLUE)Docker Images:$(NC)"
	@docker images | grep -E "(REPOSITORY|gonad)" || echo "  No Gonad images found"
	@echo ""
	@$(MAKE) --no-print-directory status

#==============================================================================
# BUILD TARGETS
#==============================================================================

.PHONY: build
build: ## Build all Docker images
	@echo -e "$(BLUE)[INFO]$(NC) Building all Docker images..."
	$(DOCKER_COMPOSE) build --no-cache
	$(DOCKER_COMPOSE) $(DEV_PROFILE) build --no-cache
	@echo -e "$(GREEN)[SUCCESS]$(NC) All images built successfully!"

.PHONY: build-prod
build-prod: ## Build production Docker image
	@echo -e "$(BLUE)[INFO]$(NC) Building production Docker image..."
	$(DOCKER_COMPOSE) build --no-cache gonad-app
	@echo -e "$(GREEN)[SUCCESS]$(NC) Production image built successfully!"

.PHONY: build-dev
build-dev: ## Build development Docker image
	@echo -e "$(BLUE)[INFO]$(NC) Building development Docker image..."
	$(DOCKER_COMPOSE) $(DEV_PROFILE) build --no-cache gonad-dev
	@echo -e "$(GREEN)[SUCCESS]$(NC) Development image built successfully!"

#==============================================================================
# DEPLOYMENT TARGETS
#==============================================================================

.PHONY: deploy
deploy: setup-env ## Deploy production environment
	@echo -e "$(BLUE)[INFO]$(NC) Deploying production environment..."
	@chmod +x deploy.sh && ./deploy.sh

.PHONY: deploy-dev
deploy-dev: setup-env ## Deploy development environment
	@echo -e "$(BLUE)[INFO]$(NC) Deploying development environment..."
	@chmod +x dev-deploy.sh && ./dev-deploy.sh

.PHONY: quick-start
quick-start: build deploy ## Quick start - build and deploy production in one command

.PHONY: quick-dev
quick-dev: build-dev deploy-dev ## Quick dev start - build and deploy development in one command

#==============================================================================
# CONTAINER MANAGEMENT
#==============================================================================

.PHONY: start
start: ## Start all containers (production)
	@echo -e "$(BLUE)[INFO]$(NC) Starting production containers..."
	$(DOCKER_COMPOSE) up -d
	@echo -e "$(GREEN)[SUCCESS]$(NC) Production containers started!"

.PHONY: start-dev  
start-dev: ## Start development containers
	@echo -e "$(BLUE)[INFO]$(NC) Starting development containers..."
	$(DOCKER_COMPOSE) $(DEV_PROFILE) up -d
	@echo -e "$(GREEN)[SUCCESS]$(NC) Development containers started!"

.PHONY: stop
stop: ## Stop all containers
	@echo -e "$(BLUE)[INFO]$(NC) Stopping all containers..."
	$(DOCKER_COMPOSE) down
	$(DOCKER_COMPOSE) $(DEV_PROFILE) down
	@echo -e "$(GREEN)[SUCCESS]$(NC) All containers stopped!"

.PHONY: restart
restart: ## Restart all running containers
	@echo -e "$(BLUE)[INFO]$(NC) Restarting containers..."
	$(DOCKER_COMPOSE) restart
	$(DOCKER_COMPOSE) $(DEV_PROFILE) restart 2>/dev/null || true
	@echo -e "$(GREEN)[SUCCESS]$(NC) Containers restarted!"

.PHONY: restart-prod
restart-prod: ## Restart production containers only
	@echo -e "$(BLUE)[INFO]$(NC) Restarting production containers..."
	$(DOCKER_COMPOSE) restart
	@echo -e "$(GREEN)[SUCCESS]$(NC) Production containers restarted!"

.PHONY: restart-dev
restart-dev: ## Restart development containers only
	@echo -e "$(BLUE)[INFO]$(NC) Restarting development containers..."
	$(DOCKER_COMPOSE) $(DEV_PROFILE) restart
	@echo -e "$(GREEN)[SUCCESS]$(NC) Development containers restarted!"

#==============================================================================
# DATABASE OPERATIONS
#==============================================================================

.PHONY: db-setup
db-setup: ## Database setup - push schema and seed data
	@echo -e "$(BLUE)[INFO]$(NC) Setting up database..."
	@if $(DOCKER_COMPOSE) ps gonad-app | grep -q "Up"; then \
		echo -e "$(BLUE)[INFO]$(NC) Setting up production database..."; \
		$(DOCKER_COMPOSE) exec gonad-app npx prisma db push --accept-data-loss; \
		$(DOCKER_COMPOSE) exec gonad-app npx prisma db seed; \
	fi
	@if $(DOCKER_COMPOSE) $(DEV_PROFILE) ps gonad-dev | grep -q "Up"; then \
		echo -e "$(BLUE)[INFO]$(NC) Setting up development database..."; \
		$(DOCKER_COMPOSE) $(DEV_PROFILE) exec gonad-dev npx prisma db push --accept-data-loss; \
		$(DOCKER_COMPOSE) $(DEV_PROFILE) exec gonad-dev npx prisma db seed; \
	fi
	@echo -e "$(GREEN)[SUCCESS]$(NC) Database setup complete!"

.PHONY: db-studio
db-studio: ## Database studio - open Prisma Studio
	@echo -e "$(BLUE)[INFO]$(NC) Opening database studio..."
	@if $(DOCKER_COMPOSE) ps gonad-app | grep -q "Up"; then \
		echo -e "$(BLUE)[INFO]$(NC) Opening Prisma Studio for production..."; \
		$(DOCKER_COMPOSE) exec gonad-app npx prisma studio; \
	elif $(DOCKER_COMPOSE) $(DEV_PROFILE) ps gonad-dev | grep -q "Up"; then \
		echo -e "$(BLUE)[INFO]$(NC) Opening Prisma Studio for development..."; \
		$(DOCKER_COMPOSE) $(DEV_PROFILE) exec gonad-dev npx prisma studio; \
	else \
		echo -e "$(RED)[ERROR]$(NC) No running containers found. Please deploy first."; \
	fi

.PHONY: db-migrate
db-migrate: ## Database migrate - run Prisma migrations
	@echo -e "$(BLUE)[INFO]$(NC) Running database migrations..."
	@if $(DOCKER_COMPOSE) ps gonad-app | grep -q "Up"; then \
		$(DOCKER_COMPOSE) exec gonad-app npx prisma migrate deploy; \
	fi
	@if $(DOCKER_COMPOSE) $(DEV_PROFILE) ps gonad-dev | grep -q "Up"; then \
		$(DOCKER_COMPOSE) $(DEV_PROFILE) exec gonad-dev npx prisma migrate deploy; \
	fi

.PHONY: db-reset
db-reset: ## Database reset - reset database and reseed
	@echo -e "$(YELLOW)[WARNING]$(NC) This will reset all database data!"
	@read -p "Are you sure? (y/N) " -n 1 -r && echo && \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		$(MAKE) --no-print-directory db-setup; \
	else \
		echo -e "$(BLUE)[INFO]$(NC) Database reset cancelled."; \
	fi

.PHONY: db-backup
db-backup: ## Database backup - create backup of current databases
	@echo -e "$(BLUE)[INFO]$(NC) Creating database backup..."
	@mkdir -p $(BACKUP_DIR)
	@timestamp=$$(date +%Y%m%d_%H%M%S) && \
	if [ -f "$(DATA_DIR)/production.db" ]; then \
		cp $(DATA_DIR)/production.db $(BACKUP_DIR)/production_$$timestamp.db && \
		echo -e "$(GREEN)[SUCCESS]$(NC) Production DB backed up to $(BACKUP_DIR)/production_$$timestamp.db"; \
	fi && \
	if [ -f "$(DATA_DIR)/dev.db" ]; then \
		cp $(DATA_DIR)/dev.db $(BACKUP_DIR)/dev_$$timestamp.db && \
		echo -e "$(GREEN)[SUCCESS]$(NC) Development DB backed up to $(BACKUP_DIR)/dev_$$timestamp.db"; \
	fi

#==============================================================================
# MONITORING & LOGS
#==============================================================================

.PHONY: logs
logs: ## Show logs for all containers
	@echo -e "$(BLUE)[INFO]$(NC) Showing application logs..."
	$(DOCKER_COMPOSE) logs -f

.PHONY: logs-prod
logs-prod: ## Show logs for production containers
	@echo -e "$(BLUE)[INFO]$(NC) Showing production logs..."
	$(DOCKER_COMPOSE) logs -f gonad-app

.PHONY: logs-dev
logs-dev: ## Show logs for development containers
	@echo -e "$(BLUE)[INFO]$(NC) Showing development logs..."
	$(DOCKER_COMPOSE) $(DEV_PROFILE) logs -f gonad-dev

.PHONY: status
status: ## Show container status
	@echo -e "$(BLUE)[INFO]$(NC) Container Status:"
	@echo ""
	@echo -e "$(BLUE)Production Containers:$(NC)"
	@$(DOCKER_COMPOSE) ps
	@echo ""
	@echo -e "$(BLUE)Development Containers:$(NC)"
	@$(DOCKER_COMPOSE) $(DEV_PROFILE) ps

.PHONY: health
health: ## Check application health
	@echo -e "$(BLUE)[INFO]$(NC) Checking application health..."
	@if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then \
		echo -e "$(GREEN)[SUCCESS]$(NC) Production app (port 3000) is healthy!"; \
	else \
		echo -e "$(YELLOW)[WARNING]$(NC) Production app (port 3000) is not responding"; \
	fi
	@if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then \
		echo -e "$(GREEN)[SUCCESS]$(NC) Development app (port 3001) is healthy!"; \
	else \
		echo -e "$(YELLOW)[WARNING]$(NC) Development app (port 3001) is not responding"; \
	fi

.PHONY: monitor
monitor: ## Monitor containers (watch status)
	@echo -e "$(BLUE)[INFO]$(NC) Monitoring containers (Ctrl+C to stop)..."
	@watch -n 2 'docker-compose ps && echo "" && docker-compose --profile dev ps'

#==============================================================================
# CLEANUP & MAINTENANCE
#==============================================================================

.PHONY: clean
clean: ## Clean up - stop containers and remove images
	@echo -e "$(BLUE)[INFO]$(NC) Running cleanup..."
	@chmod +x cleanup.sh && ./cleanup.sh

.PHONY: clean-containers
clean-containers: ## Remove all project containers
	@echo -e "$(BLUE)[INFO]$(NC) Removing containers..."
	$(DOCKER_COMPOSE) down --remove-orphans
	$(DOCKER_COMPOSE) $(DEV_PROFILE) down --remove-orphans
	@echo -e "$(GREEN)[SUCCESS]$(NC) Containers removed!"

.PHONY: clean-images
clean-images: ## Remove all project Docker images
	@echo -e "$(BLUE)[INFO]$(NC) Removing Docker images..."
	@docker rmi $$(docker images "gonad-yellow-riff*" -q) 2>/dev/null || echo -e "$(YELLOW)[WARNING]$(NC) No Gonad images to remove"
	@echo -e "$(GREEN)[SUCCESS]$(NC) Images removed!"

.PHONY: clean-volumes
clean-volumes: ## Remove all project Docker volumes
	@echo -e "$(YELLOW)[WARNING]$(NC) This will remove all data volumes!"
	@read -p "Are you sure? (y/N) " -n 1 -r && echo && \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker volume prune -f && \
		echo -e "$(GREEN)[SUCCESS]$(NC) Volumes removed!"; \
	else \
		echo -e "$(BLUE)[INFO]$(NC) Volume cleanup cancelled."; \
	fi

.PHONY: clean-all
clean-all: clean-containers clean-images clean-volumes ## Remove everything (containers, images, volumes)
	@echo -e "$(GREEN)[SUCCESS]$(NC) Complete cleanup finished!"

.PHONY: reset
reset: clean-all quick-start ## Reset everything and redeploy production
	@echo -e "$(GREEN)[SUCCESS]$(NC) Reset and redeploy complete!"

#==============================================================================
# UTILITY TARGETS
#==============================================================================

.PHONY: setup-env
setup-env: ## Setup environment files and directories
	@echo -e "$(BLUE)[INFO]$(NC) Setting up environment..."
	@mkdir -p $(DATA_DIR)
	@mkdir -p $(BACKUP_DIR)
	@chmod 755 $(DATA_DIR)
	@if [ ! -f ".env.docker.local" ]; then \
		echo -e "$(BLUE)[INFO]$(NC) Creating .env.docker.local..."; \
		echo "# Docker Environment Variables" > .env.docker.local; \
		echo "DATABASE_URL=\"file:./data/production.db\"" >> .env.docker.local; \
		echo "NEXT_PUBLIC_WC_PROJECT_ID=\"gonad-demo-project-id\"" >> .env.docker.local; \
		echo "JWT_SECRET=\"$$(openssl rand -base64 32)\"" >> .env.docker.local; \
		echo "NEXTAUTH_URL=\"http://localhost:3000\"" >> .env.docker.local; \
		echo "NEXTAUTH_SECRET=\"$$(openssl rand -base64 32)\"" >> .env.docker.local; \
		echo "NODE_ENV=\"production\"" >> .env.docker.local; \
		echo -e "$(GREEN)[SUCCESS]$(NC) Created .env.docker.local"; \
	fi

.PHONY: shell
shell: ## Open shell in running production container
	@if $(DOCKER_COMPOSE) ps gonad-app | grep -q "Up"; then \
		$(DOCKER_COMPOSE) exec gonad-app /bin/sh; \
	else \
		echo -e "$(RED)[ERROR]$(NC) Production container not running. Start it first with: make start"; \
	fi

.PHONY: shell-dev
shell-dev: ## Open shell in running development container
	@if $(DOCKER_COMPOSE) $(DEV_PROFILE) ps gonad-dev | grep -q "Up"; then \
		$(DOCKER_COMPOSE) $(DEV_PROFILE) exec gonad-dev /bin/sh; \
	else \
		echo -e "$(RED)[ERROR]$(NC) Development container not running. Start it first with: make start-dev"; \
	fi

.PHONY: update
update: ## Update application (rebuild and redeploy)
	@echo -e "$(BLUE)[INFO]$(NC) Updating application..."
	$(MAKE) --no-print-directory build
	$(MAKE) --no-print-directory restart
	@echo -e "$(GREEN)[SUCCESS]$(NC) Application updated!"

#==============================================================================
# DEVELOPMENT SHORTCUTS
#==============================================================================

.PHONY: dev
dev: deploy-dev ## Alias for deploy-dev

.PHONY: prod  
prod: deploy ## Alias for deploy

.PHONY: up
up: start ## Alias for start

.PHONY: down
down: stop ## Alias for stop

# Prevent make from treating files as targets
$(DATA_DIR) $(BACKUP_DIR):
	@mkdir -p $@
