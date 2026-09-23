import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import { useAuth } from '../context/authcontext';
import './public-pages.css';

export default function Login() {
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const { user, login, register } = useAuth();

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError('');
    setSuccess('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFirstName('');
    setLastName('');
  };

  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const loginSuccess = await login(email, password);
    if (loginSuccess) {
      navigate('/dashboard');
    } else {
      setError('❌ Invalid credentials. Please try again.');
    }
  };

  const handleSubmitRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (password !== confirmPassword) {
      setError('❌ Passwords do not match.');
      return;
    }

    const { success: registerSuccess, error: registerError } = await register({
      firstName,
      lastName,
      email,
      password,
      role,
    });

    if (registerSuccess) {
      setSuccess('✅ Registration successful! Please log in.');
      setShowRegister(false);
      // Clear form
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFirstName('');
      setLastName('');
      setRole('student');
    } else {
      setError(`❌ ${registerError || 'Registration failed. Please try again.'}`);
    }
  };

  if (user) return <Navigate to="/dashboard" />;

  return (
    <div className="page-container">
      <PublicNavbar />
      <div className="content-wrapper auth-page-shell">
        <div className="auth-shell">
          <div className="auth-brand-panel">
            <div className="brand-chip">SmartLaptop</div>
            <h1>Access your account and move forward with confidence.</h1>
            <p>
              Manage your laptop financing journey, track payments, and stay in control of every application step.
            </p>

            <div className="auth-feature-list">
              <div className="auth-feature-item">
                <span className="feature-badge">✓</span>
                <span>Fast registration in minutes</span>
              </div>
              <div className="auth-feature-item">
                <span className="feature-badge">✓</span>
                <span>Track payment progress clearly</span>
              </div>
              <div className="auth-feature-item">
                <span className="feature-badge">✓</span>
                <span>Secure access for students and admins</span>
              </div>
            </div>
          </div>

          <div className="auth-card">
            {!showRegister ? (
              <>
                <div className="role-selector">
                  <button
                    onClick={() => handleRoleChange('student')}
                    className={`role-btn ${role === 'student' ? 'active' : ''} left`}
                  >
                    Student Login
                  </button>
                  <button
                    onClick={() => handleRoleChange('admin')}
                    className={`role-btn ${role === 'admin' ? 'active' : ''} right`}
                  >
                    Admin Login
                  </button>
                </div>

                <h2 className="auth-title">
                  {role === 'admin' ? 'Admin' : 'Student'} Login
                </h2>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <form onSubmit={handleSubmitLogin} className="auth-form">
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="name@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Password</label>
                    <div className="password-input-wrap">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="toggle-password-btn"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="auth-submit-btn">
                    Log In
                  </button>
                </form>

                <p
                  className="forgot-password-link"
                  onClick={() => navigate('/forgot-password')}
                >
                  Forgot Password?
                </p>

                <p
                  onClick={() => {
                    setShowRegister(true);
                    setShowPassword(false);
                    setShowConfirmPassword(false);
                    setError('');
                    setSuccess('');
                    setEmail('');
                    setPassword('');
                    setConfirmPassword('');
                    setFirstName('');
                    setLastName('');
                    setRole('student');
                  }}
                  className="auth-switch-text"
                >
                  Don't have an account? Register here
                </p>
              </>
            ) : (
              <>
                <h2 className="auth-title">Register Account</h2>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <form onSubmit={handleSubmitRegister} className="auth-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name</label>
                      <input
                        type="text"
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Last Name</label>
                      <input
                        type="text"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="name@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Password</label>
                    <div className="password-input-wrap">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="toggle-password-btn"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Confirm Password</label>
                    <div className="password-input-wrap">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="toggle-password-btn"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      >
                        {showConfirmPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Select Role</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                      <option value="student">Student</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <button type="submit" className="auth-submit-btn">
                    Register
                  </button>
                </form>

                <p
                  onClick={() => {
                    setShowRegister(false);
                    setShowPassword(false);
                    setShowConfirmPassword(false);
                    setError('');
                    setSuccess('');
                    setEmail('');
                    setPassword('');
                    setConfirmPassword('');
                    setFirstName('');
                    setLastName('');
                    setRole('student');
                  }}
                  className="auth-switch-text"
                >
                  Already have an account? Log in here
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
