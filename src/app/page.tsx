import React from "react";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-8 py-12 text-slate-950">
      <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-[0_18px_40px_rgba(16,32,51,0.12)]">
        <h1 className="text-3xl font-semibold tracking-tight">
          Air Conditioner PM System
        </h1>
        <p className="mt-3 text-base text-slate-700">
          QR-based preventive maintenance and repair logging.
        </p>
        <nav
          className="mt-6 flex flex-wrap gap-4"
          aria-label="Primary"
        >
          <Link
            className="rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white"
            href="/dashboard"
          >
            Open Dashboard
          </Link>
          <Link
            className="rounded-full bg-slate-950 px-4 py-3 text-sm font-medium text-white"
            href="/dashboard"
          >
            Find Branch
          </Link>
        </nav>
      </div>
    </main>
  );
}
