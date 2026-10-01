"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, AlertTriangle, CheckCircle2, X } from "lucide-react";

export interface AuthErrorCardProps {
  type?: "error" | "warning" | "success";
  title?: string;
  message: string | React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  actionHref?: string;
  onClose?: () => void;
}

export function AuthErrorCard({
  type = "error",
  title,
  message,
  actionText,
  onAction,
  actionHref,
  onClose,
}: AuthErrorCardProps) {
  const Icon =
    type === "success"
      ? CheckCircle2
      : type === "warning"
      ? AlertTriangle
      : AlertCircle;

  return (
    <div
      className={`auth-alert-card ${type}`}
      role="alert"
      aria-live="polite"
    >
      <Icon className="alert-icon" size={18} />
      <div className="alert-content">
        {title && <span className="alert-title">{title}</span>}
        <div className="alert-message">{message}</div>
        {actionText && (
          <div>
            {actionHref ? (
              <Link href={actionHref} className="alert-action-btn">
                {actionText} →
              </Link>
            ) : onAction ? (
              <button
                type="button"
                onClick={onAction}
                className="alert-action-btn"
              >
                {actionText} →
              </button>
            ) : null}
          </div>
        )}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss alert"
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 2,
            color: "currentColor",
            opacity: 0.7,
            display: "flex",
            alignItems: "center",
          }}
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}

export default AuthErrorCard;
