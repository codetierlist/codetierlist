FROM node:lts
RUN npm install -g typescript

# npm install types
WORKDIR /types
COPY ./types/package.json ./types/package-lock.json ./
RUN npm ci
COPY ./types ./
RUN npm run prisma

WORKDIR /frontend
COPY ./frontend ./
RUN yarn install --frozen-lockfile

# Environment variables must be present at build time
# https://github.com/vercel/next.js/discussions/14030
ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}
ARG NEXT_PUBLIC_API_URI
ENV NEXT_PUBLIC_API_URI=${NEXT_PUBLIC_API_URI}
ENV NEXT_TELEMETRY_DISABLED 1

# build nextjs
RUN yarn run build
CMD ["yarn", "run", "start"]
