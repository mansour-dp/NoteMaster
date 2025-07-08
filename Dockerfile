# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies
RUN npm install
RUN cd server && npm install

# Copy source code
COPY . .

# Build the React app
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Copy server package files
COPY server/package*.json ./server/

# Install only production dependencies for server
RUN cd server && npm install --only=production

# Copy built React app
COPY --from=builder /app/build ./build

# Copy server source
COPY server ./server

# Copy API routes
COPY api ./api

# Expose port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Start the server
CMD ["node", "server/server.js"]
