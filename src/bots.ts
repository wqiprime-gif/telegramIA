import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { env, rootDir } from "./config.js";

const dataDir = path.join(rootDir, "data");
const uploadsDir = path.join(dataDir, "uploads");
export const botsFile = path.join(dataDir, "bots.json");

export type BotConfig = {
  id: string;
  name: string;
  token: string;
  prompt: string;
  pixKey: string;
  messageDelayMs: number;
  previewMediaUrls: string[];
  deliveryMediaUrls: string[];
  active: boolean;
};

export function parseUrls(value: string) {
  return value
    .split(/\n|,/)
    .map((url) => url.trim())
    .filter(Boolean);
}

export async function ensureDataFile() {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.mkdir(uploadsDir, { recursive: true });

  try {
    await fs.access(botsFile);
  } catch {
    const seed: BotConfig[] = env.TELEGRAM_BOT_TOKEN
      ? [
          {
            id: randomUUID(),
            name: env.BOT_NAME,
            token: env.TELEGRAM_BOT_TOKEN,
            prompt: env.BOT_PROMPT,
            pixKey: env.PIX_KEY,
            messageDelayMs: env.MESSAGE_DELAY_MS,
            previewMediaUrls: parseUrls(env.PREVIEW_MEDIA_URLS),
            deliveryMediaUrls: parseUrls(env.DELIVERY_MEDIA_URLS),
            active: true
          }
        ]
      : [];

    await fs.writeFile(botsFile, JSON.stringify(seed, null, 2));
  }
}

export async function loadBots() {
  await ensureDataFile();
  const raw = await fs.readFile(botsFile, "utf8");
  return JSON.parse(raw) as BotConfig[];
}

export async function saveBots(bots: BotConfig[]) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(botsFile, JSON.stringify(bots, null, 2));
}

export { uploadsDir, dataDir };
