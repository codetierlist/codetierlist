# build image
FROM node:lts

# copy package* files and install dependencies
COPY package.json package-lock.json ./
RUN yarn install --frozen-lockfile --production

# nextjs source tree
COPY . ./

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

# build nextjs
RUN yarn run build
CMD yarn start
