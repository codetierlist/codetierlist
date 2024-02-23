FROM node
RUN npm install -g typescript

# npm install types
WORKDIR /types
COPY ./types/package.json ./types/package-lock.json ./
RUN npm ci
COPY ./types ./
RUN ./node_modules/prisma/build/index.js generate

# npm install backend
WORKDIR /backend
COPY ./backend/package.json ./backend/package-lock.json ./
RUN npm ci
RUN cp -r ../types/prisma .
RUN  ./node_modules/prisma/build/index.js generate --schema ./prisma/schema.prisma

COPY ./backend_config.json ./backend_config.json
COPY ./backend ./
RUN npm run build

# run
CMD ["sh", "prod.sh"]
