FROM node:22-alpine
RUN apk add --no-cache openssl
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" npx prisma generate && npm run build

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db execute --file prisma/seed.sql --schema prisma/schema.prisma && node dist/main"]