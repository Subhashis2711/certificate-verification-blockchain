import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, LayoutDashboard, CheckCircle, LogOut, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const canIssue = user?.role === 'issuer' || user?.role === 'both';
  const canVerify = user?.role === 'verifier' || user?.role === 'both';

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'issuer':
        return 'bg-primary';
      case 'verifier':
        return 'bg-success';
      case 'both':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light sticky-top">
      <div className="container">
        <Link to="/dashboard" className="navbar-brand d-flex align-items-center">
          <div className="blockchain-icon me-2" style={{ width: 36, height: 36 }}>
            <Shield size={18} className="text-white" />
          </div>
          <span className="brand-title fs-5">True Certificates</span>
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {canIssue && (
              <li className="nav-item">
                <Link
                  to="/dashboard"
                  className={`nav-link d-flex align-items-center ${location.pathname === '/dashboard' ? 'active' : ''
                    }`}
                >
                  <LayoutDashboard size={18} className="me-2" />
                  Dashboard
                </Link>
              </li>
            )}
            {canVerify && (
              <li className="nav-item">
                <Link
                  to="/verify"
                  className={`nav-link d-flex align-items-center ${location.pathname === '/verify' ? 'active' : ''
                    }`}
                >
                  <CheckCircle size={18} className="me-2" />
                  Verify
                </Link>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center">
            <div className="me-3 d-none d-md-flex align-items-center">
              <Building2 size={16} className="text-secondary-custom me-2" />
              <span className="me-2">{user?.organizationName}</span>
              <span className={`badge badge-role ${getRoleBadgeClass(user?.role || '')}`}>
                {user?.role === 'both' ? 'Issuer & Verifier' : user?.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-sm d-flex align-items-center"
            >
              <LogOut size={16} className="me-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
