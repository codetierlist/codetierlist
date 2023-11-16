DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres?schema=public

init:
	cd ./types && npm ci
	cd ./types && npx prisma generate
	cd ./backend && npm ci
	cd ./backend && npx prisma generate --schema ../types/prisma/schema.prisma
	cd ./frontend && yarn install --frozen-lockfile

start_backend:
	cd ./backend && npm run build
	cd ./backend && npm run start

start_frontend_dev:
	cd ./frontend && yarn dev
