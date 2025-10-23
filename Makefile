# =============================================================================
# Gonad on Monad - Docker Management Commands
# =============================================================================

# BUILD COMMANDS
# -----------------------------------------------------------------------------
build:		## Build the Docker image with latest code changes
	docker-compose build gonad-app

rebuild:	## Force rebuild without cache (use when dependencies change)
	docker-compose build --no-cache gonad-app

# DEPLOYMENT COMMANDS  
# -----------------------------------------------------------------------------
deploy:		## Complete deployment: build, start, and initialize database
	@echo "🚀 Starting complete deployment..."
	@make build
	@make up
	@echo "⏳ Waiting for container to be ready..."
	@sleep 10
	@make db-init
	@make health
	@echo "✅ Deployment complete!"

up:		## Start the application (run 'make deploy' for first-time setup)
	docker-compose up -d gonad-app

down:		## Stop and remove containers
	docker-compose down

restart:	## Restart the running container
	docker-compose restart gonad-app

# DATABASE COMMANDS
# -----------------------------------------------------------------------------
db-init:	## Initialize database schema (REQUIRED on first deployment)
	@echo "🗄️  Initializing database schema..."
	DATABASE_URL="file:$(PWD)/data/production.db" npx prisma generate
	DATABASE_URL="file:$(PWD)/data/production.db" npx prisma db push

db-seed:	## Populate database with sample data (optional)
	@echo "🌱 Seeding database..."
	docker-compose exec gonad-app npx prisma db seed

db-reset:	## Reset database (WARNING: destroys all data)
	@echo "⚠️  Resetting database (all data will be lost)..."
	@read -p "Are you sure? Type 'yes' to continue: " confirm && [ "$$confirm" = "yes" ]
	docker-compose exec gonad-app npx prisma db push --force-reset

# MAINTENANCE COMMANDS
# -----------------------------------------------------------------------------
logs:		## View application logs (follow mode)
	docker-compose logs -f gonad-app

shell:		## Open shell inside the container
	docker-compose exec gonad-app /bin/sh

health:		## Check application health
	@echo "🔍 Checking application health..."
	@curl -f http://localhost:3000/api/health && echo "✅ Application is healthy"

status:		## Show container status
	docker-compose ps

clean:		## Clean up unused Docker resources
	docker system prune -f

# HELP
# -----------------------------------------------------------------------------
help:		## Show this help message
	@echo "Gonad on Monad - Available Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "🚀 For first-time deployment, run: make deploy"
	@echo "📚 For regular startup, run: make up"

.PHONY: build rebuild deploy up down restart db-init db-seed db-reset logs shell health status clean help

.DEFAULT_GOAL := help