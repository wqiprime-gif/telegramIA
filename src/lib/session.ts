import crypto from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import { env } from "../config.js";

export const SESSION_COOKIE = "tg_panel_session";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function sign(data: string) {
  return crypto.createHmac("sha256", env.SESSION_SECRET).update(data).digest("base64url");
}

export function createSessionToken() {
  const payload = Buffer.from(
    JSON.stringify({ exp: Date.now() + MAX_AGE_MS, v: 1 }),
    "utf8"
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token?: string) {
  if (!token) {
    return false;
  }

  const [payload, signature] = token.split(".");
  if (!payload || !signature || sign(payload) !== signature) {
    return false;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { exp?: number };
    return typeof parsed.exp === "number" && parsed.exp > Date.now();
  } catch {
    return false;
  }
}

export function isAuthenticated(request: FastifyRequest) {
  return verifySessionToken(request.cookies[SESSION_COOKIE]);
}

export function setSessionCookie(reply: FastifyReply) {
  reply.setCookie(SESSION_COOKIE, createSessionToken(), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE_MS / 1000
  });
}

export function clearSessionCookie(reply: FastifyReply) {
  reply.clearCookie(SESSION_COOKIE, { path: "/" });
}

export function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  if (isAuthenticated(request)) {
    return true;
  }
  reply.redirect("/login");
  return false;
}
