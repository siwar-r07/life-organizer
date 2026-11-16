import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  FileText,
  Pencil,
  Trash2,
  X,
  Save,
  StickyNote,
} from "lucide-react";
import api from "./api";

const colors = {
  purple: "bg-purple-100 border-purple-200",
  pink: "bg-pink-100 border-pink-200",
  blue: "bg-blue-100 border-blue-200",
  yellow: "bg-amber-100 border-amber-200",
  green: "bg-green-100 border-green-200",
};

function Notes() {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showEditor, setShowEditor] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState("purple");

  const fetchNotes = async () => {
    try {
      setError("");
      const response = await api.get("/api/notes");
      setNotes(response.data);
    } catch (err) {
      console.error("Error loading notes:", err);
      setError("Couldn't load your notes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const resetEditor = () => {
    setTitle("");
    setContent("");
    setColor("purple");
    setEditingId(null);
    setShowEditor(false);
  };

  const openNewNote = () => {
    resetEditor();
    setShowEditor(true);
  };

  const openEditNote = (note) => {
    setTitle(note.title);
    setContent(note.content);
    setColor(note.color || "purple");
    setEditingId(note._id);
    setShowEditor(true);
  };

  const saveNote = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError("Please enter both a title and note content.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const noteData = {
        title: title.trim(),
        content: content.trim(),
        color,
      };

      if (editingId) {
        const response = await api.put(
          `/api/notes/${editingId}`,
          noteData
        );

        setNotes((previous) =>
          previous.map((note) =>
            note._id === editingId ? response.data : note
          )
        );
      } else {
        const response = await api.post("/api/notes", noteData);
        setNotes((previous) => [response.data, ...previous]);
      }

      resetEditor();
    } catch (err) {
      console.error("Error saving note:", err);
      setError("Couldn't save your note. Please try again.");
    } finally {
      setSaving(false);
    }
  };

const deleteNote = async () => {
  if (!noteToDelete) return;

  try {
    await api.delete(`/api/notes/${noteToDelete._id}`);

    setNotes((previous) =>
      previous.filter((note) => note._id !== noteToDelete._id)
    );

    setNoteToDelete(null);
  } catch (err) {
    console.error("Error deleting note:", err);
    setError("Couldn't delete this note. Please try again.");
    setNoteToDelete(null);
  }
};
  const filteredNotes = notes.filter((note) => {
    const query = search.toLowerCase();

    return (
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-5 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-sm font-semibold text-purple-500">
              YOUR PERSONAL SPACE
            </p>
            <h1 className="text-3xl font-bold text-gray-800 sm:text-4xl">
              My Notes <span className="text-purple-500">✦</span>
            </h1>
            <p className="mt-2 text-gray-500">
              Capture your thoughts, ideas, and little reminders.
            </p>
          </div>

          <button
            onClick={openNewNote}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-3 font-semibold text-white shadow-lg shadow-purple-200 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <Plus size={19} />
            Create note
          </button>
        </header>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your notes..."
              className="w-full rounded-2xl border border-purple-100 bg-white py-3 pl-11 pr-4 outline-none transition focus:border-purple-300 focus:ring-4 focus:ring-purple-100"
            />
          </div>

          <p className="text-sm text-gray-500">
            {notes.length} {notes.length === 1 ? "note" : "notes"} saved
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-center justify-between rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
            <span>{error}</span>
            <button onClick={() => setError("")} aria-label="Dismiss error">
              <X size={18} />
            </button>
          </div>
        )}

        {showEditor && (
          <form
            onSubmit={saveNote}
            className="mb-8 rounded-3xl border border-purple-100 bg-white p-5 shadow-lg shadow-purple-100/50 sm:p-7"
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? "Edit your note" : "Create a new note"}
              </h2>
              <button
                type="button"
                onClick={resetEditor}
                className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close editor"
              >
                <X size={20} />
              </button>
            </div>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your note a title..."
              maxLength={120}
              className="mb-4 w-full rounded-xl border border-gray-200 px-4 py-3 text-lg font-semibold outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-50"
            />

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write down your thoughts..."
              rows={6}
              className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 leading-7 outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-50"
            />

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="mb-2 text-sm font-medium text-gray-600">
                  Note color
                </p>
                <div className="flex gap-3">
                  {Object.keys(colors).map((item) => (
                    <button
                      key={item}
                      type="button"
                      title={item}
                      onClick={() => setColor(item)}
                      className={`h-8 w-8 rounded-full border-2 ${colors[item]} ${
                        color === item
                          ? "ring-2 ring-purple-500 ring-offset-2"
                          : ""
                      }`}
                      aria-label={`Choose ${item} color`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={resetEditor}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
                >
                  <Save size={17} />
                  {saving ? "Saving..." : "Save note"}
                </button>
              </div>
            </div>
          </form>
        )}

        {loading ? (
          <div className="py-20 text-center text-gray-500">
            Loading your notes...
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-purple-400/40 bg-purple-500/10 px-5 py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-purple-600">
              {search ? <Search size={28} /> : <StickyNote size={28} />}
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              {search ? "No matching notes" : "Your notes start here"}
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-gray-500">
              {search
                ? "Try another search term."
                : "Create your first note to keep your ideas organized."}
            </p>
            {!search && (
              <button
                onClick={openNewNote}
                className="mt-5 rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700"
              >
                Create your first note
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredNotes.map((note) => (
              <article
                key={note._id}
                className={`group flex min-h-56 flex-col rounded-3xl border p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg ${
                  colors[note.color] || colors.purple
                }`}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <FileText
                      size={18}
                      className="shrink-0 text-purple-700"
                    />
                  <h2 className="font-semibold text-gray-900 note-card-title">
  {note.title}
</h2>
                  </div>

                  <div className="flex shrink-0 gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                    <button
                      onClick={() => openEditNote(note)}
                      className="rounded-lg bg-white/70 p-2 text-gray-600 hover:bg-white hover:text-purple-700"
                      title="Edit note"
                      aria-label="Edit note"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                    onClick={() => setNoteToDelete(note)}
                      className="rounded-lg bg-white/70 p-2 text-gray-600 hover:bg-white hover:text-red-600"
                      title="Delete note"
                      aria-label="Delete note"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

             <p className="flex-1 whitespace-pre-wrap break-words text-sm leading-6 text-gray-900 dark-note-content">
  {note.content}
</p>
                <div className="mt-5 border-t border-black/5 pt-3 text-xs text-gray-500">
                  {note.createdAt
                    ? new Date(note.createdAt).toLocaleDateString()
                    : "Recently created"}
                </div>
              </article>
            ))}
          </div>
        )}
       </div>

      {noteToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-purple-100 bg-white p-6 shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <Trash2 size={26} />
            </div>

            <h2 className="text-center text-xl font-bold text-gray-800">
              Delete this note?
            </h2>

            <p className="mt-2 text-center text-sm leading-6 text-gray-500">
              Are you sure you want to delete "{noteToDelete.title}"?
              This action cannot be undone.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setNoteToDelete(null)}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={deleteNote}
                className="flex-1 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 px-4 py-3 font-semibold text-white shadow-md transition hover:opacity-90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default Notes;
