FROM docker:dind
RUN apk add --no-cache nodejs npm
RUN npm install -g typescript

# npm install types
WORKDIR /types
COPY ./types/package.json ./types/package-lock.json ./
RUN npm ci
COPY ./types ./

SHELL ["/usr/bin/env", "node"]
RUN ./node_modules/prisma/build/index.js generate
SHELL ["/bin/sh", "-c"]

# npm install backend
WORKDIR /runner
COPY ./runner/package.json ./runner/package-lock.json ./
RUN npm ci

COPY ./backend_config.json ./backend_config.json
COPY ./runner ./
RUN npm run build

# run
CMD ["sh", "prod.sh"]
