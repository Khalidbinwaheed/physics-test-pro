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
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            <span>Physics Chapters & Topics</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Dynamic curriculum taxonomy • Not hardcoded • Organize MCQs by chapter & topic
          </p>
        </div>

        <button
          onClick={openCreateChapter}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-600/30"
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
              className="p-5 bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl shadow-lg transition-all space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-indigo-400">
                    Chapter {ch.chapter_number}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditChapter(ch)}
                      className="p-1 text-slate-400 hover:text-indigo-400 rounded"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white tracking-tight mt-1">{ch.name}</h3>
                {ch.description && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{ch.description}</p>
                )}

                {/* Topics Tags */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Topics ({chapterTopics.length}):</span>
                    <button
                      onClick={() => openAddTopic(ch.id)}
                      className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Topic</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {chapterTopics.length === 0 ? (
                      <span className="text-[11px] text-slate-500 italic">No topics created yet.</span>
                    ) : (
                      chapterTopics.map((t) => (
                        <span
                          key={t.id}
                          className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-[11px] text-slate-300 font-sans"
                        >
                          {t.name}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Footer info */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-500">
                <span>{ch.mcq_count || 0} Questions linked</span>
                <span className="text-emerald-400 uppercase text-[10px] font-bold">{ch.status}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT CHAPTER MODAL */}
      {showChapterModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-lg text-white">
                {editingChapter ? "Edit Chapter" : "Create Physics Chapter"}
              </h3>
              <button onClick={() => setShowChapterModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChapterSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 uppercase mb-1">
                  Chapter Number *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={chapterForm.chapter_number}
                  onChange={(e) => setChapterForm({ ...chapterForm, chapter_number: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 uppercase mb-1">
                  Chapter Title *
                </label>
                <input
                  type="text"
                  required
                  value={chapterForm.name}
                  onChange={(e) => setChapterForm({ ...chapterForm, name: e.target.value })}
                  placeholder="e.g. Motion and Force"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={chapterForm.description}
                  onChange={(e) => setChapterForm({ ...chapterForm, description: e.target.value })}
                  placeholder="Brief synopsis of topics and laws covered in this chapter..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChapterModal(false)}
                  className="px-4 py-2 border border-slate-700 rounded-xl text-sm text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-indigo-600/30"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Add Topic to Chapter</h3>
              <button onClick={() => setShowTopicModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTopicSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 uppercase mb-1">
                  Topic Name *
                </label>
                <input
                  type="text"
                  required
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  placeholder="e.g. Projectile Motion, Friction"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTopicModal(false)}
                  className="px-3 py-1.5 border border-slate-700 rounded-xl text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium"
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
