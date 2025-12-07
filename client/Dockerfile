# 1) Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# 2) Run stage
FROM node:20-alpine

WORKDIR /app

# Copy built app + node_modules
COPY --from=build /app ./

# Next.js listens on 3000 by default, but Cloud Run uses $PORT
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

EXPOSE 8080

# Make sure your package.json has:
# "scripts": { "start": "next start -p 8080", ... }
CMD ["npm", "start"]
