// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Sparkles,
  PenTool,
  MessageSquare,
  Settings,
  ChevronRight,
  ChevronLeft,
  Search,
  Bookmark,
  Trash,
  Plus,
  Star,
  Check,
  Copy,
  RotateCcw,
  TrendingUp,
  Compass,
  Users,
  Feather,
  Heart,
  Info,
  ExternalLink,
  BookMarked,
  Layers,
  Send,
  HelpCircle,
  Volume2,
  FileText,
  Activity
} from "lucide-react";
import { MOCK_NOVELS, MOCK_BLOGS, PRESET_CHARACTERS } from "./data";
import type { Novel, Chapter, Bookmark as BookmarkType, UserDraft, ReaderSettings } from "./types";

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<number>(0);

  // Novel Library & Reader State
  const [novels, setNovels] = useState<Novel[]>(MOCK_NOVELS);
  const [selectedNovel, setSelectedNovel] = useState<Novel | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [showBookmarksList, setShowBookmarksList] = useState<boolean>(false);

  // Reading Settings
  const [readerSettings, setReaderSettings] = useState<ReaderSettings>({
    fontSize: "lg",
    theme: "sepia",
    lineHeight: "relaxed",
  });

  // AI Co-Writer Drafts State
  const [drafts, setDrafts] = useState<UserDraft[]>([]);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState<string>("Draf Novel Baru Saya");
  const [draftGenre, setDraftGenre] = useState<string>("Fantasy");
  const [draftSynopsis, setDraftSynopsis] = useState<string>("");
  const [draftContent, setDraftContent] = useState<string>(
    "Di tengah kegelapan malam yang sunyi, suara langkah kaki bergaung di sepanjang koridor kastil tua..."
  );

  // Community State
  const [blogs, setBlogs] = useState(MOCK_BLOGS);
  const [newBlogTitle, setNewBlogTitle] = useState("");
  const [newBlogAuthor, setNewBlogAuthor] = useState("");
  const [newBlogContent, setNewBlogContent] = useState("");
  const [showAddBlog, setShowAddBlog] = useState(false);
  
  // Review state
  const [selectedReviewNovelId, setSelectedReviewNovelId] = useState("1");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewAuthor, setReviewAuthor] = useState("");
  const [recentReviews, setRecentReviews] = useState<Array<{
    id: string;
    novelTitle: string;
    author: string;
    rating: number;
    text: string;
    date: string;
  }>>([
    {
      id: "rev-1",
      novelTitle: "Gerbang Takdir: Saga Sang Pelopor",
      author: "Yuda_Pembaca",
      rating: 5,
      text: "Sangat suka dengan premis protagonis tanpa takdir! Benar-benar fresh dan tidak sabar menunggu kelanjutan Bab berikutnya.",
      date: "Hari ini"
    },
    {
      id: "rev-2",
      novelTitle: "Mahkota Air Mata: Reinkarnasi Putri Terbuang",
      author: "Elisa_99",
      rating: 4,
      text: "Sylvia keren sekali! Karakter balas dendam yang cerdas dan berkelas. Pertahankan alur cerita seperti ini, Kak!",
      date: "Kemarin"
    }
  ]);

  // Server health state
  const [serverStatus, setServerStatus] = useState<"checking" | "online" | "offline">("checking");
  const [serverTimestamp, setServerTimestamp] = useState<string>("");

  // Load and save localStorage configurations
  useEffect(() => {
    // Load Bookmarks
    const savedBookmarks = localStorage.getItem("novel_bookmarks");
    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks));
      } catch (e) {
        console.error(e);
      }
    }

    // Load Drafts
    const savedDrafts = localStorage.getItem("user_novel_drafts");
    if (savedDrafts) {
      try {
        const parsedDrafts = JSON.parse(savedDrafts);
        setDrafts(parsedDrafts);
        if (parsedDrafts.length > 0) {
          setActiveDraftId(parsedDrafts[0].id);
          setDraftTitle(parsedDrafts[0].title);
          setDraftGenre(parsedDrafts[0].genre);
          setDraftSynopsis(parsedDrafts[0].synopsis);
          setDraftContent(parsedDrafts[0].content);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      // Create initial draft
      const initialDraft: UserDraft = {
        id: "draft-1",
        title: "Ksatria Bayangan Terakhir",
        genre: "Fantasy",
        synopsis: "Kisah tentang seorang ksatria yang menggunakan sihir bayangan yang dilarang demi menyelamatkan kerajaannya.",
        content: "Angin malam berembus kencang, menggoyahkan dedaunan kering di Hutan Sunyi. Elian menarik jubah hitamnya lebih rapat. Di depannya berdiri gerbang gerigi logam Kastil Bayangan, lambang kekuasaan kegelapan yang harus dia taklukkan malam ini...",
        updatedAt: new Date().toLocaleDateString("id-ID")
      };
      setDrafts([initialDraft]);
      setActiveDraftId(initialDraft.id);
      setDraftTitle(initialDraft.title);
      setDraftGenre(initialDraft.genre);
      setDraftSynopsis(initialDraft.synopsis);
      setDraftContent(initialDraft.content);
    }

    // Check Server Health
    checkServerHealth();
  }, []);

  // Save Bookmarks to LocalStorage
  const saveBookmarksToStorage = (newBookmarks: BookmarkType[]) => {
    setBookmarks(newBookmarks);
    localStorage.setItem("novel_bookmarks", JSON.stringify(newBookmarks));
  };

  // Check backend server status
  const checkServerHealth = async () => {
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      if (data.status === "healthy") {
        setServerStatus("online");
        setServerTimestamp(data.timestamp);
      } else {
        setServerStatus("offline");
      }
    } catch (err) {
      setServerStatus("offline");
    }
  };

  // Create a new draft
  const handleCreateNewDraft = () => {
    const newId = `draft-${Date.now()}`;
    const newDraft: UserDraft = {
      id: newId,
      title: "Novel Tanpa Judul Baru",
      genre: "Fantasy",
      synopsis: "Sinopsis draf novel baru Anda...",
      content: "Mulai menulis novel hebat Anda di sini...",
      updatedAt: new Date().toLocaleDateString("id-ID")
    };

    const updatedDrafts = [newDraft, ...drafts];
    setDrafts(updatedDrafts);
    localStorage.setItem("user_novel_drafts", JSON.stringify(updatedDrafts));
    
    // Set as active draft
    setActiveDraftId(newId);
    setDraftTitle(newDraft.title);
    setDraftGenre(newDraft.genre);
    setDraftSynopsis(newDraft.synopsis);
    setDraftContent(newDraft.content);
  };

  // Save active draft
  const handleSaveActiveDraft = (updatedContent?: string, updatedTitle?: string, updatedGenre?: string, updatedSynopsis?: string) => {
    if (!activeDraftId) return;

    const currentContent = updatedContent !== undefined ? updatedContent : draftContent;
    const currentTitle = updatedTitle !== undefined ? updatedTitle : draftTitle;
    const currentGenre = updatedGenre !== undefined ? updatedGenre : draftGenre;
    const currentSynopsis = updatedSynopsis !== undefined ? updatedSynopsis : draftSynopsis;

    const updatedDrafts = drafts.map((d) => {
      if (d.id === activeDraftId) {
        return {
          ...d,
          title: currentTitle,
          genre: currentGenre,
          synopsis: currentSynopsis,
          content: currentContent,
          updatedAt: new Date().toLocaleDateString("id-ID")
        };
      }
      return d;
    });

    setDrafts(updatedDrafts);
    localStorage.setItem("user_novel_drafts", JSON.stringify(updatedDrafts));
  };

  // Select active draft
  const handleSelectDraft = (id: string) => {
    const draft = drafts.find((d) => d.id === id);
    if (draft) {
      setActiveDraftId(id);
      setDraftTitle(draft.title);
      setDraftGenre(draft.genre);
      setDraftSynopsis(draft.synopsis);
      setDraftContent(draft.content);
    }
  };

  // Delete draft
  const handleDeleteDraft = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = drafts.filter((d) => d.id !== id);
    setDrafts(filtered);
    localStorage.setItem("user_novel_drafts", JSON.stringify(filtered));

    if (activeDraftId === id) {
      if (filtered.length > 0) {
        handleSelectDraft(filtered[0].id);
      } else {
        setActiveDraftId(null);
        setDraftTitle("");
        setDraftSynopsis("");
        setDraftContent("");
      }
    }
  };
  // Bookmark Novel Chapter
  const toggleBookmark = (novel: Novel, chapter: Chapter) => {
    const isBookmarked = bookmarks.some(
      (b) => b.novelId === novel.id && b.chapterId === chapter.id
    );

    if (isBookmarked) {
      const filtered = bookmarks.filter(
        (b) => !(b.novelId === novel.id && b.chapterId === chapter.id)
      );
      saveBookmarksToStorage(filtered);
    } else {
      const newBookmark: BookmarkType = {
        novelId: novel.id,
        novelTitle: novel.title,
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        savedAt: new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric"
        })
      };
      saveBookmarksToStorage([...bookmarks, newBookmark]);
    }
  };

  const isChapterBookmarked = (novelId: string, chapterId: number) => {
    return bookmarks.some((b) => b.novelId === novelId && b.chapterId === chapterId);
  };

  // Open Bookmark
  const handleOpenBookmark = (bookmark: BookmarkType) => {
    const targetNovel = novels.find((n) => n.id === bookmark.novelId);
    if (targetNovel) {
      const targetChapter = targetNovel.chapters.find((c) => c.id === bookmark.chapterId);
      if (targetChapter) {
        setSelectedNovel(targetNovel);
        setSelectedChapter(targetChapter);
        setActiveTab(1); // Go to library
        setShowBookmarksList(false);
      }
    }
  };

  // Filter novels list
  const filteredNovels = novels.filter((n) => {
    const matchesGenre = selectedGenre === "Semua" || n.genre === selectedGenre;
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.synopsis.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  // Blog submission
  const handlePublishBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlogTitle || !newBlogAuthor || !newBlogContent) return;

    const newBlog = {
      id: `blog-${Date.now()}`,
      title: newBlogTitle,
      author: newBlogAuthor,
      date: "Baru saja",
      likes: 0,
      comments: 0,
      excerpt: newBlogContent.substring(0, 120) + "..."
    };

    setBlogs([newBlog, ...blogs]);
    setNewBlogTitle("");
    setNewBlogAuthor("");
    setNewBlogContent("");
    setShowAddBlog(false);
  };

  // Review submission
  const handlePublishReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText || !reviewAuthor) return;

    const targetNovel = novels.find((n) => n.id === selectedReviewNovelId);
    if (!targetNovel) return;

    // Save review
    const newRev = {
      id: `rev-${Date.now()}`,
      novelTitle: targetNovel.title,
      author: reviewAuthor,
      rating: reviewRating,
      text: reviewText,
      date: "Hari ini"
    };

    setRecentReviews([newRev, ...recentReviews]);

    // Dynamically adjust novel rating average
    const updatedNovels = novels.map((n) => {
      if (n.id === selectedReviewNovelId) {
        const count = 5; // assume base 5 ratings
        const newAverage = parseFloat(((n.rating * count + reviewRating) / (count + 1)).toFixed(1));
        return {
          ...n,
          rating: newAverage
        };
      }
      return n;
    });

    setNovels(updatedNovels);
    setReviewText("");
    setReviewAuthor("");
    alert("Ulasan Anda berhasil dikirim! Terima kasih atas dukungannya.");
  };

  // Panel details config
  const panels = [
    {
      title: "BERANDA LENTERA",
      subtitle: "Portal Novel & Rekomendasi Utama",
      emoji: "🏮",
      colorClass: "from-amber-600 via-orange-600 to-amber-700",
      accentColor: "amber",
      textClass: "text-amber-400"
    },
    {
      title: "PERPUSTAKAAN & BACA",
      subtitle: "Baca Bab Terbaru Novel Favorit",
      emoji: "📖",
      colorClass: "from-emerald-600 via-teal-600 to-emerald-700",
      accentColor: "emerald",
      textClass: "text-emerald-400"
    },
    {
      title: "KLUB ULASAN & KOMUNITAS",
      subtitle: "Ulasan Pembaca & Tulisan Blog",
      emoji: "📣",
      colorClass: "from-rose-600 via-red-600 to-rose-700",
      accentColor: "red",
      textClass: "text-rose-400"
    },
    {
      title: "TENTANG LENTERA & STATUS",
      subtitle: "Palet Crayon Batu & Status Server",
      emoji: "🔮",
      colorClass: "from-purple-600 via-fuchsia-700 to-purple-700",
      accentColor: "purple",
      textClass: "text-purple-400"
    }
  ];

  return (
    <div id="main_app_container" className="flex flex-col h-screen w-full bg-stone-950 text-stone-100 overflow-hidden font-sans select-none">
      
      {/* Dynamic Header on top for mobile screens, hidden on desktop vertical panels */}
      <div id="mobile_header_nav" className="flex md:hidden items-center justify-between px-4 py-3 bg-stone-900 border-b border-stone-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏮</span>
          <h1 className="text-lg font-bold tracking-wider text-amber-500">LENTERA NOVEL</h1>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] no-scrollbar">
          {panels.map((p, idx) => (
            <button
              id={`mob_tab_btn_${idx}`}
              key={idx}
              onClick={() => {
                setActiveTab(idx);
                setSelectedNovel(null);
                setSelectedChapter(null);
              }}
              className={`p-2 rounded-lg text-sm transition-all duration-300 flex items-center justify-center ${
                activeTab === idx
                  ? "bg-stone-800 text-stone-100 font-bold border border-stone-700"
                  : "text-stone-400 hover:text-stone-200"
              }`}
              title={p.title}
            >
              <span>{p.emoji}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace: Full Screen Multi-Panel Accordion Layout */}
      <div id="multi_panel_accordion_container" className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
        {panels.map((panel, idx) => {
          const isActive = activeTab === idx;

          return (
            <div
              id={`panel_container_${idx}`}
              key={idx}
              className={`relative transition-all duration-500 ease-in-out h-full flex flex-col ${
                isActive
                  ? "flex-1 md:flex-[10] min-w-0" // Expanded panel
                  : "hidden md:flex w-16 lg:w-20 flex-none border-r border-stone-900/60" // Collapsed vertical panel
              }`}
            >
              {/* COLLAPSED VERTICAL TAB STRIPE (Visible on Desktop only when not active) */}
              {!isActive && (
                <button
                  id={`collapsed_tab_trigger_${idx}`}
                  onClick={() => {
                    setActiveTab(idx);
                    // Clear temporary read states to present lists on swap
                    setSelectedNovel(null);
                    setSelectedChapter(null);
                  }}
                  className={`absolute inset-0 w-full h-full flex flex-col items-center justify-between py-8 transition-all duration-300 bg-gradient-to-b ${panel.colorClass} group cursor-pointer hover:brightness-110 active:scale-95`}
                >
                  {/* Backdrop layer to make it dark and unified */}
                  <div className="absolute inset-0 bg-stone-950/70 transition-opacity duration-300 group-hover:opacity-40" />

                  {/* Icon or emoji at top */}
                  <div className="relative z-10 text-2xl lg:text-3xl filter drop-shadow-md transform transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12">
                    {panel.emoji}
                  </div>

                  {/* Rotated Vertical Title */}
                  <div className="relative z-10 flex-1 flex items-center justify-center">
                    <h2
                      className="text-xs lg:text-sm font-black tracking-[0.25em] text-stone-300/80 group-hover:text-stone-100 whitespace-nowrap select-none"
                      style={{
                        writingMode: "vertical-rl",
                        transform: "rotate(180deg)",
                      }}
                    >
                      {panel.title}
                    </h2>
                  </div>

                  {/* Vertical Menu Count or Badge at bottom */}
                  <div className="relative z-10 bg-stone-950/60 w-8 h-8 rounded-full border border-stone-800/50 flex items-center justify-center text-xs font-black text-stone-400 group-hover:text-stone-100 transition-colors">
                    0{idx + 1}
                  </div>
                </button>
              )}

              {/* EXPANDED PANEL WORKSPACE (Filled with specific section logic) */}
              {isActive && (
                <div
                  id={`expanded_workspace_${idx}`}
                  className="w-full h-full flex flex-col bg-stone-950 overflow-y-auto"
                >
                  {/* Decorative Color Line Top Header */}
                  <div className={`h-1.5 w-full bg-gradient-to-r ${panel.colorClass}`} />

                  {/* Section Top Branding */}
                  <div className="px-6 py-5 border-b border-stone-900/60 bg-stone-950/90 backdrop-blur-md sticky top-0 z-15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl bg-gradient-to-br ${panel.colorClass} text-stone-100 shadow-lg shadow-orange-950/20`}>
                        <span className="text-xl md:text-2xl">{panel.emoji}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">Menu 0{idx + 1}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-stone-700" />
                          <span className={`text-[10px] font-black uppercase tracking-widest ${panel.textClass}`}>
                            {panel.title.split(" ")[0]} Mode
                          </span>
                        </div>
                        <h1 className="text-xl md:text-2xl font-black tracking-tight text-stone-100 mt-0.5">
                          {panel.title}
                        </h1>
                      </div>
                    </div>

                    {/* Quick navigation bookmarks or status helper on right */}
                    <div className="flex items-center gap-2">
                      {idx === 1 && bookmarks.length > 0 && (
                        <button
                          id="btn_toggle_bookmarks_shortcut"
                          onClick={() => setShowBookmarksList(!showBookmarksList)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-xs font-bold border border-stone-800 text-teal-400 cursor-pointer"
                        >
                          <BookMarked size={14} />
                          <span>Markah ({bookmarks.length})</span>
                        </button>
                      )}
                      <div className="text-xs bg-stone-900/90 px-3 py-1.5 rounded-lg border border-stone-850 text-stone-400">
                        {panel.subtitle}
                      </div>
                    </div>
                  </div>

                  {/* PANEL SPECIFIC VIEWS */}

                  {/* 1. HOME PANEL (Beranda) */}
                  {idx === 0 && (
                    <div id="home_view_wrapper" className="p-6 space-y-8 max-w-7xl mx-auto w-full">
                      
                      {/* Hero Feature Novel Card */}
                      <div id="hero_novel_billboard" className="relative rounded-2xl overflow-hidden border border-stone-850/50 bg-gradient-to-r from-stone-900 via-stone-920 to-stone-900 p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                        
                        {/* 3D-like Book Cover mockup */}
                        <div className="w-36 h-48 md:w-44 md:h-60 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-800 flex flex-col justify-between p-4 shadow-2xl relative transform hover:rotate-3 transition-transform duration-300 flex-none select-none">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-bold tracking-widest text-amber-200/90 bg-stone-950/40 px-2 py-0.5 rounded-full uppercase">Saga</span>
                            <span className="text-2xl filter drop-shadow-md">⚔️</span>
                          </div>
                          <div>
                            <p className="text-[10px] text-stone-200 font-bold uppercase tracking-wider mb-1">Aria Wijaya</p>
                            <h3 className="text-sm md:text-base font-black leading-tight text-white tracking-tight">
                              Gerbang Takdir
                            </h3>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="flex-1 space-y-4 text-center md:text-left">
                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-950/40 text-amber-300 border border-amber-500/25">
                              Rekomendasi Utama
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-stone-900 text-stone-300">
                              Fantasy
                            </span>
                            <div className="flex items-center text-amber-400 text-xs font-bold">
                              <Star size={13} className="fill-amber-400 mr-1" />
                              <span>4.9</span>
                            </div>
                          </div>

                          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                            Gerbang Takdir: Saga Sang Pelopor
                          </h2>

                          <p className="text-stone-400 text-sm leading-relaxed max-w-2xl">
                            "Di dunia di mana takdir ditulis di atas batu langit, Ken terbangun tanpa tanda takdir di jiwanya. Dianggap sebagai kutukan, dia justru menemukan bahwa ketiadaan takdir membebaskannya dari belenggu hukum semesta..."
                          </p>

                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                            <button
                              id="hero_btn_read"
                              onClick={() => {
                                const target = novels.find((n) => n.id === "1");
                                if (target) {
                                  setSelectedNovel(target);
                                  setSelectedChapter(target.chapters[0]);
                                  setActiveTab(1); // Jump to Reader tab
                                }
                              }}
                              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-stone-950 text-sm font-extrabold flex items-center gap-2 shadow-lg shadow-orange-950/30 cursor-pointer"
                            >
                              <BookOpen size={16} />
                              <span>Mulai Membaca Bab 1</span>
                            </button>
                            <button
                              id="hero_btn_details"
                              onClick={() => {
                                const target = novels.find((n) => n.id === "1");
                                if (target) {
                                  setSelectedNovel(target);
                                  setActiveTab(1); // Jump to Library list
                                }
                              }}
                              className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-850 text-stone-200 text-sm font-bold border border-stone-800 cursor-pointer"
                            >
                              Detail Novel
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Split Grid: Daily Prompt & Novel Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* Left: Quick Facts & Interactive AI Prompt Booster (Cols 5) */}
                        <div className="lg:col-span-5 space-y-6">

                          {/* App Stats Widget */}
                          <div className="p-6 rounded-2xl bg-stone-900/40 border border-stone-900 grid grid-cols-2 gap-4">
                            <div className="p-4 bg-stone-950/50 rounded-xl border border-stone-900 text-center">
                              <span className="text-2xl block mb-1">📚</span>
                              <span className="text-xl font-black text-stone-100">{novels.length}</span>
                              <p className="text-[10px] uppercase text-stone-500 font-bold tracking-wider">Koleksi Novel</p>
                            </div>
                            <div className="p-4 bg-stone-950/50 rounded-xl border border-stone-900 text-center">
                              <span className="text-2xl block mb-1">✍️</span>
                              <span className="text-xl font-black text-stone-100">{drafts.length}</span>
                              <p className="text-[10px] uppercase text-stone-500 font-bold tracking-wider">Draf Penulis</p>
                            </div>
                            <div className="p-4 bg-stone-950/50 rounded-xl border border-stone-900 text-center">
                              <span className="text-2xl block mb-1">⭐</span>
                              <span className="text-xl font-black text-stone-100">4.8</span>
                              <p className="text-[10px] uppercase text-stone-500 font-bold tracking-wider">Rating Rata-rata</p>
                            </div>
                          </div>

                        </div>

                        {/* Right: Trending Blogs (Cols 7) */}
                        <div className="lg:col-span-7 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="text-orange-500" size={18} />
                              <h3 className="text-sm font-extrabold tracking-wide text-stone-200">
                                BLOGS TERPOPULER MINGGU INI
                              </h3>
                            </div>
                            <span className="text-xs text-stone-500 hover:text-stone-300 cursor-pointer" onClick={() => setActiveTab(2)}>
                              Lihat Semua Blog →
                            </span>
                          </div>

                          <div className="space-y-4">
                            {blogs.slice(0, 3).map((blog) => (
                              <div
                                id={`trending_blog_${blog.id}`}
                                key={blog.id}
                                className="p-5 rounded-2xl bg-stone-900/60 border border-stone-850 hover:border-stone-800 transition-all duration-300 space-y-3 cursor-pointer"
                                onClick={() => setActiveTab(2)}
                              >
                                <div className="flex justify-between items-start gap-4">
                                  <h4 className="text-sm md:text-base font-black text-stone-100 tracking-tight leading-snug hover:text-amber-400">
                                    {blog.title}
                                  </h4>
                                  <span className="text-[10px] font-bold text-stone-500 bg-stone-950 px-2 py-0.5 rounded-md flex-none">
                                    {blog.date}
                                  </span>
                                </div>
                                <p className="text-stone-400 text-xs leading-relaxed line-clamp-2">
                                  {blog.excerpt}
                                </p>
                                <div className="flex items-center justify-between pt-1 border-t border-stone-900 text-[10px] text-stone-500">
                                  <span className="font-semibold text-stone-400">Oleh: {blog.author}</span>
                                  <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1">
                                      <Heart size={11} className="text-rose-500 fill-rose-500" />
                                      {blog.likes}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <MessageSquare size={11} />
                                      {blog.comments}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>

                    </div>
                  )}

                  {/* 2. LIBRARY & READER PANEL (Perpustakaan & Baca) */}
                  {idx === 1 && (
                    <div id="library_view_wrapper" className="p-6 max-w-7xl mx-auto w-full space-y-6">
                      
                      {/* Sub-View: Immersive Book Reader */}
                      {selectedChapter && selectedNovel ? (
                        <div id="book_reader_mode" className="space-y-6">
                          
                          {/* Reader Navigation & Controls Bar */}
                          <div className="p-4 rounded-xl bg-stone-900 border border-stone-850 flex flex-wrap items-center justify-between gap-4">
                            <button
                              id="btn_back_to_novel_info"
                              onClick={() => setSelectedChapter(null)}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-950 hover:bg-stone-800 text-xs font-bold border border-stone-800 text-stone-300 cursor-pointer"
                            >
                              <ChevronLeft size={15} />
                              <span>Informasi Novel</span>
                            </button>

                            {/* Dropdown Bab */}
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-stone-400 font-medium">Bab:</span>
                              <select
                                id="chapter_select_dropdown"
                                value={selectedChapter.id}
                                onChange={(e) => {
                                  const chapId = parseInt(e.target.value);
                                  const chap = selectedNovel.chapters.find((c) => c.id === chapId);
                                  if (chap) setSelectedChapter(chap);
                                }}
                                className="px-3 py-1 bg-stone-950 text-xs text-stone-200 border border-stone-800 rounded-lg outline-none cursor-pointer"
                              >
                                {selectedNovel.chapters.map((chap) => (
                                  <option key={chap.id} value={chap.id}>
                                    {chap.title}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Bookmark Chapter */}
                            <button
                              id="btn_reader_bookmark"
                              onClick={() => toggleBookmark(selectedNovel, selectedChapter)}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border ${
                                isChapterBookmarked(selectedNovel.id, selectedChapter.id)
                                  ? "bg-teal-950/50 text-teal-300 border-teal-500/30"
                                  : "bg-stone-950 text-stone-400 border-stone-800 hover:text-stone-200"
                              } cursor-pointer`}
                            >
                              <Bookmark size={14} className={isChapterBookmarked(selectedNovel.id, selectedChapter.id) ? "fill-teal-300" : ""} />
                              <span>
                                {isChapterBookmarked(selectedNovel.id, selectedChapter.id) ? "Tandai!" : "Bookmark"}
                              </span>
                            </button>

                            {/* Text customization settings */}
                            <div className="flex items-center gap-4">
                              
                              {/* Font Size */}
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mr-1">Teks:</span>
                                {["sm", "base", "lg", "xl", "2xl"].map((size) => (
                                  <button
                                    id={`font_size_btn_${size}`}
                                    key={size}
                                    onClick={() => setReaderSettings({ ...readerSettings, fontSize: size as any })}
                                    className={`w-7 h-7 rounded text-xs font-bold transition-colors ${
                                      readerSettings.fontSize === size
                                        ? "bg-emerald-500 text-stone-950"
                                        : "bg-stone-950 text-stone-400 hover:bg-stone-850"
                                    }`}
                                  >
                                    {size.toUpperCase()}
                                  </button>
                                ))}
                              </div>

                              {/* Reading theme color presets */}
                              <div className="flex items-center gap-1.5">
                                {["sepia", "light", "dark", "paper"].map((theme) => (
                                  <button
                                    id={`reader_theme_btn_${theme}`}
                                    key={theme}
                                    onClick={() => setReaderSettings({ ...readerSettings, theme: theme as any })}
                                    className={`w-5 h-5 rounded-full border transition-all ${
                                      theme === "sepia" ? "bg-[#f4ebd0] border-amber-800/40" :
                                      theme === "light" ? "bg-stone-100 border-stone-300" :
                                      theme === "dark" ? "bg-stone-900 border-stone-700" :
                                      "bg-zinc-300 border-stone-500" // paper
                                    } ${
                                      readerSettings.theme === theme ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-stone-900" : ""
                                    }`}
                                    title={`Tema ${theme}`}
                                  />
                                ))}
                              </div>

                            </div>
                          </div>

                          {/* True Reading Canvas */}
                          <div
                            id="reading_text_canvas"
                            className={`p-8 md:p-12 rounded-2xl border shadow-xl transition-all duration-300 max-w-4xl mx-auto ${
                              readerSettings.theme === "sepia"
                                ? "bg-[#f4ebd0] text-[#433422] border-[#e1d5b3]"
                                : readerSettings.theme === "light"
                                ? "bg-stone-50 text-stone-900 border-stone-200"
                                : readerSettings.theme === "dark"
                                ? "bg-stone-900 text-stone-200 border-stone-800"
                                : "bg-neutral-200 text-stone-800 border-stone-300" // paper
                            }`}
                          >
                            <div className="text-center space-y-2 mb-8 border-b pb-6 border-current/15">
                              <p className="text-xs uppercase font-extrabold tracking-widest opacity-70">
                                {selectedNovel.title}
                              </p>
                              <h2 className="text-2xl md:text-3xl font-serif font-black">
                                {selectedChapter.title}
                              </h2>
                              <p className="text-xs italic opacity-80">
                                Ditulis oleh {selectedNovel.author} &bull; Genre {selectedNovel.genre}
                              </p>
                            </div>

                            <div
                              className={`space-y-6 font-serif ${
                                readerSettings.fontSize === "sm" ? "text-sm" :
                                readerSettings.fontSize === "base" ? "text-base" :
                                readerSettings.fontSize === "lg" ? "text-lg" :
                                readerSettings.fontSize === "xl" ? "text-xl" :
                                "text-2xl"
                              } ${
                                readerSettings.lineHeight === "snug" ? "leading-snug" :
                                readerSettings.lineHeight === "relaxed" ? "leading-relaxed" :
                                "leading-loose"
                              }`}
                            >
                              {selectedChapter.content.map((p, pIdx) => (
                                <p key={pIdx} className="text-justify indent-8 tracking-wide">
                                  {p}
                                </p>
                              ))}
                            </div>

                            {/* End chapter guidance and triggers */}
                            <div className="mt-12 pt-8 border-t border-current/15 flex flex-col sm:flex-row items-center justify-between gap-4">
                              <p className="text-xs italic opacity-60">
                                Anda telah mencapai akhir bab ini. Dukung penulis dengan memberikan ulasan di Komunitas!
                              </p>
                              
                              <button
                                id="btn_goto_write_assist_co"
                                onClick={() => {
                                  // Pre-fill co-writer assistant with this novel's details
                                  setDraftTitle(selectedNovel.title);
                                  setDraftGenre(selectedNovel.genre);
                                  setDraftSynopsis(selectedNovel.synopsis);
                                  setDraftContent(selectedChapter.content.slice(-2).join("\n\n"));
                                  setActiveTab(2); // Jump to Writer
                                }}
                                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg cursor-pointer"
                              >
                                <Sparkles size={14} />
                                <span>Lanjutkan dengan AI Gemini</span>
                              </button>
                            </div>
                          </div>

                          {/* Pagination & Next Chapter */}
                          <div className="flex items-center justify-between max-w-4xl mx-auto">
                            <button
                              id="btn_prev_chapter"
                              disabled={selectedChapter.id === 1}
                              onClick={() => {
                                const prev = selectedNovel.chapters.find((c) => c.id === selectedChapter.id - 1);
                                if (prev) setSelectedChapter(prev);
                              }}
                              className="px-4 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs font-bold text-stone-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 hover:bg-stone-850"
                            >
                              <ChevronLeft size={14} />
                              <span>Bab Sebelumnya</span>
                            </button>

                            <button
                              id="btn_back_to_library_main"
                              onClick={() => {
                                setSelectedChapter(null);
                                setSelectedNovel(null);
                              }}
                              className="text-stone-400 hover:text-stone-200 text-xs font-semibold underline underline-offset-4"
                            >
                              Tutup Buku
                            </button>

                            <button
                              id="btn_next_chapter"
                              disabled={selectedChapter.id === selectedNovel.chapters.length}
                              onClick={() => {
                                const next = selectedNovel.chapters.find((c) => c.id === selectedChapter.id + 1);
                                if (next) setSelectedChapter(next);
                              }}
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-stone-950 text-xs font-extrabold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                            >
                              <span>Bab Berikutnya</span>
                              <ChevronRight size={14} />
                            </button>
                          </div>

                        </div>
                      ) : selectedNovel ? (
                        
                        // Sub-View: Novel Detailed View & Chapters Directory
                        <div id="novel_details_directory" className="space-y-6">
                          <button
                            id="btn_novel_back_to_list"
                            onClick={() => setSelectedNovel(null)}
                            className="flex items-center gap-1.5 text-xs font-bold text-stone-400 hover:text-stone-200 cursor-pointer"
                          >
                            <ChevronLeft size={14} />
                            <span>Kembali ke Daftar Koleksi</span>
                          </button>

                          <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-850 flex flex-col md:flex-row gap-6">
                            
                            {/* Colorful big cover */}
                            <div className={`w-40 h-56 rounded-xl bg-gradient-to-br ${selectedNovel.coverColor} flex flex-col justify-between p-5 shadow-lg flex-none`}>
                              <div className="flex justify-between items-start">
                                <span className="text-xs bg-stone-950/30 font-bold tracking-wider px-2 py-0.5 rounded-full text-stone-100 uppercase">
                                  {selectedNovel.status}
                                </span>
                                <span className="text-3xl filter drop-shadow-md">{selectedNovel.coverEmoji}</span>
                              </div>
                              <div>
                                <p className="text-xs text-stone-200/90 font-bold uppercase tracking-wider mb-1">
                                  {selectedNovel.author}
                                </p>
                                <h3 className="text-lg font-black leading-tight text-white tracking-tight">
                                  {selectedNovel.title}
                                </h3>
                              </div>
                            </div>

                            {/* Info layout */}
                            <div className="flex-1 space-y-4">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-stone-950 text-stone-300 border border-stone-800">
                                  {selectedNovel.genre}
                                </span>
                                <div className="flex items-center text-amber-400 text-xs font-bold px-3 py-1 rounded-full bg-stone-950 border border-stone-800">
                                  <Star size={13} className="fill-amber-400 mr-1" />
                                  <span>{selectedNovel.rating}</span>
                                </div>
                                <span className="text-xs text-stone-500 font-medium px-2 py-1">
                                  {selectedNovel.totalWords.toLocaleString("id-ID")} Kata
                                </span>
                                <span className="text-xs text-stone-500 font-medium px-2 py-1">
                                  👁️ {selectedNovel.views} Views
                                </span>
                              </div>

                              <h2 className="text-2xl font-black text-white">{selectedNovel.title}</h2>
                              <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider">
                                SINOPSIS CERITA:
                              </p>
                              <p className="text-stone-300 text-sm leading-relaxed">
                                {selectedNovel.synopsis}
                              </p>

                              {/* Chapter Directory Container */}
                              <div className="pt-4 space-y-3">
                                <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest border-b border-stone-850 pb-2">
                                  DAFTAR BAB TERSEDIA ({selectedNovel.chapters.length})
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {selectedNovel.chapters.map((chap) => (
                                    <button
                                      id={`chapter_dir_btn_${chap.id}`}
                                      key={chap.id}
                                      onClick={() => setSelectedChapter(chap)}
                                      className="p-3.5 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-850/60 hover:border-emerald-500/30 transition-all text-left flex items-center justify-between group cursor-pointer"
                                    >
                                      <div>
                                        <p className="text-xs font-bold text-stone-200 group-hover:text-emerald-400">
                                          {chap.title}
                                        </p>
                                        <p className="text-[10px] text-stone-500 font-medium">
                                          {chap.content.join(" ").split(" ").length} Kata &bull; Siap Baca
                                        </p>
                                      </div>
                                      <ChevronRight size={14} className="text-stone-500 group-hover:text-emerald-400 transition-transform group-hover:translate-x-1" />
                                    </button>
                                  ))}
                                </div>
                              </div>

                            </div>
                          </div>
                        </div>

                      ) : (
                        
                        // Default Library Grid
                        <div id="library_default_grid" className="space-y-6">
                          
                          {/* Search & Genre Filtration Area */}
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            
                            {/* Genre pills */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              {["Semua", "Fantasy", "Romance", "Sci-Fi", "Mystery"].map((g) => (
                                <button
                                  id={`genre_pill_${g}`}
                                  key={g}
                                  onClick={() => setSelectedGenre(g)}
                                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    selectedGenre === g
                                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-stone-950 font-black shadow-md shadow-emerald-950/20"
                                      : "bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-850"
                                  }`}
                                >
                                  {g}
                                </button>
                              ))}
                            </div>

                            {/* Search bar widget */}
                            <div className="relative w-full md:w-72">
                              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                              <input
                                id="library_search_input"
                                type="text"
                                placeholder="Cari judul novel, penulis..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                              />
                            </div>
                          </div>

                          {/* Render novels grid */}
                          {filteredNovels.length === 0 ? (
                            <div className="p-12 text-center rounded-2xl border border-dashed border-stone-800 text-stone-500 space-y-2">
                              <span className="text-3xl block">🔍</span>
                              <p className="text-sm font-semibold">Tidak ada novel yang cocok dengan kriteria Anda.</p>
                              <p className="text-xs">Coba cari dengan kata kunci lain atau ubah filter genre.</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {filteredNovels.map((novel) => (
                                <div
                                  id={`novel_card_${novel.id}`}
                                  key={novel.id}
                                  onClick={() => setSelectedNovel(novel)}
                                  className="group p-5 rounded-2xl bg-stone-900/60 border border-stone-850/70 hover:border-emerald-500/20 hover:bg-stone-900 transition-all duration-300 flex gap-4 cursor-pointer"
                                >
                                  {/* Small book cover */}
                                  <div className={`w-24 h-36 rounded-lg bg-gradient-to-br ${novel.coverColor} flex flex-col justify-between p-3.5 shadow-md flex-none transition-transform duration-300 group-hover:scale-105 group-hover:rotate-2`}>
                                    <span className="text-2xl filter drop-shadow">{novel.coverEmoji}</span>
                                    <div>
                                      <p className="text-[9px] text-stone-200/95 font-bold uppercase tracking-wider mb-0.5 line-clamp-1">
                                        {novel.author}
                                      </p>
                                      <h4 className="text-[11px] font-black leading-tight text-white tracking-tight line-clamp-2">
                                        {novel.title.split(":")[0]}
                                      </h4>
                                    </div>
                                  </div>

                                  {/* Quick metadata & synopsis */}
                                  <div className="flex-1 flex flex-col justify-between py-1">
                                    <div className="space-y-1.5">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                                          {novel.genre}
                                        </span>
                                        <div className="flex items-center text-amber-400 text-xs font-bold">
                                          <Star size={11} className="fill-amber-400 mr-0.5" />
                                          {novel.rating}
                                        </div>
                                      </div>
                                      <h3 className="text-sm font-black text-stone-100 leading-snug group-hover:text-emerald-400 transition-colors">
                                        {novel.title}
                                      </h3>
                                      <p className="text-stone-400 text-xs leading-relaxed line-clamp-2">
                                        {novel.synopsis}
                                      </p>
                                    </div>

                                    <div className="flex items-center justify-between text-[10px] text-stone-500 font-semibold border-t border-stone-850/50 pt-1.5">
                                      <span>👁️ {novel.views} Views</span>
                                      <span>{novel.chapters.length} Bab Terbit</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Bookmark List Details Drawer (If open) */}
                          {showBookmarksList && bookmarks.length > 0 && (
                            <div className="p-6 rounded-2xl bg-stone-900 border border-teal-500/25 space-y-4">
                              <div className="flex items-center justify-between border-b border-stone-850 pb-2">
                                <h3 className="text-sm font-black text-teal-400 flex items-center gap-1.5 uppercase tracking-wider">
                                  <BookMarked size={16} />
                                  <span>DAFTAR MARKAH BUKU SAYA ({bookmarks.length})</span>
                                </h3>
                                <button
                                  id="btn_clear_all_bookmarks"
                                  onClick={() => {
                                    if (confirm("Hapus semua bookmark tersimpan?")) {
                                      saveBookmarksToStorage([]);
                                      setShowBookmarksList(false);
                                    }
                                  }}
                                  className="text-[10px] text-stone-500 hover:text-rose-400 font-bold"
                                >
                                  Bersihkan Semua
                                </button>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {bookmarks.map((b, bIdx) => (
                                  <div
                                    id={`bookmark_item_${bIdx}`}
                                    key={bIdx}
                                    onClick={() => handleOpenBookmark(b)}
                                    className="p-3 rounded-xl bg-stone-950 hover:bg-stone-850 border border-stone-850 hover:border-teal-500/20 transition-all flex justify-between items-center cursor-pointer group"
                                  >
                                    <div>
                                      <h4 className="text-xs font-black text-stone-200 line-clamp-1 group-hover:text-teal-400">
                                        {b.novelTitle}
                                      </h4>
                                      <p className="text-[10px] text-stone-400 font-semibold">
                                        {b.chapterTitle}
                                      </p>
                                      <p className="text-[9px] text-stone-500">Dandai pada: {b.savedAt}</p>
                                    </div>
                                    <button
                                      id={`btn_delete_bookmark_${bIdx}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const filtered = bookmarks.filter(
                                          (bm) => !(bm.novelId === b.novelId && bm.chapterId === b.chapterId)
                                        );
                                        saveBookmarksToStorage(filtered);
                                      }}
                                      className="p-1 rounded text-stone-500 hover:text-rose-400"
                                      title="Hapus bookmark"
                                    >
                                      <Trash size={12} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        </div>
                      )}

                    </div>
                  )}

                  {/* 3. AI CO-WRITER ASSISTANT PANEL (Pena AI) */}
                  
                  {idx === 2 && (
                    <div id="community_view_wrapper" className="p-6 max-w-7xl mx-auto w-full space-y-6">
                      
                      {/* Flex split layout */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* Left column: Blogs Feed (Cols 7) */}
                        <div className="lg:col-span-7 space-y-6">
                          
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
                              <MessageSquare size={16} className="text-rose-500" />
                              <span>DAFTAR BLOG & DISKUSI TERKINI</span>
                            </h3>

                            <button
                              id="btn_toggle_add_blog"
                              onClick={() => setShowAddBlog(!showAddBlog)}
                              className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 font-bold text-xs border border-rose-500/30 flex items-center gap-1 cursor-pointer"
                            >
                              <Plus size={13} />
                              <span>{showAddBlog ? "Batal" : "Tulis Blog"}</span>
                            </button>
                          </div>

                          {/* New blog interactive form block */}
                          {showAddBlog && (
                            <form id="add_blog_form" onSubmit={handlePublishBlog} className="p-5 rounded-2xl bg-stone-900 border border-rose-500/25 space-y-4">
                              <h4 className="text-xs font-black text-rose-300 uppercase tracking-widest">
                                PUBLIKASIKAN TULISAN BLOG BARU
                              </h4>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-stone-500 uppercase block">Nama Anda / Penulis</label>
                                  <input
                                    id="input_blog_author"
                                    type="text"
                                    placeholder="Contoh: Sang_Penyair"
                                    required
                                    value={newBlogAuthor}
                                    onChange={(e) => setNewBlogAuthor(e.target.value)}
                                    className="w-full px-3 py-1.5 bg-stone-950 border border-stone-850 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-rose-500"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-stone-500 uppercase block">Judul Tulisan</label>
                                  <input
                                    id="input_blog_title"
                                    type="text"
                                    placeholder="Contoh: Cara Menghindari Penulis Block"
                                    required
                                    value={newBlogTitle}
                                    onChange={(e) => setNewBlogTitle(e.target.value)}
                                    className="w-full px-3 py-1.5 bg-stone-950 border border-stone-850 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-rose-500"
                                  />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-stone-500 uppercase block">Konten Lengkap Tulisan</label>
                                <textarea
                                  id="input_blog_content"
                                  rows={4}
                                  placeholder="Tulis opini, review buku, atau petunjuk penulisan Anda di sini..."
                                  required
                                  value={newBlogContent}
                                  onChange={(e) => setNewBlogContent(e.target.value)}
                                  className="w-full p-3 bg-stone-950 border border-stone-850 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-rose-500 resize-none"
                                />
                              </div>

                              <button
                                id="btn_submit_new_blog"
                                type="submit"
                                className="w-full py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:brightness-110 text-stone-100 text-xs font-extrabold rounded-lg shadow cursor-pointer"
                              >
                                Terbitkan ke Komunitas
                              </button>
                            </form>
                          )}

                          {/* Blogs List */}
                          <div className="space-y-4">
                            {blogs.map((blog) => (
                              <div
                                id={`community_blog_card_${blog.id}`}
                                key={blog.id}
                                className="p-5 rounded-2xl bg-stone-900/60 border border-stone-850 hover:bg-stone-900 transition-all space-y-3"
                              >
                                <div className="flex justify-between items-start gap-4">
                                  <h4 className="text-base font-black text-stone-100 hover:text-rose-400 cursor-pointer">
                                    {blog.title}
                                  </h4>
                                  <span className="text-[10px] font-bold text-stone-500 bg-stone-950 px-2 py-0.5 rounded-md flex-none">
                                    {blog.date}
                                  </span>
                                </div>
                                <p className="text-stone-300 text-xs leading-relaxed">
                                  {blog.excerpt}
                                </p>
                                <div className="flex items-center justify-between pt-2.5 border-t border-stone-900 text-xs text-stone-500">
                                  <span>Ditulis oleh: <strong className="text-stone-400">{blog.author}</strong></span>
                                  <div className="flex items-center gap-4">
                                    <button
                                      id={`btn_like_blog_${blog.id}`}
                                      onClick={() => {
                                        const updated = blogs.map((b) => {
                                          if (b.id === blog.id) {
                                            return { ...b, likes: b.likes + 1 };
                                          }
                                          return b;
                                        });
                                        setBlogs(updated);
                                      }}
                                      className="flex items-center gap-1 text-[10px] font-bold text-stone-400 hover:text-rose-400 cursor-pointer"
                                    >
                                      <Heart size={12} className="text-rose-500 fill-rose-500" />
                                      <span>{blog.likes} Suka</span>
                                    </button>
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-stone-400">
                                      <MessageSquare size={12} />
                                      <span>{blog.comments} Komentar</span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                        </div>

                        {/* Right column: Write Novel Reviews (Cols 5) */}
                        <div className="lg:col-span-5 space-y-6">
                          
                          <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-850 space-y-4">
                            <h3 className="text-xs font-black text-stone-300 uppercase tracking-widest border-b border-stone-850 pb-2 flex items-center gap-1">
                              <Star size={14} className="text-amber-400 fill-amber-400 animate-pulse" />
                              <span>KIRIM ULASAN BUKU NOVEL</span>
                            </h3>

                            <form id="submit_review_form" onSubmit={handlePublishReview} className="space-y-4">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-stone-500 uppercase block">Pilih Novel Yang Diulas</label>
                                <select
                                  id="select_review_novel"
                                  value={selectedReviewNovelId}
                                  onChange={(e) => setSelectedReviewNovelId(e.target.value)}
                                  className="w-full px-3 py-1.5 bg-stone-950 border border-stone-850 rounded-lg text-xs text-stone-200 outline-none focus:border-rose-500 cursor-pointer"
                                >
                                  {novels.map((n) => (
                                    <option key={n.id} value={n.id}>{n.title}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-stone-500 uppercase block">Nama Anda</label>
                                  <input
                                    id="input_review_author"
                                    type="text"
                                    placeholder="Contoh: Siska_Kolektor"
                                    required
                                    value={reviewAuthor}
                                    onChange={(e) => setReviewAuthor(e.target.value)}
                                    className="w-full px-3 py-1.5 bg-stone-950 border border-stone-850 rounded-lg text-xs text-stone-200 outline-none focus:border-rose-500"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-stone-500 uppercase block">Rating Bintang</label>
                                  <div className="flex items-center gap-1 pt-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <button
                                        id={`star_selector_btn_${star}`}
                                        key={star}
                                        type="button"
                                        onClick={() => setReviewRating(star)}
                                        className="text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                                      >
                                        <Star
                                          size={16}
                                          className={star <= reviewRating ? "fill-amber-400" : "text-stone-600"}
                                        />
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-stone-500 uppercase block">Ulasan Tertulis</label>
                                <textarea
                                  id="input_review_text"
                                  rows={3}
                                  placeholder="Ketik impresi mendalam atau masukan konstruktif Anda untuk bab yang baru dibaca..."
                                  required
                                  value={reviewText}
                                  onChange={(e) => setReviewText(e.target.value)}
                                  className="w-full p-3 bg-stone-950 border border-stone-850 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-rose-500 resize-none"
                                />
                              </div>

                              <button
                                id="btn_submit_review"
                                type="submit"
                                className="w-full py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:brightness-110 text-stone-100 text-xs font-black rounded-lg shadow cursor-pointer"
                              >
                                Kirim Ulasan Saya
                              </button>
                            </form>
                          </div>

                          {/* Recent Reviews grid */}
                          <div className="space-y-3">
                            <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest">
                              ULASAN TERBARU PEMBACA
                            </h3>
                            <div className="space-y-3">
                              {recentReviews.map((rev) => (
                                <div
                                  id={`review_item_${rev.id}`}
                                  key={rev.id}
                                  className="p-4 rounded-xl bg-stone-900/40 border border-stone-850 space-y-2"
                                >
                                  <div className="flex justify-between items-center text-[10px] text-stone-500">
                                    <span className="font-bold text-stone-300">@{rev.author}</span>
                                    <span>{rev.date}</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-2">
                                    <h4 className="text-xs font-black text-stone-200 line-clamp-1">
                                      {rev.novelTitle}
                                    </h4>
                                    <div className="flex items-center text-amber-400 text-xs flex-none font-bold">
                                      <Star size={10} className="fill-amber-400 mr-0.5" />
                                      {rev.rating}
                                    </div>
                                  </div>
                                  <p className="text-stone-400 text-xs leading-relaxed italic">
                                    "{rev.text}"
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                        </div>

                      </div>

                    </div>
                  )}

                  {/* 5. ABOUT, STATUS & SETTINGS PANEL (Tentang & Setelan) */}
                  {idx === 3 && (
                    <div id="settings_view_wrapper" className="p-6 max-w-5xl mx-auto w-full space-y-8">
                      
                      {/* Concept Presentation Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        
                        {/* Concept story */}
                        <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-850 space-y-4">
                          <h3 className="text-base font-black text-purple-400 flex items-center gap-1.5 uppercase tracking-wider">
                            <Info size={16} />
                            <span>FILOSOFI DESAIN LENTERA NOVEL</span>
                          </h3>
                          <div className="space-y-3 text-stone-300 text-xs leading-relaxed">
                            <p>
                              Aplikasi ini didesain secara khusus untuk menerjemahkan keinginan estetika pengguna dengan presisi tinggi. Desain **Multi-Panel Accordion Vertikal** ini terinspirasi dari layout website portofolio kreatif kelas dunia.
                            </p>
                            <p>
                              Setiap panel vertikal melambangkan satu "Crayon Batu Warna-Warni" (seperti pada gambar inspirasi krayon batu alam) yang menyimpan energi kreatif yang berbeda-beda. Ketika Anda memilih satu krayon, krayon tersebut akan melebar penuh emosi untuk membebaskan ruang kerja Anda, sementara krayon-krayon lainnya mengempis tertib di sisi layar.
                            </p>
                            <p>
                              Aplikasi ini memanjakan mata Anda dengan transisi warna-warni yang halus dan fitur penulisan yang handal.
                            </p>
                          </div>
                        </div>

                        {/* Real-time server connection status dashboard */}
                        <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-850 space-y-4">
                          <h3 className="text-xs font-black text-stone-300 uppercase tracking-widest border-b border-stone-850 pb-2 flex items-center gap-1.5">
                            <Activity size={15} className="text-purple-400" />
                            <span>KONEKTIVITAS SERVER & TELEMETRI</span>
                          </h3>

                          <div className="space-y-4">
                            <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-850 flex items-center justify-between">
                              <div>
                                <h4 className="text-xs font-black text-stone-200">Status Server AI Studio</h4>
                                <p className="text-[10px] text-stone-500 mt-0.5">Memeriksa rute endpoint internal /api/health</p>
                              </div>
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                                serverStatus === "online"
                                  ? "bg-emerald-950/50 text-emerald-300 border border-emerald-500/30"
                                  : serverStatus === "offline"
                                  ? "bg-rose-950/50 text-rose-300 border border-rose-500/30"
                                  : "bg-stone-900 text-stone-400 animate-pulse"
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${serverStatus === "online" ? "bg-emerald-400" : "bg-rose-400 animate-ping"}`} />
                                {serverStatus === "online" ? "Koneksi Aktif" : serverStatus === "offline" ? "Masalah Koneksi" : "Memeriksa..."}
                              </span>
                            </div>

                            {serverStatus === "online" && (
                              <div className="space-y-2 text-[10px] font-mono text-stone-500 bg-stone-950 p-3 rounded-lg border border-stone-900">
                                <p>&gt;_ TIMESTAMP: {serverTimestamp}</p>
                                <p>&gt;_ HANDLER_API: express_router_healthy</p>
                                <p>&gt;_ API_KEY_SECRET: OK (Terkonfigurasi Aman Server-Side)</p>
                              </div>
                            )}

                            <div className="p-4 rounded-xl bg-purple-950/20 text-purple-300 border border-purple-500/20 text-xs leading-relaxed space-y-2">
                              <p className="font-bold flex items-center gap-1">
                                <Settings size={13} />
                                Bagaimana Cara Mengkonfigurasi API Key?
                              </p>
                              <p className="opacity-80">
                                <code className="bg-stone-950 px-1 py-0.5 rounded text-stone-300">.env</code> dengan variabel <code className="bg-stone-950 px-1 py-0.5 rounded text-stone-300">GEMINI_API_KEY</code>.
                              </p>
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Natural Clay Stones Palette Picker matching the user's color image */}
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest">
                            PALET WARNA ALAMIAH KRAYON BATU (CRAYON STONES COLLECTION)
                          </h3>
                          <p className="text-xs text-stone-500">
                            Berikut adalah visual kode warna krayon batu alam dari gambar referensi Anda yang kami gunakan di setiap panel menu.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                          <div className="p-4 rounded-xl bg-stone-900 border border-stone-850 flex flex-col items-center text-center gap-2">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 shadow-lg" />
                            <h4 className="text-xs font-black text-stone-200">Crimson Coral</h4>
                            <code className="text-[10px] text-stone-500 bg-stone-950 px-1.5 py-0.5 rounded">#f43f5e</code>
                          </div>

                          <div className="p-4 rounded-xl bg-stone-900 border border-stone-850 flex flex-col items-center text-center gap-2">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 shadow-lg" />
                            <h4 className="text-xs font-black text-stone-200">Amber Ochre</h4>
                            <code className="text-[10px] text-stone-500 bg-stone-950 px-1.5 py-0.5 rounded">#f59e0b</code>
                          </div>

                          <div className="p-4 rounded-xl bg-stone-900 border border-stone-850 flex flex-col items-center text-center gap-2">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg" />
                            <h4 className="text-xs font-black text-stone-200">Cobalt Stone</h4>
                            <code className="text-[10px] text-stone-500 bg-stone-950 px-1.5 py-0.5 rounded">#3b82f6</code>
                          </div>

                          <div className="p-4 rounded-xl bg-stone-900 border border-stone-850 flex flex-col items-center text-center gap-2">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg" />
                            <h4 className="text-xs font-black text-stone-200">Teal Malachite</h4>
                            <code className="text-[10px] text-stone-500 bg-stone-950 px-1.5 py-0.5 rounded">#10b981</code>
                          </div>

                          <div className="p-4 rounded-xl bg-stone-900 border border-stone-850 flex flex-col items-center text-center gap-2 relative overflow-hidden col-span-2 sm:col-span-1">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-fuchsia-600 shadow-lg" />
                            <h4 className="text-xs font-black text-stone-200">Amethyst Clay</h4>
                            <code className="text-[10px] text-stone-500 bg-stone-950 px-1.5 py-0.5 rounded">#a855f7</code>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Aesthetic Footer inside active content to prevent clutter */}
                  <div className="mt-auto px-6 py-4 border-t border-stone-900/60 text-center text-[10px] text-stone-600 font-bold bg-stone-950">
                    &copy; 2026 LENTERA NOVEL CO-WRITING PORTAL &bull; DESIGNED WITH VIBRANT VERTICAL PANEL STRIPES
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
