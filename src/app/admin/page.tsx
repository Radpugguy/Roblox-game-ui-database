"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Game {
  id: string;
  title: string;
  developer: string | null;
  genre: string | null;
  thumbnail: string | null;
  _count: { screenshots: number };
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/games")
        .then((res) => res.json())
        .then((data) => {
          setGames(data);
          setLoading(false);
        });
    }
  }, [session]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}" and all its screenshots?`)) return;

    const res = await fetch(`/api/games/${id}`, { method: "DELETE" });
    if (res.ok) {
      setGames(games.filter((g) => g.id !== id));
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-gray-400">
        Loading...
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <Link
          href="/admin/games/new"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2 transition-colors"
        >
          Add Game
        </Link>
      </div>

      {/* Games Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">
                Game
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">
                Developer
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">
                Genre
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">
                Screenshots
              </th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {games.map((game) => (
              <tr key={game.id} className="hover:bg-gray-750">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {game.thumbnail && (
                      <Image
                        src={game.thumbnail}
                        alt={game.title}
                        width={48}
                        height={27}
                        className="rounded object-cover"
                      />
                    )}
                    <span className="text-white font-medium">{game.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-400">
                  {game.developer || "-"}
                </td>
                <td className="px-4 py-3 text-gray-400">
                  {game.genre || "-"}
                </td>
                <td className="px-4 py-3 text-gray-400">
                  {game._count.screenshots}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/games/${game.id}/screenshots`}
                      className="text-sm text-blue-400 hover:text-blue-300"
                    >
                      Screenshots
                    </Link>
                    <Link
                      href={`/game/${game.id}`}
                      className="text-sm text-gray-400 hover:text-gray-300"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDelete(game.id, game.title)}
                      className="text-sm text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {games.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No games added yet. Click &ldquo;Add Game&rdquo; to get
                  started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
