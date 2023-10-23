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
ENV NODE_ENV production

# databse url needed for prisma
ARG DATABASE_URL
ENV DATABASE_URL="${DATABASE_URL}"

# initalize prisma
RUN npx prisma generate

# build nextjs
RUN npm run build
CMD npm start
