# Use Node.js 22 Alpine as the base image
FROM node:25-alpine

# Install su-exec for user switching
RUN apk add --no-cache su-exec

# Create appuser and group with UID/GID 1000
RUN addgroup -g 1000 appuser && \
    adduser -u 1000 -G appuser -s /bin/sh -D appuser

# Set working directory inside the container
WORKDIR /app
RUN chown appuser:appuser /app

# Switch to appuser for build process
USER appuser

# Copy package files first to leverage Docker layer caching
COPY --chown=appuser:appuser package.json package-lock.json ./

# Install dependencies using npm ci for a clean install based on lockfile
RUN npm ci

# Copy the rest of the application source code
COPY --chown=appuser:appuser . .

# Build the application (runs build:css, vite build, and fix-routes.js)
RUN npm run build

# Switch back to root to setup entrypoint
USER root

# Copy entrypoint script and make it executable
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose the port that Wrangler will run on
EXPOSE 8787

# Use the entrypoint script to fix permissions and switch user
ENTRYPOINT ["docker-entrypoint.sh"]

# Start the application using Wrangler Pages Dev in local mode
# This mimics the Cloudflare Pages environment, providing D1 and R2 bindings via local simulation.
# To connect to remote production resources, add --remote (requires authentication).
CMD ["npx", "wrangler", "pages", "dev", "dist", "--ip", "0.0.0.0", "--port", "8787"]
