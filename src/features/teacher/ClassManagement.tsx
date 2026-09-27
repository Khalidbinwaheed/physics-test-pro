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
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <School className="w-6 h-6 text-primary" />
            <span>Class & Section Management</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            Organize student cohorts • Bulk assign tests to entire classes or sections
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 neu-btn-primary rounded-xl text-sm font-semibold cursor-pointer"
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
            className="p-6 rounded-2xl neu-raised hover:neu-raised-lg space-y-3 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-primary uppercase">
                Section {c.section}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase neu-inset-sm text-emerald-500 font-bold">
                {c.status}
              </span>
            </div>

            <h3 className="text-xl font-bold text-foreground tracking-tight">{c.name}</h3>

            <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs font-mono text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{c.student_count || 0} Students enrolled</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE CLASS MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm neu-raised-lg rounded-3xl p-6 sm:p-7 text-foreground animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <h3 className="font-bold text-base text-foreground">Create Class & Section</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-xl neu-btn-interactive cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-mono font-medium text-foreground uppercase mb-1">
                  Class Name *
                </label>
                <input
                  type="text"
                  required
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="e.g. Class 12, Pre-Engineering"
                  className="w-full px-3.5 py-2.5 rounded-xl neu-inset text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-foreground uppercase mb-1">
                  Section *
                </label>
                <input
                  type="text"
                  required
                  value={section}
                  onChange={(e) => setSection(e.target.value.toUpperCase())}
                  placeholder="e.g. A, B, North"
                  className="w-full px-3.5 py-2.5 rounded-xl neu-inset text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 neu-btn rounded-xl text-xs text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 neu-btn-primary rounded-xl text-sm font-semibold cursor-pointer"
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
