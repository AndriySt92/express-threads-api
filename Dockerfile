# Використовуємо образ дистрибутив лінукс Alpine з версією Node -14 Node.js
#  Node -14 Node.js
FROM node:19.5.0-alpine

# Indicate work directory
WORKDIR /app

# Copy package.json и package-lock.json in container /app
COPY package*.json ./

# Install dependents
RUN npm install

# Copy rest app in container /app
COPY . .

# Install Prisma
RUN npm install -g prisma

# Generate Prisma client
RUN prisma generate

# Copy Prisma schema and URL database in container /app
COPY prisma/schema.prisma ./prisma/

# Open port 3000 in our container
EXPOSE 3000

# Starting server
CMD [ "npm", "start" ]