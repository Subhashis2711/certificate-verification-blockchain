import { useState, useMemo, useEffect } from 'react';
import {
  Award,
  Plus,
  Search,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCertificates } from '../context/CertificateContext';
import IssueCertificateModal from '../components/IssueCertificateModal';
import CertificateCard from '../components/CertificateCard';

const getCertificateStatus = (certificate) => {
  if (certificate.status === "REVOKED") return "REVOKED";
  if (certificate.expiryDate && new Date(certificate.expiryDate) < new Date()) return "EXPIRED";
  return "ACTIVE";
};

export const Dashboard = () => {
  const { user } = useAuth();
  const { certificates, getOrganizationCertificates } = useCertificates();
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (user?.organizationId) {
      getOrganizationCertificates(user.organizationId);
    }
  }, [getOrganizationCertificates, user?.organizationId]);

  const filteredCertificates = useMemo(() => {
    return certificates.filter(cert => {
      const matchesSearch =
        cert.holderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.holderEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.certificateType.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || getCertificateStatus(cert) === statusFilter;;

      return matchesSearch && matchesStatus;
    });
  }, [certificates, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const active = certificates.filter(c => getCertificateStatus(c) === "ACTIVE").length;
    const revoked = certificates.filter(c => getCertificateStatus(c) === "REVOKED").length;
    const expired = certificates.filter(c => getCertificateStatus(c) === "EXPIRED").length;
    return { total: certificates.length, active, revoked, expired };
  }, [certificates]);

  const canIssue = user?.role === 'issuer' || user?.role === 'both';

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
        <div>
          <h1 className="h3 mb-1">Certificate Dashboard</h1>
          <p className="text-secondary-custom mb-0">
            Manage and track all certificates issued by <strong>{user?.organizationName}</strong>
          </p>
        </div>
        {canIssue && (
          <button
            className="btn btn-primary d-flex align-items-center mt-3 mt-md-0"
            onClick={() => setShowIssueModal(true)}
          >
            <Plus size={18} className="me-2" />
            Issue Certificate
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <div className="stat-number">{stats.total}</div>
                <div className="stat-label">Total Issued</div>
              </div>
              <Award size={32} className="text-primary opacity-50" />
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <div className="stat-number text-success">{stats.active}</div>
                <div className="stat-label">Active</div>
              </div>
              <CheckCircle size={32} className="text-success opacity-50" />
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <div className="stat-number text-danger">{stats.revoked}</div>
                <div className="stat-label">Revoked</div>
              </div>
              <XCircle size={32} className="text-danger opacity-50" />
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="stat-card">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <div className="stat-number text-warning">{stats.expired}</div>
                <div className="stat-label">Expired</div>
              </div>
              <Clock size={32} className="text-warning opacity-50" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-md-8">
              <div className="input-group">
                <span className="input-group-text bg-card border-custom">
                  <Search size={18} className="text-secondary-custom" />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by holder name, email, or certificate type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-card border-custom">
                  <Filter size={18} className="text-secondary-custom" />
                </span>
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="REVOKED">Revoked</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Certificates List */}
      {filteredCertificates.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <FileText size={48} className="text-secondary-custom mb-3" />
            <h5 className="mb-2">No certificates found</h5>
            <p className="text-secondary-custom mb-0">
              {certificates.length === 0
                ? 'Start issuing certificates to see them here.'
                : 'Try adjusting your search or filters.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {filteredCertificates.map((certificate) => (
            <div key={certificate.id} className="col-12 col-md-6 col-xl-4">
              <CertificateCard certificate={{ ...certificate, status: getCertificateStatus(certificate) }} showActions={canIssue} />
            </div>
          ))}
        </div>
      )}

      {/* Issue Certificate Modal */}
      <IssueCertificateModal
        show={showIssueModal}
        onHide={() => setShowIssueModal(false)}
      />
    </div>
  );
}
