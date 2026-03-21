"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

interface VideoCardProps {
  id: string;
  title?: string;
  description?: string;
  createdAt?: string;
  thumbnailUrl: string;
  videoUrl: string;
  onDelete?: (id: string) => Promise<void> | void;
}

function resolveMediaUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  const endpoint =
    process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT?.trim() ||
    process.env.NEXT_PUBLIC_IMAGEKIT_API_KEY?.trim();
  if (!endpoint) return trimmed;

  const normalizedEndpoint = endpoint.endsWith("/")
    ? endpoint.slice(0, -1)
    : endpoint;
  const normalizedPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

  return `${normalizedEndpoint}${normalizedPath}`;
}

function formatDate(value?: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

export default function VideoCard({
  id,
  title,
  description,
  createdAt,
  thumbnailUrl,
  videoUrl,
  onDelete,
}: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const resolvedThumbnailUrl = useMemo(() => resolveMediaUrl(thumbnailUrl), [thumbnailUrl]);
  const resolvedVideoUrl = useMemo(() => resolveMediaUrl(videoUrl), [videoUrl]);
  const formattedDate = useMemo(() => formatDate(createdAt), [createdAt]);

  const handleDelete = async () => {
    if (!onDelete || isDeleting) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await onDelete(id);
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete video."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-amber-900/20 bg-white/70 shadow-md backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-[180px_1fr]">
        <button
          type="button"
          onClick={() => setIsPlaying((prev) => !prev)}
          className="group relative block h-40 w-full overflow-hidden rounded-xl border border-amber-900/10 bg-stone-200"
          aria-label={isPlaying ? "Hide video player" : "Play video"}
        >
          {resolvedThumbnailUrl ? (
            <Image
              src={resolvedThumbnailUrl}
              alt={title ? `${title} thumbnail` : "Video thumbnail"}
              fill
              sizes="(max-width: 768px) 100vw, 180px"
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-stone-500">
              No thumbnail
            </div>
          )}

          <span className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-100 transition duration-300 group-hover:bg-black/35">
            <span className="rounded-full bg-white/90 p-3 text-stone-800 shadow-md">
              ▶
            </span>
          </span>
        </button>

        <div className="space-y-3">
          <div>
            <h3 className="line-clamp-2 text-lg font-semibold text-amber-950">
              {title || "Untitled video"}
            </h3>
            {formattedDate && (
              <p className="mt-1 text-xs text-stone-500">{formattedDate}</p>
            )}
            {description && (
              <p className="mt-2 line-clamp-3 text-sm text-stone-700">{description}</p>
            )}
          </div>

          {isPlaying ? (
            <video
              controls
              className="h-44 w-full rounded-lg border border-amber-900/10 bg-black object-cover"
              src={resolvedVideoUrl}
            />
          ) : (
            <div className="flex flex-col gap-1 text-sm">
              <a
                href={resolvedVideoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex text-sm font-medium text-amber-800 underline-offset-2 transition hover:text-amber-900 hover:underline"
              >
                Video link
              </a>
              <a
                href={resolvedThumbnailUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex text-sm font-medium text-amber-800 underline-offset-2 transition hover:text-amber-900 hover:underline"
              >
                Thumbnail link
              </a>
            </div>
          )}

          {onDelete && (
            <div className="space-y-1">
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
              {deleteError && (
                <p className="text-xs text-red-700">{deleteError}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
