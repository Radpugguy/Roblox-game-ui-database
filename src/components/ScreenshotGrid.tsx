"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface TagInfo {
  tag: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Screenshot {
  id: string;
  imageUrl: string;
  caption?: string | null;
  game: { id: string; title: string };
  category: { name: string; slug: string };
  tags?: TagInfo[];
}

interface ScreenshotGridProps {
  screenshots: Screenshot[];
  showGameName?: boolean;
}

export default function ScreenshotGrid({
  screenshots,
  showGameName = false,
}: ScreenshotGridProps) {
  const [selectedImage, setSelectedImage] = useState<Screenshot | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {screenshots.map((screenshot) => (
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
              {showGameName && (
                <Link
                  href={`/game/${screenshot.game.id}`}
                  className="text-sm text-blue-400 hover:text-blue-300"
                  onClick={(e) => e.stopPropagation()}
                >
                  {screenshot.game.title}
                </Link>
              )}
              <div className="flex items-center gap-2 flex-wrap mt-1">
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
              {screenshot.caption && (
                <span className="text-xs text-gray-500 truncate block mt-1">
                  {screenshot.caption}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

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
              {showGameName && (
                <span className="text-white font-medium">
                  {selectedImage.game.title} &mdash;{" "}
                </span>
              )}
              <span className="text-gray-400">
                {selectedImage.category.name}
              </span>
              {selectedImage.tags && selectedImage.tags.length > 0 && (
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
    </>
  );
}
