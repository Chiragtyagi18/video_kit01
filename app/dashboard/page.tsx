"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import VideoCard from "../components/VideoCard";

type DashboardVideo = {
  _id?: string;
  title?: string;
  description?: string;
  createdAt?: string;
  videoUrl: string;
  thumbnailUrl: string;
};

function normalizeId(value: unknown, index: number): string {
  if (typeof value === "string" && value.trim()) return value;
  return `video-${index}`;
}

function isValidVideoPayload(value: unknown): value is DashboardVideo[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof (item as DashboardVideo).videoUrl === "string" &&
        typeof (item as DashboardVideo).thumbnailUrl === "string"
    )
  );
}

export default function DashboardPage() {
  const [videos, setVideos] = useState<DashboardVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/video", { cache: "no-store" });
      const data = (await response.json()) as unknown;

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard content.");
      }

      if (!isValidVideoPayload(data)) {
        throw new Error("Unexpected dashboard data shape.");
      }

      setVideos(data);
    } catch (fetchError) {
      setVideos([]);
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to load dashboard."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchVideos();
  }, [fetchVideos]);

  const normalizedVideos = useMemo(
    () =>
      videos.map((video, index) => ({
        ...video,
        _id: normalizeId(video._id, index),
      })),
    [videos]
  );

  const handleDelete = useCallback(async (id: string) => {
    const response = await fetch(`/api/video?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });

    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      throw new Error(payload.error || "Failed to delete video.");
    }

    setVideos((prev) => prev.filter((video, idx) => normalizeId(video._id, idx) !== id));
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-100 to-amber-200 px-4 py-10">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-amber-950">Dashboard</h1>
          <p className="mt-2 text-stone-600">
            Browse and manage your uploaded videos.
          </p>
        </header>

        {isLoading && (
          <div className="rounded-2xl border border-amber-900/20 bg-white/60 p-8 text-center text-stone-600 shadow-md backdrop-blur-md">
            Loading uploads...
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-2xl border border-red-300/70 bg-red-50/80 p-6 text-red-800 shadow-md">
            {error}
          </div>
        )}

        {!isLoading && !error && normalizedVideos.length === 0 && (
          <div className="rounded-2xl border border-amber-900/20 bg-white/60 p-8 text-center text-stone-600 shadow-md backdrop-blur-md">
            No uploads yet
          </div>
        )}

        {!isLoading && !error && normalizedVideos.length > 0 && (
          <section className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
            {normalizedVideos.map((video) => (
              <VideoCard
                key={video._id}
                id={video._id!}
                title={video.title}
                description={video.description}
                createdAt={video.createdAt}
                thumbnailUrl={video.thumbnailUrl}
                videoUrl={video.videoUrl}
                onDelete={handleDelete}
              />
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
