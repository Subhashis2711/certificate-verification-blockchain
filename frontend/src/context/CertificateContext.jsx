import { createContext, useContext, useState, useCallback } from 'react';
import { getCertificatesApi, issueCertificateApi, verifyCertificateApi, revokeCertificateApi } from '../services/api';

const CertificateContext = createContext(undefined);

export function CertificateProvider({ children }) {
  const [certificates, setCertificates] = useState([]);

  const getOrganizationCertificates = useCallback(async (organizationId) => {
    const allCertificates = await getCertificatesApi(organizationId);
    setCertificates(allCertificates);
    return allCertificates;
  }, []);

  const issueCertificate = useCallback(async (certificatePayload) => {
    const response = await issueCertificateApi(certificatePayload);
    const newCertificate = response.data;
    setCertificates(prev => [...prev, newCertificate]);
    return newCertificate;
  }, [certificates]);

  const verifyCertificate = useCallback(async (certificatePayload) => {
    try {
      const response = await verifyCertificateApi(certificatePayload);
      const result = response.data;

      return {
        isValid: result.valid,
        certificate: result.certificate || null,
        message: result.valid
          ? "Certificate verified successfully! This certificate is recorded on the blockchain."
          : result.reason || "Certificate verification failed.",
        verifiedAt: new Date().toISOString(),
      };

    } catch (error) {
      return {
        isValid: false,
        message: "An error occurred during verification. Please try again.",
        verifiedAt: new Date().toISOString(),
      };
    }
  }, []);


  const revokeCertificate = useCallback(async (id, reason = "Revoked by issuer") => {
    try {
      const response = await revokeCertificateApi({
        id,
        reason
      });
      const revokedCert = response.data;
      setCertificates(prev =>
        prev.map(cert =>
          cert.id === id
            ? { ...cert, status: "REVOKED" }
            : cert
        )
      );
      return revokedCert;
    } catch (error) {
      throw new Error("Failed to revoke certificate");
    }
  }, []);

  return (
    <CertificateContext.Provider value={{
      certificates,
      getOrganizationCertificates,
      issueCertificate,
      verifyCertificate,
      revokeCertificate,
    }}>
      {children}
    </CertificateContext.Provider>
  );
}

export function useCertificates() {
  const context = useContext(CertificateContext);
  if (context === undefined) {
    throw new Error('useCertificates must be used within a CertificateProvider');
  }
  return context;
}
