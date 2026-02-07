import Link from "next/link";
import Image from "next/image";

interface GameCardProps {
  id: string;
  title: string;
  developer?: string | null;
  genre?: string | null;
  thumbnail?: string | null;
  screenshotCount: number;
}

export default function GameCard({
  id,
  title,
  developer,
  genre,
  thumbnail,
  screenshotCount,
}: GameCardProps) {
  return (
    <Link href={`/game/${id}`} className="group block">
      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-blue-500 transition-colors">
        <div className="aspect-video relative bg-gray-900">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600">
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                />
              </svg>
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-white truncate">{title}</h3>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm text-gray-400">
              {developer || "Unknown Developer"}
            </span>
            <span className="text-xs text-gray-500">
              {screenshotCount} screenshot{screenshotCount !== 1 ? "s" : ""}
            </span>
          </div>
          {genre && (
            <span className="inline-block mt-2 text-xs bg-gray-700 text-gray-300 rounded px-2 py-0.5">
              {genre}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
