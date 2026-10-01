"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import Image from "next/image";
import { UploadCloud, CheckCircle2, AlertCircle, Trash2, RefreshCw, Loader2, Link as LinkIcon } from "lucide-react";
import "@/styles/admin/CloudinaryUpload.scss";

interface CloudinaryImageUploadProps {
  value: string;
  onChange: (url: string, publicId?: string) => void;
  label: string;
  folder?: string;
  placeholder?: string;
  aspectRatioHint?: string;
  required?: boolean;
}

export function CloudinaryImageUpload({
  value,
  onChange,
  label,
  folder = "silo-exhibitions/events/fliers",
  placeholder = "Upload high-res JPG, PNG, or WebP (max 25MB)",
  aspectRatioHint,
  required = false,
}: CloudinaryImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadFile = async (file: File) => {
    if (!file) return;

    // Validate size (25MB max)
    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg("File is too large. Maximum size is 25MB.");
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to upload image to Cloudinary.");
      }

      onChange(data.secure_url, data.public_id);
    } catch (err: any) {
      console.error("[Cloudinary Upload Error]:", err);
      setErrorMsg(err.message || "Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadFile(file);
    }
    // Reset file input value so same file can be re-selected if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => {
    setIsDragOver(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUploadFile(file);
    }
  };

  const handleManualUrlSubmit = () => {
    if (manualUrl.trim()) {
      onChange(manualUrl.trim());
      setManualUrl("");
      setShowUrlInput(false);
    }
  };

  return (
    <div className="cloudinary-upload">
      <div className="cloudinary-upload__label-row">
        <label className="cloudinary-upload__label">
          {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
        </label>
        {aspectRatioHint && (
          <span className="cloudinary-upload__badge">{aspectRatioHint}</span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={onFileInputChange}
      />

      {value ? (
        // Preview Card when image is uploaded or entered
        <div className="cloudinary-upload__preview-card">
          <div className="cloudinary-upload__preview-thumb">
            <Image
              src={value}
              alt={label}
              fill
              unoptimized={!value.includes("res.cloudinary.com")}
              sizes="72px"
            />
          </div>

          <div className="cloudinary-upload__preview-meta">
            <span className="cloudinary-upload__preview-status">
              <CheckCircle2 size={13} />
              {value.includes("res.cloudinary.com") ? "Hosted on Cloudinary" : "Custom Image URL"}
            </span>
            <span className="cloudinary-upload__preview-url" title={value}>
              {value}
            </span>

            <div className="cloudinary-upload__preview-actions">
              <button
                type="button"
                className="cloudinary-upload__action-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <RefreshCw size={12} />
                <span>Replace</span>
              </button>
              <button
                type="button"
                className="cloudinary-upload__action-btn cloudinary-upload__action-btn--danger"
                onClick={() => onChange("")}
                disabled={isUploading}
              >
                <Trash2 size={12} />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Dropzone for file upload
        <div
          className={`cloudinary-upload__dropzone ${isDragOver ? "is-dragover" : ""} ${
            isUploading ? "is-uploading" : ""
          }`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <div className="cloudinary-upload__dropzone-content">
            <div className="cloudinary-upload__icon-circle">
              {isUploading ? (
                <Loader2 size={22} className="cloudinary-upload__uploading-spinner" />
              ) : (
                <UploadCloud size={22} />
              )}
            </div>

            <p className="cloudinary-upload__primary-text">
              {isUploading ? (
                "Uploading image to Cloudinary..."
              ) : (
                <>
                  <span>Click to upload</span> or drag and drop image here
                </>
              )}
            </p>

            <span className="cloudinary-upload__sub-text">
              {isUploading ? "Processing and optimizing on CDN..." : placeholder}
            </span>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="cloudinary-upload__error">
          <AlertCircle size={14} />
          <span>{errorMsg}</span>
        </div>
      )}

      {!value && !isUploading && (
        <div>
          <button
            type="button"
            className="cloudinary-upload__url-toggle"
            onClick={() => setShowUrlInput(!showUrlInput)}
          >
            {showUrlInput ? "Hide manual URL input" : "Or enter direct image URL"}
          </button>

          {showUrlInput && (
            <div className="cloudinary-upload__url-input-wrap">
              <input
                type="url"
                placeholder="https://res.cloudinary.com/... or https://..."
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleManualUrlSubmit();
                  }
                }}
              />
              <button
                type="button"
                className="cloudinary-upload__action-btn"
                onClick={handleManualUrlSubmit}
              >
                <LinkIcon size={12} />
                <span>Apply URL</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export default CloudinaryImageUpload;
