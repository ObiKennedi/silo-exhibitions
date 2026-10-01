"use client";

import { createAuthClient } from "better-auth/react";
import { adminClient, twoFactorClient, emailOTPClient } from "better-auth/client/plugins";
import { ac, roles } from "@/lib/permissions";

export const authClient = createAuthClient({
  plugins: [
    adminClient({ ac, roles }),
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = "/staff/two-factor";
      },
    }),
    emailOTPClient(),
  ],
});

export const { signIn, signOut, useSession, linkSocial } = authClient;

/**
 * Initiates the Google OAuth sign-in flow.
 */
export async function signInWithGoogle(options?: {
  callbackURL?: string;
  errorCallbackURL?: string;
}) {
  return await authClient.signIn.social({
    provider: "google",
    callbackURL: options?.callbackURL ?? "/dashboard",
    errorCallbackURL: options?.errorCallbackURL ?? "/login?error=oauth",
  });
}

/**
 * Links a Google account to an already logged-in user profile.
 */
export async function linkGoogleAccount(options?: {
  callbackURL?: string;
  errorCallbackURL?: string;
}) {
  return await authClient.linkSocial({
    provider: "google",
    callbackURL: options?.callbackURL ?? "/staff/settings",
    errorCallbackURL: options?.errorCallbackURL ?? "/staff/settings?error=link_failed",
  });
}