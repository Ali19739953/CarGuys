import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig";
import "./ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    try {
      // Firebase password reset
      await auth.sendPasswordResetEmail(email, {
        url: `${window.location.origin}/login`, // Redirect URL after password reset
        handleCodeInApp: true,
      });

      setMessage({
        text: "Password reset email sent! Please check your inbox and spam folder.",
        type: "success"
      });

      //redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (error) {
      console.error("Password reset error:", error);
      let errorMessage;

      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = "Please enter a valid email address.";
          break;
        case 'auth/user-not-found':
          errorMessage = "No account found with this email address.";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Too many attempts. Please try again later.";
          break;
        default:
          errorMessage = "Error sending password reset email. Please try again.";
      }

      setMessage({
        text: errorMessage,
        type: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgotPasswordContainer">
      <h2 className="forgotPasswordTitle">Reset Your Password</h2>
      <form onSubmit={handleSubmit} className="forgotPasswordForm">
        <div className="formGroup">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
            className="forgotPasswordInput"
            disabled={isLoading}
          />
        </div>
        <button 
          type="submit" 
          className="submitButton"
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
      
      {message.text && (
        <p className={`message ${message.type}`}>
          {message.text}
        </p>
      )}
      
      <p className="backToLogin">
        Remembered your password? {' '}
        <a href="/login" className="loginLink">
          Back to login
        </a>
      </p>
    </div>
  );
}

export default ForgotPassword;