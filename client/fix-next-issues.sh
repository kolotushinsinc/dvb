#!/bin/bash

# Script to fix common Next.js issues including webpack cache corruption
# Usage: ./fix-next-issues.sh [dev|build]

# Set text colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Next.js Issue Fixer ===${NC}"
echo -e "${YELLOW}This script will help resolve common Next.js issues${NC}"

# Step 1: Clear Next.js cache
echo -e "\n${BLUE}Step 1: Clearing Next.js cache...${NC}"
if [ -d ".next" ]; then
  rm -rf .next
  echo -e "${GREEN}✅ Cache cleared successfully!${NC}"
else
  echo -e "${YELLOW}⚠️ No .next directory found. Cache was already cleared.${NC}"
fi

# Step 2: Check for node_modules issues
echo -e "\n${BLUE}Step 2: Checking node_modules...${NC}"
if [ -d "node_modules" ]; then
  echo -e "${YELLOW}Would you like to reinstall node_modules? This can fix dependency issues. (y/n)${NC}"
  read -r answer
  if [[ "$answer" =~ ^[Yy]$ ]]; then
    echo "Removing node_modules..."
    rm -rf node_modules
    echo "Installing dependencies..."
    npm install
    echo -e "${GREEN}✅ Dependencies reinstalled!${NC}"
  else
    echo "Skipping node_modules reinstallation."
  fi
else
  echo "Installing dependencies..."
  npm install
  echo -e "${GREEN}✅ Dependencies installed!${NC}"
fi

# Step 3: Update browserslist database
echo -e "\n${BLUE}Step 3: Updating browserslist database...${NC}"
npx update-browserslist-db@latest
echo -e "${GREEN}✅ Browserslist database updated!${NC}"

# Step 4: Fix potential file permission issues
echo -e "\n${BLUE}Step 4: Fixing potential file permission issues...${NC}"
find . -type d -name ".next" -exec chmod -R 755 {} \; 2>/dev/null || true
find . -type d -name "node_modules" -exec chmod -R 755 {} \; 2>/dev/null || true
echo -e "${GREEN}✅ File permissions fixed!${NC}"

# Step 5: Start development server or build for production
echo -e "\n${BLUE}Step 5: Starting Next.js...${NC}"
if [ "$1" == "build" ]; then
  echo "Building for production..."
  npm run build
  echo -e "${GREEN}✅ Build completed!${NC}"
else
  echo "Starting development server..."
  npm run dev
fi

echo -e "\n${GREEN}All steps completed! Next.js should now work properly.${NC}"
echo -e "${YELLOW}If you still encounter issues, please check the Next.js documentation or report the issue.${NC}"
