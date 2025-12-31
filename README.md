# Certificate Verification Blockchain (Hyperledger Fabric)

This project implements a **certificate verification system** using **Hyperledger Fabric** with:
- 1 Orderer
- 2 Peer Organizations (Issuer & Verifier)
- CouchDB state database
- Hyperledger Explorer for visualization

---

## Prerequisites

Make sure you have the following installed:

- Docker & Docker Compose (v2+)
- Git
- Bash shell (macOS / Linux)
- Hyperledger Fabric binaries (already present in `network/bin`)

---

## Folder Structure (Important)

```
cert-verification-blockchain/
├── network/
│   ├── bin/                  # Fabric binaries (NOT ignored)
│   ├── config/               # configtx.yaml, core.yaml, crypto-config.yaml
│   ├── docker/               # docker-compose files
│   ├── scripts/              # generate.sh, networkUp.sh, channel scripts
│   ├── organizations/        # Crypto material (generated)
│   ├── artifacts/            # Genesis & channel artifacts
│
├── explorer/
│   ├── config.json
│   ├── connection-profile/
│
├── docker/
│   ├── docker-compose-net.yaml
│   ├── docker-compose-explorer.yaml
│
└── README.md
```

---

## Step 1: Generate Crypto & Artifacts

Run from `network/scripts`:

```bash
chmod +x generate.sh
./generate.sh
```

This generates:
- MSP & TLS certificates
- Genesis block
- Channel transaction

---

## Step 2: Start the Fabric Network

```bash
chmod +x networkUp.sh
./networkUp.sh
```

This starts:
- Orderer
- Issuer Peer + CouchDB
- Verifier Peer + CouchDB

Verify:
```bash
docker ps
```

---

## Step 3: Create & Join Channel

```bash
chmod +x createChannel.sh
./createChannel.sh
```

Verify channel join:
```bash
docker exec -it peer0.issuer.example.com peer channel list
```

---

## Step 4: Start Hyperledger Explorer

```bash
chmod +x runExplorer.sh
./runExplorer.sh
```

Access Explorer:
```
http://localhost:8080
```

> It is **OK** if Explorer shows only **IssuerMSP** as the client org.
> VerifierMSP still participates at the network level.

---

## Step 5: Verify Network Health

- Explorer UI loads
- Channel visible
- Blocks increment after transactions
- No peer/orderer crash loops

---

## Next Planned Steps (Project Roadmap)

1. **Write Chaincode**
   - Certificate issue
   - Certificate verify
   - Certificate revoke

2. **Package & Deploy Chaincode**
   - Approve for Issuer & Verifier
   - Commit to channel

3. **Invoke Transactions**
   - Issue certificate
   - Verify certificate hash

4. **Integrate Backend**
   - Node.js / Java service
   - Fabric Gateway SDK

5. **Frontend (Optional)**
   - React dashboard
   - Certificate verification UI

---

## Common Commands

Stop network:
```bash
./networkDown.sh
```

View logs:
```bash
docker logs peer0.issuer.example.com
docker logs orderer.example.com
docker logs explorer
```

---

## Notes

- `network/bin` must always be committed
- `organizations/` should be gitignored after initial testing
- Explorer access issues usually mean:
  - Channel not created
  - Peer not joined
  - Wrong admin identity paths

---

## Status

✅ Network running  
✅ Channel created  
✅ Explorer connected  
🚧 Chaincode pending  

---

Happy building 🚀
