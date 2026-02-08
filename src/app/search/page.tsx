import { prisma } from "@/lib/prisma";
import GameCard from "@/components/GameCard";
import ScreenshotGrid from "@/components/ScreenshotGrid";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ q?: string; tag?: string | string[] }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const resolved = await searchParams;
  const query = resolved.q || "";
  const tagParam = resolved.tag;
  const tagSlugs = tagParam
    ? Array.isArray(tagParam)
      ? tagParam
      : [tagParam]
    : [];

  const tagGroups = await prisma.tagGroup.findMany({
    include: {
      tags: {
        include: { _count: { select: { screenshots: true } } },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  const games = query
    ? await prisma.game.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { developer: { contains: query } },
            { genre: { contains: query } },
          ],
        },
        include: { _count: { select: { screenshots: true } } },
        orderBy: { createdAt: "desc" },
      })
    : [];

  // If tags are selected, also search screenshots by tag
  const taggedScreenshots =
    tagSlugs.length > 0
      ? await prisma.screenshot.findMany({
          where: {
            tags: { some: { tag: { slug: { in: tagSlugs } } } },
            ...(query
              ? {
                  OR: [
                    { game: { title: { contains: query } } },
                    { caption: { contains: query } },
                  ],
                }
              : {}),
          },
          include: {
            game: true,
            category: true,
            tags: { include: { tag: { include: { tagGroup: true } } } },
          },
          orderBy: { createdAt: "desc" },
        })
      : [];

  // Build tag filter URL helper
  function tagUrl(slug: string): string {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    const newTags = tagSlugs.includes(slug)
      ? tagSlugs.filter((t) => t !== slug)
      : [...tagSlugs, slug];
    newTags.forEach((t) => params.append("tag", t));
    return `/search?${params.toString()}`;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-2">Search</h1>
      {query && (
        <p className="text-gray-400 mb-4">
          Results for &ldquo;{query}&rdquo;
        </p>
      )}

      {/* Tag Filters */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-400 mb-3">
          Filter by Tags
        </h2>
        {tagGroups.map((group) => (
          <div key={group.id} className="mb-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              {group.name}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {group.tags.map((tag) => {
                const isActive = tagSlugs.includes(tag.slug);
                return (
                  <Link
                    key={tag.id}
                    href={tagUrl(tag.slug)}
                    className={`rounded px-3 py-1 text-xs border transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white border-blue-500"
                        : "bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600"
                    }`}
                  >
                    {tag.name}
                    <span className="ml-1 opacity-60">
                      {tag._count.screenshots}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Tag-filtered screenshots */}
      {tagSlugs.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Screenshots ({taggedScreenshots.length})
          </h2>
          {taggedScreenshots.length > 0 ? (
            <ScreenshotGrid screenshots={taggedScreenshots} showGameName />
          ) : (
            <p className="text-gray-500">
              No screenshots found with the selected tags.
            </p>
          )}
        </section>
      )}

      {/* Game results */}
      {query && (
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">
            Games ({games.length})
          </h2>
          {games.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {games.map((game) => (
                <GameCard
                  key={game.id}
                  id={game.id}
                  title={game.title}
                  developer={game.developer}
                  genre={game.genre}
                  thumbnail={game.thumbnail}
                  screenshotCount={game._count.screenshots}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              No games found matching &ldquo;{query}&rdquo;
            </p>
          )}
        </section>
      )}

      {!query && tagSlugs.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">
            Enter a search term or select tags to find screenshots.
          </p>
        </div>
      )}
    </div>
  );
}
