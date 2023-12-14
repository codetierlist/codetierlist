init: docker_init
	cd ./types && npm ci
	cd ./types && npx prisma generate
	cd ./backend && npm ci
	cd ./backend && npx prisma generate --schema ../types/prisma/schema.prisma
	cd ./frontend && npm ci

start_backend:
	cd ./backend && npm run build
	cd ./backend && npm run start

start_frontend_dev:
	cd ./frontend && npm run dev

clean:
	cd ./frontend && rm -rf .next
	cd ./backend && rm -rf out

docker_up_db:
	docker compose  -f "docker-compose.yml" up -d --build db

docker_up:
	docker compose  -f "docker-compose.yml" up -d --build

docker_down:
	docker compose  -f "docker-compose.yml" down

docker_restart: docker_down docker_up

docker_dev:
	docker compose -f "docker-compose-dev.yml" up -d --build

docker_dev_down:
	docker compose -f "docker-compose-dev.yml" down

docker_dev_restart: docker_dev_down docker_dev

docker_init:
	docker swarm init
	docker service create --name registry --publish published=5000,target=5000 registry:2