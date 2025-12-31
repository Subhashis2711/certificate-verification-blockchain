export CORE_PEER_TLS_ENABLED=true
export ORDERER_CA=../organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
export PEER0_ISSUER_CA=../organizations/peerOrganizations/issuer.example.com/peers/peer0.issuer.example.com/tls/ca.crt
export PEER0_VERIFIER_CA=../organizations/peerOrganizations/verifier.example.com/peers/peer0.verifier.example.com/tls/ca.crt
export FABRIC_CFG_PATH=../config/

export CHANNEL_NAME=certificatechannel

setGlobalsForOrderer(){
    export CORE_PEER_LOCALMSPID="OrdererMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=../organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
    export CORE_PEER_MSPCONFIGPATH=../organizations/ordererOrganizations/example.com/users/Admin@example.com/msp
}

setGlobalsForPeer0Issuer(){
    export CORE_PEER_LOCALMSPID="IssuerMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ISSUER_CA
    export CORE_PEER_MSPCONFIGPATH=../organizations/peerOrganizations/issuer.example.com/users/Admin@issuer.example.com/msp
    export CORE_PEER_ADDRESS=localhost:7051
}

setGlobalsForPeer0Verifier(){
    export CORE_PEER_LOCALMSPID="VerifierMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_VERIFIER_CA
    export CORE_PEER_MSPCONFIGPATH=../organizations/peerOrganizations/verifier.example.com/users/Admin@verifier.example.com/msp
    export CORE_PEER_ADDRESS=localhost:9051
}

createChannel(){
    setGlobalsForPeer0Issuer
    
    ../bin/peer channel create -o localhost:7050 -c $CHANNEL_NAME \
    --ordererTLSHostnameOverride orderer.example.com \
    -f ../artifacts/${CHANNEL_NAME}.tx --outputBlock ../artifacts/${CHANNEL_NAME}.block \
    --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA

		echo "Channel $CHANNEL_NAME created successfully"
}

joinChannel(){
    setGlobalsForPeer0Issuer
    ../bin/peer channel join -b ../artifacts/$CHANNEL_NAME.block
    
    setGlobalsForPeer0Verifier
    ../bin/peer channel join -b ../artifacts/$CHANNEL_NAME.block    
}

createChannel
joinChannel