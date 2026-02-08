"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

interface TagGroup {
  id: string;
  name: string;
  slug: string;
  tags: Tag[];
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Screenshot {
  id: string;
  imageUrl: string;
  caption: string | null;
  category: Category;
  tags?: { tag: Tag }[];
}

interface Game {
  id: string;
  title: string;
  screenshots: Screenshot[];
}

export default function ManageScreenshotsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const gameId = params.id as string;

  const [game, setGame] = useState<Game | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tagGroups, setTagGroups] = useState<TagGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      Promise.all([
        fetch(`/api/games/${gameId}`).then((r) => r.json()),
        fetch("/api/categories").then((r) => r.json()),
        fetch("/api/tags").then((r) => r.json()),
      ]).then(([gameData, catData, tagData]) => {
        setGame(gameData);
        setCategories(catData);
        setTagGroups(tagData);
        if (catData.length > 0) setSelectedCategory(catData[0].id);
        setLoading(false);
      });
    }
  }, [session, gameId]);

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0 || !selectedCategory) return;

    setUploading(true);

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) continue;

      const { url } = await uploadRes.json();

      await fetch("/api/screenshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: url,
          caption: caption || null,
          gameId,
          categoryId: selectedCategory,
          tagIds: selectedTags,
        }),
      });
    }

    // Refresh game data
    const refreshed = await fetch(`/api/games/${gameId}`).then((r) => r.json());
    setGame(refreshed);
    setCaption("");
    setFiles(null);
    setSelectedTags([]);
    setUploading(false);

    const fileInput = document.getElementById(
      "screenshot-files"
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleDeleteScreenshot = async (screenshotId: string) => {
    if (!confirm("Delete this screenshot?")) return;

    const res = await fetch(`/api/screenshots/${screenshotId}`, {
      method: "DELETE",
    });
    if (res.ok && game) {
      setGame({
        ...game,
        screenshots: game.screenshots.filter((s) => s.id !== screenshotId),
      });
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-gray-400">
        Loading...
      </div>
    );
  }

  if (!session || !game) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={() => router.push("/admin")}
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          &larr; Back to Admin
        </button>
        <h1 className="text-3xl font-bold text-white mt-2">
          {game.title} - Screenshots
        </h1>
        <p className="text-gray-400 mt-1">
          {game.screenshots.length} screenshot
          {game.screenshots.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Upload Form */}
      <form
        onSubmit={handleUpload}
        className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8"
      >
        <h2 className="text-lg font-semibold text-white mb-4">
          Upload Screenshots
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="screenshot-files"
              className="block text-sm text-gray-400 mb-1"
            >
              Images *
            </label>
            <input
              id="screenshot-files"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setFiles(e.target.files)}
              className="w-full text-gray-400 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-700 file:text-gray-300 hover:file:bg-gray-600"
              required
            />
          </div>
          <div>
            <label
              htmlFor="category"
              className="block text-sm text-gray-400 mb-1"
            >
              Category *
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-gray-900 text-white rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:border-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label
              htmlFor="caption"
              className="block text-sm text-gray-400 mb-1"
            >
              Caption (optional, applies to all uploaded images)
            </label>
            <input
              id="caption"
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full bg-gray-900 text-white rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Tag Selection */}
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-400 mb-2">
              Tags (optional)
            </label>
            {tagGroups.map((group) => (
              <div key={group.id} className="mb-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  {group.name}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {group.tags.map((tag) => {
                    const isSelected = selectedTags.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`rounded px-3 py-1 text-xs border transition-colors ${
                          isSelected
                            ? "bg-blue-600 text-white border-blue-500"
                            : "bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-600"
                        }`}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-6 py-2 transition-colors disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {/* Existing Screenshots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {game.screenshots.map((screenshot) => (
          <div
            key={screenshot.id}
            className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700"
          >
            <div className="aspect-video relative bg-gray-900">
              <Image
                src={screenshot.imageUrl}
                alt={screenshot.caption || "Screenshot"}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
            <div className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs bg-gray-700 text-gray-300 rounded px-2 py-0.5">
                    {screenshot.category.name}
                  </span>
                  {screenshot.tags?.map((st) => (
                    <span
                      key={st.tag.id}
                      className="text-xs bg-gray-800 text-gray-500 rounded px-1.5 py-0.5 border border-gray-700"
                    >
                      {st.tag.name}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => handleDeleteScreenshot(screenshot.id)}
                  className="text-sm text-red-400 hover:text-red-300 ml-2 flex-shrink-0"
                >
                  Delete
                </button>
              </div>
              {screenshot.caption && (
                <p className="text-xs text-gray-500 mt-1">
                  {screenshot.caption}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {game.screenshots.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No screenshots yet. Use the form above to upload some.
        </div>
      )}
    </div>
  );
}
