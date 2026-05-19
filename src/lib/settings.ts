import fs from "node:fs/promises";
import path from "node:path";
import { env, rootDir } from "../config.js";
import { decryptSecret, encryptSecret, maskApiKey } from "./crypto.js";

const dataDir = path.join(rootDir, "data");
const settingsFile = path.join(dataDir, "settings.json");

export type AppSettings = {
  openaiApiKeyEncrypted?: string;
  openaiModel: string;
};

const defaultSettings: AppSettings = {
  openaiModel: env.OPENAI_MODEL
};

export async function loadSettings(): Promise<AppSettings> {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    const raw = await fs.readFile(settingsFile, "utf8");
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return { ...defaultSettings };
  }
}

export async function saveSettings(settings: AppSettings) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(settingsFile, JSON.stringify(settings, null, 2));
}

export async function getOpenAIApiKey(): Promise<string> {
  const settings = await loadSettings();
  if (settings.openaiApiKeyEncrypted) {
    return decryptSecret(settings.openaiApiKeyEncrypted);
  }
  if (env.OPENAI_API_KEY) {
    return env.OPENAI_API_KEY;
  }
  throw new Error("Configure a OpenAI API Key no painel em Configuracoes.");
}

export async function getOpenAIModel(): Promise<string> {
  const settings = await loadSettings();
  return settings.openaiModel || env.OPENAI_MODEL;
}

export async function getApiKeyStatus() {
  const settings = await loadSettings();
  if (settings.openaiApiKeyEncrypted) {
    try {
      const key = decryptSecret(settings.openaiApiKeyEncrypted);
      return { configured: true, masked: maskApiKey(key), source: "painel" as const };
    } catch {
      return { configured: false, masked: "", source: "painel" as const };
    }
  }
  if (env.OPENAI_API_KEY) {
    return { configured: true, masked: maskApiKey(env.OPENAI_API_KEY), source: "env" as const };
  }
  return { configured: false, masked: "", source: "none" as const };
}

export async function updateOpenAISettings(input: { apiKey?: string; model?: string }) {
  const current = await loadSettings();
  const next: AppSettings = {
    openaiModel: input.model?.trim() || current.openaiModel || env.OPENAI_MODEL
  };

  if (input.apiKey?.trim()) {
    next.openaiApiKeyEncrypted = encryptSecret(input.apiKey.trim());
  } else if (current.openaiApiKeyEncrypted) {
    next.openaiApiKeyEncrypted = current.openaiApiKeyEncrypted;
  }

  await saveSettings(next);
  return next;
}
