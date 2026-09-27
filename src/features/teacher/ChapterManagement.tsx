import React, { useState } from "react";
import { portalStorage } from "@/lib/portal-storage";
import { ChapterItem, TopicItem } from "@/lib/portal-types";
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Tag,
  Layers,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";

export function ChapterManagement() {
  const [chapters, setChapters] = useState<ChapterItem[]>(portalStorage.getChapters());
  const [topics, setTopics] = useState<TopicItem[]>(portalStorage.getTopics());

  const [showChapterModal, setShowChapterModal] = useState(false);
  const [editingChapter, setEditingChapter] = useState<ChapterItem | null>(null);
  const [chapterForm, setChapterForm] = useState({
    name: "",
    chapter_number: 1,
    description: "",
    display_order: 1,
  });

  const [showTopicModal, setShowTopicModal] = useState(false);
  const [topicChapterId, setTopicChapterId] = useState("");
  const [topicName, setTopicName] = useState("");

  const refresh = () => {
    setChapters(portalStorage.getChapters());
    setTopics(portalStorage.getTopics());
  };

  const openCreateChapter = () => {
    setEditingChapter(null);
    setChapterForm({
      name: "",
      chapter_number: chapters.length + 1,
      description: "",
      display_order: chapters.length + 1,
    });
    setShowChapterModal(true);
  };

  const openEditChapter = (ch: ChapterItem) => {
    setEditingChapter(ch);
    setChapterForm({
      name: ch.name,
      chapter_number: ch.chapter_number,
      description: ch.description || "",
      display_order: ch.display_order,
    });
    setShowChapterModal(true);
  };

  const handleChapterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterForm.name.trim()) {
      toast.error("Chapter name is required.");
      return;
    }
    try {
      if (editingChapter) {
        portalStorage.updateChapter(editingChapter.id, chapterForm);
        toast.success("Chapter updated.");
      } else {
        portalStorage.createChapter(chapterForm);
        toast.success("New Physics chapter created.");
      }
      setShowChapterModal(false);
      refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to save chapter.");
    }
  };

  const openAddTopic = (chapterId: string) => {
    setTopicChapterId(chapterId);
    setTopicName("");
    setShowTopicModal(true);
  };

  const handleTopicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicName.trim() || !topicChapterId) {
      toast.error("Topic name is required.");
      return;
    }
    try {
      portalStorage.createTopic(topicChapterId, topicName);
      toast.success("Topic added to chapter.");
      setShowTopicModal(false);
      refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to add topic.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <span>Physics Chapters & Topics</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            Dynamic curriculum taxonomy • Not hardcoded • Organize MCQs by chapter & topic
          </p>
        </div>

        <button
          onClick={openCreateChapter}
          className="flex items-center gap-2 px-4 py-2.5 neu-btn-primary rounded-xl text-sm font-semibold cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Chapter</span>
        </button>
      </div>

      {/* Chapters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {chapters.map((ch) => {
          const chapterTopics = topics.filter((t) => t.chapter_id === ch.id);

          return (
            <div
              key={ch.id}
              className="p-6 rounded-2xl neu-raised hover:neu-raised-lg transition-all space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-primary">
                    Chapter {ch.chapter_number}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditChapter(ch)}
                      className="p-1.5 neu-btn rounded-xl text-muted-foreground hover:text-primary cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-foreground tracking-tight mt-1">{ch.name}</h3>
                {ch.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ch.description}</p>
                )}

                {/* Topics Tags */}
                <div className="mt-3 pt-3 border-t border-border/60 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                    <span>Topics ({chapterTopics.length}):</span>
                    <button
                      onClick={() => openAddTopic(ch.id)}
                      className="text-primary hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Topic</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {chapterTopics.length === 0 ? (
                      <span className="text-[11px] text-muted-foreground italic">No topics created yet.</span>
                    ) : (
                      chapterTopics.map((t) => (
                        <span
                          key={t.id}
                          className="px-2.5 py-1 neu-inset-sm rounded-lg text-[11px] text-foreground font-sans"
                        >
                          {t.name}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Footer info */}
              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span>{ch.mcq_count || 0} Questions linked</span>
                <span className="text-emerald-500 uppercase text-[10px] font-bold neu-inset-sm px-2 py-0.5 rounded">{ch.status}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT CHAPTER MODAL */}
      {showChapterModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md neu-raised-lg rounded-3xl p-6 sm:p-7 text-foreground animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <h3 className="font-bold text-lg text-foreground">
                {editingChapter ? "Edit Chapter" : "Create Physics Chapter"}
              </h3>
              <button
                onClick={() => setShowChapterModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-xl neu-btn-interactive cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChapterSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-mono font-medium text-foreground uppercase mb-1">
                  Chapter Number *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={chapterForm.chapter_number}
                  onChange={(e) => setChapterForm({ ...chapterForm, chapter_number: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl neu-inset text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-foreground uppercase mb-1">
                  Chapter Title *
                </label>
                <input
                  type="text"
                  required
                  value={chapterForm.name}
                  onChange={(e) => setChapterForm({ ...chapterForm, name: e.target.value })}
                  placeholder="e.g. Motion and Force"
                  className="w-full px-3.5 py-2 rounded-xl neu-inset text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-foreground uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={chapterForm.description}
                  onChange={(e) => setChapterForm({ ...chapterForm, description: e.target.value })}
                  placeholder="Brief synopsis of topics and laws covered in this chapter..."
                  className="w-full px-3.5 py-2.5 rounded-xl neu-inset text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChapterModal(false)}
                  className="px-4 py-2 neu-btn rounded-xl text-sm text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 neu-btn-primary rounded-xl text-sm font-semibold cursor-pointer"
                >
                  Save Chapter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD TOPIC MODAL */}
      {showTopicModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm neu-raised-lg rounded-3xl p-6 sm:p-7 text-foreground animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <h3 className="font-bold text-base text-foreground">Add Topic to Chapter</h3>
              <button
                onClick={() => setShowTopicModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-xl neu-btn-interactive cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTopicSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-mono font-medium text-foreground uppercase mb-1">
                  Topic Name *
                </label>
                <input
                  type="text"
                  required
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  placeholder="e.g. Projectile Motion, Friction"
                  className="w-full px-3.5 py-2.5 rounded-xl neu-inset text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTopicModal(false)}
                  className="px-3.5 py-2 neu-btn rounded-xl text-xs text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 neu-btn-primary rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Add Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
