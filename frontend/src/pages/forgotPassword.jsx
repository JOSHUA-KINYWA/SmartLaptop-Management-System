import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Apidomain } from "../utils/ApiDomain";
import "./forgotPassword.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("request");

  const handleRequestReset = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${Apidomain}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to send reset code.");
      }

      setStep("reset");
      setMessage(data.message || "A reset code has been sent to your email.");
    } catch (err) {
      setError(err.message || "Unable to request reset code.");
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${Apidomain}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code: resetCode,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to reset password.");
      }

      setMessage(data.message || "Password reset successful.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.message || "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-bg">
      <div className="forgot-password-container">
        <h2 className="forgot-password-title">
          {step === "request" ? "Forgot Password" : "Reset Password"}
        </h2>

        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        {step === "request" ? (
          <form className="forgot-password-form" onSubmit={handleRequestReset}>
            <label className="forgot-password-label" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="forgot-password-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="forgot-password-btn" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Code"}
            </button>
            <button type="button" className="forgot-password-btn secondary" onClick={() => navigate("/login")}>
              Back to Login
            </button>
          </form>
        ) : (
          <form className="forgot-password-form" onSubmit={handleResetPassword}>
            <label className="forgot-password-label" htmlFor="reset-code">
              Reset Code
            </label>
            <input
              id="reset-code"
              type="text"
              className="forgot-password-input"
              placeholder="Enter 6-digit code"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value.trim())}
              required
            />

            <label className="forgot-password-label" htmlFor="new-password">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              className="forgot-password-input"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <label className="forgot-password-label" htmlFor="confirm-password">
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              type="password"
              className="forgot-password-input"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <button type="submit" className="forgot-password-btn" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
            <button type="button" className="forgot-password-btn secondary" onClick={() => navigate("/login")}>
              Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;