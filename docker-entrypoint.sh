#!/bin/sh
set -e

# Fix permissions for runtime-writable directories
# Iterating over a specific list avoids expensive recursive chown on /app
for dir in .wrangler node_modules/.cache tmp logs uploads caches; do
    if [ -d "/app/$dir" ] && [ ! -L "/app/$dir" ]; then
        chown -R appuser:appuser "/app/$dir"
    fi
done

# Drop privileges to appuser and run the command
exec su-exec appuser "$@"
