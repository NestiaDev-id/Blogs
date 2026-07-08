import type { Context } from "hono";
import prisma from "../config/database.js";

// GET /api/posts - Daftar semua post (bisa filter: ?type=article | ?type=chapter | ?series=slug)
export const getAllPosts = async (c: Context) => {
  const type = c.req.query("type"); // "article" atau "chapter"
  const seriesSlug = c.req.query("series");

  const where: any = { status: "PUBLISHED" };

  if (type === "article") {
    where.seriesId = null; // Artikel lepas (tidak punya seri)
  } else if (type === "chapter") {
    where.seriesId = { not: null }; // Hanya chapter dari seri
  }

  if (seriesSlug) {
    const series = await prisma.series.findUnique({ where: { slug: seriesSlug } });
    if (series) where.seriesId = series.id;
  }

  const posts = await prisma.post.findMany({
    where,
    include: {
      author: { select: { id: true, name: true, avatar: true } },
      series: { select: { id: true, title: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return c.json({ status: "success", data: posts });
};

// GET /api/posts/:slug - Baca isi tulisan
export const getPostBySlug = async (c: Context) => {
  const slug = c.req.param("slug");

  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: { select: { id: true, name: true, avatar: true } },
      series: { select: { id: true, title: true, slug: true } },
    },
  });

  if (!post) {
    return c.json({ status: "error", message: "Tulisan tidak ditemukan" }, 404);
  }

  // Tambah view count
  await prisma.post.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } });

  return c.json({ status: "success", data: { ...post, viewCount: post.viewCount + 1 } });
};

// POST /api/posts - Tulis artikel/bab baru (Author only)
export const createPost = async (c: Context) => {
  const userId = c.get("userId");
  const { title, content, excerpt, status, seriesId, order } = await c.req.json();

  if (!title) {
    return c.json({ status: "error", message: "Judul wajib diisi" }, 400);
  }

  // Generate slug dari title
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  // Pastikan slug unik
  const existing = await prisma.post.findUnique({ where: { slug } });
  if (existing) {
    return c.json({ status: "error", message: "Judul sudah digunakan, coba judul lain" }, 409);
  }

  const post = await prisma.post.create({
    data: {
      title,
      slug,
      content: content || "",
      excerpt,
      status: status || "DRAFT",
      order: order || null,
      authorId: userId,
      seriesId: seriesId || null,
    },
  });

  return c.json({ status: "success", data: post }, 201);
};
