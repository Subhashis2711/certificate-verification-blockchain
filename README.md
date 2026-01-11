# Certificate Verification Blockchain (Hyperledger Fabric)

This project implements a **certificate verification system** using **Hyperledger Fabric**. It provides a decentralized ledger for issuing and authenticating digital certificates.

## Prerequisites

Before starting, ensure you have the following installed:

* **Docker & Docker Desktop**: Ensure the Docker daemon is running.
* **Git**: For version control.
* **Node.js**: (v16.x or v18.x recommended) for chaincode and application development.
* **VS Code**: Recommended IDE for development.
* **Bash Shell**: Required for running the automation scripts.

## Project Structure
## Project Structure

~~~text
cert-verification-blockchain/
├── backend/
│   ├── node_modules/             # Backend dependencies
│   ├── fabricNetwork.js          # Fabric Gateway logic
│   ├── server.js                 # Express API entry point
│   └── package.json              # Backend configuration
│
├── chaincode/
│   └── certificate-verification/
│       ├── node_modules/         # Chaincode dependencies
│       ├── index.js              # Smart contract entry point
│       ├── lib/                  # Contract logic (Issue/Verify)
│       └── package.json          # Chaincode configuration
│
├── network/
│   ├── bin/                      # Fabric binaries (peer, orderer, configtxgen)
│   ├── config/                   # core.yaml, configtx.yaml, orderer.yaml
│   ├── docker/                   # Docker Compose files for network nodes
│   ├── artifacts/                # Genesis block and channel transactions
│   ├── organizations/            # Generated Crypto Material (MSP & TLS)
│   │   ├── peerOrganizations/
│   │   └── ordererOrganizations/
│   ├── scripts/                  # Automation Bash scripts
│   │   ├── generate.sh
│   │   ├── networkUp.sh
│   │   ├── createChannel.sh
│   │   ├── deployCC.sh           # Chaincode deployment script
│   │   ├── networkDown.sh
│   │   └── runExplorer.sh
│   └── explorer/                 # Hyperledger Explorer configuration
│       ├── config.json
│       ├── connection-profile/
│       └── docker-compose.yaml
│
├── .gitignore                    # Ignored files (node_modules, bin, orgs)
└── README.md                     # Project documentation
~~~

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd cert-verification-blockchain
```

### 2. Open in VSCode
```bash
code .
```
> Open the integrated terminal in your editor (Ctrl + `) to run the following commands.

### 3. Install Hyperledger Fabric Binaries
Run the official script to download the platform-specific Fabric binaries and Docker images:

```bash
curl -sSL [https://bit.ly/2ysbOFE](https://bit.ly/2ysbOFE) | bash -s
```

### 4. Configure Network Binaries
Move the downloaded `bin` folder into the `network` directory. This ensures the local shell scripts can locate the Fabric tools:

```bash
cp -r fabric-samples/bin network/bin
```

## Running the Network
Navigate to the scripts directory to manage the network:

### Step 0: Cleanup old network configs
```bash
cd network/script
chmod +x cleanUp.sh
./config.sh
```

### Step 1: Generate Crypto Artifacts
Generate the MSP/TLS certificates and genesis block:

```bash
chmod +x generate.sh
./generate.sh
```

### Step 2: Launch the Network
Start the Orderer and Peer nodes:

```bash
chmod +x networkUp.sh
./networkUp.sh
```

### Step 3: Create Channel
Create the channel and join the Issuer and Verifier peers to it:

```bash
chmod +x createChannel.sh
./createChannel.sh
```

### Step 4: Hyperledger Explorer
Start the visualization dashboard:

```bash
chmod +x runExplorer.sh
./runExplorer.sh
```

> Access the UI at: http://localhost:8080

## Common Commands
Stop Network: `cd network/scripts && ./networkDown.sh`

View Logs: `docker logs -f peer0.issuer.example.com`

Verify Containers: `docker ps`

## Chaincode Deployment

### 1. Install Chaincode Dependencies
Before deploying, install the Node.js dependencies for the smart contract:

```bash
cd chaincode/certificate-verification
npm install
```

### 2. Deploy to Channel
```bash
cd network/scripts
chmod +x deployCC.sh
./deployCC.sh
```
This script packages, installs, approves (for both Issuer and Verifier), and commits the chaincode to the channel.

## Backend setup (API)
The backend uses the Fabric Gateway SDK to interact with the network.

### 1. Install Dependencies
```bash
cd ../../backend
npm install
```

### 2. Start the server
```bash
npm run dev
```

### API Reference
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/certificates` | Retrieve all issued certificates |
| **POST** | `/api/issue` | Issue a new certificate (requires id, hash, student, etc.) |
| **POST** | `/api/verify` | Verify a certificate hash against the ledger |

### Testing backend API

1. Issue a certificate
```bash
curl -X POST http://localhost:4000/api/issue \ 
     -H "Content-Type: application/json" \
     -d '{
       "id": "CERT_999",
       "hash": "d7a8fbb307d7809469ca9abcb0082e4f",
       "student": "Alice Smith",
       "course": "Hyperledger Fabric Developer",
       "issuer": "Blockchain Institute",
       "date": "2026-01-11"
     }'
```

2. Verify the certifcate
```bash
curl -X POST http://localhost:4000/api/verify \
     -H "Content-Type: application/json" \
     -d '{
       "id": "CERT_999",
       "hash": "d7a8fbb307d7809469ca9abcb0082e4f" 
     }'  
```