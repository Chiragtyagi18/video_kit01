"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-100 to-amber-200 flex flex-col items-center justify-center px-4 text-stone-800">
      
      {/* Hero Section */}
      <main className="w-full max-w-4xl text-center">
        <div className="mb-8 flex justify-center">
          <div className="p-4 bg-amber-800/20 rounded-full backdrop-blur-md border border-amber-800/30 shadow-xl">
            <span className="text-5xl">🎬</span>
          </div>
        </div>

        <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-6">
          Stream <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-700 to-orange-800">Your Vision.</span>
        </h1>

        <p className="text-xl md:text-2xl text-stone-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          The ultimate platform for creators to upload, share, and discover high-quality video content.
        </p>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {session ? (
            <>
              <Link
                href="/upload"
                className="w-full sm:w-auto px-8 py-4 bg-amber-800 text-amber-50 font-bold rounded-full hover:bg-amber-900 transition-all transform hover:scale-105 shadow-lg"
              >
                Upload Video 🎬
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full sm:w-auto px-8 py-4 bg-stone-200/60 backdrop-blur-md border border-amber-800/30 text-stone-700 font-bold rounded-full hover:bg-stone-300/60 transition-all shadow-lg"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/register" 
                className="w-full sm:w-auto px-8 py-4 bg-amber-800 text-amber-50 font-bold rounded-full hover:bg-amber-900 transition-all transform hover:scale-105 shadow-lg"
              >
                Get Started Free
              </Link>
              
              <Link 
                href="/login" 
                className="w-full sm:w-auto px-8 py-4 bg-stone-200/60 backdrop-blur-md border border-amber-800/30 text-stone-700 font-bold rounded-full hover:bg-stone-300/60 transition-all shadow-lg"
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* Secondary Action */}
        <div className="mt-12">
          <Link 
            href="/dashboard" 
            className="text-stone-500 hover:text-stone-800 transition-colors flex items-center justify-center gap-2 group"
          >
            Open Dashboard
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </main>

      {/* Social Proof / Stats */}
      <footer className="absolute bottom-8 w-full px-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center border-t border-amber-800/20 pt-8 text-stone-500 text-sm">
          <p>© 2026 VideoShare AI</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-stone-800">Terms</Link>
            <Link href="/privacy" className="hover:text-stone-800">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
