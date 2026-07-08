import type { Context } from "hono";
import { Post, Series } from "../models/index.js";

// GET /api/posts - Daftar semua post (bisa filter: ?type=article | ?type=chapter | ?series=slug)
export const getAllPosts = async (c: Context) => {
  const type = c.req.query("type"); // "article" atau "chapter"
  const seriesSlug = c.req.query("series");

  let query: any = { status: "PUBLISHED" };

  if (type === "article") {
    query.seriesId = null; // Artikel lepas
  } else if (type === "chapter") {
    query.seriesId = { $ne: null }; // Hanya chapter dari seri
  }

  if (seriesSlug) {
    const series = await Series.findOne({ slug: seriesSlug });
    if (series) query.seriesId = series._id;
  }

  const posts = await Post.find(query)
    .populate("authorId", "name avatar")
    .populate("seriesId", "title slug")
    .sort({ createdAt: -1 });

  return c.json({ status: "success", data: posts });
};

// GET /api/posts/:slug - Baca isi tulisan
export const getPostBySlug = async (c: Context) => {
  const slug = c.req.param("slug");

  const post = await Post.findOne({ slug })
    .populate("authorId", "name avatar")
    .populate("seriesId", "title slug");

  if (!post) {
    return c.json({ status: "error", message: "Tulisan tidak ditemukan" }, 404);
  }

  // Tambah view count
  post.viewCount = (post.viewCount || 0) + 1;
  await post.save();

  return c.json({ status: "success", data: post });
};

// POST /api/posts - Tulis artikel/bab baru (Author only)
export const createPost = async (c: Context) => {
  const userId = c.get("userId");
  const { title, content, excerpt, status, seriesId, order } = await c.req.json();

  if (!title) {
    return c.json({ status: "error", message: "Judul wajib diisi" }, 400);
  }

  // Generate slug
  const slug = title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();

  // Pastikan slug unik
  const existing = await Post.findOne({ slug });
  if (existing) {
    return c.json({ status: "error", message: "Judul sudah digunakan, coba judul lain" }, 409);
  }

  const post = await Post.create({
    title, slug, content: content || "", excerpt, status: status || "DRAFT", order: order || null, authorId: userId, seriesId: seriesId || null
  });

  return c.json({ status: "success", data: post }, 201);
};
