#!/bin/bash

# Script to deploy CORS fix to production server
# This script will:
# 1. Copy the updated nginx configuration to the server
# 2. Copy the updated server code to the server
# 3. Restart nginx and the Node.js application

echo "Starting CORS fix deployment..."

# Replace these with your actual server details
SERVER_USER="your_username"
SERVER_IP="your_server_ip"
SERVER_PATH="/path/to/your/dvb/project"

# Copy updated nginx configuration
echo "Copying updated nginx configuration..."
scp server/nginx-updated.conf ${SERVER_USER}@${SERVER_IP}:/etc/nginx/sites-available/api.dvberry.ru

# Copy updated server code
echo "Copying updated server code..."
scp -r server/src ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/server/

# Restart nginx
echo "Restarting nginx..."
ssh ${SERVER_USER}@${SERVER_IP} "sudo systemctl restart nginx"

# Restart the Node.js application (adjust according to your process manager)
echo "Restarting Node.js application..."
ssh ${SERVER_USER}@${SERVER_IP} "cd ${SERVER_PATH}/server && pm2 restart dvb-api || npm start"

echo "CORS fix deployment completed!"