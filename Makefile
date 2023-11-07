init:
	cd ./types && npm install
	cd ./types && npx prisma generate
	cd ./backend && npm install
	cd .backend && npx prisma generate --schema ../types/prisma/schema.prisma
	cd ./frontend && npm install