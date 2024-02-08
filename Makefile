init:
	cd ./types && npm ci
	cd ./types && npx prisma generate
	cd ./backend && npm ci
	cd ./backend && npx prisma generate --schema ../types/prisma/schema.prisma
	cd ./frontend && npm ci

# remove output files
clean:
	cd ./frontend && rm -rf .next
	cd ./frontend && rm -rf node_modules
	cd ./backend && rm -rf out
	cd ./backend && rm -rf node_modules

# prod docker
docker_up:
	docker compose  -f "docker-compose.yml" up -d --build

docker_down:
	docker compose  -f "docker-compose.yml" down

docker_restart: docker_down docker_up

# dev docker
docker_dev:
	docker compose -f "docker-compose-dev.yml" up -d --build

docker_dev_down:
	docker compose -f "docker-compose-dev.yml" down

docker_dev_restart: docker_dev_down docker_dev
