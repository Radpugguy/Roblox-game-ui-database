import { prisma } from "@/lib/prisma";
import ScreenshotGrid from "@/components/ScreenshotGrid";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ category?: string }>;
}

export default async function BrowsePage({ searchParams }: Props) {
  const { category } = await searchParams;

  const categories = await prisma.category.findMany({
    include: { _count: { select: { screenshots: true } } },
    orderBy: { name: "asc" },
  });

  const screenshots = await prisma.screenshot.findMany({
    where: category ? { category: { slug: category } } : undefined,
    include: { game: true, category: true },
    orderBy: { createdAt: "desc" },
  });

  const activeCategory = categories.find((c) => c.slug === category);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">
        {activeCategory ? activeCategory.name : "Browse All Screenshots"}
      </h1>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
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

      {/* Screenshots */}
      {screenshots.length > 0 ? (
        <ScreenshotGrid screenshots={screenshots} showGameName />
      ) : (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No screenshots found.</p>
          {category && (
            <p className="text-sm mt-1">
              No screenshots in this category yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
