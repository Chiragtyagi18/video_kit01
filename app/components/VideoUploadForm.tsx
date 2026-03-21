"use client";

import { FormEvent, useState } from "react";
import FileUpload from "./FileUpload";

interface ImageKitUploadResponse {
  fileId?: string;
  filePath?: string;
  url?: string;
  name?: string;
}

interface UploadedAsset {
  fileId: string;
  name: string;
  filePath: string;
  url: string;
}

function normalizeUploadResponse(
  response: ImageKitUploadResponse
): UploadedAsset | null {
  const filePath = response.filePath?.trim();
  const url = response.url?.trim();
  const fileId = response.fileId?.trim();

  if (!fileId || (!filePath && !url)) {
    return null;
  }

  return {
    fileId,
    name: response.name?.trim() || "Uploaded file",
    filePath: filePath || url || "",
    url: url || filePath || "",
  };
}

function VideoUploadForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoAsset, setVideoAsset] = useState<UploadedAsset | null>(null);
  const [thumbnailAsset, setThumbnailAsset] = useState<UploadedAsset | null>(
    null
  );
  const [videoProgress, setVideoProgress] = useState(0);
  const [thumbnailProgress, setThumbnailProgress] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVideoSuccess = (response: ImageKitUploadResponse) => {
    const normalized = normalizeUploadResponse(response);
    if (!normalized) {
      setSubmitError("Video upload succeeded but response was invalid.");
      return;
    }
    setSubmitError(null);
    setVideoAsset(normalized);
  };

  const handleThumbnailSuccess = (response: ImageKitUploadResponse) => {
    const normalized = normalizeUploadResponse(response);
    if (!normalized) {
      setSubmitError("Thumbnail upload succeeded but response was invalid.");
      return;
    }
    setSubmitError(null);
    setThumbnailAsset(normalized);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle || !trimmedDescription) {
      setSubmitError("Please enter both title and description.");
      return;
    }

    if (!videoAsset || !thumbnailAsset) {
      setSubmitError("Please upload both a video and a thumbnail.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: trimmedTitle,
          description: trimmedDescription,
          videoUrl: videoAsset.url,
          thumbnailUrl: thumbnailAsset.url,
          videoFileId: videoAsset.fileId,
          thumbnailFileId: thumbnailAsset.fileId,
        }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Failed to create video.");
      }

      setSubmitSuccess("Video uploaded successfully.");
      setTitle("");
      setDescription("");
      setVideoAsset(null);
      setThumbnailAsset(null);
      setVideoProgress(0);
      setThumbnailProgress(0);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to upload video."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearVideoSelection = () => {
    setVideoAsset(null);
    setVideoProgress(0);
    setSubmitError(null);
  };

  const clearThumbnailSelection = () => {
    setThumbnailAsset(null);
    setThumbnailProgress(0);
    setSubmitError(null);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label htmlFor="title" className="block text-sm font-semibold text-amber-900">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full rounded-lg border border-amber-900/20 bg-white/80 px-4 py-3 text-stone-800 outline-none ring-amber-700/40 focus:ring-2"
          placeholder="Enter a title for your video"
          required
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="description"
          className="block text-sm font-semibold text-amber-900"
        >
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="min-h-28 w-full rounded-lg border border-amber-900/20 bg-white/80 px-4 py-3 text-stone-800 outline-none ring-amber-700/40 focus:ring-2"
          placeholder="Describe your video"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-amber-900">
          Video File
        </label>
        <FileUpload
          fileType="video"
          onSuccess={handleVideoSuccess}
          onProgress={setVideoProgress}
          hasSelection={Boolean(videoAsset)}
          onCancelSelection={clearVideoSelection}
        />
        {videoProgress > 0 && videoProgress < 100 && (
          <p className="text-xs text-stone-600">Video upload: {videoProgress}%</p>
        )}
        {videoAsset && (
          <p className="text-xs text-emerald-700">
            Video selected: <span className="font-medium">{videoAsset.name}</span>
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-amber-900">
          Thumbnail Image
        </label>
        <FileUpload
          fileType="image"
          onSuccess={handleThumbnailSuccess}
          onProgress={setThumbnailProgress}
          hasSelection={Boolean(thumbnailAsset)}
          onCancelSelection={clearThumbnailSelection}
        />
        {thumbnailProgress > 0 && thumbnailProgress < 100 && (
          <p className="text-xs text-stone-600">
            Thumbnail upload: {thumbnailProgress}%
          </p>
        )}
        {thumbnailAsset && (
          <p className="text-xs text-emerald-700">
            Thumbnail selected:{" "}
            <span className="font-medium">{thumbnailAsset.name}</span>
          </p>
        )}
      </div>

      {submitError && (
        <div className="rounded-lg border border-red-400/50 bg-red-100/70 px-4 py-3 text-sm text-red-800">
          {submitError}
        </div>
      )}

      {submitSuccess && (
        <div className="rounded-lg border border-emerald-500/50 bg-emerald-100/70 px-4 py-3 text-sm text-emerald-800">
          {submitSuccess}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-amber-800 px-5 py-3 font-semibold text-amber-50 transition hover:bg-amber-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Uploading..." : "Publish Video"}
      </button>
    </form>
  );
}

export default VideoUploadForm;
