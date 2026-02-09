#!/bin/bash

echo "Stopping staging containers..."
docker compose -f docker-compose.staging.yml down

echo "Building frontend staging image..."
docker build -f ../../src/frontend/Dockerfile.staging -t tradeplay-frontend:staging ../../src/frontend
echo "Building backend staging image..."
docker build -f ../../src/backend/Dockerfile.staging -t tradeplay-backend:staging ../../src/backend

echo "Starting staging stack..."
docker compose -f docker-compose.staging.yml up -d --remove-orphans