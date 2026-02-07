import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ScreenshotGrid from "@/components/ScreenshotGrid";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function GamePage({ params }: Props) {
  const { id } = await params;

  const game = await prisma.game.findUnique({
    where: { id },
    include: {
      screenshots: {
        include: { game: true, category: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!game) notFound();

  // Group screenshots by category
  const byCategory = game.screenshots.reduce(
    (acc, screenshot) => {
      const cat = screenshot.category.name;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(screenshot);
      return acc;
    },
    {} as Record<string, typeof game.screenshots>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Game Header */}
      <div className="mb-8">
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

      {/* Screenshots by Category */}
      {game.screenshots.length > 0 ? (
        <div className="space-y-8">
          {Object.entries(byCategory).map(([categoryName, screenshots]) => (
            <section key={categoryName}>
              <h2 className="text-lg font-semibold text-white mb-3">
                {categoryName}
                <span className="ml-2 text-sm text-gray-500 font-normal">
                  ({screenshots.length})
                </span>
              </h2>
              <ScreenshotGrid screenshots={screenshots} />
            </section>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <p>No screenshots added yet for this game.</p>
        </div>
      )}
    </div>
  );
}
