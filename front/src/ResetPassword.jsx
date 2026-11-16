import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  LockKeyhole,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft
} from "lucide-react";
import api from "./api";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [status, setStatus] = useState("waiting");
  const [message, setMessage] = useState("");

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  const resetPassword = async () => {
    setMessage("");

    if (!password || !confirmPassword) {
      setMessage("Please fill in both fields.");
      return;
    }

    if (!passwordRegex.test(password)) {
      setMessage(
        "Password must be at least 8 characters and include uppercase, lowercase and a number."
      );
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setStatus("loading");

      const response = await api.post(
        `/auth/reset-password/${token}`,
        { password }
      );

      setStatus("success");
      setMessage(response.data);

    
} catch (error) {
  console.error("RESET PASSWORD ERROR:", error.response?.data);
  console.error("RESET PASSWORD STATUS:", error.response?.status);

  setStatus("error");

  const serverMessage = error.response?.data;

  setMessage(
    typeof serverMessage === "string"
      ? serverMessage
      : serverMessage?.message || "This reset link is invalid or has expired."
  );
}

  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-6">

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-500 text-white shadow-lg shadow-purple-200">
            <LockKeyhole size={30} />
          </div>

          <h1 className="mt-3 text-xl font-bold text-gray-800">
            Life Organizer
          </h1>

        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-purple-100/60 border border-purple-100 p-8">

          {/* WAITING */}
          {status === "waiting" && (
            <>
              <div className="text-center">

                <h2 className="text-2xl font-bold text-gray-800">
                  Create a new password
                </h2>

                <p className="text-gray-500 mt-3 leading-relaxed">
                  Choose a strong password for your Life Organizer account.
                </p>

              </div>

              {/* Password */}
              <div className="mt-7">

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New password
                </label>

                <div className="relative">

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setMessage("");
                    }}
                    placeholder="Enter your new password"
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-500"
                  >
                    {showPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>

                </div>

              </div>

              {/* Confirm password */}
              <div className="mt-4">

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm password
                </label>

                <div className="relative">

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setMessage("");
                    }}
                    placeholder="Confirm your new password"
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-500"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>

                </div>

              </div>

              {/* Error */}
              {message && (
                <p className="text-red-500 text-sm mt-4">
                  {message}
                </p>
              )}

              {/* Requirements */}
              <div className="mt-5 bg-purple-50 rounded-xl p-4">
<p
  className="text-sm font-semibold mb-2"
  style={{ color: "#374151" }}
>
  Password requirements
</p>
                <p className="text-xs"
style={{ color: "#6B7280" }}>
                  • At least 8 characters
                </p>

                <p className="text-xs"
style={{ color: "#6B7280" }}>
                  • One uppercase letter
                </p>

                <p className="text-xs"
style={{ color: "#6B7280" }}>
                  • One lowercase letter
                </p>

                <p className="text-xs"
style={{ color: "#6B7280" }}>
                  • One number
                </p>

              </div>

              <button
                onClick={resetPassword}
                className="mt-6 w-full py-3.5 rounded-xl bg-purple-500 text-white font-semibold hover:bg-purple-600 active:scale-[0.98] transition-all shadow-md shadow-purple-200"
              >
                Reset password
              </button>

              <button
                onClick={() => navigate("/")}
                className="mt-4 w-full text-sm text-gray-500 hover:text-purple-500"
              >
                <span className="flex items-center justify-center gap-2">
                  <ArrowLeft size={16} />
                  Back to login
                </span>
              </button>

            </>
          )}

          {/* LOADING */}
          {status === "loading" && (
            <div className="text-center">

              <div className="w-16 h-16 mx-auto rounded-full bg-purple-50 flex items-center justify-center">

                <Loader2
                  size={34}
                  className="text-purple-500 animate-spin"
                />

              </div>

              <h2 className="text-2xl font-bold text-gray-800 mt-5">
                Updating your password
              </h2>

              <p className="text-gray-500 mt-3">
                Please wait a moment...
              </p>

            </div>
          )}

          {/* SUCCESS */}
          {status === "success" && (
            <div className="text-center">

              <div className="w-16 h-16 mx-auto rounded-full bg-green-50 flex items-center justify-center">

                <CheckCircle
                  size={36}
                  className="text-green-500"
                />

              </div>

              <h2 className="text-2xl font-bold text-gray-800 mt-5">
                Password changed!
              </h2>

              <p className="text-gray-500 mt-3 leading-relaxed">
                Your password has been updated successfully.
                You can now sign in with your new password.
              </p>

              <button
                onClick={() => navigate("/")}
                className="mt-7 w-full py-3.5 rounded-xl bg-purple-500 text-white font-semibold hover:bg-purple-600"
              >
                Back to Login
              </button>

            </div>
          )}

          {/* ERROR */}
          {status === "error" && (
            <div className="text-center">

              <div className="w-16 h-16 mx-auto rounded-full bg-red-50 flex items-center justify-center">

                <XCircle
                  size={36}
                  className="text-red-500"
                />

              </div>

              <h2 className="text-2xl font-bold text-gray-800 mt-5">
                Link unavailable
              </h2>

              <p className="text-gray-500 mt-3 leading-relaxed">
                {message}
              </p>

              <button
                onClick={() => navigate("/")}
                className="mt-7 w-full py-3.5 rounded-xl bg-gray-800 text-white font-semibold hover:bg-gray-900"
              >
                Back to Login
              </button>

            </div>
          )}

        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} Life Organizer
        </p>

      </div>

    </div>
  );
};

export default ResetPassword;