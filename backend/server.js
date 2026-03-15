import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FabricNetwork } from './fabricNetwork.js';
import multer from "multer";
import { generateSHA256 } from "./utils.js";

const upload = multer({ storage: multer.memoryStorage() });

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function envOrDefault(key, defaultValue) {
  return process.env[key] || defaultValue;
}

const channelName = envOrDefault('CHANNEL_NAME', 'certificate-verification-channel');
const chaincodeName = envOrDefault('CHAINCODE_NAME', 'certificate-verification-chaincode');
const mspId = envOrDefault('MSP_ID', 'IssuerMSP');

// Path to crypto materials (pointing to the peer org folder)
const cryptoPath = envOrDefault(
  'CRYPTO_PATH',
  path.resolve(__dirname, '..', 'network', 'organizations', 'peerOrganizations', 'issuer.example.com')
);

const config = {
  mspId,
  channelName,
  chaincodeName,
  peerEndpoint: envOrDefault('PEER_ENDPOINT', 'localhost:7051'),
  peerHostAlias: envOrDefault('PEER_HOST_ALIAS', 'peer0.issuer.example.com'),
  keyDirectoryPath: envOrDefault(
    'KEY_DIRECTORY_PATH',
    path.resolve(cryptoPath, 'users', 'Admin@issuer.example.com', 'msp', 'keystore')
  ),
  certDirectoryPath: envOrDefault(
    'CERT_DIRECTORY_PATH',
    path.resolve(cryptoPath, 'users', 'Admin@issuer.example.com', 'msp', 'signcerts')
  ),
  tlsCertPath: envOrDefault(
    'TLS_CERT_PATH',
    path.resolve(cryptoPath, 'peers', 'peer0.issuer.example.com', 'tls', 'ca.crt')
  )
};

const network = new FabricNetwork(config);

// --- API Routes ---
app.get('/api/certificates', async (req, res) => {
  try {
    const { organizationId } = req.query;
    const data = await network.query('GetCertificatesByOrganization', organizationId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/issue', upload.single('file'), async (req, res) => {
  try {
    const fileBuffer = req.file.buffer;
    const hash = generateSHA256(fileBuffer);
    const { id, certificateType, holderName, holderEmail, issuedBy, organizationId, organizationName, issuedDate } = req.body;
    const result = await network.submit('IssueCertificate', id, hash, certificateType, holderName, holderEmail, issuedBy, organizationId, organizationName, issuedDate);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/verify', upload.single('file'), async (req, res) => {
  try {
    const resolveHash = () => {
      if (req.file) return generateSHA256(req.file.buffer);
      return req.body.hash
    }
    const hash = resolveHash();
    if (!hash) return res.status(400).json({ error: 'Unable to generate hash from file or body' });
    if (!req.body.id) return res.status(400).json({ error: 'certificate ID is missing' });
    const result = await network.query('VerifyCertificate', req.body.id, hash);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/revoke', async (req, res) => {
  try {
    const { id, reason } = req.body;
    if (!id) return res.status(400).json({ error: "CertificateId is missing" });
    const result = await network.submit("RevokeCertificate", id, reason || "Revoked by issuer");
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = envOrDefault('PORT', '4000');
app.listen(PORT, async () => {
  try {
    await network.init();
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  } catch (error) {
    process.exit(1);
  }
});