FROM node:lts
RUN npm install -g typescript

# npm install backend
# TODO: @ggggg why is this needed?
WORKDIR /backend
COPY ./backend/package.json ./
RUN npm install

# npm install types
WORKDIR /types
COPY ./types/package.json ./
RUN npm install

# copy backend prisma for types generation
WORKDIR /backend
COPY ./backend/prisma ./prisma

# build out types
WORKDIR /types
COPY ./types .
RUN npm run prisma

# npm install frontend
WORKDIR /frontend
COPY ./frontend/package.json ./
RUN yarn install --frozen-lockfile --production

# build frontend
WORKDIR /frontend
COPY ./frontend .
RUN yarn run build

# Environment variables must be present at build time
# https://github.com/vercel/next.js/discussions/14030
ARG ENV_VARIABLE
ENV ENV_VARIABLE=${ENV_VARIABLE}
ARG NEXT_PUBLIC_ENV_VARIABLE
ENV NEXT_PUBLIC_ENV_VARIABLE=${NEXT_PUBLIC_ENV_VARIABLE}
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# build nextjs
RUN yarn run build
CMD yarn run start
