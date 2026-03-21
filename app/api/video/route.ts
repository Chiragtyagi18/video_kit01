import { connectToDatabase } from "@/lib/db";
import Video, { IVideo } from "@/models/Video";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";
import ImageKit from "@imagekit/nodejs";

function getImageKitClient() {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY ?? process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("ImageKit private key is not configured.");
  }

  return new ImageKit({
    privateKey,
  });
}

function isNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const maybeError = error as { message?: unknown; help?: unknown };
  const message = typeof maybeError.message === "string" ? maybeError.message.toLowerCase() : "";
  const help = typeof maybeError.help === "string" ? maybeError.help.toLowerCase() : "";

  return message.includes("not found") || help.includes("not found");
}

function normalizePath(pathname: string): string {
  if (!pathname) return "";
  const withLeadingSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return withLeadingSlash.replace(/\/{2,}/g, "/");
}

function resolvePathFromAssetUrl(assetUrl?: string): string | null {
  if (!assetUrl) return null;
  const value = assetUrl.trim();
  if (!value) return null;

  if (value.startsWith("/")) {
    return normalizePath(value);
  }

  const urlEndpoint =
    process.env.IMAGEKIT_URL_ENDPOINT ??
    process.env.IMAGEKIT_API_KEY ??
    process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
  if (!urlEndpoint) return null;

  try {
    const endpointUrl = new URL(urlEndpoint);
    const fileUrl = new URL(value);

    if (endpointUrl.origin !== fileUrl.origin) {
      return null;
    }

    const decodedPath = normalizePath(decodeURIComponent(fileUrl.pathname));
    const endpointPath = normalizePath(decodeURIComponent(endpointUrl.pathname || "/"));

    if (endpointPath !== "/" && decodedPath.startsWith(`${endpointPath}/`)) {
      return normalizePath(decodedPath.slice(endpointPath.length));
    }

    if (decodedPath === endpointPath) {
      return "/";
    }

    return decodedPath;
  } catch {
    return null;
  }
}

async function findFileIdByPath(imagekit: ImageKit, filePath: string): Promise<string | null> {
  const normalized = normalizePath(filePath);
  const lastSlashIndex = normalized.lastIndexOf("/");
  const folderPath = normalized.slice(0, lastSlashIndex + 1) || "/";

  const response = await imagekit.assets.list({
    path: folderPath,
    limit: 100,
    type: "file",
  });

  const match = response.find(
    (item): item is (typeof response)[number] & { type: "file"; fileId: string; filePath: string } => {
      if (item.type !== "file") return false;
      return typeof item.filePath === "string" && item.filePath === normalized;
    }
  );

  return match && typeof match.fileId === "string" ? match.fileId : null;
}

export async function GET() {
  try {
    await connectToDatabase();
    const videos = await Video.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(videos);
  } catch {
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const body: IVideo = await request.json();

    if (!body.title || !body.videoUrl || !body.thumbnailUrl || !body.description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const videoData = {
      ...body,
      controls: body?.controls ?? true,
      transformation: {
        height: 1920,
        width: 1080,
        quality: body.trasnformation?.quality ?? 80,
      },
    };

    const newVideo = await Video.create(videoData);
    return NextResponse.json(newVideo, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create video" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = request.nextUrl.searchParams.get("id")?.trim();
    if (!id) {
      return NextResponse.json({ error: "Missing video id" }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid video id" }, { status: 400 });
    }

    await connectToDatabase();
    const existingVideo = await Video.findById(id).lean<IVideo | null>();

    if (!existingVideo) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const fileIds = [existingVideo.videoFileId, existingVideo.thumbnailFileId].filter(
      (value): value is string => typeof value === "string" && value.trim().length > 0
    );

    let imagekit: ImageKit | null = null;
    try {
      imagekit = getImageKitClient();
    } catch (configError) {
      console.error("Skipping ImageKit deletion due to missing configuration.", configError);
    }

    if (imagekit && fileIds.length < 2) {
      const videoPath = resolvePathFromAssetUrl(existingVideo.videoUrl);
      const thumbnailPath = resolvePathFromAssetUrl(existingVideo.thumbnailUrl);

      if (!existingVideo.videoFileId && videoPath) {
        const resolvedVideoFileId = await findFileIdByPath(imagekit, videoPath);
        if (resolvedVideoFileId) {
          fileIds.push(resolvedVideoFileId);
        }
      }

      if (!existingVideo.thumbnailFileId && thumbnailPath) {
        const resolvedThumbnailFileId = await findFileIdByPath(imagekit, thumbnailPath);
        if (resolvedThumbnailFileId) {
          fileIds.push(resolvedThumbnailFileId);
        }
      }
    }

    const uniqueFileIds = Array.from(new Set(fileIds));
    if (imagekit && uniqueFileIds.length > 0) {
      const deletionResults = await Promise.allSettled(
        uniqueFileIds.map((fileId) => imagekit.files.delete(fileId))
      );

      for (const [index, result] of deletionResults.entries()) {
        if (result.status === "fulfilled") {
          continue;
        }

        if (!isNotFoundError(result.reason)) {
          throw result.reason;
        }

        console.warn("ImageKit asset already missing during delete.", {
          fileId: uniqueFileIds[index],
        });
      }
    }

    const deletedVideo = await Video.findByIdAndDelete(id);

    if (!deletedVideo) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, id });
  } catch {
    return NextResponse.json({ error: "Failed to delete video" }, { status: 500 });
  }
}
