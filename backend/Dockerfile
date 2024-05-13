FROM node:21-alpine
RUN npm install -g typescript

# npm install types
WORKDIR /types
COPY ./types/package.json ./types/package-lock.json ./
RUN npm ci
COPY ./types ./
RUN npm run prisma

# npm install backend
WORKDIR /backend
COPY ./backend/package.json ./backend/package-lock.json ./
RUN npm ci
RUN cp -r ../types/prisma .
RUN npm run prisma

COPY ./config_backend.json ./config_backend.json
COPY ./config_limits.json ./config_limits.json
COPY ./backend ./
RUN npm run build

# run
CMD ["sh", "prod.sh"]
