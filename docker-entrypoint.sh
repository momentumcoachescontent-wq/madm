#!/bin/sh
set -e

# Fix permissions for .wrangler mount if it exists
if [ -d "/app/.wrangler" ]; then
    chown -R appuser:appuser /app/.wrangler
fi

# Fix permissions for the application directory
# Using -R might be slow on large directories, but necessary for write access
chown -R appuser:appuser /app

# Drop privileges to appuser and run the command
exec su-exec appuser "$@"
