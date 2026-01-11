#!/bin/bash

# 1. Path setup (Adjust these to your local paths)
export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=${PWD}/../config/ # Path containing core.yaml

# 2. Network Constants
CHANNEL_NAME="certificate-verification-channel"
CC_NAME="cert-chaincode"
CC_SRC_PATH="../../chaincode/certificate-verification" 
CC_VERSION="1"
CC_SEQUENCE="1"

# 3. TLS Certificate Paths (Relative to script location)
ORDERER_CA=${PWD}/../organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls/ca.crt
ISSUER_PEER_TLS_ROOTCERT=${PWD}/../organizations/peerOrganizations/issuer.example.com/peers/peer0.issuer.example.com/tls/ca.crt
VERIFIER_PEER_TLS_ROOTCERT=${PWD}/../organizations/peerOrganizations/verifier.example.com/peers/peer0.verifier.example.com/tls/ca.crt

# Environment for Issuer
setIssuer() {
  export CORE_PEER_TLS_ENABLED=true
  export CORE_PEER_LOCALMSPID="IssuerMSP"
  export CORE_PEER_TLS_ROOTCERT_FILE=$ISSUER_PEER_TLS_ROOTCERT
  export CORE_PEER_MSPCONFIGPATH=${PWD}/../organizations/peerOrganizations/issuer.example.com/users/Admin@issuer.example.com/msp
  export CORE_PEER_ADDRESS=localhost:7051
}

# Environment for Verifier
setVerifier() {
  export CORE_PEER_TLS_ENABLED=true
  export CORE_PEER_LOCALMSPID="VerifierMSP"
  export CORE_PEER_TLS_ROOTCERT_FILE=$VERIFIER_PEER_TLS_ROOTCERT
  export CORE_PEER_MSPCONFIGPATH=${PWD}/../organizations/peerOrganizations/verifier.example.com/users/Admin@verifier.example.com/msp
  export CORE_PEER_ADDRESS=localhost:9051
}

echo "--- Packaging chaincode ---"
peer lifecycle chaincode package ${CC_NAME}.tar.gz --path ${CC_SRC_PATH} --lang node --label ${CC_NAME}_${CC_VERSION}

echo "--- Installing on Peer0 Issuer ---"
setIssuer
peer lifecycle chaincode install ${CC_NAME}.tar.gz

echo "--- Installing on Peer0 Verifier ---"
setVerifier
peer lifecycle chaincode install ${CC_NAME}.tar.gz

# Extract Package ID
PACKAGE_ID=$(peer lifecycle chaincode queryinstalled | sed -n "/${CC_NAME}_${CC_VERSION}/{s/^Package ID: //; s/, Label:.*$//; p;}")
echo "Package ID: $PACKAGE_ID"

echo "--- Approving for Issuer ---"
setIssuer
peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "$ORDERER_CA" --channelID $CHANNEL_NAME --name $CC_NAME --version $CC_VERSION --package-id $PACKAGE_ID --sequence $CC_SEQUENCE --signature-policy "OR('IssuerMSP.peer','VerifierMSP.peer')"

echo "--- Approving for Verifier ---"
setVerifier
peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "$ORDERER_CA" --channelID $CHANNEL_NAME --name $CC_NAME --version $CC_VERSION --package-id $PACKAGE_ID --sequence $CC_SEQUENCE --signature-policy "OR('IssuerMSP.peer','VerifierMSP.peer')"

echo "--- Committing Chaincode ---"
# Commit requires endorsement from both orgs
peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "$ORDERER_CA" --channelID $CHANNEL_NAME --name $CC_NAME --version $CC_VERSION --sequence $CC_SEQUENCE --peerAddresses localhost:7051 --tlsRootCertFiles "$ISSUER_PEER_TLS_ROOTCERT" --peerAddresses localhost:9051 --tlsRootCertFiles "$VERIFIER_PEER_TLS_ROOTCERT" --signature-policy "OR('IssuerMSP.peer','VerifierMSP.peer')"