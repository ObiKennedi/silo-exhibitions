"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

import { registerAction } from "@/app/actions/auth-actions";
import { signInWithGoogle } from "@/lib/auth-client";
import { AuthErrorCard } from "@/components/auth/AuthErrorCard";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [isGooglePending, setIsGooglePending] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setWarningMsg(null);
    setUnverifiedEmail(null);

    startTransition(async () => {
      const res = await registerAction({
        name,
        email,
        password,
      });

      if (!res.success) {
        if (res.unverified && res.email) {
          setUnverifiedEmail(res.email);
          setWarningMsg(res.message || "An unverified account already exists. We resent a verification code.");
        } else {
          setErrorMsg(res.error || "Unable to create account. Please check your details.");
        }
        return;
      }

      // Successful registration -> Navigate to OTP verification page
      router.push(`/verify-otp?email=${encodeURIComponent(email)}&reason=signup`);
    });
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsGooglePending(true);
      setErrorMsg(null);
      // Google OAuth automatically verifies email
      await signInWithGoogle({ callbackURL: "/dashboard" });
    } catch (err: any) {
      setIsGooglePending(false);
      setErrorMsg(err?.message || "Google sign up failed. Please try again.");
    }
  };

  return (
    <>
      <div className="auth-title-section">
        <h1 className="auth-main-title">CREATE <mark>ACCOUNT</mark></h1>
      </div>

      {errorMsg && (
        <AuthErrorCard
          type="error"
          title="Registration Error"
          message={errorMsg}
          onClose={() => setErrorMsg(null)}
        />
      )}

      {warningMsg && (
        <AuthErrorCard
          type="warning"
          title="Account Exists"
          message={warningMsg}
          actionText="Verify your email"
          actionHref={`/verify-otp?email=${encodeURIComponent(unverifiedEmail || email)}`}
        />
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="auth-form-group">
          <label className="auth-label" htmlFor="register-name">
            Full Name
          </label>
          <div className="auth-input-wrapper">
            <input
              id="register-name"
              type="text"
              required
              autoComplete="name"
              placeholder="e.g. Jane Doe"
              className="auth-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending || isGooglePending}
            />
          </div>
        </div>

        <div className="auth-form-group">
          <label className="auth-label" htmlFor="register-email">
            Email
          </label>
          <div className="auth-input-wrapper">
            <input
              id="register-email"
              type="email"
              required
              autoComplete="email"
              placeholder="Enter your email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending || isGooglePending}
            />
          </div>
        </div>

        <div className="auth-form-group">
          <label className="auth-label" htmlFor="register-password">
            Password
          </label>
          <div className="auth-input-wrapper">
            <input
              id="register-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              placeholder="At least 8 characters"
              className="auth-input with-icon-right"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isPending || isGooglePending}
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

        <button
          type="submit"
          className="auth-submit-btn"
          disabled={isPending || isGooglePending}
          style={{ marginTop: 8 }}
        >
          {isPending ? (
            <>
              <Loader2 className="auth-spinner" size={18} />
              <span>Creating account...</span>
            </>
          ) : (
            <span>Create Account</span>
          )}
        </button>

        <button
          type="button"
          className="auth-google-btn"
          onClick={handleGoogleSignUp}
          disabled={isPending || isGooglePending}
        >
          {isGooglePending ? (
            <Loader2 className="auth-spinner" size={18} />
          ) : (
            <FcGoogle className="google-icon" />
          )}
          <span>Sign In with Google</span>
        </button>
      </form>

      <div className="auth-switch-footer">
        Already have an account?{" "}
        <Link href="/login" className="auth-switch-link">
          Sign In
        </Link>
      </div>
    </>
  );
}
