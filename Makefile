# install dependencies for Intellisense to work,
# not needed for running the app (project is dockerized)
init:
	cd ./types && npm ci
	cd ./types && npx prisma generate
	cd ./backend && npm ci
	cd ./backend && npx prisma generate --schema ../types/prisma/schema.prisma
	cd ./frontend && npm ci
	cd ./runner && npm ci

# remove output files
clean:
	cd ./frontend && rm -rf .next
	cd ./frontend && rm -rf node_modules
	cd ./backend && rm -rf out
	cd ./backend && rm -rf node_modules
	cd ./types && rm -rf node_modules
	cd ./runner && rm -rf node_modules

# prod docker
prod_up:
	docker compose  -f "docker-compose.yml" up -d --build

prod_down:
	docker compose  -f "docker-compose.yml" down

prod_restart: docker_down docker_up

# dev docker (includes hot reload for backend and frontend)
dev_up:
	docker compose -f "docker-compose-dev.yml" up -d --build

dev_down:
	docker compose -f "docker-compose-dev.yml" down

dev_restart: docker_dev_down docker_dev

# runner
runner_up:
	docker compose -f "docker-compose-runner.yml" up -d --build

runner_down:
	docker compose -f "docker-compose-runner.yml" down

runner_restart: runner_down runner_up
