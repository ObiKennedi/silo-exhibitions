"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, KeyRound } from "lucide-react";

import { forgotPasswordAction } from "@/app/actions/auth-actions";
import { AuthErrorCard } from "@/components/auth/AuthErrorCard";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setErrorMsg(null);

    startTransition(async () => {
      const res = await forgotPasswordAction({ email });

      if (!res.success) {
        setErrorMsg(res.error || "Unable to send reset code. Please try again.");
        return;
      }

      // Navigate to reset password page with email filled
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    });
  };

  return (
    <>
      <div className="auth-title-section">
        <span className="auth-fun-kicker">don&apos;t worry ~</span>
        <h1 className="auth-main-title">FORGOT <mark>PASSWORD</mark>?</h1>
        <p className="auth-sub-title">
          Enter your email address and we&apos;ll send you a 6-digit code to reset your password
        </p>
      </div>

      {errorMsg && (
        <AuthErrorCard
          type="error"
          title="Request Error"
          message={errorMsg}
          onClose={() => setErrorMsg(null)}
        />
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="auth-form-group">
          <label className="auth-label" htmlFor="forgot-email">
            Email Address
          </label>
          <div className="auth-input-wrapper">
            <input
              id="forgot-email"
              type="email"
              required
              autoComplete="email"
              placeholder="Enter your email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
            />
          </div>
        </div>

        <button
          type="submit"
          className="auth-submit-btn"
          disabled={isPending}
          style={{ marginTop: 8 }}
        >
          {isPending ? (
            <>
              <Loader2 className="auth-spinner" size={18} />
              <span>Sending code...</span>
            </>
          ) : (
            <>
              <KeyRound size={18} />
              <span>Send Reset Code</span>
            </>
          )}
        </button>
      </form>

      <div className="auth-switch-footer">
        Remember your password?{" "}
        <Link href="/login" className="auth-switch-link">
          Sign In
        </Link>
      </div>
    </>
  );
}
