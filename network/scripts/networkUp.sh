#!/bin/bash
set -e

# Path to Fabric binaries
FABRIC_BIN="../bin"

# Create Docker network if it doesn't exist
docker network inspect certificate-verification-network >/dev/null 2>&1 || \
docker network create certificate-verification-network

echo "Starting Fabric network..."
docker-compose -f ../docker/docker-compose-net.yaml up -d

echo "Network started on 'certificate-verification-network'!"
