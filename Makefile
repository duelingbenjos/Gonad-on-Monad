build:
	docker build -t gonad-app .

up:
	docker run -d \
	--name gonad-app \
	-p 3000:3000 \
	--env-file .env \
	-v $(pwd)/data:/app/data \
	gonad-app

logs:
	docker logs gonad-app

health:
	curl http://localhost:3000/api/health