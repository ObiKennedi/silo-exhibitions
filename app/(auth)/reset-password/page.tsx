"use client";

import React, { useState, useTransition, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";

import { resetPasswordAction, resendOtpAction } from "@/app/actions/auth-actions";
import { AuthErrorCard } from "@/components/auth/AuthErrorCard";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [isResending, setIsResending] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6) {
      setErrorMsg("Please enter the complete 6-digit reset code.");
      return;
    }

    if (!password || password.length < 8) {
      setErrorMsg("New password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please verify.");
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);

    startTransition(async () => {
      const res = await resetPasswordAction({
        email,
        otp: cleanOtp,
        password,
      });

      if (!res.success) {
        setErrorMsg(res.error || "Failed to reset password. Please check your code.");
        return;
      }

      setSuccessMsg("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        router.push(`/login?email=${encodeURIComponent(email)}`);
      }, 1500);
    });
  };

  const handleResend = async () => {
    if (!email || !email.includes("@") || isResending) return;

    try {
      setIsResending(true);
      setErrorMsg(null);
      const res = await resendOtpAction({
        email,
        type: "forget-password",
      });

      if (!res.success) {
        setErrorMsg(res.error || "Failed to resend reset code.");
        return;
      }

      setSuccessMsg("A new 6-digit password reset code has been sent to your email.");
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to resend code.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      <div className="auth-title-section">
        <span className="auth-fun-kicker">one last step ~</span>
        <h1 className="auth-main-title">RESET <mark>PASSWORD</mark></h1>
        <p className="auth-sub-title">
          {email ? (
            <>
              Enter the 6-digit reset code sent to<br />
              <strong style={{ color: "#0f172a" }}>{email}</strong>
            </>
          ) : (
            "Enter the 6-digit code from your email and your new password"
          )}
        </p>
      </div>

      {successMsg && (
        <AuthErrorCard
          type="success"
          title="Success"
          message={successMsg}
          onClose={() => setSuccessMsg(null)}
        />
      )}

      {errorMsg && (
        <AuthErrorCard
          type="error"
          title="Reset Error"
          message={errorMsg}
          onClose={() => setErrorMsg(null)}
        />
      )}

      <form onSubmit={handleSubmit} noValidate>
        {!initialEmail && (
          <div className="auth-form-group">
            <label className="auth-label" htmlFor="reset-email">
              Email Address
            </label>
            <div className="auth-input-wrapper">
              <input
                id="reset-email"
                type="email"
                required
                autoComplete="email"
                placeholder="Enter your email"
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending || isResending}
              />
            </div>
          </div>
        )}

        <div className="auth-form-group">
          <label className="auth-label" htmlFor="reset-otp">
            6-Digit Reset Code
          </label>
          <div className="auth-input-wrapper">
            <input
              id="reset-otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              required
              autoComplete="one-time-code"
              placeholder="123456"
              className="auth-input"
              style={{ letterSpacing: "4px", fontWeight: 600, fontSize: "16px" }}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              disabled={isPending || isResending}
            />
          </div>
        </div>

        <div className="auth-form-group">
          <label className="auth-label" htmlFor="reset-new-password">
            New Password
          </label>
          <div className="auth-input-wrapper">
            <input
              id="reset-new-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              placeholder="At least 8 characters"
              className="auth-input with-icon-right"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isPending || isResending}
            />
            <button
              type="button"
              className="auth-input-icon-btn"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="auth-form-group">
          <label className="auth-label" htmlFor="reset-confirm-password">
            Confirm New Password
          </label>
          <div className="auth-input-wrapper">
            <input
              id="reset-confirm-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              placeholder="Re-enter new password"
              className="auth-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isPending || isResending}
            />
          </div>
        </div>

        <button
          type="submit"
          className="auth-submit-btn"
          disabled={isPending || isResending}
          style={{ marginTop: 8 }}
        >
          {isPending ? (
            <>
              <Loader2 className="auth-spinner" size={18} />
              <span>Resetting password...</span>
            </>
          ) : (
            <>
              <Check size={18} />
              <span>Reset Password</span>
            </>
          )}
        </button>

        <div className="otp-resend-row">
          <span>Didn&apos;t get the code?</span>
          <button
            type="button"
            onClick={handleResend}
            className="resend-btn"
            disabled={isResending || isPending}
          >
            {isResending ? "Sending..." : "Resend Code"}
          </button>
        </div>
      </form>

      <div className="auth-switch-footer">
        Remember your password?{" "}
        <Link href="/login" className="auth-switch-link">
          Back to Sign In
        </Link>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Loader2 className="auth-spinner" size={28} style={{ color: "#0f172a" }} />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}

