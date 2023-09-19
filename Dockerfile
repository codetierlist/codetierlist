FROM node:lts

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY src ./src
COPY public ./public
COPY next.config.js .
COPY tsconfig.json .

# Environment variables must be present at build time
# https://github.com/vercel/next.js/discussions/14030
ARG ENV_VARIABLE
ENV ENV_VARIABLE=${ENV_VARIABLE}
ARG NEXT_PUBLIC_ENV_VARIABLE
ENV NEXT_PUBLIC_ENV_VARIABLE=${NEXT_PUBLIC_ENV_VARIABLE}

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

CMD ["npm", "run", "start"]