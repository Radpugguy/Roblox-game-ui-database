"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [search, setSearch] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold text-white">
              Roblox UI Database
            </Link>
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Games
              </Link>
              <Link
                href="/browse"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Browse
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="hidden sm:block">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search games..."
                className="bg-gray-800 text-gray-200 rounded-lg px-3 py-1.5 text-sm border border-gray-700 focus:outline-none focus:border-blue-500 w-48 lg:w-64"
              />
            </form>

            {session ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/admin"
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Admin
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Admin Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
