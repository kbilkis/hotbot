#!/bin/sh

# Exit on any error
set -e

# Load environment variables from .env file if it exists
if [ -f .env ]; then
    echo "📋 Loading environment variables from .env..."
    export $(grep -v '^#' .env | xargs)
fi

# Check if SENTRY_AUTH_TOKEN is set
if [ -z "$SENTRY_AUTH_TOKEN" ]; then
    echo "❌ Error: SENTRY_AUTH_TOKEN environment variable is not set"
    exit 1
fi

echo "🏗️  Building client (Vite)..."
vite build

echo "📤 Uploading client-side sourcemaps to Sentry..."
# Upload React sourcemaps to Sentry
if [ -n "$SENTRY_ORG" ] && [ -n "$SENTRY_PROJECT_REACT" ]; then
    npx @sentry/wizard@latest -i sourcemaps --saas --org "$SENTRY_ORG" --project "$SENTRY_PROJECT_REACT" --skip-connect || echo "⚠️  Sentry React sourcemap upload failed"
else
    echo "⚠️  Skipping React sourcemap upload - SENTRY_ORG and SENTRY_PROJECT_REACT not set"
fi

echo "🗑️  Cleaning up client-side sourcemaps from deployment..."
# Remove sourcemaps from deployment but keep the JS files
find dist -name '*.js.map' -type f -delete

echo "🔍 Setting up Wrangler sourcemap capture..."

# Create directory for captured sourcemaps
mkdir -p dist_wrangler_sourcemaps

# Start monitoring in background
{
    while true; do
        if [ -d ".wrangler/tmp" ]; then
            find .wrangler/tmp -name "*.js.map" -type f -newer dist_wrangler_sourcemaps 2>/dev/null | while read -r sourcemap; do
                if [ -f "$sourcemap" ]; then
                    echo "📋 Capturing Wrangler sourcemap: $(basename "$sourcemap")"
                    cp "$sourcemap" "dist_wrangler_sourcemaps/"
                    
                    # Also try to find the corresponding JS file
                    js_file="${sourcemap%.map}"
                    if [ -f "$js_file" ]; then
                        echo "📋 Capturing corresponding JS file: $(basename "$js_file")"
                        cp "$js_file" "dist_wrangler_sourcemaps/"
                    fi
                fi
            done
        fi
        sleep 0.2
    done
} &

MONITOR_PID=$!

# Function to cleanup and upload
cleanup_and_upload() {
    echo "🧹 Stopping monitor..."
    kill $MONITOR_PID 2>/dev/null || true
    sleep 1
    
    # Upload any captured server sourcemaps
    if [ -d "dist_wrangler_sourcemaps" ] && [ "$(ls -A dist_wrangler_sourcemaps 2>/dev/null)" ]; then
        echo "📤 Cloudflare Workers sourcemaps..."
        # Note: Wrangler automatically uploads sourcemaps (upload_source_maps: true in wrangler.jsonc)
        # Additional Sentry upload for Workers is optional
        if [ -n "$SENTRY_ORG" ] && [ -n "$SENTRY_PROJECT_WORKERS" ]; then
            echo "📤 Uploading Workers sourcemaps to Sentry (optional - Wrangler already uploads them)..."
            npx @sentry/wizard@latest -i sourcemaps --saas --org "$SENTRY_ORG" --project "$SENTRY_PROJECT_WORKERS" --skip-connect || echo "⚠️  Sentry Workers sourcemap upload failed"
        else
            echo "ℹ️  Skipping additional Sentry upload - Wrangler will handle sourcemaps automatically"
        fi
        echo "✅ Server sourcemaps processed"
        
        # Clean up captured files
        rm -rf dist_wrangler_sourcemaps
    else
        echo "⚠️  No server sourcemaps were captured"
    fi
}

# Set trap to cleanup on exit
trap cleanup_and_upload EXIT INT TERM

echo "🚀 Starting Wrangler deployment..."

# Run wrangler deploy with the environment argument if provided
if [ -n "$1" ]; then
    wrangler deploy --env="$1"
else
    wrangler deploy --env=""
fi

echo "✅ Deployment complete!"

# Trigger cleanup and upload
cleanup_and_upload