import { useState } from 'react';
import { X, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCertificates } from '../context/CertificateContext';
import { generateFileHash } from '../utils';

export default function IssueCertificateModal({ show, onHide }) {
  const { user } = useAuth();
  const { issueCertificate } = useCertificates();

  const [holderName, setHolderName] = useState('');
  const [holderEmail, setHolderEmail] = useState('');
  const [certificateType, setCertificateType] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState('');
  const [file, setFile] = useState(null);
  const [fileHash, setFileHash] = useState('');
  const [isHashing, setIsHashing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = async (selectedFile) => {
    setFile(selectedFile);
    setError('');
    setIsHashing(true);

    try {
      const hash = await generateFileHash(selectedFile);
      setFileHash(hash);
    } catch (err) {
      setError('Failed to generate file hash. Please try again.');
      setFileHash('');
    } finally {
      setIsHashing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileChange(droppedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('Please upload a certificate file to continue.');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();

      formData.append("file", file);
      formData.append("id", crypto.randomUUID());
      formData.append("holderName", holderName);
      formData.append("holderEmail", holderEmail);
      formData.append("certificateType", certificateType);
      formData.append("issuedDate", issueDate);
      formData.append("issuedBy", user?.id || "");
      formData.append("organizationId", user?.organizationId || "");
      formData.append("organizationName", user?.organizationName || "");
      formData.append("expiryDate", expiryDate || "");

      await issueCertificate(formData);

      setSuccess(true);
      setTimeout(() => {
        resetForm();
        onHide();
      }, 2000);
    } catch {
      setError('Failed to issue certificate. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setHolderName('');
    setHolderEmail('');
    setCertificateType('');
    setIssueDate(new Date().toISOString().split('T')[0]);
    setExpiryDate('');
    setFile(null);
    setFileHash('');
    setError('');
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onHide();
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content bg-card border-custom">
          <div className="modal-header border-custom">
            <h5 className="modal-title">Issue New Certificate</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={handleClose}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
          <div className="modal-body">
            {success ? (
              <div className="text-center py-5">
                <CheckCircle size={64} className="text-success mb-3" />
                <h4>Certificate Issued Successfully!</h4>
                <p className="text-secondary-custom">
                  The certificate has been recorded on the blockchain.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="alert alert-danger d-flex align-items-center mb-4">
                    <AlertCircle size={18} className="me-2" />
                    {error}
                  </div>
                )}

                {/* File Upload Zone */}
                <div className="mb-4">
                  <label className="form-label">Certificate Document <span className="text-danger">*</span></label>
                  <div
                    className={`upload-zone ${dragOver ? 'dragover' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('fileInput')?.click()}
                  >
                    <input
                      type="file"
                      id="fileInput"
                      className="d-none"
                      onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    />
                    <Upload size={32} className="text-secondary-custom mb-2" />
                    {file ? (
                      <div>
                        <p className="mb-1 text-white">{file.name}</p>
                        <small className="text-secondary-custom">Click to change file</small>
                      </div>
                    ) : (
                      <div>
                        <p className="mb-1 text-white">Drop your certificate file here</p>
                        <small className="text-secondary-custom">or click to browse</small>
                      </div>
                    )}
                  </div>
                  {isHashing && (
                    <div className="mt-2 d-flex align-items-center">
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      <small className="text-secondary-custom">Generating hash from file...</small>
                    </div>
                  )}
                  {fileHash && !isHashing && (
                    <div className="mt-2">
                      <small className="text-secondary-custom">SHA-256 File Hash (stored on blockchain):</small>
                      <div className="hash-display mt-1 small">
                        {fileHash}
                      </div>
                    </div>
                  )}
                </div>

                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label htmlFor="holderName" className="form-label">Holder Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="holderName"
                      placeholder="Enter certificate holder's name"
                      value={holderName}
                      onChange={(e) => setHolderName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label htmlFor="holderEmail" className="form-label">Holder Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="holderEmail"
                      placeholder="holder@email.com"
                      value={holderEmail}
                      onChange={(e) => setHolderEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label htmlFor="certificateType" className="form-label">Certificate Type</label>
                  <select
                    className="form-select"
                    id="certificateType"
                    value={certificateType}
                    onChange={(e) => setCertificateType(e.target.value)}
                    required
                  >
                    <option value="">Select certificate type</option>
                    <option value="Degree Certificate">Degree Certificate</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Professional Certification">Professional Certification</option>
                    <option value="Course Completion">Course Completion</option>
                    <option value="Training Certificate">Training Certificate</option>
                    <option value="Achievement Award">Achievement Award</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="row g-3 mt-1">
                  <div className="col-12 col-md-6">
                    <label htmlFor="issueDate" className="form-label">Issue Date</label>
                    <input
                      type="date"
                      className="form-control"
                      id="issueDate"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label htmlFor="expiryDate" className="form-label">
                      Expiry Date <span className="text-secondary-custom">(Optional)</span>
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="expiryDate"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      min={issueDate}
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleClose}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Issuing on Blockchain...
                      </>
                    ) : (
                      'Issue Certificate'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
