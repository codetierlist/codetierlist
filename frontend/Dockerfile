FROM node:21-alpine
RUN npm install -g typescript

COPY ./config_limits.json ./config_limits.json

# npm install types
WORKDIR /types
COPY ./types/package.json ./types/package-lock.json ./
RUN npm ci
COPY ./types ./
RUN npm run prisma

WORKDIR /docs
COPY ./docs ./

WORKDIR /frontend
COPY ./frontend/package.json ./frontend/package-lock.json ./
RUN npm ci
COPY ./frontend ./

# Environment variables must be present at build time
# https://github.com/vercel/next.js/discussions/14030
ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_TELEMETRY_DISABLED 1

# build nextjs
RUN npm run build
CMD ["./node_modules/.bin/next", "start"]
