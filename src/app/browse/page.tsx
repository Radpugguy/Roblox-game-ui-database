import { prisma } from "@/lib/prisma";
import ScreenshotGrid from "@/components/ScreenshotGrid";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ category?: string; tag?: string | string[] }>;
}

export default async function BrowsePage({ searchParams }: Props) {
  const resolved = await searchParams;
  const category = resolved.category;
  const tagParam = resolved.tag;
  const tagSlugs = tagParam
    ? Array.isArray(tagParam)
      ? tagParam
      : [tagParam]
    : [];

  const [categories, tagGroups] = await Promise.all([
    prisma.category.findMany({
      include: { _count: { select: { screenshots: true } } },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.tagGroup.findMany({
      include: {
        tags: {
          include: { _count: { select: { screenshots: true } } },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const screenshots = await prisma.screenshot.findMany({
    where: {
      ...(category ? { category: { slug: category } } : {}),
      ...(tagSlugs.length > 0
        ? { tags: { some: { tag: { slug: { in: tagSlugs } } } } }
        : {}),
    },
    include: {
      game: true,
      category: true,
      tags: { include: { tag: { include: { tagGroup: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const activeCategory = categories.find((c) => c.slug === category);

  // Build tag filter URL helper
  function tagUrl(slug: string): string {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    const newTags = tagSlugs.includes(slug)
      ? tagSlugs.filter((t) => t !== slug)
      : [...tagSlugs, slug];
    newTags.forEach((t) => params.append("tag", t));
    return `/browse?${params.toString()}`;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">
        {activeCategory ? activeCategory.name : "Browse All Screenshots"}
      </h1>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Link
          href="/browse"
          className={`rounded-lg px-4 py-2 text-sm border transition-colors ${
            !category
              ? "bg-blue-600 text-white border-blue-500"
              : "bg-gray-800 text-gray-300 border-gray-700 hover:border-gray-600"
          }`}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/browse?category=${cat.slug}`}
            className={`rounded-lg px-4 py-2 text-sm border transition-colors ${
              category === cat.slug
                ? "bg-blue-600 text-white border-blue-500"
                : "bg-gray-800 text-gray-300 border-gray-700 hover:border-gray-600"
            }`}
          >
            {cat.name}
            <span className="ml-1 text-xs opacity-70">
              {cat._count.screenshots}
            </span>
          </Link>
        ))}
      </div>

      {/* Tag Filters */}
      {tagGroups.map((group) => {
        const activeTags = group.tags.filter((t) =>
          tagSlugs.includes(t.slug)
        );
        const hasActiveTags = activeTags.length > 0;

        return (
          <div key={group.id} className="mb-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              {group.name}
              {hasActiveTags && (
                <span className="ml-1 text-blue-400">
                  ({activeTags.length})
                </span>
              )}
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
        );
      })}

      <div className="mt-6">
        {screenshots.length > 0 ? (
          <ScreenshotGrid screenshots={screenshots} showGameName />
        ) : (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg">No screenshots found.</p>
            {(category || tagSlugs.length > 0) && (
              <p className="text-sm mt-1">
                Try adjusting your filters.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
