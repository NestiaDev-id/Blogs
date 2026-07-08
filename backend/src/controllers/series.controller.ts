import type { Context } from "hono";
import { Series } from "../models/index.js";

// GET /api/series - Daftar semua seri
export const getAllSeries = async (c: Context) => {
  const series = await Series.find().populate("authorId", "name avatar").sort({ updatedAt: -1 });
  return c.json({ status: "success", data: series });
};

// GET /api/series/:slug - Detail seri (bisa dipopulate dengan post nanti di resolver terpisah jika butuh kompleksitas)
export const getSeriesBySlug = async (c: Context) => {
  const slug = c.req.param("slug");

  const series = await Series.findOne({ slug }).populate("authorId", "name avatar");

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

  // Generate slug
  const slug = title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();

  // Pastikan slug unik
  const existing = await Series.findOne({ slug });
  if (existing) {
    return c.json({ status: "error", message: "Judul sudah digunakan, coba judul lain" }, 409);
  }

  const series = await Series.create({
    title, slug, description, coverImage, status, authorId: userId
  });

  return c.json({ status: "success", data: series }, 201);
};
