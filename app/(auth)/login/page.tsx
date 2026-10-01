"use client";

import React, { useState, useTransition, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

import { loginAction } from "@/app/actions/auth-actions";
import { signInWithGoogle } from "@/lib/auth-client";
import { AuthErrorCard } from "@/components/auth/AuthErrorCard";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackParam = searchParams.get("callbackURL");
  const redirectDestination = callbackParam
    ? `/dashboard?callbackURL=${encodeURIComponent(callbackParam)}`
    : "/dashboard";
  const verifiedNotice = searchParams.get("verified");

  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
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
      const res = await loginAction({
        email,
        password,
        rememberMe,
      });

      if (!res.success) {
        if (res.unverified && res.email) {
          setUnverifiedEmail(res.email);
          setWarningMsg(
            res.message ||
              "Your email is not verified yet. We have sent a fresh 6-digit verification code to your inbox."
          );
        } else {
          setErrorMsg(res.error || "Failed to sign in. Please verify your credentials.");
        }
        return;
      }

      router.push(redirectDestination);
      router.refresh();
    });
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGooglePending(true);
      setErrorMsg(null);
      await signInWithGoogle({ callbackURL: redirectDestination });
    } catch (err: any) {
      setIsGooglePending(false);
      setErrorMsg(err?.message || "Google sign in failed. Please try again.");
    }
  };

  return (
    <>
      <div className="auth-title-section">
        <span className="auth-fun-kicker">welcome back ~</span>
        <h1 className="auth-main-title">SIGN <mark>IN</mark></h1>
        <p className="auth-sub-title">
          Enter your email and password to access your account
        </p>
      </div>

      {verifiedNotice && (
        <AuthErrorCard
          type="success"
          title="Account Verified"
          message="Your email address has been verified! You can now sign in."
        />
      )}

      {errorMsg && (
        <AuthErrorCard
          type="error"
          title="Sign In Error"
          message={errorMsg}
          onClose={() => setErrorMsg(null)}
        />
      )}

      {warningMsg && (
        <AuthErrorCard
          type="warning"
          title="Email Verification Required"
          message={warningMsg}
          actionText="Enter verification code"
          actionHref={`/verify-otp?email=${encodeURIComponent(unverifiedEmail || email)}`}
        />
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="auth-form-group">
          <label className="auth-label" htmlFor="login-email">
            Email
          </label>
          <div className="auth-input-wrapper">
            <input
              id="login-email"
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
          <label className="auth-label" htmlFor="login-password">
            Password
          </label>
          <div className="auth-input-wrapper">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
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

        <div className="auth-options-row">
          <label className="auth-checkbox-label" htmlFor="remember-me">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isPending || isGooglePending}
            />
            <span>Remember me</span>
          </label>

          <Link href="/forgot-password" className="auth-forgot-link">
            Forgot Password
          </Link>
        </div>

        <button
          type="submit"
          className="auth-submit-btn"
          disabled={isPending || isGooglePending}
        >
          {isPending ? (
            <>
              <Loader2 className="auth-spinner" size={18} />
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </button>

        <button
          type="button"
          className="auth-google-btn"
          onClick={handleGoogleSignIn}
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
        Don&apos;t have an account?{" "}
        <Link href="/register" className="auth-switch-link">
          Sign Up
        </Link>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Loader2 className="auth-spinner" size={28} style={{ color: "#0f172a" }} />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

