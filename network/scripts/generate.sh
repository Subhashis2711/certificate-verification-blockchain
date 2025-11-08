#!/bin/bash
set -e
export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=${PWD}/../config

echo "Generating crypto material..."
cryptogen generate --config=../config/crypto-config.yaml --output=../organizations

echo "Generating Genesis block..."
configtxgen -profile CertificateVerificationGenesis -outputBlock ../artifacts/genesis.block -channelID system-channel

echo "Generating channel creation transaction..."
configtxgen -profile CertificateVerificationChannel -outputCreateChannelTx ../artifacts/certificatechannel.tx -channelID certificatechannel

echo "--Artifacts generated successfully!--"
