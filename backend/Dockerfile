FROM node:lts
RUN npm install -g typescript

# npm install backend
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

# build backend
WORKDIR /backend
COPY ./backend .
RUN npm run build

# run
CMD ["bash", "prod.sh"]