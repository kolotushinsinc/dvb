#!/bin/bash

# Script to clear Next.js cache and restart the development server
# This can help resolve webpack cache corruption issues

echo "🧹 Cleaning Next.js cache..."
rm -rf .next

echo "✅ Cache cleared successfully!"
echo "🚀 Starting development server..."
npm run dev
