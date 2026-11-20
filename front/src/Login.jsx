import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Check, AlertCircle, CheckCircle2, X } from "lucide-react";

const API = "http://localhost:5000/auth";
const emailRegex = /^\S+@\S+\.\S+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const errMsg = (error, fallback) =>
  error.response?.data?.message || error.response?.data || fallback;

const Alert = ({ type = "error", children, onClose }) => (
  <div
    className={`dw-alert dw-alert-${type}`}
    role={type === "error" ? "alert" : "status"}
  >
    {type === "error" ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
    <span>{children}</span>
    {onClose && (
      <button
        type="button"
        className="dw-alert-close"
        aria-label="Dismiss"
        onClick={onClose}
      >
        <X size={14} />
      </button>
    )}
  </div>
);
const whiteInput = (el) => {
  if (!el) return;
  el.style.setProperty("background-color", "#ffffff", "important");
  el.style.setProperty("color", "#1F2A22", "important");
};
function Login() {
  const navigate = useNavigate();
  const [page, setPage] = useState("login"); // "login" | "register" | "forgot"

  // login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState("");

  // register
  const [username, setUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // forgot / reset
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const goTo = (p) => {
    setLoginError("");
    setForgotError("");
    setRegisterError("");
    setForgotSuccess("");
    setPage(p);
  };

  /* ---------------- handlers ---------------- */

  const handleLogin = async (e) => {
    e?.preventDefault();
    setLoginError("");
    setRegisterSuccess("");

    if (!email || !password) {
      setLoginError("Please fill all fields");
      return;
    }

    try {
      setLoginLoading(true);
      const res = await axios.post(`${API}/login`, { email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/dashboard");
    } catch (error) {
      setLoginLoading(false);
      setLoginError(errMsg(error, "Invalid email or password"));
    }
  };

  const handleRegister = async (e) => {
    e?.preventDefault();
    setRegisterError("");
    setEmailError("");
    setPasswordError("");

    if (!username || !registerEmail || !registerPassword) {
      setRegisterError("Please fill all fields");
      return;
    }
    if (username.trim().length < 3) {
      setUsernameTouched(true);
      return;
    }
    if (!emailRegex.test(registerEmail)) {
      setEmailError("Invalid email format");
      return;
    }
    if (!passwordRegex.test(registerPassword)) {
      setPasswordTouched(true);
      setPasswordError(
        "Password must contain 8 characters, uppercase, lowercase and number"
      );
      return;
    }

    try {
      setRegisterLoading(true);
      await axios.post(`${API}/register`, {
        username,
        email: registerEmail,
        password: registerPassword,
      });

      setUsername("");
      setRegisterEmail("");
      setRegisterPassword("");
      setRegisterLoading(false);
      setRegisterSuccess("Account created successfully. You can now log in.");
      setPage("login");
    } catch (error) {
      setRegisterLoading(false);
      setRegisterError(errMsg(error, "Registration failed"));
    }
  };

  const handleForgotPassword = async (e) => {
    e?.preventDefault();
    setForgotError("");
    setForgotSuccess("");

    if (!forgotEmail) {
      setForgotError("Please enter your email address.");
      return;
    }
    if (!emailRegex.test(forgotEmail)) {
      setForgotError("Please enter a valid email address.");
      return;
    }

    try {
      await axios.post(`${API}/forgot-password`, { email: forgotEmail });
      setForgotSuccess(
        "If an account exists with this email, a password reset link has been sent."
      );
    } catch (error) {
      setForgotError(errMsg(error, "Something went wrong. Please try again."));
    }
  };

  // kept from your original code (not rendered in this layout, same as before)
  // eslint-disable-next-line no-unused-vars
  const handleResetPassword = async () => {
    try {
      const res = await axios.post(`${API}/reset-password/${resetToken}`, {
        password: newPassword,
      });
      setLoginError(res.data);
      setResetToken("");
      setNewPassword("");
      setPage("login");
    } catch (error) {
      setLoginError(errMsg(error, "Reset failed"));
    }
  };

  // Placeholder: point this at your backend's Google OAuth route
  const handleGoogle = () => {
    window.location.href = `${API}/google`;
  };

  /* ---------------- right-panel content ---------------- */

  const renderLogin = () => (
    <form onSubmit={handleLogin} noValidate>
      <p className="dw-eyebrow">Your day, your way</p>
      <h1 className="dw-title">Welcome back.</h1>
      <p className="dw-sub">A little clarity is just a sign-in away.</p>
    
      <label className="dw-label" htmlFor="login-email">
        Email address
      </label>
      <input
      ref={whiteInput}
        id="login-email"
        className={`dw-input ${loginError ? "dw-input-error" : ""}`}
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setLoginError("");
          setRegisterSuccess("");
        }}
      />

      <div className="dw-label-row">
        <label className="dw-label" htmlFor="login-password">
          Password
        </label>
        <button
          type="button"
          className="dw-link-small"
          onClick={() => goTo("forgot")}
        >
          Forgot password?
        </button>
      </div>
      <div className="dw-pass">
        <input
        ref={whiteInput}
          id="login-password"
          className={`dw-input ${loginError ? "dw-input-error" : ""}`}
          type={showLoginPassword ? "text" : "password"}
          placeholder="Enter your password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setLoginError("");
            setRegisterSuccess("");
          }}
        />
        <button
          type="button"
          className="dw-eye"
          aria-label={showLoginPassword ? "Hide password" : "Show password"}
          onClick={() => setShowLoginPassword(!showLoginPassword)}
        >
          {showLoginPassword ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
      {registerSuccess && (
        <Alert type="success" onClose={() => setRegisterSuccess("")}>
          {registerSuccess}
        </Alert>
      )}
      {loginError && (
        <Alert onClose={() => setLoginError("")}>{loginError}</Alert>
      )}

      <button className="dw-btn-primary" type="submit" disabled={loginLoading}>
        {loginLoading ? "Signing in..." : "Sign in"}
      </button>

      <p className="dw-legal">
        By continuing, you agree to our Terms of Service
        <br />
        and Privacy Policy.
      </p>
    </form>
  );

  const renderRegister = () => {
    const usernameInvalid = usernameTouched && username.trim().length < 3;
    const passwordInvalid = passwordTouched && passwordError;

    return (
      <form onSubmit={handleRegister} noValidate>
        <p className="dw-eyebrow">Your day, your way</p>
        <h1 className="dw-title">Create your account.</h1>
        <p className="dw-sub">A calmer day starts with a little clarity.</p>

        <label className="dw-label" htmlFor="reg-name">
          Name
        </label>
        <input
        ref={whiteInput}
          id="reg-name"
          className={`dw-input ${usernameInvalid ? "dw-input-error" : ""}`}
          type="text"
          placeholder="Your name"
          value={username}
          onChange={(e) => {
            const value = e.target.value;
            setUsername(value);
            setRegisterError("");
            if (usernameTouched && value.trim().length >= 3) {
              setUsernameTouched(false);
            }
          }}
          onBlur={() => setUsernameTouched(true)}
        />
        {usernameInvalid && (
          <p className="dw-hint">
            <AlertCircle size={13} /> Use at least 3 characters
          </p>
        )}

        <label className="dw-label" htmlFor="reg-email">
          Email address
        </label>
        <input
        ref={whiteInput}
          id="reg-email"
          className={`dw-input ${emailError ? "dw-input-error" : ""}`}
          type="email"
          placeholder="you@example.com"
          value={registerEmail}
          onChange={(e) => {
            setRegisterEmail(e.target.value);
            setEmailError("");
            setRegisterError("");
          }}
        />
        {emailError && (
          <p className="dw-hint">
            <AlertCircle size={13} /> {emailError}
          </p>
        )}

        <label className="dw-label" htmlFor="reg-password">
          Password
        </label>
        <div className="dw-pass">
          <input
          ref={whiteInput}
            id="reg-password"
            className={`dw-input ${passwordInvalid ? "dw-input-error" : ""}`}
            type={showRegisterPassword ? "text" : "password"}
            placeholder="Create a password"
            value={registerPassword}
            onChange={(e) => {
              const value = e.target.value;
              setRegisterPassword(value);
              setRegisterError("");

              if (passwordTouched) {
                if (passwordRegex.test(value)) {
                  setPasswordError("");
                } else if (value.length > 0) {
                  setPasswordError(
                    "Use at least 8 characters, with uppercase, lowercase, and a number."
                  );
                } else {
                  setPasswordError("");
                }
              }
            }}
            onBlur={() => setPasswordTouched(true)}
          />
          <button
            type="button"
            className="dw-eye"
            aria-label={
              showRegisterPassword ? "Hide password" : "Show password"
            }
            onClick={() => setShowRegisterPassword(!showRegisterPassword)}
          >
            {showRegisterPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
        {passwordInvalid && (
          <p className="dw-hint">
            <AlertCircle size={13} /> {passwordError}
          </p>
        )}

        {registerError && (
          <Alert onClose={() => setRegisterError("")}>{registerError}</Alert>
        )}

        <button
          className="dw-btn-primary"
          type="submit"
          disabled={registerLoading}
          style={{ marginTop: 22 }}
        >
          {registerLoading ? "Creating account..." : "Create account"}
        </button>

        <p className="dw-legal">
          By continuing, you agree to our Terms of Service
          <br />
          and Privacy Policy.
        </p>
      </form>
    );
  };

  const renderForgot = () => (
    <form onSubmit={handleForgotPassword} noValidate>
      <p className="dw-eyebrow">Your day, your way</p>
      <h1 className="dw-title">Forgot your password?</h1>
      <p className="dw-sub">
        No worries. Enter your email and we'll send you a link to reset it.
      </p>

      <label className="dw-label" htmlFor="forgot-email">
        Email address
      </label>
      <input
      ref={whiteInput}
        id="forgot-email"
        className={`dw-input ${forgotError ? "dw-input-error" : ""}`}
        type="email"
        placeholder="you@example.com"
        value={forgotEmail}
        onChange={(e) => {
          setForgotEmail(e.target.value);
          setForgotError("");
        }}
      />

      {forgotSuccess && <Alert type="success">{forgotSuccess}</Alert>}
      {forgotError && (
        <Alert onClose={() => setForgotError("")}>{forgotError}</Alert>
      )}

      <button
        className="dw-btn-primary"
        type="submit"
        style={{ marginTop: 22 }}
      >
        Send reset link
      </button>

      <p className="dw-back">
        <button type="button" onClick={() => goTo("login")}>
          ← Back to sign in
        </button>
      </p>
    </form>
  );

  /* ---------------- layout ---------------- */

  return (
    <div className="dw-root">
      <style>{css}</style>

      {/* ===== Left: brand panel ===== */}
      <aside className="dw-left">
        <div className="dw-left-top">
          <span className="dw-logo">daywell</span>
          <span className="dw-tag">LIFE, A LITTLE LIGHTER</span>
        </div>

        <div className="dw-hero">
          <h2>
            Less juggling.
            <br />
            More living.
          </h2>
          <p>
            Your plans, habits, and little reminders.
            <br />
            One peaceful place to bring it all together.
          </p>
        </div>

        <div className="dw-preview-wrap">
          <div className="dw-preview">
            <div className="dw-preview-head">
              <span className="dw-preview-eyebrow">YOUR DAILY OVERVIEW</span>
              <span className="dw-pill">At your pace</span>
            </div>
            <h3>A little progress, every day.</h3>
            <span className="dw-date">{today}</span>

            <ul className="dw-tasks">
              <li>
                <span className="dw-box dw-box-on">
                  <Check size={12} strokeWidth={3} />
                </span>
                <div>
                  <strong>Morning walk</strong>
                  <small>Make time for yourself</small>
                </div>
                <time>8:00 AM</time>
              </li>
              <li>
                <span className="dw-box" />
                <div>
                  <strong>Plan the week</strong>
                  <small>A fresh start, a clear mind</small>
                </div>
                <time>9:30 AM</time>
              </li>
              <li>
                <span className="dw-box" />
                <div>
                  <strong>Call Mom</strong>
                  <small>The little things matter</small>
                </div>
                <time>6:00 PM</time>
              </li>
            </ul>
          </div>

          <div className="dw-toast">
            <span className="dw-toast-icon">
              <Check size={13} strokeWidth={2.5} />
            </span>
            <div>
              <strong>Small steps add up.</strong>
              <small>You showed up. That counts.</small>
            </div>
          </div>
        </div>

        <div className="dw-left-bottom">
          <h4>Make space for what matters.</h4>
          <p>A calmer day starts with a little clarity.</p>
        </div>
      </aside>

      {/* ===== Right: form panel ===== */}
      <main className="dw-right">
        <div className="dw-topbar">
          {page === "login" ? (
            <>
              <span>New to daywell?</span>
              <button type="button" onClick={() => goTo("register")}>
                Create an account
              </button>
            </>
          ) : (
            <>
              <span>Already have an account?</span>
              <button type="button" onClick={() => goTo("login")}>
                Sign in
              </button>
            </>
          )}
        </div>

        <div className="dw-form-wrap">
          <div className="dw-form">
            {page === "login" && renderLogin()}
            {page === "register" && renderRegister()}
            {page === "forgot" && renderForgot()}
          </div>
        </div>

        <p className="dw-footer">A clearer mind. A little more you.</p>
      </main>
    </div>
  );
}

/* ---------------- styles ---------------- */

const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Lora:wght@400;500&display=swap');

.dw-root {
  position: fixed; inset: 0; display: flex;
  background: #FBFAF4;
  font-family: 'Inter', system-ui, sans-serif;
  color: #1F2A22;
  overflow: auto;
}
.dw-root *, .dw-root *::before, .dw-root *::after { box-sizing: border-box; }
.dw-root button { font-family: inherit; }

/* ---------- left panel ---------- */
.dw-left {
  position: relative;
  flex: 0 0 46%;
  max-width: 680px;
  min-height: 100%;
  background: #111827;
  color: #fff;
  border-radius: 0 22px 22px 0;
  padding: 34px clamp(28px, 4vw, 60px) 40px;
  display: flex; flex-direction: column;
}
.dw-left-top { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.dw-logo { font-family: 'Lora', serif; font-size: 26px; color: #B05CF5; letter-spacing: 0.2px; }
.dw-tag { font-size: 9px; letter-spacing: 1px; color: #B05CF5; }

.dw-hero { margin-top: clamp(28px, 5vh, 56px); }
.dw-hero h2 {
  font-family: 'Lora', serif; font-weight: 400;
  font-size: clamp(38px, 4.6vw, 58px); line-height: 1.12; margin: 0 0 18px;
}
.dw-hero p { margin: 0; font-size: 14px; line-height: 1.5; color: #AEB5C4; }

.dw-preview-wrap { position: relative; margin: auto 0; padding: 36px 0 34px; }
.dw-preview {
  background: #1E293B; border: 1px solid #2C3A50; border-radius: 16px;
  padding: 22px 24px 26px; position: relative; max-width: 560px;
}
.dw-preview-head { display: flex; justify-content: space-between; align-items: flex-start; }
.dw-preview-eyebrow { font-size: 9px; letter-spacing: 0.8px; color: #B05CF5; }
.dw-pill {
  font-size: 10px; color: #D9D4F2; background: #2C2F4E;
  padding: 6px 14px; border-radius: 999px; margin-top: -6px;
}
.dw-preview h3 {
  font-family: 'Lora', serif; font-weight: 400; font-size: 23px;
  margin: 10px 0 18px; line-height: 1.25;
}
.dw-date { display: block; font-size: 9px; letter-spacing: 0.8px; color: #9AA3B5; text-transform: uppercase; margin-bottom: 14px; }
.dw-tasks { list-style: none; margin: 0; padding: 0; display: grid; gap: 14px; }
.dw-tasks li { display: flex; align-items: center; gap: 12px; }
.dw-tasks li div { flex: 1; display: grid; gap: 2px; }
.dw-tasks strong { font-size: 12px; font-weight: 500; color: #F1F3F8; }
.dw-tasks small { font-size: 10px; color: #8D97AB; }
.dw-tasks time { font-size: 10px; color: #8D97AB; }
.dw-box {
  width: 17px; height: 17px; border-radius: 4px; border: 1.5px solid #566178;
  display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.dw-box-on { background: #A855F7; border-color: #A855F7; color: #fff; }

.dw-toast {
  position: absolute; right: 8px; bottom: 8px;
  display: flex; align-items: center; gap: 10px;
  background: linear-gradient(120deg, #A855F7, #EC4899);
  border-radius: 12px; padding: 14px 18px 14px 14px; width: 220px;
  box-shadow: 0 12px 30px rgba(168, 85, 247, 0.3);
}
.dw-toast-icon {
  width: 24px; height: 24px; border-radius: 50%;
  border: 1.5px solid rgba(255,255,255,0.8);
  display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.dw-toast div { display: grid; gap: 2px; }
.dw-toast strong { font-size: 12px; font-weight: 600; }
.dw-toast small { font-size: 10px; opacity: 0.85; }

.dw-left-bottom h4 { font-family: 'Lora', serif; font-weight: 400; font-size: 18px; margin: 0 0 6px; }
.dw-left-bottom p { margin: 0; font-size: 12px; color: #8D97AB; }

/* ---------- right panel ---------- */
.dw-right { flex: 1; min-width: 0; display: flex; flex-direction: column; min-height: 100%; }
.dw-topbar {
  display: flex; justify-content: flex-end; align-items: center; gap: 10px;
  padding: 22px 36px; font-size: 11px; color: #6B7280;
}
.dw-topbar button {
  background: none; border: none; padding: 0; cursor: pointer;
  font-size: 11px; font-weight: 600; color: #3F5A2E;
}
.dw-topbar button:hover { text-decoration: underline; }

.dw-form-wrap { flex: 1; display: flex; align-items: center; justify-content: center; padding: 20px 28px; }
.dw-form { width: 100%; max-width: 440px; }

.dw-eyebrow { font-size: 9px; letter-spacing: 0.9px; text-transform: uppercase; color: #5B6458; margin: 0 0 14px; }
.dw-title { font-family: 'Lora', serif; font-weight: 400; font-size: 36px; line-height: 1.15; margin: 0 0 10px; color: #223126; }
.dw-sub { font-size: 12px; color: #6B7280; margin: 0 0 26px; line-height: 1.5; }

.dw-btn-outline {
  width: 100%; padding: 14px 16px; background: #FDFDF9;
  border: 1px solid #D9D8CE; border-radius: 6px;
  font-size: 12px; font-weight: 500; color: #1F2A22; cursor: pointer;
  transition: background .15s, border-color .15s;
}
.dw-btn-outline:hover { background: #F4F3EA; border-color: #C9C8BC; }

.dw-divider { display: flex; align-items: center; gap: 14px; margin: 22px 0 24px; color: #8A8F86; font-size: 10px; }
.dw-divider::before, .dw-divider::after { content: ""; flex: 1; height: 1px; background: #E1E0D6; }

.dw-label { display: block; font-size: 11px; font-weight: 500; color: #2B352D; margin-bottom: 8px; }
.dw-label-row { display: flex; justify-content: space-between; align-items: baseline; }
.dw-link-small {
  background: none; border: none; padding: 0; cursor: pointer;
  font-size: 10px; font-weight: 500; color: #3F5A2E; margin-bottom: 8px;
}
.dw-link-small:hover { text-decoration: underline; }

.dw-input {
  width: 100%; padding: 15px 14px; margin-bottom: 18px;
  background: #FCFCF7; border: 1px solid #D9D8CE; border-radius: 6px;
  font-family: inherit; font-size: 12px; color: #1F2A22; outline: none;
  transition: border-color .15s, box-shadow .15s;
}
.dw-input::placeholder { color: #9A9E96; }
.dw-input:focus { border-color: #4F6B3A; box-shadow: 0 0 0 3px rgba(79, 107, 58, 0.15); }
.dw-input-error,
.dw-input-error:focus {
  border-color: #E2705E;
  box-shadow: 0 0 0 3px rgba(226, 112, 94, 0.15);
}

.dw-pass { position: relative; }
.dw-pass .dw-input { padding-right: 44px; }
.dw-eye {
  position: absolute; right: 8px; top: 8px; width: 32px; height: 32px;
  background: none; border: none; border-radius: 6px; cursor: pointer; color: #4B5563;
  display: inline-flex; align-items: center; justify-content: center;
}
.dw-eye:hover { background: rgba(0,0,0,0.05); }

.dw-check { display: flex; align-items: center; gap: 8px; font-size: 10px; color: #4B5563; margin: -2px 0 22px; cursor: pointer; }
.dw-check input { width: 13px; height: 13px; accent-color: #4F6B3A; margin: 0; }

.dw-btn-primary {
  width: 100%; padding: 15px 16px; background: #52703A; color: #fff;
  border: none; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer;
  transition: background .15s, opacity .15s;
}
.dw-btn-primary:hover:not(:disabled) { background: #46612F; }
.dw-btn-primary:disabled { opacity: .7; cursor: not-allowed; }
.dw-btn-primary:focus-visible, .dw-btn-outline:focus-visible { outline: 2px solid #4F6B3A; outline-offset: 2px; }

.dw-legal { text-align: center; font-size: 9px; line-height: 1.6; color: #7B8077; margin: 26px 0 0; }
.dw-back { text-align: center; margin: 22px 0 0; }
.dw-back button { background: none; border: none; cursor: pointer; font-size: 12px; color: #3F5A2E; font-weight: 500; }
.dw-back button:hover { text-decoration: underline; }

/* ---------- errors & alerts ---------- */
.dw-hint {
  display: flex; align-items: center; gap: 6px;
  margin: -10px 0 14px; font-size: 11px; color: #B4412F;
  animation: dw-fade .2s ease;
}

.dw-alert {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 12px 14px; margin: 0 0 16px;
  border-radius: 10px; border: 1px solid; border-left-width: 4px;
  font-size: 12px; line-height: 1.5;
  animation: dw-slide .25s ease;
}
.dw-alert > svg { flex-shrink: 0; margin-top: 1px; }
.dw-alert > span { flex: 1; }
.dw-alert-error {
  background: #FEF2F0; color: #9B2C1C;
  border-color: #F6CFC8; border-left-color: #E2705E;
}
.dw-alert-success {
  background: #EEF6E8; color: #2F5320;
  border-color: #CFE1C2; border-left-color: #5E9A3F;
}
.dw-alert-close {
  background: none; border: none; padding: 2px; cursor: pointer;
  color: inherit; opacity: .55; border-radius: 4px;
  display: inline-flex; align-items: center; justify-content: center;
}
.dw-alert-close:hover { opacity: 1; background: rgba(0,0,0,0.06); }

@keyframes dw-slide {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes dw-fade {
  from { opacity: 0; } to { opacity: 1; }
}

.dw-footer { text-align: center; font-size: 9px; color: #8A8F86; margin: 0; padding: 0 0 22px; }

/* ---------- responsive ---------- */
@media (max-width: 900px) {
  .dw-left { display: none; }
  .dw-topbar { padding: 18px 22px; }
}
@media (prefers-reduced-motion: reduce) {
  .dw-root * { transition: none !important; }
  .dw-alert, .dw-hint { animation: none !important; }
}
  
`;

export default Login;
