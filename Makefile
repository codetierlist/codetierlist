docker_file = docker-compose.yml

init:
	docker compose -f ${docker_file} up -d --build --remove-orphans
	docker compose -f ${docker_file} exec next bash -c "cd app;npx prisma migrate deploy"
