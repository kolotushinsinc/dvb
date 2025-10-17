#!/bin/bash

# Script to deploy CORS fix to production server
# This script will:
# 1. Copy the updated nginx configuration to the server
# 2. Copy the updated server code to the server
# 3. Restart nginx and the Node.js application

echo "Starting CORS fix deployment..."

# Server details
SERVER_USER="root"
SERVER_IP="194.67.88.43"
SERVER_PATH="/var/www/html/dvb"

# Copy updated nginx configuration
echo "Copying updated nginx configuration..."
scp server/nginx-updated.conf ${SERVER_USER}@${SERVER_IP}:/etc/nginx/sites-available/api.dvberry.ru

# Copy updated server code
echo "Copying updated server code..."
scp -r server/src ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/server/

# Restart nginx
echo "Restarting nginx..."
ssh ${SERVER_USER}@${SERVER_IP} "systemctl restart nginx"

# Restart the Node.js application
echo "Restarting Node.js application..."
ssh ${SERVER_USER}@${SERVER_IP} "cd ${SERVER_PATH}/server && pm2 restart all || pm2 start index.ts --name dvb-api"

echo "CORS fix deployment completed!"