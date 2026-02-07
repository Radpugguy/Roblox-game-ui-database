import { prisma } from "@/lib/prisma";
import GameCard from "@/components/GameCard";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q || "";

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-2">Search Results</h1>
      {query && (
        <p className="text-gray-400 mb-6">
          Showing results for &ldquo;{query}&rdquo;
        </p>
      )}

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
          {query ? (
            <p className="text-lg">
              No games found matching &ldquo;{query}&rdquo;
            </p>
          ) : (
            <p className="text-lg">Enter a search term to find games.</p>
          )}
        </div>
      )}
    </div>
  );
}
