import type { Context } from "hono";
import prisma from "../config/database.js";

// GET /api/series - Daftar semua seri
export const getAllSeries = async (c: Context) => {
  const series = await prisma.series.findMany({
    include: {
      author: { select: { id: true, name: true, avatar: true } },
      _count: { select: { posts: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return c.json({ status: "success", data: series });
};

// GET /api/series/:slug - Detail seri beserta daftar post (chapter)
export const getSeriesBySlug = async (c: Context) => {
  const slug = c.req.param("slug");

  const series = await prisma.series.findUnique({
    where: { slug },
    include: {
      author: { select: { id: true, name: true, avatar: true } },
      posts: {
        where: { status: "PUBLISHED" },
        orderBy: { order: "asc" },
        select: { id: true, title: true, slug: true, order: true, createdAt: true },
      },
    },
  });

  if (!series) {
    return c.json({ status: "error", message: "Seri tidak ditemukan" }, 404);
  }

  return c.json({ status: "success", data: series });
};

// POST /api/series - Buat seri baru (Author only)
export const createSeries = async (c: Context) => {
  const userId = c.get("userId");
  const { title, description, coverImage, status } = await c.req.json();

  if (!title) {
    return c.json({ status: "error", message: "Judul seri wajib diisi" }, 400);
  }

  // Generate slug dari title
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  // Pastikan slug unik
  const existing = await prisma.series.findUnique({ where: { slug } });
  if (existing) {
    return c.json({ status: "error", message: "Judul sudah digunakan, coba judul lain" }, 409);
  }

  const series = await prisma.series.create({
    data: { title, slug, description, coverImage, status, authorId: userId },
  });

  return c.json({ status: "success", data: series }, 201);
};
