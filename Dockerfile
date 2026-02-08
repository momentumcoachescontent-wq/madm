# Use Node.js 22 Alpine as the base image
FROM node:22-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package.json package-lock.json ./

# Install dependencies using npm ci for a clean install based on lockfile
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the application (runs build:css, vite build, and fix-routes.js)
RUN npm run build

# Expose the port that Wrangler will run on
EXPOSE 8787

# Start the application using Wrangler Pages Dev in local mode
# This mimics the Cloudflare Pages environment, providing D1 and R2 bindings via local simulation.
# To connect to remote production resources, add --remote (requires authentication).
CMD ["npx", "wrangler", "pages", "dev", "dist", "--ip", "0.0.0.0", "--port", "8787"]
