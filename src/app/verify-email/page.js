"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [message, setMessage] = useState("Verifying your email...");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function verifyEmail() {
      if (!token) {
        setMessage("Invalid verification link");
        return;
      }

      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await res.json();

        if (res.ok) {
          setSuccess(true);
          setMessage(data.message);
        } else {
          setMessage(data.message);
        }
      } catch (error) {
        setMessage("Something went wrong");
      }
    }

    verifyEmail();
  }, [token]);

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg text-center">
      <h1 className="text-2xl font-bold mb-4">Email Verification</h1>
      <p className={success ? "text-green-600" : "text-red-600"}>
        {message}
      </p>
      {success && (
        <a
          href="/login"
          className="inline-block mt-5 bg-blue-600 text-white px-5 py-2 rounded-lg"
        >
          Go to Login
        </a>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Suspense fallback={<p>Loading...</p>}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}