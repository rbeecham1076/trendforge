"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { ImagePlus, Upload, X, Loader2, Palette } from "lucide-react";
import type { ImageAnalysis } from "@/lib/types";

interface ImageUploadProps {
  onAnalysisComplete: (analysis: ImageAnalysis) => void;
  disabled?: boolean;
}

export function ImageUpload({ onAnalysisComplete, disabled = false }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      // Validate
      if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
        setError("Please upload a PNG, JPG, or WebP image.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be under 5MB.");
        return;
      }

      setError(null);
      setAnalysis(null);

      // Preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);

      // Upload & analyze
      setAnalyzing(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Upload failed");
        }

        const result: ImageAnalysis = await res.json();
        setAnalysis(result);
        onAnalysisComplete(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to analyze image."
        );
        setPreview(null);
      } finally {
        setAnalyzing(false);
      }
    },
    [onAnalysisComplete]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
      }
    },
    [handleFile]
  );

  const clearPreview = useCallback(() => {
    setPreview(null);
    setAnalysis(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  return (
    <div className="relative">
      {/* Drop zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && !analyzing && !preview && inputRef.current?.click()}
        className={`
          relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
          ${
            dragActive
              ? "border-fuchsia-400/60 bg-fuchsia-500/5 scale-[1.01]"
              : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
          }
          ${disabled ? "opacity-50 pointer-events-none" : ""}
          ${preview ? "border-solid border-white/20" : ""}
        `}
        role="button"
        tabIndex={0}
        aria-label="Upload inspiration image"
      >
        {/* Glass morphism background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] via-transparent to-fuchsia-500/[0.02]" />

        <div className="relative p-6">
          {analyzing ? (
            /* Analyzing state */
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="relative mb-4">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-fuchsia-500/20 to-violet-500/20 blur-xl animate-pulse" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.05] border border-white/10">
                  <Loader2 className="h-7 w-7 text-fuchsia-400 animate-spin" />
                </div>
              </div>
              <p className="text-sm font-medium text-white mb-1">
                Analyzing your inspiration...
              </p>
              <p className="text-xs text-gray-500">
                Our AI is identifying styles, colors, and product ideas
              </p>
            </div>
          ) : preview && analysis ? (
            /* Analysis complete — show summary */
            <div className="flex gap-4">
              {/* Thumbnail */}
              <div className="shrink-0">
                <div className="relative h-20 w-20 rounded-xl overflow-hidden border border-white/10">
                  <Image
                    src={preview}
                    alt="Upload preview"
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearPreview();
                    }}
                    className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-gray-400 hover:text-white hover:bg-black/80 transition-colors"
                    aria-label="Remove image"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Analysis summary */}
              <div className="flex-1 min-w-0 space-y-2">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Detected Niche</p>
                  <p className="text-sm font-semibold text-white">
                    {analysis.niche}
                  </p>
                </div>

                {/* Keywords */}
                <div className="flex flex-wrap gap-1">
                  {analysis.keywords.slice(0, 5).map((kw) => (
                    <span
                      key={kw}
                      className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/10 to-fuchsia-500/10 text-indigo-300 border border-indigo-500/20"
                    >
                      {kw}
                    </span>
                  ))}
                </div>

                {/* Color palette preview */}
                <div className="flex items-center gap-1.5">
                  <Palette className="h-3 w-3 text-gray-500" />
                  <div className="flex gap-1">
                    {analysis.palette.slice(0, 5).map((color) => (
                      <div
                        key={color}
                        className="h-3.5 w-3.5 rounded-full border border-white/20"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Default drop zone */
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 border border-indigo-500/20 mb-3 group-hover:scale-110 transition-transform">
                {dragActive ? (
                  <Upload className="h-6 w-6 text-fuchsia-400" />
                ) : (
                  <ImagePlus className="h-6 w-6 text-gray-500" />
                )}
              </div>
              <p className="text-sm font-medium text-white mb-1">
                Upload inspiration image
              </p>
              <p className="text-xs text-gray-500 max-w-xs">
                Drag and drop a mood board, product photo, or Pinterest
                screenshot — our AI will extract trends
              </p>
              <p className="text-xs text-gray-600 mt-2">
                PNG, JPG, or WebP · Max 5MB
              </p>
            </div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleChange}
          className="hidden"
          disabled={disabled || analyzing}
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-2 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2">
          <X className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
