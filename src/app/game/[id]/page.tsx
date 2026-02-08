"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface TagGroup {
  id: string;
  name: string;
  slug: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  tagGroup: TagGroup;
}

interface ScreenshotTag {
  tag: Tag;
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
  game: { id: string; title: string };
  category: Category;
  tags: ScreenshotTag[];
}

interface Game {
  id: string;
  title: string;
  developer: string | null;
  genre: string | null;
  robloxUrl: string | null;
  screenshots: Screenshot[];
}

export default function GamePage() {
  const params = useParams();
  const id = params.id as string;

  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<Screenshot | null>(null);

  useEffect(() => {
    fetch(`/api/games/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setGame(null);
        } else {
          setGame(data);
        }
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-gray-400">
        Loading...
      </div>
    );
  }

  if (!game) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-gray-400">
        Game not found.
      </div>
    );
  }

  // Get categories that have screenshots
  const categoryMap = new Map<string, { category: Category; count: number }>();
  for (const s of game.screenshots) {
    const existing = categoryMap.get(s.category.id);
    if (existing) {
      existing.count++;
    } else {
      categoryMap.set(s.category.id, { category: s.category, count: 1 });
    }
  }
  const populatedCategories = Array.from(categoryMap.values());

  // Filter screenshots by active category
  const filteredScreenshots = activeCategory
    ? game.screenshots.filter((s) => s.category.id === activeCategory)
    : game.screenshots;

  // Get all unique tags on the filtered screenshots, grouped
  const tagsByGroup = new Map<
    string,
    { group: TagGroup; tags: Map<string, { tag: Tag; count: number }> }
  >();
  for (const s of filteredScreenshots) {
    for (const st of s.tags) {
      const groupId = st.tag.tagGroup.id;
      if (!tagsByGroup.has(groupId)) {
        tagsByGroup.set(groupId, {
          group: st.tag.tagGroup,
          tags: new Map(),
        });
      }
      const groupEntry = tagsByGroup.get(groupId)!;
      const existing = groupEntry.tags.get(st.tag.id);
      if (existing) {
        existing.count++;
      } else {
        groupEntry.tags.set(st.tag.id, { tag: st.tag, count: 1 });
      }
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Game Header */}
      <div className="mb-6">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          &larr; Back to Games
        </Link>
        <h1 className="text-3xl font-bold text-white mt-2">{game.title}</h1>
        <div className="flex items-center gap-4 mt-2 text-gray-400">
          {game.developer && <span>{game.developer}</span>}
          {game.genre && (
            <span className="bg-gray-800 text-gray-300 rounded px-2 py-0.5 text-sm">
              {game.genre}
            </span>
          )}
          <span className="text-sm text-gray-500">
            {game.screenshots.length} screenshot
            {game.screenshots.length !== 1 ? "s" : ""}
          </span>
        </div>
        {game.robloxUrl && (
          <a
            href={game.robloxUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-sm text-blue-400 hover:text-blue-300"
          >
            View on Roblox &rarr;
          </a>
        )}
      </div>

      {game.screenshots.length > 0 ? (
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-56 flex-shrink-0 hidden lg:block">
            {/* Category Filter */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Categories
              </h3>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setActiveCategory(null)}
                    className={`w-full text-left text-sm px-3 py-1.5 rounded transition-colors ${
                      !activeCategory
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-800"
                    }`}
                  >
                    All ({game.screenshots.length})
                  </button>
                </li>
                {populatedCategories.map(({ category, count }) => (
                  <li key={category.id}>
                    <button
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full text-left text-sm px-3 py-1.5 rounded transition-colors ${
                        activeCategory === category.id
                          ? "bg-blue-600 text-white"
                          : "text-gray-300 hover:bg-gray-800"
                      }`}
                    >
                      {category.name} ({count})
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tags by Group */}
            {Array.from(tagsByGroup.values()).map(({ group, tags }) => (
              <div key={group.id} className="mb-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {group.name}
                </h3>
                <div className="flex flex-wrap gap-1">
                  {Array.from(tags.values()).map(({ tag, count }) => (
                    <span
                      key={tag.id}
                      className="text-xs bg-gray-800 text-gray-400 rounded px-2 py-0.5 border border-gray-700"
                    >
                      {tag.name}
                      <span className="ml-1 text-gray-600">{count}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </aside>

          {/* Screenshot Grid */}
          <div className="flex-1 min-w-0">
            {/* Mobile category filter */}
            <div className="lg:hidden mb-4 flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory(null)}
                className={`rounded-lg px-3 py-1.5 text-sm border transition-colors ${
                  !activeCategory
                    ? "bg-blue-600 text-white border-blue-500"
                    : "bg-gray-800 text-gray-300 border-gray-700"
                }`}
              >
                All
              </button>
              {populatedCategories.map(({ category, count }) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`rounded-lg px-3 py-1.5 text-sm border transition-colors ${
                    activeCategory === category.id
                      ? "bg-blue-600 text-white border-blue-500"
                      : "bg-gray-800 text-gray-300 border-gray-700"
                  }`}
                >
                  {category.name} ({count})
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredScreenshots.map((screenshot) => (
                <div
                  key={screenshot.id}
                  className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer"
                  onClick={() => setSelectedImage(screenshot)}
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
                  <div className="p-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs bg-gray-700 text-gray-300 rounded px-2 py-0.5">
                        {screenshot.category.name}
                      </span>
                      {screenshot.tags.map((st) => (
                        <span
                          key={st.tag.id}
                          className="text-xs bg-gray-800 text-gray-500 rounded px-1.5 py-0.5 border border-gray-700"
                        >
                          {st.tag.name}
                        </span>
                      ))}
                    </div>
                    {screenshot.caption && (
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {screenshot.caption}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredScreenshots.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No screenshots in this category.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <p>No screenshots added yet for this game.</p>
        </div>
      )}

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-5xl w-full max-h-[90vh] relative">
            <button
              className="absolute -top-10 right-0 text-white text-lg hover:text-gray-300"
              onClick={() => setSelectedImage(null)}
            >
              Close
            </button>
            <Image
              src={selectedImage.imageUrl}
              alt={selectedImage.caption || "Screenshot"}
              width={1920}
              height={1080}
              className="w-full h-auto max-h-[85vh] object-contain rounded"
            />
            <div className="mt-2 text-center">
              <span className="text-gray-400">
                {selectedImage.category.name}
              </span>
              {selectedImage.tags.length > 0 && (
                <span className="text-gray-600 ml-2">
                  {selectedImage.tags.map((st) => st.tag.name).join(", ")}
                </span>
              )}
              {selectedImage.caption && (
                <p className="text-gray-500 text-sm mt-1">
                  {selectedImage.caption}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
