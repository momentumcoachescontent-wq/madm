#!/bin/bash
set -e

# Create the .wrangler directory if it doesn't exist
# This prevents Docker from creating it as root when mounting a volume
if [ ! -d ".wrangler" ]; then
    echo "Creating .wrangler directory..."
    mkdir -p .wrangler
else
    echo ".wrangler directory already exists."
fi

# If running as root (e.g. CI/CD), try to ensure ownership matches the container user (1000:1000)
# This helps avoid permission issues when the container runs as appuser (1000)
if [ "$(id -u)" -eq 0 ]; then
    echo "Running as root. Adjusting .wrangler ownership to 1000:1000..."
    chown -R 1000:1000 .wrangler || echo "Warning: Failed to chown .wrangler. Ensure permissions are correct."
fi

echo "Setup complete. You can now run 'docker-compose up'."
