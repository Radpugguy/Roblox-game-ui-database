import { DatabaseSync } from "node:sqlite";
import { hashSync } from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "dev.db");

const db = new DatabaseSync(dbPath);

const DEFAULT_CATEGORIES = [
  { name: "HUD & Gameplay", slug: "hud-gameplay" },
  { name: "Main Menu", slug: "main-menu" },
  { name: "Settings", slug: "settings" },
  { name: "Inventory", slug: "inventory" },
  { name: "Shop & Marketplace", slug: "shop-marketplace" },
  { name: "Character Customization", slug: "character-customization" },
  { name: "Lobby & Server Select", slug: "lobby-server-select" },
  { name: "Leaderboard & Stats", slug: "leaderboard-stats" },
  { name: "Chat & Social", slug: "chat-social" },
  { name: "Tutorial & Onboarding", slug: "tutorial-onboarding" },
  { name: "Loading Screen", slug: "loading-screen" },
  { name: "Dialogue & NPC", slug: "dialogue-npc" },
  { name: "Map & Navigation", slug: "map-navigation" },
  { name: "Quest & Objectives", slug: "quest-objectives" },
  { name: "Upgrade & Skills", slug: "upgrade-skills" },
  { name: "Notifications & Popups", slug: "notifications-popups" },
  { name: "Trading", slug: "trading" },
  { name: "Battle & Combat", slug: "battle-combat" },
];

const sampleGames = [
  { title: "Adopt Me!", developer: "DreamCraft", genre: "Simulator", robloxUrl: "https://www.roblox.com/games/920587237" },
  { title: "Blox Fruits", developer: "Gamer Robot Inc", genre: "RPG", robloxUrl: "https://www.roblox.com/games/2753915549" },
  { title: "Brookhaven", developer: "Wolfpaq", genre: "Roleplay", robloxUrl: "https://www.roblox.com/games/4924922222" },
  { title: "Tower Defense Simulator", developer: "Paradoxum Games", genre: "Strategy", robloxUrl: "https://www.roblox.com/games/3260590327" },
  { title: "Murder Mystery 2", developer: "Nikilis", genre: "Horror", robloxUrl: "https://www.roblox.com/games/142823291" },
  { title: "Jailbreak", developer: "Badimo", genre: "Action", robloxUrl: "https://www.roblox.com/games/606849621" },
];

function cuid() {
  return "c" + Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

console.log("Seeding database...");

// Create admin user
const passwordHash = hashSync("admin123", 10);
const existingUser = db.prepare("SELECT id FROM User WHERE username = ?").get("admin");
if (!existingUser) {
  db.prepare(
    "INSERT INTO User (id, username, passwordHash, createdAt) VALUES (?, ?, ?, datetime('now'))"
  ).run(cuid(), "admin", passwordHash);
}
console.log("Admin user ready (username: admin, password: admin123)");

// Create categories
const insertCat = db.prepare("INSERT INTO Category (id, name, slug) VALUES (?, ?, ?)");
const checkCat = db.prepare("SELECT id FROM Category WHERE slug = ?");
for (const cat of DEFAULT_CATEGORIES) {
  if (!checkCat.get(cat.slug)) {
    insertCat.run(cuid(), cat.name, cat.slug);
  }
}
console.log(`Created ${DEFAULT_CATEGORIES.length} categories`);

// Create sample games
const insertGame = db.prepare(
  "INSERT INTO Game (id, title, developer, genre, robloxUrl, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))"
);
const checkGame = db.prepare("SELECT id FROM Game WHERE title = ?");
for (const game of sampleGames) {
  if (!checkGame.get(game.title)) {
    insertGame.run(cuid(), game.title, game.developer, game.genre, game.robloxUrl);
  }
}
console.log(`Seeded ${sampleGames.length} sample games`);

console.log("Seed complete!");
db.close();
