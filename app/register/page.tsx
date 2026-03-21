'use client';

import { useRouter } from "next/navigation";
import React, { useState } from "react";

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  const handleSumit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      router.push("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-amber-50 via-orange-100 to-amber-200 px-4">
      
      <div className="w-full max-w-md rounded-2xl bg-amber-800/10 backdrop-blur-lg shadow-2xl p-8 border border-amber-800/20">
        
        <h1 className="text-3xl font-bold text-amber-900 text-center mb-6">
          Create Account
        </h1>

        <form onSubmit={handleSumit} className="space-y-4">
          
          <input
            type="email"
            placeholder="Email"
            required
            className="w-full rounded-lg px-4 py-2 bg-amber-50 text-stone-800 placeholder-stone-400 border border-amber-800/30 focus:outline-none focus:ring-2 focus:ring-amber-700 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            required
            className="w-full rounded-lg px-4 py-2 bg-amber-50 text-stone-800 placeholder-stone-400 border border-amber-800/30 focus:outline-none focus:ring-2 focus:ring-amber-700 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            required
            className="w-full rounded-lg px-4 py-2 bg-amber-50 text-stone-800 placeholder-stone-400 border border-amber-800/30 focus:outline-none focus:ring-2 focus:ring-amber-700 transition"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button
            type="submit"
            className="w-full rounded-lg bg-amber-800 text-amber-50 font-semibold py-2 hover:bg-amber-900 transition duration-300 shadow-md"
          >
            Register
          </button>

        </form>

        <p className="text-center text-stone-600 text-sm mt-6">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-semibold underline hover:text-amber-900 text-amber-800"
          >
            Login
          </a>
        </p>

      </div>
    </div>
  );
}

export default RegisterPage;