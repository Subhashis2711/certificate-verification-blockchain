import { useState } from 'react';
import {
  Award,
  Calendar,
  Mail,
  User,
  Hash,
  MoreVertical,
  XCircle,
  Copy,
  Check
} from 'lucide-react';
import { useCertificates } from '../context/CertificateContext';

export default function CertificateCard({ certificate, showActions = false }) {
  const { revokeCertificate } = useCertificates();
  const [copied, setCopied] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'valid':
        return 'bg-success';
      case 'revoked':
        return 'bg-danger';
      case 'expired':
        return 'bg-warning text-dark';
      default:
        return 'bg-secondary';
    }
  };

  const handleCopyHash = async () => {
    await navigator.clipboard.writeText(certificate.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevoke = () => {
    if (window.confirm('Are you sure you want to revoke this certificate? This action cannot be undone.')) {
      revokeCertificate(certificate.id);
    }
    setShowDropdown(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="card certificate-card h-100">
      <div className="card-header d-flex justify-content-between align-items-center py-3">
        <div className="d-flex align-items-center">
          <div className="blockchain-icon me-2" style={{ width: 36, height: 36 }}>
            <Award size={18} className="text-white" />
          </div>
          <div>
            <h6 className="mb-0 text-truncate" style={{ maxWidth: '180px' }}>
              {certificate.certificateType}
            </h6>
            <div className='d-flex flex-column'>

              {certificate.revokedAt ? (
                <small className="text-secondary-custom">
                  <strong>Revoked:</strong> {formatDate(certificate.revokedAt)}
                </small>
              ) : (<small className="text-secondary-custom">
                <strong>Issued:</strong> {formatDate(certificate.issuedDate)}
              </small>)}
            </div>
          </div>
        </div>
        <div className="d-flex align-items-center">
          <span className={`badge ${getStatusBadge(certificate.status)} me-2`}>
            {certificate.expiryDate && new Date(certificate.expiryDate) < new Date() ? 'EXPIRED' : certificate.status}
          </span>
          {showActions && certificate.status === 'ACTIVE' && (
            <div className="dropdown">
              <button
                className="btn btn-link text-secondary-custom p-0"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <MoreVertical size={18} />
              </button>
              {showDropdown && (
                <div className="dropdown-menu dropdown-menu-end show" style={{ display: 'block' }}>
                  <button className="dropdown-item text-danger" onClick={handleRevoke}>
                    <XCircle size={16} className="me-2" />
                    Revoke Certificate
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="card-body">
        <div className="mb-3">
          <div className="d-flex align-items-center mb-2">
            <User size={16} className="text-secondary-custom me-2" />
            <span className="text-secondary-custom small">Certificate ID</span>
          </div>
          <p className="mb-0 fw-medium">{certificate.id}</p>
        </div>

        <div className="mb-3">
          <div className="d-flex align-items-center mb-2">
            <User size={16} className="text-secondary-custom me-2" />
            <span className="text-secondary-custom small">Holder</span>
          </div>
          <p className="mb-0 fw-medium">{certificate.holderName}</p>
        </div>

        <div className="mb-3">
          <div className="d-flex align-items-center mb-2">
            <Mail size={16} className="text-secondary-custom me-2" />
            <span className="text-secondary-custom small">Email</span>
          </div>
          <p className="mb-0 text-truncate">{certificate.holderEmail}</p>
        </div>

        {certificate.expiryDate && (
          <div className="mb-3">
            <div className="d-flex align-items-center mb-2">
              <Calendar size={16} className="text-secondary-custom me-2" />
              <span className="text-secondary-custom small">Expires</span>
            </div>
            <p className="mb-0">{formatDate(certificate.expiryDate)}</p>
          </div>
        )}

        <div>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div className="d-flex align-items-center">
              <Hash size={16} className="text-secondary-custom me-2" />
              <span className="text-secondary-custom small">Certificate Hash</span>
            </div>
            <button
              className="btn btn-link btn-sm p-0 text-primary"
              onClick={handleCopyHash}
              title="Copy hash"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
          <div className="hash-display small">
            {certificate.hash.substring(0, 20)}...{certificate.hash.substring(certificate.hash.length - 20)}
          </div>
        </div>
      </div>
    </div>
  );
}
