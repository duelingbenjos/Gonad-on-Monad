build:
	docker-compose build gonad-app

up:
	docker-compose up -d gonad-app

down:
	docker-compose down

restart:
	docker-compose restart gonad-app

logs:
	docker-compose logs -f gonad-app

db-init:
	docker-compose exec gonad-app npx prisma db push

db-seed:
	docker-compose exec gonad-app npx prisma db seed

shell:
	docker-compose exec gonad-app /bin/sh

health:
	curl http://localhost:3000/api/health

status:
	docker-compose ps