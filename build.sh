#!/bin/bash
# Build script for production deployment

echo "Starting production build..."

# Install dependencies
npm ci --only=production

# Build the application
npm run build

echo "Build completed successfully!"