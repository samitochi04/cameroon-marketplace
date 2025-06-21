#!/bin/bash

echo "Testing local build..."

# Clean previous build
rm -rf dist

# Install dependencies
npm ci

# Build the project
npm run build

# Check if build was successful
if [ -d "dist" ] && [ "$(ls -A dist)" ]; then
    echo "✅ Build successful! dist folder contains:"
    ls -la dist/
else
    echo "❌ Build failed or dist folder is empty"
    exit 1
fi

echo "✅ Ready for deployment!"