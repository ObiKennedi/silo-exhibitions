"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface AuthActionResult {
  success: boolean;
  message?: string;
  error?: string;
  unverified?: boolean;
  email?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

/**
 * Register a new user account with email and password.
 * Automatically dispatches a 6-digit OTP verification email via Better Auth emailOTP plugin.
 */
export async function registerAction(data: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthActionResult> {
  try {
    const { name, email, password } = data;

    if (!name || name.trim().length < 2) {
      return { success: false, error: "Please provide a valid full name (at least 2 characters)." };
    }
    if (!email || !email.includes("@")) {
      return { success: false, error: "Please enter a valid email address." };
    }
    if (!password || password.length < 8) {
      return { success: false, error: "Password must be at least 8 characters long." };
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      // If user exists and is already verified
      if (existing.emailVerified) {
        return {
          success: false,
          error: "An account with this email already exists. Please sign in instead.",
        };
      }

      // If user exists but is not verified, resend OTP
      await auth.api.sendVerificationOTP({
        body: {
          email: normalizedEmail,
          type: "email-verification",
        },
      });

      return {
        success: false,
        unverified: true,
        email: normalizedEmail,
        message: "An unverified account already exists with this email. We have resent a new verification code.",
      };
    }

    // Call Better Auth signUpEmail (triggers sendVerificationOTP automatically)
    const reqHeaders = await headers();
    await auth.api.signUpEmail({
      body: {
        name: name.trim(),
        email: normalizedEmail,
        password,
      },
      headers: reqHeaders,
    });

    return {
      success: true,
      email: normalizedEmail,
      message: "Account created! A 6-digit verification code has been sent to your email.",
    };
  } catch (err: any) {
    console.error("[AuthAction] Register error:", err);
    const errorMessage =
      err?.message ||
      err?.body?.message ||
      "Unable to create account. Please verify your details and try again.";
    return { success: false, error: errorMessage };
  }
}

/**
 * Sign in an existing user with email and password.
 * If user account is unverified, automatically resends fresh OTP and returns unverified status.
 */
export async function loginAction(data: {
  email: string;
  password: string;
  rememberMe?: boolean;
}): Promise<AuthActionResult> {
  try {
    const { email, password, rememberMe = true } = data;

    if (!email || !email.includes("@")) {
      return { success: false, error: "Please enter a valid email address." };
    }
    if (!password) {
      return { success: false, error: "Please enter your password." };
    }

    const normalizedEmail = email.toLowerCase().trim();
    const reqHeaders = await headers();

    try {
      const result = await auth.api.signInEmail({
        body: {
          email: normalizedEmail,
          password,
          rememberMe,
        },
        headers: reqHeaders,
      });

      return {
        success: true,
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
        },
      };
    } catch (signInErr: any) {
      const errCode = signInErr?.code || signInErr?.body?.code || signInErr?.message || "";

      // Check if the error is due to unverified email
      if (
        errCode === "EMAIL_NOT_VERIFIED" ||
        errCode.toLowerCase().includes("not verified") ||
        errCode.toLowerCase().includes("email_not_verified")
      ) {
        // Automatically resend OTP as explicitly requested by user
        try {
          await auth.api.sendVerificationOTP({
            body: {
              email: normalizedEmail,
              type: "email-verification",
            },
          });
        } catch (otpErr) {
          console.error("[AuthAction] Failed to auto-resend OTP during unverified login:", otpErr);
        }

        return {
          success: false,
          unverified: true,
          email: normalizedEmail,
          message:
            "Your email address is not verified yet. We have resent a fresh 6-digit verification code to your email.",
        };
      }

      // Check if user exists in DB and is unverified (in case Better Auth returned generic error)
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (user && !user.emailVerified) {
        // Check if password matches
        try {
          await auth.api.sendVerificationOTP({
            body: {
              email: normalizedEmail,
              type: "email-verification",
            },
          });
        } catch (otpErr) {
          console.error("[AuthAction] Failed to auto-resend OTP:", otpErr);
        }

        return {
          success: false,
          unverified: true,
          email: normalizedEmail,
          message:
            "Your email address is not verified yet. We have sent a fresh 6-digit verification code to your email.",
        };
      }

      return {
        success: false,
        error: "Invalid email or password. Please try again.",
      };
    }
  } catch (err: any) {
    console.error("[AuthAction] Login error:", err);
    return {
      success: false,
      error: err?.message || "An unexpected error occurred during sign in.",
    };
  }
}

/**
 * Verify 6-digit OTP code for email verification.
 */
export async function verifyOtpAction(data: {
  email: string;
  otp: string;
}): Promise<AuthActionResult> {
  try {
    const { email, otp } = data;
    if (!email || !otp) {
      return { success: false, error: "Email and 6-digit OTP code are required." };
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = otp.trim();

    if (cleanOtp.length !== 6) {
      return { success: false, error: "Please enter the complete 6-digit code." };
    }

    const reqHeaders = await headers();
    await auth.api.verifyEmailOTP({
      body: {
        email: normalizedEmail,
        otp: cleanOtp,
      },
      headers: reqHeaders,
    });

    // Explicitly guarantee prisma user record is marked emailVerified
    await prisma.user.updateMany({
      where: { email: normalizedEmail },
      data: { emailVerified: true },
    });

    return {
      success: true,
      email: normalizedEmail,
      message: "Email successfully verified! You can now sign in.",
    };
  } catch (err: any) {
    console.error("[AuthAction] Verify OTP error:", err);
    const code = err?.body?.code || err?.code || "";
    let msg = "Invalid or expired verification code. Please request a new one.";
    if (code === "OTP_EXPIRED") {
      msg = "Your verification code has expired. Please click 'Resend Code'.";
    } else if (code === "INVALID_OTP") {
      msg = "The code you entered is incorrect. Please check and try again.";
    }
    return { success: false, error: msg };
  }
}

/**
 * Resend a fresh 6-digit OTP code.
 */
export async function resendOtpAction(data: {
  email: string;
  type?: "email-verification" | "forget-password";
}): Promise<AuthActionResult> {
  try {
    const { email, type = "email-verification" } = data;
    if (!email || !email.includes("@")) {
      return { success: false, error: "Please provide a valid email address." };
    }

    const normalizedEmail = email.toLowerCase().trim();

    await auth.api.sendVerificationOTP({
      body: {
        email: normalizedEmail,
        type,
      },
    });

    return {
      success: true,
      message: "A new 6-digit verification code has been dispatched to your inbox.",
    };
  } catch (err: any) {
    console.error("[AuthAction] Resend OTP error:", err);
    return {
      success: false,
      error:
        err?.message ||
        "Too many requests. Please wait a minute before requesting another code.",
    };
  }
}

/**
 * Request password reset OTP.
 */
export async function forgotPasswordAction(data: {
  email: string;
}): Promise<AuthActionResult> {
  try {
    const { email } = data;
    if (!email || !email.includes("@")) {
      return { success: false, error: "Please enter a valid email address." };
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Send OTP for forget-password
    await auth.api.sendVerificationOTP({
      body: {
        email: normalizedEmail,
        type: "forget-password",
      },
    });

    return {
      success: true,
      email: normalizedEmail,
      message: "If an account exists with this email, a 6-digit password reset code has been sent.",
    };
  } catch (err: any) {
    console.error("[AuthAction] Forgot password error:", err);
    return {
      success: false,
      error:
        err?.message ||
        "Unable to send reset code. Please wait a moment and try again.",
    };
  }
}

/**
 * Reset password using 6-digit OTP code.
 */
export async function resetPasswordAction(data: {
  email: string;
  otp: string;
  password: string;
}): Promise<AuthActionResult> {
  try {
    const { email, otp, password } = data;

    if (!email || !email.includes("@")) {
      return { success: false, error: "Invalid email address." };
    }
    if (!otp || otp.trim().length !== 6) {
      return { success: false, error: "Please enter the complete 6-digit reset code." };
    }
    if (!password || password.length < 8) {
      return { success: false, error: "Password must be at least 8 characters long." };
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = otp.trim();

    const reqHeaders = await headers();
    await auth.api.resetPasswordEmailOTP({
      body: {
        email: normalizedEmail,
        otp: cleanOtp,
        password,
      },
      headers: reqHeaders,
    });

    return {
      success: true,
      message: "Your password has been successfully reset! You can now log in.",
    };
  } catch (err: any) {
    console.error("[AuthAction] Reset password error:", err);
    const code = err?.body?.code || err?.code || "";
    let msg = "Failed to reset password. Please verify your OTP code.";
    if (code === "OTP_EXPIRED") {
      msg = "Your reset code has expired. Please request a new one.";
    } else if (code === "INVALID_OTP") {
      msg = "The reset code you entered is invalid. Please try again.";
    }
    return { success: false, error: msg };
  }
}
