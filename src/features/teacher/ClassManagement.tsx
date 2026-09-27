import React, { useState } from "react";
import { portalStorage } from "@/lib/portal-storage";
import { ClassItem } from "@/lib/portal-types";
import { School, Plus, Users, X, Check } from "lucide-react";
import { toast } from "sonner";

export function ClassManagement() {
  const [classes, setClasses] = useState<ClassItem[]>(portalStorage.getClasses());
  const [showModal, setShowModal] = useState(false);
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("A");

  const refresh = () => {
    setClasses(portalStorage.getClasses());
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) {
      toast.error("Class name is required.");
      return;
    }
    try {
      portalStorage.createClass(className, section);
      toast.success(`Class ${className}-${section} created successfully.`);
      setShowModal(false);
      setClassName("");
      setSection("A");
      refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to create class.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <School className="w-6 h-6 text-indigo-400" />
            <span>Class & Section Management</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Organize student cohorts • Bulk assign tests to entire classes or sections
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Class</span>
        </button>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {classes.map((c) => (
          <div
            key={c.id}
            className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-indigo-400 uppercase">
                Section {c.section}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {c.status}
              </span>
            </div>

            <h3 className="text-xl font-bold text-white tracking-tight">{c.name}</h3>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>{c.student_count || 0} Students enrolled</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE CLASS MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Create Class & Section</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 uppercase mb-1">
                  Class Name *
                </label>
                <input
                  type="text"
                  required
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="e.g. Class 12, Pre-Engineering"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 uppercase mb-1">
                  Section *
                </label>
                <input
                  type="text"
                  required
                  value={section}
                  onChange={(e) => setSection(e.target.value.toUpperCase())}
                  placeholder="e.g. A, B, North"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 border border-slate-700 rounded-xl text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-indigo-600/30"
                >
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
