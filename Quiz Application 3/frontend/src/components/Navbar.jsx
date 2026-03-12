import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🧠 QuizApp
        </Link>

        <div className="navbar-links">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link nav-link-accent">Register</Link>
            </>
          ) : isAdmin ? (
            <>
              <span className="nav-user">
                <span className="nav-user-icon">👑</span>
                {user.username}
                <span className="nav-role-badge admin">
                  {user.role === 'staff' ? 'Staff' : 'Admin'}
                </span>
              </span>
              <Link to="/admin" className="nav-link">Dashboard</Link>
              <button onClick={handleLogout} className="nav-logout-btn">Logout</button>
            </>
          ) : (
            <>
              <span className="nav-user">
                <span className="nav-user-icon">👤</span>
                {user.username}
                <span className="nav-role-badge user">User</span>
              </span>
              <Link to="/dashboard" className="nav-link">Quiz</Link>
              <Link to="/my-results" className="nav-link">My Results</Link>
              <button onClick={handleLogout} className="nav-logout-btn">Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
