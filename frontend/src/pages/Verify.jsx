import { useState } from 'react';
import {
  Upload,
  Search,
  CheckCircle,
  XCircle,
  Shield,
  User,
  Mail,
  Calendar,
  Building2,
  Award,
  Hash,
  Clock
} from 'lucide-react';
import { useCertificates } from '../context/CertificateContext';

const getCertificatePayload = (args) => {
  const { verificationMode, certificateId, file, manualHash } = args;
  if (verificationMode === 'file') {
    const certificatePayload = new FormData();
    certificatePayload.append("id", certificateId);
    certificatePayload.append("file", file);
    return certificatePayload;
  } else {
    return { hash: manualHash, id: certificateId };
  }
}

export const Verify = () => {
  const { verifyCertificate } = useCertificates();
  const [file, setFile] = useState(null);
  const [manualHash, setManualHash] = useState('');
  const [certificateId, setCertificateId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [verificationMode, setVerificationMode] = useState('file');

  const handleFileChange = async (selectedFile) => {
    setFile(selectedFile);
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileChange(droppedFile);
    }
  };

  const handleVerify = async () => {
    setIsVerifying(true);

    const certificatePayload = getCertificatePayload({ verificationMode, certificateId, file, manualHash });
    try {
      const verificationResult = await verifyCertificate(certificatePayload);
      setResult(verificationResult);
    } catch {
      setResult({
        isValid: false,
        message: 'An error occurred during verification. Please try again.',
        verifiedAt: new Date().toISOString(),
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const resetVerification = () => {
    setFile(null);
    setFileHash('');
    setManualHash('');
    setResult(null);
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="text-center mb-5">
        <div className="blockchain-icon mx-auto mb-3" style={{ width: 64, height: 64 }}>
          <Shield size={32} className="text-white" />
        </div>
        <h1 className="h2 mb-2">Verify Certificate</h1>
        <p className="text-secondary-custom">
          Upload a certificate or enter its hash to verify authenticity on the blockchain
        </p>
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          {/* Verification Mode Tabs */}
          <div className="card mb-4">
            <div className="card-body p-0">
              <ul className="nav nav-tabs border-0">
                <li className="nav-item flex-fill">
                  <button
                    className={`nav-link w-100 py-3 rounded-0 ${verificationMode === 'file' ? 'active bg-primary text-white' : ''}`}
                    onClick={() => { setVerificationMode('file'); resetVerification(); }}
                  >
                    <Upload size={18} className="me-2" />
                    Upload Certificate
                  </button>
                </li>
                <li className="nav-item flex-fill">
                  <button
                    className={`nav-link w-100 py-3 rounded-0 ${verificationMode === 'hash' ? 'active bg-primary text-white' : ''}`}
                    onClick={() => { setVerificationMode('hash'); resetVerification(); }}
                  >
                    <Hash size={18} className="me-2" />
                    Enter Hash
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Upload / Hash Input Area */}
          <div className="card mb-4">
            <div className="card-body p-4">
              {verificationMode === 'file' ? (
                <>
                  <div className="input-group mb-4">
                    <span className="input-group-text bg-card border-custom">
                      <Hash size={18} className="text-secondary-custom" />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      id="certificateIdInput"
                      placeholder="Enter certificate ID"
                      value={certificateId}
                      onChange={(e) => setCertificateId(e.target.value)}
                    />
                  </div>
                  <div
                    className={`upload-zone ${dragOver ? 'dragover' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('verifyFileInput')?.click()}
                  >
                    <input
                      type="file"
                      id="verifyFileInput"
                      className="d-none"
                      onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    />
                    <Upload size={48} className="text-secondary-custom mb-3" />
                    {file ? (
                      <div>
                        <p className="mb-1 h5 text-white">{file.name}</p>
                        <small className="text-secondary-custom">Click to change file</small>
                      </div>
                    ) : (
                      <div>
                        <p className="mb-1 h5 text-white">Drop your certificate here</p>
                        <small className="text-secondary-custom">
                          Supports PDF, DOC, DOCX, PNG, JPG
                        </small>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div>
                  <label htmlFor="certificateIdInput" className="form-label">Certificate ID</label>
                  <div className="input-group mb-3">
                    <span className="input-group-text bg-card border-custom">
                      <Hash size={18} className="text-secondary-custom" />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      id="certificateIdInput"
                      placeholder="Enter certificate ID"
                      value={certificateId}
                      onChange={(e) => setCertificateId(e.target.value)}
                    />
                  </div>

                  <label htmlFor="hashInput" className="form-label">Certificate Hash</label>
                  <div className="input-group">
                    <span className="input-group-text bg-card border-custom">
                      <Hash size={18} className="text-secondary-custom" />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      id="hashInput"
                      placeholder="Enter the certificate hash (SHA-256)"
                      value={manualHash}
                      onChange={(e) => setManualHash(e.target.value)}
                    />
                  </div>
                  <small className="text-secondary-custom mt-2 d-block">
                    Enter the 64-character SHA-256 hash of the certificate
                  </small>
                </div>
              )}

              <button
                className="btn btn-primary w-100 py-3 mt-4 d-flex align-items-center justify-content-center"
                onClick={handleVerify}
                disabled={isVerifying || (verificationMode === 'file' ? !file : !manualHash)}
              >
                {isVerifying ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Verifying on Blockchain...
                  </>
                ) : (
                  <>
                    <Search size={20} className="me-2" />
                    Verify Certificate
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Verification Result */}
          {result && (
            <div className="card verification-result">
              <div className={`card-header py-4 ${result.isValid ? 'bg-success' : 'bg-danger'} bg-opacity-10`}>
                <div className="d-flex align-items-center">
                  {result.isValid ? (
                    <CheckCircle size={32} className="text-success me-3" />
                  ) : (
                    <XCircle size={32} className="text-danger me-3" />
                  )}
                  <div>
                    <h4 className={`mb-1 ${result.isValid ? 'text-success' : 'text-danger'}`}>
                      {result.isValid ? 'Certificate Verified' : 'Verification Failed'}
                    </h4>
                    <p className="mb-0 text-secondary-custom">{result.message}</p>
                  </div>
                </div>
              </div>

              {result.certificate && (
                <div className="card-body p-4">
                  <h5 className="mb-4">Certificate Details</h5>

                  <div className="row g-4">
                    <div className="col-12 col-md-6">
                      <div className="d-flex align-items-start">
                        <div className="blockchain-icon me-3" style={{ width: 40, height: 40 }}>
                          <Award size={20} className="text-white" />
                        </div>
                        <div>
                          <small className="text-secondary-custom d-block">Certificate Type</small>
                          <span className="fw-medium">{result.certificate.certificateType}</span>
                        </div>
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <div className="d-flex align-items-start">
                        <div className="blockchain-icon me-3" style={{ width: 40, height: 40 }}>
                          <Award size={20} className="text-white" />
                        </div>
                        <div>
                          <small className="text-secondary-custom d-block">Certificate ID</small>
                          <span className="fw-medium">{result.certificate.id}</span>
                        </div>
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <div className="d-flex align-items-start">
                        <div className="rounded-circle bg-card p-2 me-3">
                          <User size={20} className="text-secondary-custom" />
                        </div>
                        <div>
                          <small className="text-secondary-custom d-block">Holder Name</small>
                          <span className="fw-medium">{result.certificate.holderName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <div className="d-flex align-items-start">
                        <div className="rounded-circle bg-card p-2 me-3">
                          <Mail size={20} className="text-secondary-custom" />
                        </div>
                        <div>
                          <small className="text-secondary-custom d-block">Holder Email</small>
                          <span className="fw-medium">{result.certificate.holderEmail}</span>
                        </div>
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <div className="d-flex align-items-start">
                        <div className="rounded-circle bg-card p-2 me-3">
                          <Building2 size={20} className="text-secondary-custom" />
                        </div>
                        <div>
                          <small className="text-secondary-custom d-block">Issued By</small>
                          <span className="fw-medium">{result.certificate.organizationName || result.certificate.organizationId}</span>
                        </div>
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <div className="d-flex align-items-start">
                        <div className="rounded-circle bg-card p-2 me-3">
                          <Calendar size={20} className="text-secondary-custom" />
                        </div>
                        <div>
                          <small className="text-secondary-custom d-block">Issue Date</small>
                          <span className="fw-medium">
                            {new Date(result.certificate.issuedDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {result.certificate.expiryDate && (
                      <div className="col-12 col-md-6">
                        <div className="d-flex align-items-start">
                          <div className="rounded-circle bg-card p-2 me-3">
                            <Clock size={20} className="text-secondary-custom" />
                          </div>
                          <div>
                            <small className="text-secondary-custom d-block">Expiry Date</small>
                            <span className="fw-medium">
                              {new Date(result.certificate.expiryDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="d-flex align-items-center mb-2">
                      <Hash size={16} className="text-secondary-custom me-2" />
                      <small className="text-secondary-custom">Certificate Hash</small>
                    </div>
                    <div className="hash-display">{result.certificate.hash}</div>
                  </div>

                  <div className="mt-4 pt-3 border-top border-custom">
                    <small className="text-secondary-custom">
                      Verified at: {formatDate(result.verifiedAt)}
                    </small>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info Section */}
          <div className="card mt-4">
            <div className="card-body p-4">
              <h5 className="mb-3">How Verification Works</h5>
              <div className="row g-4">
                <div className="col-12 col-md-4">
                  <div className="d-flex align-items-start">
                    <div className="badge bg-primary rounded-circle p-2 me-3">1</div>
                    <div>
                      <h6 className="mb-1">Upload Certificate</h6>
                      <small className="text-secondary-custom">
                        Upload the certificate file or enter its hash directly
                      </small>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-md-4">
                  <div className="d-flex align-items-start">
                    <div className="badge bg-primary rounded-circle p-2 me-3">2</div>
                    <div>
                      <h6 className="mb-1">Generate Hash</h6>
                      <small className="text-secondary-custom">
                        A unique cryptographic hash is generated from the certificate
                      </small>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-md-4">
                  <div className="d-flex align-items-start">
                    <div className="badge bg-primary rounded-circle p-2 me-3">3</div>
                    <div>
                      <h6 className="mb-1">Blockchain Lookup</h6>
                      <small className="text-secondary-custom">
                        The hash is verified against records stored on the blockchain
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
