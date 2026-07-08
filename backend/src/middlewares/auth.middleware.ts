import type { Context, Next } from "hono";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

// Middleware: Wajib login (token JWT valid)
export const authRequired = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ status: "error", message: "Token tidak ditemukan" }, 401);
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string; role: string };

    // Simpan data user ke context agar bisa diakses di controller
    c.set("userId", decoded.id);
    c.set("userRole", decoded.role);

    await next();
  } catch {
    return c.json({ status: "error", message: "Token tidak valid atau sudah kedaluwarsa" }, 401);
  }
};

// Middleware: Hanya Author atau Admin yang boleh akses
export const authorOnly = async (c: Context, next: Next) => {
  const role = c.get("userRole");

  if (role !== "AUTHOR" && role !== "ADMIN") {
    return c.json({ status: "error", message: "Akses ditolak. Hanya penulis yang diizinkan." }, 403);
  }

  await next();
};
