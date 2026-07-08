import mongoose from "mongoose";

// --- MODEL USER ---
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  avatar: { type: String, default: null },
  bio: { type: String, default: null },
  role: { type: String, default: "READER" }, // READER, AUTHOR, ADMIN
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);

// --- MODEL SERIES (Novel) ---
const seriesSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: null },
  coverImage: { type: String, default: null },
  status: { type: String, default: "ONGOING" },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

export const Series = mongoose.model("Series", seriesSchema);

// --- MODEL POST (Artikel / Chapter) ---
const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, default: "" },
  excerpt: { type: String, default: null },
  status: { type: String, default: "DRAFT" },
  viewCount: { type: Number, default: 0 },
  order: { type: Number, default: null },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  seriesId: { type: mongoose.Schema.Types.ObjectId, ref: "Series", default: null }
}, { timestamps: true });

export const Post = mongoose.model("Post", postSchema);

// --- MODEL COMMENT ---
const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

export const Comment = mongoose.model("Comment", commentSchema);
