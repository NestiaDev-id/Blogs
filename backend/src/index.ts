import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

// Routes
import authRoute from "./routes/auth.route.js";
import seriesRoute from "./routes/series.route.js";
import postRoute from "./routes/post.route.js";

const app = new Hono();

// Middleware global
app.use("*", cors());

// Root
app.get("/", (c) => c.redirect("/api"));

import connectDB from "./config/database.js";
connectDB(); // Hubungkan ke Mongoose saat server start

// Root API
app.get("/api", (c) =>
  c.json({
    message: "Welcome to Lentera Blog API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      series: "/api/series",
      posts: "/api/posts",
    },
  })
);

// Mount routes
app.route("/api/auth", authRoute);
app.route("/api/series", seriesRoute);
app.route("/api/posts", postRoute);

// Error Handler
app.onError((err, c) =>
  c.json({ status: "error", message: err.message }, 500)
);

// 404 handler
app.notFound((c) =>
  c.json({ status: "error", message: "Not Found" }, 404)
);

const port = 3000;

// Export app untuk Vercel Serverless Function
export default app;

// Jalankan server lokal HANYA jika bukan di environment Vercel/Production
if (process.env.NODE_ENV !== "production") {
  console.log(`🚀 Server running on http://localhost:${port}`);
  serve({ fetch: app.fetch, port });
}