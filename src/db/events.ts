import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { env } from "../config.js";
import { getPool, useDatabase } from "./index.js";

const eventsFile = path.join(env.DATA_DIR, "events.json");

type Store = {
  leads: Lead[];
  messages: ConversationMessage[];
  receipts: Receipt[];
  sales: Sale[];
  products: Product[];
};

export type Lead = {
  id: string;
  botId: string;
  chatId: number;
  username?: string;
  displayName?: string;
  createdAt: string;
  lastMessageAt: string;
};

export type ConversationMessage = {
  id: string;
  botId: string;
  chatId: number;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
};

export type Receipt = {
  id: string;
  botId: string;
  chatId: number;
  fileUrl?: string;
  fileType?: string;
  paid: boolean;
  confidence: number;
  reason: string;
  createdAt: string;
};

export type Sale = {
  id: string;
  botId: string;
  chatId: number;
  productName: string;
  amountCents: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
};

export type Product = {
  id: string;
  botId: string;
  name: string;
  priceCents: number;
  active: boolean;
  createdAt: string;
};

const emptyStore = (): Store => ({
  leads: [],
  messages: [],
  receipts: [],
  sales: [],
  products: []
});

async function loadFileStore(): Promise<Store> {
  try {
    const raw = await fs.readFile(eventsFile, "utf8");
    return { ...emptyStore(), ...JSON.parse(raw) };
  } catch {
    return emptyStore();
  }
}

async function saveFileStore(store: Store) {
  await fs.mkdir(env.DATA_DIR, { recursive: true });
  await fs.writeFile(eventsFile, JSON.stringify(store, null, 2));
}

export async function initEventsSchema() {
  if (!useDatabase()) return;

  await getPool().query(`
    CREATE TABLE IF NOT EXISTS leads (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      bot_id UUID NOT NULL,
      chat_id BIGINT NOT NULL,
      username TEXT,
      display_name TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(bot_id, chat_id)
    );

    CREATE TABLE IF NOT EXISTS conversation_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      bot_id UUID NOT NULL,
      chat_id BIGINT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS receipts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      bot_id UUID NOT NULL,
      chat_id BIGINT NOT NULL,
      file_url TEXT,
      file_type TEXT,
      paid BOOLEAN NOT NULL DEFAULT false,
      confidence NUMERIC NOT NULL DEFAULT 0,
      reason TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS sales (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      bot_id UUID NOT NULL,
      chat_id BIGINT NOT NULL,
      product_name TEXT NOT NULL,
      amount_cents INTEGER NOT NULL,
      payment_method TEXT NOT NULL DEFAULT 'pix',
      status TEXT NOT NULL DEFAULT 'approved',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      bot_id UUID NOT NULL,
      name TEXT NOT NULL,
      price_cents INTEGER NOT NULL,
      active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    ALTER TABLE bots ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'pix';
    ALTER TABLE bots ADD COLUMN IF NOT EXISTS laranjinha_api_key_encrypted TEXT;
    ALTER TABLE bots ADD COLUMN IF NOT EXISTS product_name TEXT NOT NULL DEFAULT 'VIP';
    ALTER TABLE bots ADD COLUMN IF NOT EXISTS product_price_cents INTEGER NOT NULL DEFAULT 4990;
    ALTER TABLE bots ADD COLUMN IF NOT EXISTS telegram_group_link TEXT NOT NULL DEFAULT '';
  `);
}

export async function upsertLead(input: {
  botId: string;
  chatId: number;
  username?: string;
  displayName?: string;
}) {
  if (useDatabase()) {
    await getPool().query(
      `INSERT INTO leads (bot_id, chat_id, username, display_name)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (bot_id, chat_id) DO UPDATE SET
         username = COALESCE(EXCLUDED.username, leads.username),
         display_name = COALESCE(EXCLUDED.display_name, leads.display_name),
         last_message_at = NOW()`,
      [input.botId, input.chatId, input.username ?? null, input.displayName ?? null]
    );
    return;
  }

  const store = await loadFileStore();
  const existing = store.leads.find((l) => l.botId === input.botId && l.chatId === input.chatId);
  const now = new Date().toISOString();
  if (existing) {
    existing.lastMessageAt = now;
    if (input.username) existing.username = input.username;
    if (input.displayName) existing.displayName = input.displayName;
  } else {
    store.leads.push({
      id: randomUUID(),
      botId: input.botId,
      chatId: input.chatId,
      username: input.username,
      displayName: input.displayName,
      createdAt: now,
      lastMessageAt: now
    });
  }
  await saveFileStore(store);
}

export async function logMessage(input: {
  botId: string;
  chatId: number;
  role: "user" | "assistant" | "system";
  content: string;
}) {
  if (useDatabase()) {
    await getPool().query(
      `INSERT INTO conversation_messages (bot_id, chat_id, role, content) VALUES ($1,$2,$3,$4)`,
      [input.botId, input.chatId, input.role, input.content.slice(0, 8000)]
    );
    return;
  }

  const store = await loadFileStore();
  store.messages.push({
    id: randomUUID(),
    botId: input.botId,
    chatId: input.chatId,
    role: input.role,
    content: input.content.slice(0, 8000),
    createdAt: new Date().toISOString()
  });
  if (store.messages.length > 5000) store.messages = store.messages.slice(-5000);
  await saveFileStore(store);
}

export async function logReceipt(input: {
  botId: string;
  chatId: number;
  fileUrl?: string;
  fileType?: string;
  paid: boolean;
  confidence: number;
  reason: string;
}) {
  if (useDatabase()) {
    await getPool().query(
      `INSERT INTO receipts (bot_id, chat_id, file_url, file_type, paid, confidence, reason)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        input.botId,
        input.chatId,
        input.fileUrl ?? null,
        input.fileType ?? null,
        input.paid,
        input.confidence,
        input.reason
      ]
    );
    return;
  }

  const store = await loadFileStore();
  store.receipts.unshift({
    id: randomUUID(),
    ...input,
    createdAt: new Date().toISOString()
  });
  await saveFileStore(store);
}

export async function logSale(input: {
  botId: string;
  chatId: number;
  productName: string;
  amountCents: number;
  paymentMethod: string;
}) {
  if (useDatabase()) {
    await getPool().query(
      `INSERT INTO sales (bot_id, chat_id, product_name, amount_cents, payment_method)
       VALUES ($1,$2,$3,$4,$5)`,
      [input.botId, input.chatId, input.productName, input.amountCents, input.paymentMethod]
    );
    return;
  }

  const store = await loadFileStore();
  store.sales.unshift({
    id: randomUUID(),
    botId: input.botId,
    chatId: input.chatId,
    productName: input.productName,
    amountCents: input.amountCents,
    paymentMethod: input.paymentMethod,
    status: "approved",
    createdAt: new Date().toISOString()
  });
  await saveFileStore(store);
}

export async function listLeads(limit = 100) {
  if (useDatabase()) {
    const { rows } = await getPool().query(
      `SELECT l.*, b.name AS bot_name FROM leads l
       LEFT JOIN bots b ON b.id = l.bot_id
       ORDER BY l.last_message_at DESC LIMIT $1`,
      [limit]
    );
    return rows;
  }
  const store = await loadFileStore();
  return store.leads.slice(0, limit);
}

export async function listConversations(limit = 80) {
  if (useDatabase()) {
    const { rows } = await getPool().query(
      `SELECT m.*, b.name AS bot_name FROM conversation_messages m
       LEFT JOIN bots b ON b.id = m.bot_id
       ORDER BY m.created_at DESC LIMIT $1`,
      [limit]
    );
    return rows;
  }
  const store = await loadFileStore();
  return store.messages.slice(-limit).reverse();
}

export async function listReceipts(limit = 50) {
  if (useDatabase()) {
    const { rows } = await getPool().query(
      `SELECT r.*, b.name AS bot_name FROM receipts r
       LEFT JOIN bots b ON b.id = r.bot_id
       ORDER BY r.created_at DESC LIMIT $1`,
      [limit]
    );
    return rows;
  }
  const store = await loadFileStore();
  return store.receipts.slice(0, limit);
}

export async function listSales(limit = 50) {
  if (useDatabase()) {
    const { rows } = await getPool().query(
      `SELECT s.*, b.name AS bot_name FROM sales s
       LEFT JOIN bots b ON b.id = s.bot_id
       ORDER BY s.created_at DESC LIMIT $1`,
      [limit]
    );
    return rows;
  }
  const store = await loadFileStore();
  return store.sales.slice(0, limit);
}

export async function salesByDay(days = 7) {
  if (useDatabase()) {
    const { rows } = await getPool().query<{ day: string; total: string }>(
      `SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day,
              COALESCE(SUM(amount_cents), 0)::text AS total
       FROM sales
       WHERE created_at >= NOW() - ($1::int || ' days')::interval
       GROUP BY 1 ORDER BY 1`,
      [days]
    );
    return rows.map((r) => ({ day: r.day, totalCents: Number(r.total) }));
  }

  const store = await loadFileStore();
  const map = new Map<string, number>();
  const cutoff = Date.now() - days * 86400000;
  for (const s of store.sales) {
    if (new Date(s.createdAt).getTime() < cutoff) continue;
    const day = s.createdAt.slice(0, 10);
    map.set(day, (map.get(day) ?? 0) + s.amountCents);
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([day, totalCents]) => ({ day, totalCents }));
}

export async function dashboardStats() {
  if (useDatabase()) {
    const db = getPool();
    const [leads, sales, receipts, messages] = await Promise.all([
      db.query<{ c: string }>("SELECT COUNT(*)::text AS c FROM leads"),
      db.query<{ total: string; count: string }>(
        "SELECT COALESCE(SUM(amount_cents),0)::text AS total, COUNT(*)::text AS count FROM sales"
      ),
      db.query<{ c: string }>("SELECT COUNT(*)::text AS c FROM receipts WHERE paid = true"),
      db.query<{ c: string }>(
        "SELECT COUNT(*)::text AS c FROM conversation_messages WHERE created_at >= NOW() - interval '1 day'"
      )
    ]);
    return {
      leads: Number(leads.rows[0]?.c ?? 0),
      salesTotalCents: Number(sales.rows[0]?.total ?? 0),
      salesCount: Number(sales.rows[0]?.count ?? 0),
      receiptsApproved: Number(receipts.rows[0]?.c ?? 0),
      messagesToday: Number(messages.rows[0]?.c ?? 0)
    };
  }

  const store = await loadFileStore();
  const today = new Date().toISOString().slice(0, 10);
  return {
    leads: store.leads.length,
    salesTotalCents: store.sales.reduce((s, x) => s + x.amountCents, 0),
    salesCount: store.sales.length,
    receiptsApproved: store.receipts.filter((r) => r.paid).length,
    messagesToday: store.messages.filter((m) => m.createdAt.startsWith(today)).length
  };
}

export async function listProducts(botId?: string) {
  if (useDatabase()) {
    const { rows } = botId
      ? await getPool().query(
          `SELECT p.*, b.name AS bot_name FROM products p LEFT JOIN bots b ON b.id = p.bot_id
           WHERE p.bot_id = $1 ORDER BY p.created_at DESC`,
          [botId]
        )
      : await getPool().query(
          `SELECT p.*, b.name AS bot_name FROM products p LEFT JOIN bots b ON b.id = p.bot_id ORDER BY p.created_at DESC`
        );
    return rows;
  }
  const store = await loadFileStore();
  return botId ? store.products.filter((p) => p.botId === botId) : store.products;
}

export async function saveProduct(input: { botId: string; name: string; priceCents: number }) {
  if (useDatabase()) {
    await getPool().query(
      `INSERT INTO products (bot_id, name, price_cents) VALUES ($1,$2,$3)`,
      [input.botId, input.name, input.priceCents]
    );
    return;
  }
  const store = await loadFileStore();
  store.products.push({
    id: randomUUID(),
    botId: input.botId,
    name: input.name,
    priceCents: input.priceCents,
    active: true,
    createdAt: new Date().toISOString()
  });
  await saveFileStore(store);
}
