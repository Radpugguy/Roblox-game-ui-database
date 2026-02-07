import { prisma } from "@/lib/prisma";
import GameCard from "@/components/GameCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [games, categories, screenshotCount] = await Promise.all([
    prisma.game.findMany({
      include: { _count: { select: { screenshots: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      include: { _count: { select: { screenshots: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.screenshot.count(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-3">
          Roblox UI Database
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          A comprehensive reference of Roblox game interface designs. Browse UI
          screenshots from popular Roblox games for inspiration and research.
        </p>
        <div className="flex justify-center gap-6 mt-4 text-sm text-gray-500">
          <span>
            <strong className="text-gray-300">{games.length}</strong> Games
          </span>
          <span>
            <strong className="text-gray-300">{screenshotCount}</strong>{" "}
            Screenshots
          </span>
          <span>
            <strong className="text-gray-300">{categories.length}</strong>{" "}
            Categories
          </span>
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">
            Browse by Category
          </h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/browse?category=${category.slug}`}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg px-4 py-2 text-sm border border-gray-700 hover:border-gray-600 transition-colors"
              >
                {category.name}
                <span className="ml-2 text-gray-500">
                  {category._count.screenshots}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Games Grid */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">All Games</h2>
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
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg">No games added yet.</p>
            <p className="text-sm mt-1">
              Log in as an admin to start adding Roblox games and their UI
              screenshots.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
