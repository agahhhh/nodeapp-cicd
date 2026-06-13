# Stage 1: builder — install ALL deps, run tests
FROM node:20-alpine AS builder
 
WORKDIR /app
 
# Copy package files first (layer cache: only re-runs npm ci if package*.json changed)
COPY package*.json ./
RUN npm ci
 
# Copy source and run tests inside the build step
COPY . .
RUN npm run lint
RUN npm run test:ci
 
# Stage 2: production image — only runtime files
FROM node:20-alpine AS production
 
WORKDIR /app
 
# Add non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
 
# Copy package files and install PRODUCTION dependencies only
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
 
# Copy application source from builder stage
COPY --from=builder /app/src ./src
 
# Switch to non-root user
USER appuser
 
# Expose the application port
EXPOSE 3000
 
# Health check — Docker will restart the container if this fails
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1
 
CMD ["node", "src/server.js"]
