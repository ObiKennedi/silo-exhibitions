"use client";

import React, { useState, useEffect, useRef, useTransition, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, MailCheck, RotateCcw } from "lucide-react";

import { verifyOtpAction, resendOtpAction } from "@/app/actions/auth-actions";
import { AuthErrorCard } from "@/components/auth/AuthErrorCard";

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";
  const reason = searchParams.get("reason");

  const [email, setEmail] = useState(initialEmail);
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [cooldown, setCooldown] = useState(60);
  const [isPending, startTransition] = useTransition();
  const [isResending, setIsResending] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(
    reason === "signup"
      ? "Account created! Please enter the 6-digit code sent to your email."
      : null
  );

  // Countdown timer for resend button
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Focus the first input on load
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleDigitChange = (index: number, value: string) => {
    // Handle paste of full or partial code
    if (value.length > 1) {
      const pastedDigits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newDigits = [...digits];
      pastedDigits.forEach((d, i) => {
        if (index + i < 6) {
          newDigits[index + i] = d;
        }
      });
      setDigits(newDigits);
      const nextIdx = Math.min(index + pastedDigits.length, 5);
      inputRefs.current[nextIdx]?.focus();
      return;
    }

    // Only allow numbers
    const cleanValue = value.replace(/\D/g, "");
    const newDigits = [...digits];
    newDigits[index] = cleanValue;
    setDigits(newDigits);

    // Auto-advance
    if (cleanValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length !== 6) {
      setErrorMsg("Please enter all 6 digits of the verification code.");
      return;
    }

    if (!email || !email.includes("@")) {
      setErrorMsg("Please provide a valid email address.");
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);

    startTransition(async () => {
      const res = await verifyOtpAction({
        email,
        otp,
      });

      if (!res.success) {
        setErrorMsg(res.error || "Verification failed. Please check your code.");
        return;
      }

      setSuccessMsg("Email verified successfully! Taking you there...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    });
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address to receive a code.");
      return;
    }

    try {
      setIsResending(true);
      setErrorMsg(null);
      const res = await resendOtpAction({
        email,
        type: "email-verification",
      });

      if (!res.success) {
        setErrorMsg(res.error || "Failed to resend code.");
        return;
      }

      setSuccessMsg("A fresh 6-digit code has been sent to your email!");
      setCooldown(60);
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to resend code.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      <div className="auth-title-section">
        <span className="auth-fun-kicker">check your inbox ~</span>
        <h1 className="auth-main-title">VERIFY <mark>EMAIL</mark></h1>
        <p className="auth-sub-title">
          {email ? (
            <>
              We sent a 6-digit verification code to<br />
              <strong style={{ color: "#0f172a" }}>{email}</strong>
            </>
          ) : (
            "Enter the 6-digit code sent to your email"
          )}
        </p>
      </div>

      {successMsg && (
        <AuthErrorCard
          type="success"
          title="Notification"
          message={successMsg}
          onClose={() => setSuccessMsg(null)}
        />
      )}

      {errorMsg && (
        <AuthErrorCard
          type="error"
          title="Verification Error"
          message={errorMsg}
          onClose={() => setErrorMsg(null)}
        />
      )}

      <form onSubmit={handleSubmit} noValidate>
        {!initialEmail && (
          <div className="auth-form-group">
            <label className="auth-label" htmlFor="otp-email">
              Confirm Email Address
            </label>
            <div className="auth-input-wrapper">
              <input
                id="otp-email"
                type="email"
                required
                placeholder="Enter your email"
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending || isResending}
              />
            </div>
          </div>
        )}

        <div className="otp-inputs-grid">
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              autoComplete="one-time-code"
              className="otp-single-digit"
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              disabled={isPending || isResending}
              aria-label={`Digit ${idx + 1}`}
            />
          ))}
        </div>

        <button
          type="submit"
          className="auth-submit-btn"
          disabled={isPending || isResending || digits.join("").length !== 6}
        >
          {isPending ? (
            <>
              <Loader2 className="auth-spinner" size={18} />
              <span>Verifying...</span>
            </>
          ) : (
            <>
              <MailCheck size={18} />
              <span>Verify Code</span>
            </>
          )}
        </button>

        <div className="otp-resend-row">
          <span>Didn&apos;t receive the code?</span>
          {cooldown > 0 ? (
            <span className="cooldown-text">Resend in {cooldown}s</span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="resend-btn"
              disabled={isResending}
            >
              {isResending ? "Sending..." : "Resend Code"}
            </button>
          )}
        </div>
      </form>

      <div className="auth-switch-footer">
        Entered the wrong email?{" "}
        <Link href="/login" className="auth-switch-link">
          Back to Sign In
        </Link>
      </div>
    </>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Loader2 className="auth-spinner" size={28} style={{ color: "#0f172a" }} />
        </div>
      }
    >
      <VerifyOtpForm />
    </Suspense>
  );
}

