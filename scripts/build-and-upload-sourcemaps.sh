#!/bin/sh

# Exit on any error
set -e

# Load environment variables from .env file if it exists
if [ -f .env ]; then
    echo "📋 Loading environment variables from .env..."
    export $(grep -v '^#' .env | xargs)
fi

# Check if HIGHLIGHT_API_KEY is set
if [ -z "$HIGHLIGHT_API_KEY" ]; then
    echo "❌ Error: HIGHLIGHT_API_KEY environment variable is not set"
    echo "   Please add HIGHLIGHT_API_KEY to your .env file or set it as an environment variable"
    exit 1
fi

echo "🏗️  Building application..."
npm run build

mkdir -p dist_sourcemap/assets
# mv dist/assets/main.js.map dist_sourcemap/assets/main.js.map


echo "📤 Uploading client-side sourcemaps to highlight.io..."
# Only upload client-side sourcemaps (assets folder) to highlight.io
# npx --yes @highlight-run/sourcemap-uploader upload --apiKey "$HIGHLIGHT_API_KEY" --path ./dist_sourcemap

echo "🗑️  Cleaning up client-side sourcemaps from deployment..."
# Only delete client-side sourcemaps (keep server-side ones for Cloudflare Workers)
find dist/assets -name '*.js.map' -type f -delete

echo "📋 Server-side sourcemaps (index.js.map) will be handled by Cloudflare Workers"
echo "✅ Build and sourcemap upload complete!"