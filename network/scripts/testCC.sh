#!/bin/bash

# --- 1. SET PATHS ---
# Adjust these paths to point to your 'bin' and 'config' directories
export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=${PWD}/../config/

# Check if peer binary is actually found
if ! command -v peer &> /dev/null
then
    echo "Error: 'peer' command not found. Please check your PATH."
    echo "Current PATH: $PATH"
    exit 1
fi

# --- 2. CONFIGURATION ---
CHANNEL_NAME="certificate-verification-channel"
CC_NAME="certificate-verification-chaincode"

ORDERER_CA=${PWD}/../organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls/ca.crt
ISSUER_TLS_ROOT=${PWD}/../organizations/peerOrganizations/issuer.example.com/peers/peer0.issuer.example.com/tls/ca.crt
VERIFIER_TLS_ROOT=${PWD}/../organizations/peerOrganizations/verifier.example.com/peers/peer0.verifier.example.com/tls/ca.crt

# --- 3. IDENTITY HELPERS ---
setIssuer() {
    export CORE_PEER_TLS_ENABLED=true
    export CORE_PEER_LOCALMSPID="IssuerMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$ISSUER_TLS_ROOT
    export CORE_PEER_MSPCONFIGPATH=${PWD}/../organizations/peerOrganizations/issuer.example.com/users/Admin@issuer.example.com/msp
    export CORE_PEER_ADDRESS=localhost:7051
    echo "--- Identity Switched to: IssuerMSP ---"
}

setVerifier() {
    export CORE_PEER_TLS_ENABLED=true
    export CORE_PEER_LOCALMSPID="VerifierMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$VERIFIER_TLS_ROOT
    export CORE_PEER_MSPCONFIGPATH=${PWD}/../organizations/peerOrganizations/verifier.example.com/users/Admin@verifier.example.com/msp
    export CORE_PEER_ADDRESS=localhost:9051
    echo "--- Identity Switched to: VerifierMSP ---"
}

# --- 4. START TESTING ---

echo "Starting Test Suite..."

setIssuer
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
    --tls --cafile "$ORDERER_CA" -C $CHANNEL_NAME -n $CC_NAME \
    --peerAddresses localhost:7051 --tlsRootCertFiles "$ISSUER_TLS_ROOT" \
    --peerAddresses localhost:9051 --tlsRootCertFiles "$VERIFIER_TLS_ROOT" \
    -c '{"function":"IssueCertificate","Args":["CERT_001", "hash123", "John Doe", "Blockchain", "Issuer Org", "2026-01-02"]}'

# Give the ledger a moment to commit the block
sleep 10

setVerifier
echo "Querying as Verifier..."
peer chaincode query -C $CHANNEL_NAME -n $CC_NAME -c '{"function":"ReadCertificate","Args":["CERT_001"]}'

echo "Test Complete."