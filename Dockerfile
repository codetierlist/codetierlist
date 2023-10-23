# build image
FROM node:lts
WORKDIR /app

# copy package* files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# generated prima files
COPY prisma ./prisma/

# nextjs source tree
COPY src ./src

# tsconfig and next config
COPY next.config.js ./
COPY tsconfig.json ./

# Environment variables must be present at build time
# https://github.com/vercel/next.js/discussions/14030
ARG ENV_VARIABLE
ENV ENV_VARIABLE=${ENV_VARIABLE}
ARG NEXT_PUBLIC_ENV_VARIABLE
ENV NEXT_PUBLIC_ENV_VARIABLE=${NEXT_PUBLIC_ENV_VARIABLE}
ENV NEXT_TELEMETRY_DISABLED 1

# databse url needed for prisma
ARG DATABASE_HOST
ARG DATABASE_PWD
ENV DATABASE_URL="postgres://postgres:${DATABASE_PWD}@${DATABASE_HOST}:5432/postgres?schema=public"

# initalize prisma
RUN npx prisma generate

# build nextjs
RUN npm run build
CMD npm start
