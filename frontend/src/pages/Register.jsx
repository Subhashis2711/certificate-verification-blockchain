import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, Building2, UserCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [role, setRole] = useState('both');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const success = await register(email, password, organizationName, role);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('An account with this email already exists.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card login-card shadow-lg border-0">
              <div className="card-body p-4 p-md-5">
                <div className="text-center mb-4">
                  <div className="blockchain-icon mx-auto mb-3">
                    <Shield size={24} className="text-white" />
                  </div>
                  <h1 className="brand-title mb-1">True Certificates</h1>
                  <p className="text-secondary-custom mb-0">
                    Blockchain Certificate Verification
                  </p>
                </div>

                <h2 className="h4 text-center mb-4">Create your organization account</h2>

                {error && (
                  <div className="alert alert-danger d-flex align-items-center" role="alert">
                    <AlertCircle size={18} className="me-2" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="organizationName" className="form-label">
                      Organization Name
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-card border-custom">
                        <Building2 size={18} className="text-secondary-custom" />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        id="organizationName"
                        placeholder="Enter your organization name"
                        value={organizationName}
                        onChange={(e) => setOrganizationName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email address
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-card border-custom">
                        <Mail size={18} className="text-secondary-custom" />
                      </span>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        placeholder="you@organization.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Password
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-card border-custom">
                        <Lock size={18} className="text-secondary-custom" />
                      </span>
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        placeholder="Create a strong password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">
                      Confirm Password
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-card border-custom">
                        <Lock size={18} className="text-secondary-custom" />
                      </span>
                      <input
                        type="password"
                        className="form-control"
                        id="confirmPassword"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label d-flex align-items-center">
                      <UserCheck size={18} className="me-2 text-secondary-custom" />
                      Organization Role
                    </label>
                    <div className="row g-2">
                      <div className="col-4">
                        <input
                          type="radio"
                          className="btn-check"
                          name="role"
                          id="role-issuer"
                          value="issuer"
                          checked={role === 'issuer'}
                          onChange={(e) => setRole(e.target.value)}
                        />
                        <label
                          className="btn btn-outline-primary w-100"
                          htmlFor="role-issuer"
                        >
                          Issuer
                        </label>
                      </div>
                      <div className="col-4">
                        <input
                          type="radio"
                          className="btn-check"
                          name="role"
                          id="role-verifier"
                          value="verifier"
                          checked={role === 'verifier'}
                          onChange={(e) => setRole(e.target.value)}
                        />
                        <label
                          className="btn btn-outline-primary w-100"
                          htmlFor="role-verifier"
                        >
                          Verifier
                        </label>
                      </div>
                      <div className="col-4">
                        <input
                          type="radio"
                          className="btn-check"
                          name="role"
                          id="role-both"
                          value="both"
                          checked={role === 'both'}
                          onChange={(e) => setRole(e.target.value)}
                        />
                        <label
                          className="btn btn-outline-primary w-100"
                          htmlFor="role-both"
                        >
                          Both
                        </label>
                      </div>
                    </div>
                    <small className="text-secondary-custom mt-2 d-block">
                      {role === 'issuer' && 'Issue certificates to individuals and organizations.'}
                      {role === 'verifier' && 'Verify certificates issued by other organizations.'}
                      {role === 'both' && 'Issue and verify certificates.'}
                    </small>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2 mb-3"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating account...
                      </>
                    ) : (
                      'Create account'
                    )}
                  </button>

                  <p className="text-center text-secondary-custom mb-0">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary text-decoration-none">
                      Sign in
                    </Link>
                  </p>
                </form>
              </div>
            </div>

            <p className="text-center text-secondary-custom mt-4 small">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
