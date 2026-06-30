export interface Chapter {
  id: number;
  title: string;
  content: string[]; // List of paragraphs
}

export interface Novel {
  id: string;
  title: string;
  author: string;
  coverColor: string; // Tailwind gradient class or color class
  coverEmoji: string; // Emoji representing the novel theme
  genre: string;
  rating: number;
  synopsis: string;
  chapters: Chapter[];
  status: "Berjalan" | "Tamat";
  totalWords: number;
  views: string;
}

export interface Bookmark {
  novelId: string;
  chapterId: number;
  chapterTitle: string;
  novelTitle: string;
  savedAt: string;
}

export interface UserDraft {
  id: string;
  title: string;
  genre: string;
  synopsis: string;
  content: string;
  updatedAt: string;
}

export interface ReaderSettings {
  fontSize: "sm" | "base" | "lg" | "xl" | "2xl";
  theme: "sepia" | "light" | "dark" | "paper";
  lineHeight: "relaxed" | "loose" | "snug";
}
