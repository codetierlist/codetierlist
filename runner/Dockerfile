FROM docker:dind
RUN apk add --no-cache nodejs npm
RUN npm install -g typescript

# npm install types
WORKDIR /types
COPY ./types/package.json ./types/package-lock.json ./
RUN npm ci
COPY ./types ./

RUN npm run prisma

# npm install backend
WORKDIR /runner
COPY ./runner/package.json ./runner/package-lock.json ./
RUN npm ci

COPY ./config_backend.json ./config_backend.json
COPY ./config_limits.json ./config_limits.json
COPY ./runner ./
RUN npm run build

# run
CMD ["sh", "prod.sh"]
