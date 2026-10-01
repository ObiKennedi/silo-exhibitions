"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useSession } from "@/lib/auth-client";
import "@/styles/RedirectPage.scss";

function DashboardRedirectContent() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackURL = searchParams.get("callbackURL");

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.replace("/login");
      return;
    }

    if (callbackURL) {
      router.replace(callbackURL);
      return;
    }

    const role = (session.user.role as string | undefined)?.toUpperCase();

    // Redistribute based on user role
    if (
      role === "ADMIN" ||
      role === "SUPER_ADMIN" ||
      role === "EVENT_MANAGER" ||
      role === "GATE_STAFF" ||
      role === "LOGISTICS_LEAD"
    ) {
      router.replace("/admin");
    } else {
      router.replace("/home");
    }
  }, [session, isPending, router, callbackURL]);

  return (
    <div className="redirect-screen" role="status" aria-live="polite">
      <div className="redirect-spinner">
        <div className="spinner-ring" />
        <div className="spinner-logo">
          <Image
            src="/favicon-light.png"
            alt="Silo Exhibitions"
            width={28}
            height={28}
            priority
            className="spinner-logo-img"
          />
        </div>
      </div>

      <div className="redirect-info">
        <span className="redirect-kicker">taking you there ~</span>
        <h2 className="redirect-title">REDIRECTING</h2>
        <p className="redirect-sub">Please hold on while we prepare your dashboard</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="redirect-screen">
          <div className="redirect-spinner">
            <div className="spinner-ring" />
            <div className="spinner-logo">
              <span className="spinner-logo-letter">S</span>
            </div>
          </div>
        </div>
      }
    >
      <DashboardRedirectContent />
    </Suspense>
  );
}
