import type { Context } from "hono";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/database.js";
import { env } from "../config/env.js";

// POST /api/auth/register
export const register = async (c: Context) => {
  const { email, password, name } = await c.req.json();

  if (!email || !password || !name) {
    return c.json({ status: "error", message: "Email, password, dan nama wajib diisi" }, 400);
  }

  // Cek apakah email sudah terdaftar
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return c.json({ status: "error", message: "Email sudah terdaftar" }, 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { email, password: hashedPassword, name },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  return c.json({ status: "success", data: user }, 201);
};

// POST /api/auth/login
export const login = async (c: Context) => {
  const { email, password } = await c.req.json();

  if (!email || !password) {
    return c.json({ status: "error", message: "Email dan password wajib diisi" }, 400);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return c.json({ status: "error", message: "Email atau password salah" }, 401);
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return c.json({ status: "error", message: "Email atau password salah" }, 401);
  }

  const token = jwt.sign({ id: user.id, role: user.role }, env.JWT_SECRET, { expiresIn: "7d" });

  return c.json({
    status: "success",
    data: {
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    },
  });
};

// GET /api/auth/me - Ambil profil user yang sedang login
export const getMe = async (c: Context) => {
  const userId = c.get("userId");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, avatar: true, bio: true, role: true, createdAt: true },
  });

  if (!user) {
    return c.json({ status: "error", message: "User tidak ditemukan" }, 404);
  }

  return c.json({ status: "success", data: user });
};
