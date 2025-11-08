#!/bin/bash
#
# SPDX-License-Identifier: Apache-2.0
#
# Script to start Hyperledger Explorer for Certificate Verification Network

set -e

EXPLORER_COMPOSE_FILE="../docker/docker-compose-explorer.yaml"

echo "============================================================"
echo "🚀 Starting Hyperledger Explorer..."
echo "============================================================"

# Ensure the main Fabric network is running
if ! docker network inspect certificate-verification-network >/dev/null 2>&1; then
  echo "❌ Fabric network not found! Please start it first using:"
  echo "   ./networkUp.sh"
  exit 1
fi

# Bring up Explorer and its DB
docker-compose -f $EXPLORER_COMPOSE_FILE up -d

echo "============================================================"
echo "✅ Explorer is starting..."
echo "🌐 Access it at: http://localhost:8080"
echo "============================================================"

# Wait for container health
echo "⏳ Waiting for Explorer DB to be healthy..."
sleep 10

# Show container status
docker ps --filter "name=explorer"

echo "============================================================"
echo "🧭 Logs (follow with): docker logs -f explorer"
echo "============================================================"
