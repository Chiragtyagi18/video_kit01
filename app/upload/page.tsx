"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import VideoUploadForm from "../components/VideoUploadForm";

export default function VideoUploadPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-100 to-amber-200 px-4 py-12 flex items-center justify-center">
      
      <div className="w-full max-w-3xl rounded-2xl bg-amber-800/10 backdrop-blur-lg shadow-2xl border border-amber-800/20 p-8">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-2">
            Upload New Video 🎬
          </h1>
          <p className="text-stone-600">
            Share your creativity with the world.
          </p>
          {session && (
            <div className="mt-4">
              <Link
                href="/dashboard"
                className="inline-flex rounded-full border border-amber-800/40 bg-amber-100 px-5 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-200"
              >
                Go to Dashboard
              </Link>
            </div>
          )}
        </div>

        <div className="bg-amber-800/10 rounded-xl p-6 border border-amber-800/20">
          <VideoUploadForm />
        </div>

      </div>
    </div>
  );
}
