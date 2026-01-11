import * as grpc from '@grpc/grpc-js';
import { connect, signers, hash } from '@hyperledger/fabric-gateway';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { TextDecoder } from 'node:util';

const utf8Decoder = new TextDecoder();

export class FabricNetwork {
  #gateway;
  #network;
  #contract;
  #client;

  constructor(config) {
    this.config = config;
  }

  async init() {
    this.#client = await this.#newGrpcConnection();

    this.#gateway = connect({
      client: this.#client,
      identity: await this.#newIdentity(),
      signer: await this.#newSigner(),
      hash: hash.sha256,
      discovery: { enabled: true, asLocalhost: true }
    });

    this.#network = this.#gateway.getNetwork(this.config.channelName);
    this.#contract = this.#network.getContract(this.config.chaincodeName);
  }

  async #newGrpcConnection() {
    const tlsRootCert = await fs.readFile(this.config.tlsCertPath);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client(this.config.peerEndpoint, tlsCredentials, {
      'grpc.ssl_target_name_override': this.config.peerHostAlias,
    });
  }

  async #newIdentity() {
    const certPath = await this.#getFirstDirFileName(this.config.certDirectoryPath);
    const credentials = await fs.readFile(certPath);
    return { mspId: this.config.mspId, credentials };
  }

  async #newSigner() {
    const keyPath = await this.#getFirstDirFileName(this.config.keyDirectoryPath);
    const privateKeyPem = await fs.readFile(keyPath);
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    return signers.newPrivateKeySigner(privateKey);
  }

  async #getFirstDirFileName(dirPath) {
    const files = await fs.readdir(dirPath);
    const fileName = files.find(file => !file.startsWith('.'));
    if (!fileName) throw new Error(`No files in: ${dirPath}`);
    return path.join(dirPath, fileName);
  }

  async submit(functionName, ...args) {
    const resultBytes = await this.#contract.submitTransaction(functionName, ...args);
    return JSON.parse(utf8Decoder.decode(resultBytes));
  }

  async query(functionName, ...args) {
    const resultBytes = await this.#contract.evaluateTransaction(functionName, ...args);
    return JSON.parse(utf8Decoder.decode(resultBytes));
  }

  close() {
    this.#gateway?.close();
    this.#client?.close();
  }
}