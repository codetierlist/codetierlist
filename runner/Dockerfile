FROM docker:dind
RUN apk add --no-cache bash nodejs npm
RUN npm install -g typescript

# npm install types
WORKDIR /types
COPY ./types/package.json ./types/package-lock.json ./
RUN npm ci
COPY ./types ./

SHELL ["/bin/bash", "-c"]
RUN npm run prisma

# npm install backend
WORKDIR /runner
COPY ./runner/package.json ./runner/package-lock.json ./
RUN npm ci

COPY ./backend_config.json ./backend_config.json
COPY ./runner ./
RUN npm run build

# run
CMD ["bash", "prod.sh"]
