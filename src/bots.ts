import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { env } from "./config.js";
import { getPool, useDatabase } from "./db/index.js";

const dataDir = env.DATA_DIR;
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
  paymentMethod: "pix" | "laranjinha";
  laranjinhaApiKeyEncrypted?: string;
  productName: string;
  productPriceCents: number;
  telegramGroupLink: string;
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
            active: true,
            paymentMethod: "pix",
            productName: "VIP",
            productPriceCents: 4990,
            telegramGroupLink: ""
          }
        ]
      : [];

    await fs.writeFile(botsFile, JSON.stringify(seed, null, 2));
  }
}

function rowToBot(row: {
  id: string;
  name: string;
  token: string;
  prompt: string;
  pix_key: string;
  message_delay_ms: number;
  preview_media_urls: string[] | string;
  delivery_media_urls: string[] | string;
  active: boolean;
  payment_method?: string;
  laranjinha_api_key_encrypted?: string | null;
  product_name?: string;
  product_price_cents?: number;
  telegram_group_link?: string;
}): BotConfig {
  return {
    id: row.id,
    name: row.name,
    token: row.token,
    prompt: row.prompt,
    pixKey: row.pix_key,
    messageDelayMs: row.message_delay_ms,
    previewMediaUrls:
      typeof row.preview_media_urls === "string"
        ? JSON.parse(row.preview_media_urls)
        : row.preview_media_urls,
    deliveryMediaUrls:
      typeof row.delivery_media_urls === "string"
        ? JSON.parse(row.delivery_media_urls)
        : row.delivery_media_urls,
    active: row.active,
    paymentMethod: row.payment_method === "laranjinha" ? "laranjinha" : "pix",
    laranjinhaApiKeyEncrypted: row.laranjinha_api_key_encrypted ?? undefined,
    productName: row.product_name ?? "VIP",
    productPriceCents: row.product_price_cents ?? 4990,
    telegramGroupLink: row.telegram_group_link ?? ""
  };
}

export async function loadBots() {
  if (useDatabase()) {
    const { rows } = await getPool().query(
      `SELECT id, name, token, prompt, pix_key, message_delay_ms, preview_media_urls, delivery_media_urls, active,
              payment_method, laranjinha_api_key_encrypted, product_name, product_price_cents, telegram_group_link
       FROM bots ORDER BY created_at ASC`
    );
    return rows.map(rowToBot);
  }

  await ensureDataFile();
  const raw = await fs.readFile(botsFile, "utf8");
  const bots = JSON.parse(raw) as Partial<BotConfig>[];
  return bots.map((b) => ({
    ...b,
    productName: b.productName ?? "VIP",
    productPriceCents: b.productPriceCents ?? 4990,
    telegramGroupLink: b.telegramGroupLink ?? "",
    paymentMethod: b.paymentMethod === "laranjinha" ? "laranjinha" : "pix"
  })) as BotConfig[];
}

export async function saveBots(bots: BotConfig[]) {
  if (useDatabase()) {
    const db = getPool();
    const client = await db.connect();
    try {
      await client.query("BEGIN");
      await client.query("DELETE FROM bots");
      for (const bot of bots) {
        await client.query(
          `INSERT INTO bots (id, name, token, prompt, pix_key, message_delay_ms, preview_media_urls, delivery_media_urls, active,
            payment_method, laranjinha_api_key_encrypted, product_name, product_price_cents, telegram_group_link)
           VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9,$10,$11,$12,$13,$14)`,
          [
            bot.id,
            bot.name,
            bot.token,
            bot.prompt,
            bot.pixKey,
            bot.messageDelayMs,
            JSON.stringify(bot.previewMediaUrls),
            JSON.stringify(bot.deliveryMediaUrls),
            bot.active,
            bot.paymentMethod,
            bot.laranjinhaApiKeyEncrypted ?? null,
            bot.productName,
            bot.productPriceCents,
            bot.telegramGroupLink
          ]
        );
      }
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
    return;
  }

  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(botsFile, JSON.stringify(bots, null, 2));
}

export { uploadsDir, dataDir };
