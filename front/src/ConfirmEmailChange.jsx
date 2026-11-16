import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "./api";

export default function ConfirmEmailChange() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const response = await api.post(
          `/auth/confirm-email-change/${token}`
        );

        setMessage(response.data.message);
        setSuccess(true);
      } catch (error) {
        setMessage(
          error.response?.data?.message ||
          "Email verification failed. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    confirmEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        <div className="mb-4 text-4xl">
          {loading ? "⏳" : success ? "✓" : "✕"}
        </div>

        <h1 className="mb-3 text-2xl font-bold text-gray-800">
          {loading
            ? "Verifying your email..."
            : success
            ? "Email Changed Successfully!"
            : "Verification Failed"}
        </h1>

        <p className="mb-6 text-gray-600">
          {loading
            ? "Please wait while we verify your new email address."
            : message}
        </p>

        {!loading && (
          <button
            onClick={() => navigate("/")}
            className="rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700"
          >
            Go to Login
          </button>
        )}
      </div>
    </div>
  );
}