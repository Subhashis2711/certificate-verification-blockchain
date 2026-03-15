import { Contract } from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';

export class CertificateContract extends Contract {

  async InitLedger(ctx) {
    // optional bootstrap (can be empty)
    return;
  }

  _verifyMSP(ctx, allowedMSPs) {
    const mspId = ctx.clientIdentity.getMSPID();

    if (!allowedMSPs.includes(mspId)) {
      throw new Error(
        `Access denied for MSP ${mspId}. Allowed MSPs: ${allowedMSPs.join(', ')}`
      );
    }
  }


  // --------------------------------------------------
  // Utility
  // --------------------------------------------------
  async CertificateExists(ctx, certificateId) {
    const data = await ctx.stub.getState(certificateId);
    return data && data.length > 0;
  }

  // --------------------------------------------------
  // Issue Certificate (Issuer)
  // --------------------------------------------------
  async IssueCertificate(
    ctx,
    id,
    hash,
    certificateType,
    holderName,
    holderEmail,
    issuedBy,
    organizationId,
    organizationName,
    issuedDate,
    expiryDate
  ) {
    this._verifyMSP(ctx, ['IssuerMSP']);

    const exists = await this.CertificateExists(ctx, id);
    if (exists) {
      throw new Error(`Certificate: ${id} already exists`);
    }

    const certificate = {
      id,
      hash,
      holderName,
      holderEmail,
      issuedBy,
      organizationId,
      organizationName,
      issuedDate,
      expiryDate,
      status: 'ACTIVE',
      certificateType,
    };

    await ctx.stub.putState(
      id,
      Buffer.from(
        stringify(sortKeysRecursive(certificate))
      )
    );

    return JSON.stringify(certificate);
  }

  // --------------------------------------------------
  // Verify Certificate (Verifier)
  // --------------------------------------------------
  async VerifyCertificate(ctx, certificateId, certificateHash) {
    this._verifyMSP(ctx, ['IssuerMSP', 'VerifierMSP']);

    const exists = await this.CertificateExists(ctx, certificateId);
    if (!exists) {
      return JSON.stringify({
        valid: false,
        reason: 'Certificate not found'
      });
    }

    const certBytes = await ctx.stub.getState(certificateId);
    const cert = JSON.parse(certBytes.toString());

    if (cert.status !== 'ACTIVE') {
      return JSON.stringify({
        valid: false,
        reason: `Certificate is ${cert.status}`
      });
    }

    if (cert.expiryDate && new Date() > new Date(cert.expiryDate)) {
      return JSON.stringify({
        valid: false,
        reason: "Certificate has expired"
      });
    }

    if (cert.hash !== certificateHash) {
      return JSON.stringify({
        valid: false,
        reason: 'Hash mismatch'
      });
    }

    return JSON.stringify({
      valid: true,
      certificate: cert
    });
  }

  // --------------------------------------------------
  // Revoke Certificate (Issuer/Admin)
  // --------------------------------------------------
  async RevokeCertificate(ctx, certificateId, reason) {
    this._verifyMSP(ctx, ['IssuerMSP']);

    const exists = await this.CertificateExists(ctx, certificateId);
    if (!exists) {
      throw new Error(`Certificate ${certificateId} does not exist`);
    }

    const certBytes = await ctx.stub.getState(certificateId);
    const cert = JSON.parse(certBytes.toString());

    cert.status = 'REVOKED';
    cert.revocationReason = reason;
    cert.revokedAt = new Date().toISOString();

    await ctx.stub.putState(
      certificateId,
      Buffer.from(
        stringify(sortKeysRecursive(cert))
      )
    );

    return JSON.stringify(cert);
  }

  // --------------------------------------------------
  // Read Certificate
  // --------------------------------------------------
  async ReadCertificate(ctx, certificateId) {
    const certBytes = await ctx.stub.getState(certificateId);
    if (!certBytes || certBytes.length === 0) {
      throw new Error(`Certificate ${certificateId} does not exist`);
    }
    return certBytes.toString();
  }

  // --------------------------------------------------
  // Get All Certificates
  // --------------------------------------------------
  async GetCertificatesByOrganization(ctx, organizationId) {
    const results = [];
    const iterator = await ctx.stub.getStateByRange('', '');

    let result = await iterator.next();
    while (!result.done) {
      const value = result.value.value.toString('utf8');
      if (value) {
        const record = JSON.parse(value);
        if (record.organizationId === organizationId) {
          results.push(record);
        }
      }
      result = await iterator.next();
    }
    await iterator.close();

    return JSON.stringify(results);
  }
}
