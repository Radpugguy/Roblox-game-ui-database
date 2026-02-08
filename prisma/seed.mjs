import Database from "better-sqlite3";
import { hashSync } from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "dev.db");

const db = new Database(dbPath);

const DEFAULT_CATEGORIES = [
  { name: "HUD & Gameplay", slug: "hud-gameplay", sortOrder: 1 },
  { name: "Main Menu", slug: "main-menu", sortOrder: 2 },
  { name: "Settings", slug: "settings", sortOrder: 3 },
  { name: "Inventory", slug: "inventory", sortOrder: 4 },
  { name: "Shop & Marketplace", slug: "shop-marketplace", sortOrder: 5 },
  { name: "Character Customization", slug: "character-customization", sortOrder: 6 },
  { name: "Lobby & Server Select", slug: "lobby-server-select", sortOrder: 7 },
  { name: "Leaderboard & Stats", slug: "leaderboard-stats", sortOrder: 8 },
  { name: "Chat & Social", slug: "chat-social", sortOrder: 9 },
  { name: "Tutorial & Onboarding", slug: "tutorial-onboarding", sortOrder: 10 },
  { name: "Loading Screen", slug: "loading-screen", sortOrder: 11 },
  { name: "Dialogue & NPC", slug: "dialogue-npc", sortOrder: 12 },
  { name: "Map & Navigation", slug: "map-navigation", sortOrder: 13 },
  { name: "Quest & Objectives", slug: "quest-objectives", sortOrder: 14 },
  { name: "Upgrade & Skills", slug: "upgrade-skills", sortOrder: 15 },
  { name: "Notifications & Popups", slug: "notifications-popups", sortOrder: 16 },
  { name: "Trading", slug: "trading", sortOrder: 17 },
  { name: "Battle & Combat", slug: "battle-combat", sortOrder: 18 },
];

const TAG_GROUPS = [
  {
    name: "Platform",
    slug: "platform",
    sortOrder: 1,
    tags: [
      { name: "PC", slug: "pc", sortOrder: 1 },
      { name: "Mobile", slug: "mobile", sortOrder: 2 },
      { name: "Console (Xbox)", slug: "console-xbox", sortOrder: 3 },
      { name: "Tablet", slug: "tablet", sortOrder: 4 },
    ],
  },
  {
    name: "UI Elements",
    slug: "ui-elements",
    sortOrder: 2,
    tags: [
      { name: "Health Bar", slug: "health-bar", sortOrder: 1 },
      { name: "Currency Display", slug: "currency-display", sortOrder: 2 },
      { name: "Minimap", slug: "minimap", sortOrder: 3 },
      { name: "Timer / Clock", slug: "timer-clock", sortOrder: 4 },
      { name: "Progress Bar", slug: "progress-bar", sortOrder: 5 },
      { name: "Tooltip", slug: "tooltip", sortOrder: 6 },
      { name: "Button Prompts", slug: "button-prompts", sortOrder: 7 },
      { name: "Icons", slug: "icons", sortOrder: 8 },
      { name: "Modal / Popup", slug: "modal-popup", sortOrder: 9 },
      { name: "Scrollable List", slug: "scrollable-list", sortOrder: 10 },
    ],
  },
  {
    name: "UI Style",
    slug: "ui-style",
    sortOrder: 3,
    tags: [
      { name: "Minimalist", slug: "minimalist", sortOrder: 1 },
      { name: "Cartoon / Stylized", slug: "cartoon-stylized", sortOrder: 2 },
      { name: "Realistic", slug: "realistic", sortOrder: 3 },
      { name: "Pixel Art", slug: "pixel-art", sortOrder: 4 },
      { name: "Flat Design", slug: "flat-design", sortOrder: 5 },
      { name: "Skeuomorphic", slug: "skeuomorphic", sortOrder: 6 },
      { name: "Neon / Glow", slug: "neon-glow", sortOrder: 7 },
      { name: "Dark Theme", slug: "dark-theme", sortOrder: 8 },
      { name: "Light Theme", slug: "light-theme", sortOrder: 9 },
    ],
  },
  {
    name: "Game Genre",
    slug: "game-genre",
    sortOrder: 4,
    tags: [
      { name: "RPG", slug: "genre-rpg", sortOrder: 1 },
      { name: "Simulator", slug: "genre-simulator", sortOrder: 2 },
      { name: "Tycoon", slug: "genre-tycoon", sortOrder: 3 },
      { name: "Obby / Platformer", slug: "genre-obby", sortOrder: 4 },
      { name: "FPS / Shooter", slug: "genre-fps", sortOrder: 5 },
      { name: "Horror", slug: "genre-horror", sortOrder: 6 },
      { name: "Roleplay", slug: "genre-roleplay", sortOrder: 7 },
      { name: "Strategy / Tower Defense", slug: "genre-strategy", sortOrder: 8 },
      { name: "Racing", slug: "genre-racing", sortOrder: 9 },
      { name: "Social / Hangout", slug: "genre-social", sortOrder: 10 },
    ],
  },
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
const insertCat = db.prepare("INSERT INTO Category (id, name, slug, sortOrder) VALUES (?, ?, ?, ?)");
const checkCat = db.prepare("SELECT id FROM Category WHERE slug = ?");
for (const cat of DEFAULT_CATEGORIES) {
  if (!checkCat.get(cat.slug)) {
    insertCat.run(cuid(), cat.name, cat.slug, cat.sortOrder);
  }
}
console.log(`Created ${DEFAULT_CATEGORIES.length} categories`);

// Create tag groups and tags
const insertTagGroup = db.prepare("INSERT INTO TagGroup (id, name, slug, sortOrder) VALUES (?, ?, ?, ?)");
const checkTagGroup = db.prepare("SELECT id FROM TagGroup WHERE slug = ?");
const insertTag = db.prepare("INSERT INTO Tag (id, name, slug, sortOrder, tagGroupId) VALUES (?, ?, ?, ?, ?)");
const checkTag = db.prepare("SELECT id FROM Tag WHERE slug = ?");

let totalTags = 0;
for (const group of TAG_GROUPS) {
  let groupRow = checkTagGroup.get(group.slug);
  let groupId;
  if (!groupRow) {
    groupId = cuid();
    insertTagGroup.run(groupId, group.name, group.slug, group.sortOrder);
  } else {
    groupId = groupRow.id;
  }
  for (const tag of group.tags) {
    if (!checkTag.get(tag.slug)) {
      insertTag.run(cuid(), tag.name, tag.slug, tag.sortOrder, groupId);
      totalTags++;
    }
  }
}
console.log(`Created ${TAG_GROUPS.length} tag groups with ${totalTags} tags`);

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
