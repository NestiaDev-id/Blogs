import type { Context } from "hono";
import prisma from "../config/database.js";

// GET /api/posts/:postId/comments - Lihat komentar di suatu tulisan
export const getComments = async (c: Context) => {
  const postId = c.req.param("postId");

  const comments = await prisma.comment.findMany({
    where: { postId },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: "desc" },
  });

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
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    return c.json({ status: "error", message: "Tulisan tidak ditemukan" }, 404);
  }

  const comment = await prisma.comment.create({
    data: { content: content.trim(), postId, userId },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
    },
  });

  return c.json({ status: "success", data: comment }, 201);
};
