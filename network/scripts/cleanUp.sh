#!/bin/bash

# Stop & remove all containers
docker ps -aq | xargs -r docker stop
docker ps -aq | xargs -r docker rm

# Remove Fabric-related images
docker images | grep hyperledger | awk '{print $3}' | xargs -r docker rmi -f

# Remove networks & volumes
docker network prune -f
docker volume prune -f
docker volume rm docker_pgdata docker_walletstore

# Remove Fabric-generated folders
rm -rf ../organizations ../artifacts

echo "Fabric network fully cleaned. Ready for fresh setup."
