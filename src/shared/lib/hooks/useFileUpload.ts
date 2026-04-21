import { useState, useRef, useCallback } from "react";

interface UseFileUploadOptions {
  onSuccess?: (key: string) => void;
  onError?: (error: string) => void;
}

export function useFileUpload({ onSuccess, onError }: UseFileUploadOptions = {}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onload = async () => {
          const base64 = reader.result as string;
          const res = await fetch("/api/internal/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileName: file.name,
              contentType: file.type,
              base64Data: base64,
            }),
          });
          const data = await res.json();
          if (data.key) {
            onSuccess?.(data.key);
            resolve(data.key);
          } else {
            onError?.(data.error || "Upload failed");
            resolve(null);
          }
          setUploading(false);
        };
        reader.readAsDataURL(file);
      });
    } catch {
      onError?.("Upload failed");
      setUploading(false);
      return null;
    }
  }, [onSuccess, onError]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return null;
    return uploadFile(file);
  }, [uploadFile]);

  const triggerUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return {
    uploading,
    fileInputRef,
    uploadFile,
    handleFileUpload,
    triggerUpload,
  };
}