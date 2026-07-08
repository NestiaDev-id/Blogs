import type { Context } from "hono";
import { Comment, Post } from "../models/index.js";

// GET /api/posts/:postId/comments - Lihat komentar di suatu tulisan
export const getComments = async (c: Context) => {
  const postId = c.req.param("postId");

  const comments = await Comment.find({ postId })
    .populate("userId", "name avatar")
    .sort({ createdAt: -1 });

  return c.json({ status: "success", data: comments });
};

// POST /api/posts/:postId/comments - Kirim komentar (Login required)
export const createComment = async (c: Context) => {
  const postId = c.req.param("postId");
  const userId = c.get("userId");
  const { content } = await c.req.json();

  if (!content || content.trim() === "") {
    return c.json({ status: "error", message: "Isi komentar tidak boleh kosong" }, 400);
  }

  // Pastikan post ada
  const post = await Post.findById(postId);
  if (!post) {
    return c.json({ status: "error", message: "Tulisan tidak ditemukan" }, 404);
  }

  const comment = await Comment.create({ content: content.trim(), postId, userId });
  await comment.populate("userId", "name avatar");

  return c.json({ status: "success", data: comment }, 201);
};
