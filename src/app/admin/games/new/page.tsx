"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NewGamePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    developer: "",
    genre: "",
    robloxUrl: "",
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    let thumbnail = "";

    // Upload thumbnail if provided
    if (thumbnailFile) {
      const formData = new FormData();
      formData.append("file", thumbnailFile);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (uploadRes.ok) {
        const { url } = await uploadRes.json();
        thumbnail = url;
      }
    }

    const res = await fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        thumbnail: thumbnail || undefined,
      }),
    });

    if (res.ok) {
      const game = await res.json();
      router.push(`/admin/games/${game.id}/screenshots`);
    } else {
      setSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-gray-400">
        Loading...
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Add New Game</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 rounded-lg p-6 border border-gray-700 space-y-4"
      >
        <div>
          <label htmlFor="title" className="block text-sm text-gray-400 mb-1">
            Game Title *
          </label>
          <input
            id="title"
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-gray-900 text-white rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="developer"
            className="block text-sm text-gray-400 mb-1"
          >
            Developer
          </label>
          <input
            id="developer"
            type="text"
            value={form.developer}
            onChange={(e) => setForm({ ...form, developer: e.target.value })}
            className="w-full bg-gray-900 text-white rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="genre" className="block text-sm text-gray-400 mb-1">
            Genre
          </label>
          <input
            id="genre"
            type="text"
            value={form.genre}
            onChange={(e) => setForm({ ...form, genre: e.target.value })}
            placeholder="e.g., RPG, Simulator, Tycoon, Obby"
            className="w-full bg-gray-900 text-white rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="robloxUrl"
            className="block text-sm text-gray-400 mb-1"
          >
            Roblox Game Link
          </label>
          <input
            id="robloxUrl"
            type="url"
            value={form.robloxUrl}
            onChange={(e) => setForm({ ...form, robloxUrl: e.target.value })}
            placeholder="https://www.roblox.com/games/..."
            className="w-full bg-gray-900 text-white rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="thumbnail"
            className="block text-sm text-gray-400 mb-1"
          >
            Thumbnail Image
          </label>
          <input
            id="thumbnail"
            type="file"
            accept="image/*"
            onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
            className="w-full text-gray-400 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-700 file:text-gray-300 hover:file:bg-gray-600"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-6 py-2 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Create Game"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium rounded-lg px-6 py-2 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
