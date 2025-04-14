//trying to implement redux for login
//imported loginRequest, loginSuccess, loginFailure from redux
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  loginRequest,
  loginSuccess,
  loginFailure,
} from "../Redux/Features/SharedSlices/Users/userSlice";
import { auth } from "../firebaseConfig";
import "./Login.css";
import { GoogleAuthProvider, OAuthProvider, signInWithPopup } from "firebase/auth";
// import backgroundImage from "../background.jpg"; // Import the background image

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  

  const handleLogin = async (e) => {
    e.preventDefault();
    dispatch(loginRequest());
    try {
      const userCredential = await auth.signInWithEmailAndPassword(
        email,
        password
      );
      const token = await userCredential.user.getIdToken();
      const isVerified = userCredential.user.emailVerified;

      // if (!isVerified) {
      //   alert("Please verify your email address before logging in.");
      //   // Logut the user
      //   await auth.signOut();
      //   return;
      // }

      // Fetch the CSRF token and set the cookie
      await fetch("http://localhost:8000/auth/set-csrf/", {
        method: "GET",
        credentials: "include",
      });

      // Send the login request with credentials and CSRF token
      const response = await fetch("http://localhost:8000/auth/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ idToken: token }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login response data:", data);
        alert("Login successful");
        const userType = data.user_type;
        dispatch(loginSuccess(data));
        if (userType === "GarageManagers") {
          const garageName = data.garage_name;
          navigate(
            `/GarageDashboard?garageName=${encodeURIComponent(garageName)}`,
            { state: { from: location } }
          );
        } else if (userType === "ServiceSeekers") {
          const firstName = data.first_name;
          navigate(
            `/ServiceSeekerHomepage?firstName=${encodeURIComponent(firstName)}`
          );
        } else {
          navigate("/Homepage");
        }

        console.log(`User type: ${userType}`);
        console.log(`Email: ${email}`);
        console.log(`User ID: ${data.user_id}`);
      } else {
        dispatch(loginFailure(data.error || "Unknown error"));
        alert("Login failed: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.log({ error });
      let errorMessage;

      switch (error.code) {
        case "auth/invalid-credential":
          errorMessage = "Invalid credentials. Please try again.";
          break;
        // case "auth/wrong-password":
        //   errorMessage = "Incorrect password. Please try again.";
        //   break;
        case "auth/invalid-email":
          errorMessage =
            "The email address entered is invalid. Please ensure it is in the correct format (e.g., name@example.com).";
          break;
        case "auth/missing-password":
          errorMessage =
            "A password is required to log in. Please enter your password and try again.";
          break;
        case "auth/user-disabled":
          errorMessage = "Account disabled. Please contact support.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Please try again later.";
          break;
        default:
          errorMessage = "An error occurred during login. Please try again.";
      }

      dispatch(loginFailure(errorMessage));
      alert(errorMessage);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle Google Login
  const handleGoogleLogin = async () => {
    try {
      const googleProvider = new GoogleAuthProvider();
      googleProvider.addScope("profile");
      googleProvider.addScope("email");
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      console.log({ token, result });
      alert("Google login successful");
      // window.location.href = "https://www.amazon.com";
    } catch (error) {
      // console.error("Error logging in with Google:", error);
      console.log({ error });
      alert("Error logging in with Google");
    }
  };
  const forgotPassword = () => {
    navigate("/ForgotPassword");
  };

  // Handle Apple Login
  const handleAppleLogin = async () => {
    try {
      const appleProvider = new OAuthProvider('apple.com');
      const result = await signInWithPopup(auth, appleProvider);
      // const token = await result.user.getIdToken();
      const token = null;

      console.log({ token, result });
      alert("Apple login successful");
      // window.location.href = "https://www.amazon.com"; // Redirect after successful login
    } catch (error) {
      // console.error("Error logging in with Apple:", error);
      console.log({ error });
      alert("Error logging in with Apple");
    }
  };

  return (
    <div className="loginContainer">
      <section className="loginWindow">
        {/* Left side - Welcome message */}
        <section className="welcome-section">
          <div className="welcome-text">
            <h1>
              Welcome to <span>CarGuys</span>
            </h1>
          </div>
        </section>

        <section className="loginSection">
          {/* <header className="App-header-login">
        <div className="logo">
          <img src="/logologin.png" alt="Logo" />
        </div>
      </header> */}
          <div className="loginBox">
            <h2 className="LoginTitle">
              Login to your <span>account</span>
            </h2>

            <form onSubmit={handleLogin}>
              <div className="loginEmail">
                <p>Email</p>
                <input
                  type="text"
                  className="loginEmailInput"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="loginPassword">
                <p>Password</p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    position: "relative",
                  }}
                >
                  <input
                    type={showPassword ? "text" : "password"}
                    className="loginPasswordInput"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    //required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    style={{
                      position: "absolute",
                      right: 10,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div className="remember-forgot">
                {/* <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                //have to implement the function for this.
              />
              <span className="custom-checkbox"></span>
              Remember me
            </label> */}
                <Link
                  to="/ForgotPassword"
                  className="forgot-password"
                  onClick={forgotPassword}
                >
                  Forgot Password?
                </Link>
              </div>
              <button type="submit" className="sign-in-button">
                Login with email
              </button>
            </form>
            {/* <div className="or-divider">
              <span>Or login with</span>
            </div> */}
            {/* <div className="social-login">
              <button className="google-button" onClick={handleGoogleLogin}>
                <img src="/icon/google2.png" alt="Google" /> Google
              </button>
              <button className="apple-button" onClick={handleAppleLogin}>
                <img src="/icon/apple.png" alt="Apple" /> Apple
              </button>
            </div> */}
            {/* <div className="signup-link">
          Don't have an account? <a href="#">Get Started</a>
        </div> */}
          </div>
        </section>
      </section>
    </div>
  );
}

export default Login;