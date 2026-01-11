#!/bin/bash

set -e

echo "Stopping Fabric network..."
docker-compose -f ../docker/docker-compose-net.yaml down --volumes --remove-orphans
docker volume prune -f

echo "Network stopped!"
