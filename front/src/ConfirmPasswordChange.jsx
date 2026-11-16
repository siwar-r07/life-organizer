import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Loader2,
  ShieldCheck,
  ArrowLeft
} from "lucide-react";
import api from "./api";

const ConfirmPasswordChange = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("waiting");
  const [message, setMessage] = useState("");

  const confirmPasswordChange = async () => {
    try {
      setStatus("loading");

      const response = await api.post(
        `/auth/confirm-password-change/${token}`
      );

      setStatus("success");
      setMessage(response.data);

    } catch (error) {
      setStatus("error");

      setMessage(
        error.response?.data ||
          "This confirmation link is invalid or has expired."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-500 text-white shadow-lg shadow-purple-200">
            <ShieldCheck size={30} />
          </div>

          <h1 className="mt-3 text-xl font-bold text-gray-800">
            Life Organizer
          </h1>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-purple-100/60 border border-purple-100 p-8 text-center">

          {/* WAITING */}
          {status === "waiting" && (
            <>
              <div className="w-16 h-16 mx-auto rounded-full bg-purple-50 flex items-center justify-center">
                <ShieldCheck
                  size={34}
                  className="text-purple-500"
                />
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mt-5">
                Confirm password change
              </h2>

              <p className="text-gray-500 mt-3 leading-relaxed">
                You requested to change your Life Organizer password.
                Click below to confirm this change.
              </p>

              <button
                onClick={confirmPasswordChange}
                className="mt-7 w-full py-3.5 rounded-xl bg-purple-500 text-white font-semibold hover:bg-purple-600 active:scale-[0.98] transition-all shadow-md shadow-purple-200"
              >
                Confirm password change
              </button>

              <p className="text-xs text-gray-400 mt-4">
                This confirmation link expires in 15 minutes.
              </p>
            </>
          )}

          {/* LOADING */}
          {status === "loading" && (
            <>
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
            </>
          )}

          {/* SUCCESS */}
          {status === "success" && (
            <>
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
                className="mt-7 w-full py-3.5 rounded-xl bg-purple-500 text-white font-semibold hover:bg-purple-600 active:scale-[0.98] transition-all shadow-md shadow-purple-200"
              >
                Back to Login
              </button>
            </>
          )}

          {/* ERROR */}
          {status === "error" && (
            <>
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
                className="mt-7 w-full py-3.5 rounded-xl bg-gray-800 text-white font-semibold hover:bg-gray-900 active:scale-[0.98] transition-all"
              >
                <span className="flex items-center justify-center gap-2">
                  <ArrowLeft size={18} />
                  Back to Login
                </span>
              </button>
            </>
          )}

        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} Life Organizer
        </p>

      </div>
    </div>
  );
};

export default ConfirmPasswordChange;