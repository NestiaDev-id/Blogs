import { Hono } from "hono";
import { getAllPosts, getPostBySlug, createPost } from "../controllers/post.controller.js";
import { getComments, createComment } from "../controllers/comment.controller.js";
import { authRequired, authorOnly } from "../middlewares/auth.middleware.js";

const postRoute = new Hono();

// Post endpoints
postRoute.get("/", getAllPosts);
postRoute.get("/:slug", getPostBySlug);
postRoute.post("/", authRequired, authorOnly, createPost);

// Comment endpoints (nested under post)
postRoute.get("/:postId/comments", getComments);
postRoute.post("/:postId/comments", authRequired, createComment);

export default postRoute;
