import React, { useState, useEffect } from "react";
import "./App.css";
import { createClient } from "@supabase/supabase-js";

/**
 * Initialize Supabase client using env variables.
 */
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// PUBLIC_INTERFACE
/**
 * Main Notes App - minimalistic, sidebar layout, fully integrated with Supabase.
 * Features: Create, Edit, Delete, View note list, View note details.
 */
function App() {
  // App state
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form and UI states
  const [editMode, setEditMode] = useState(false);   // Editing or creating?
  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formError, setFormError] = useState("");
  const [formTouched, setFormTouched] = useState(false);

  // Fetch notes from Supabase on mount
  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line
  }, []);

  // DEBUG: Log Supabase environment variables and notes for troubleshooting.
  useEffect(() => {
    // Helps debug if env variables are undefined/wrong.
    // Remove/comment out in production! For local debugging.
    // eslint-disable-next-line
    if (!supabaseUrl || !supabaseKey) {
      // eslint-disable-next-line
      console.warn("Supabase env vars not set", { supabaseUrl, supabaseKey });
    }
  }, []);

  // PUBLIC_INTERFACE
  /**
   * Fetch all notes (sorted by last_updated descending).
   */
  async function fetchNotes() {
    setLoading(true);
    let { data, error } = await supabase
      .from("notes")
      .select("*")
      .order("last_updated", { ascending: false });
    if (error) {
      setFormError("Failed to load notes.");
      setNotes([]);
    } else {
      setNotes(data || []);
      if (data && data.length > 0) {
        setSelectedId((id) =>
          id && data.some((note) => note.id === id) ? id : data[0].id
        );
      } else {
        setSelectedId(null);
      }
    }
    setLoading(false);
  }

  /**
   * Handle clicking a note from sidebar.
   */
  function handleSelectNote(id) {
    setSelectedId(id);
    setEditMode(false);
    setFormError("");
    setFormTouched(false);
  }

  /**
   * Start new note mode.
   */
  function handleNewNote() {
    setEditMode(true);
    setSelectedId(null);
    setFormTitle("");
    setFormBody("");
    setFormError("");
    setFormTouched(false);
  }

  /**
   * Start editing the current note.
   */
  function handleEditNote() {
    const n = notes.find((n) => n.id === selectedId);
    if (n) {
      setEditMode(true);
      setFormTitle(n.title || "");
      setFormBody(n.body || "");
      setFormError("");
      setFormTouched(false);
    }
  }

  /**
   * Delete a note by id.
   */
  async function handleDeleteNote(id) {
    if (!window.confirm("Delete this note? This action cannot be undone.")) {
      return;
    }
    setLoading(true);
    let { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) {
      setFormError("Could not delete note.");
    } else {
      await fetchNotes();
      setEditMode(false);
    }
    setLoading(false);
  }

  /**
   * Save (create or update) a note.
   */
  async function handleSaveNote(e) {
    e.preventDefault();
    setFormTouched(true);
    if (!formTitle.trim()) {
      setFormError("Title required.");
      return;
    }
    setLoading(true);
    if (selectedId == null) {
      // Create
      const { data, error } = await supabase
        .from("notes")
        .insert([{ title: formTitle.trim(), body: formBody, last_updated: new Date().toISOString() }])
        .select();
      if (error) {
        setFormError("Could not save note.");
      } else {
        setEditMode(false);
        await fetchNotes();
        setSelectedId(data && data.length > 0 ? data[0].id : null);
      }
    } else {
      // Update
      const { error } = await supabase
        .from("notes")
        .update({ title: formTitle.trim(), body: formBody, last_updated: new Date().toISOString() })
        .eq("id", selectedId);
      if (error) {
        setFormError("Could not update note.");
      } else {
        setEditMode(false);
        await fetchNotes();
      }
    }
    setLoading(false);
  }

  /**
   * Cancel form edit/create.
   */
  function handleCancel() {
    setEditMode(false);
    setFormTitle("");
    setFormBody("");
    setFormError("");
    setFormTouched(false);
    // reselect previous note
    if (notes.length > 0 && selectedId == null) setSelectedId(notes[0].id);
  }

  /**
   * Render sidebar note list.
   */
  function renderSidebar() {
    return (
      <nav className="notes-sidebar" aria-label="Sidebar for notes list">
        <div className="sidebar-header">Notes</div>
        <button className="new-note-btn" onClick={handleNewNote} aria-label="Create new note">
          + New Note
        </button>
        <div className="notes-list" role="list">
          {notes.map((n) => (
            <button
              key={n.id}
              className={
                "note-list-item" +
                (selectedId === n.id && !editMode ? " selected" : "")
              }
              onClick={() => handleSelectNote(n.id)}
              aria-current={selectedId === n.id ? "true" : undefined}
              title={n.title}
            >
              {n.title || <em style={{ opacity: 0.7 }}>Untitled</em>}
            </button>
          ))}
        </div>
      </nav>
    );
  }

  /**
   * Render loading or empty state in main area.
   */
  function renderEmptyOrLoading() {
    if (loading) {
      return <div className="notes-empty">Loading...</div>;
    }
    if (notes.length === 0) {
      return (
        <div className="notes-empty">
          No notes found.<br />Click "New Note" to create your first note!
        </div>
      );
    }
    return null;
  }

  /**
   * Render note details or edit form in main area.
   */
  function renderMain() {
    if (editMode) {
      // Editing or creating
      return (
        <section className="notes-main" aria-label="Main area: edit note">
          <form onSubmit={handleSaveNote} autoComplete="off">
            <input
              className="note-title-input"
              placeholder="Title"
              maxLength={120}
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              aria-label="Note title"
              required
              disabled={loading}
            />
            <textarea
              className="note-body-input"
              placeholder="Write your note here..."
              value={formBody}
              onChange={(e) => setFormBody(e.target.value)}
              aria-label="Note content"
              disabled={loading}
              rows={8}
            ></textarea>
            <div className="note-meta-row">
              {formError && (
                <span style={{ color: "var(--accent)", fontWeight: 500 }}>
                  {formError}
                </span>
              )}
              <div className="action-btns" style={{ marginLeft: "auto" }}>
                <button className="primary-btn" type="submit" disabled={loading}>
                  Save
                </button>
                <button
                  className="secondary-btn"
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </section>
      );
    }

    // View note details
    const note = notes.find((n) => n.id === selectedId);
    if (!note) {
      return (
        <section className="notes-main">{renderEmptyOrLoading()}</section>
      );
    }
    return (
      <section className="notes-main" aria-label="Main area: note details">
        <h2 style={{ color: "var(--primary)", margin: "0 0 1em 0" }}>
          {note.title || <em>Untitled</em>}
        </h2>
        <div style={{ color: "var(--secondary)", fontSize: ".97em", marginBottom: ".95em" }}>
          {note.last_updated ? (
            <span className="note-meta-date">
              Last updated: {new Date(note.last_updated).toLocaleString()}
            </span>
          ) : null}
        </div>
        <pre
          style={{
            background: "var(--sidebar-bg)",
            borderRadius: "7px",
            padding: ".95em 1.2em",
            margin: 0,
            color: "var(--secondary)",
            fontSize: "1.06em",
            minHeight: "7vh",
            whiteSpace: "pre-wrap"
          }}
        >
          {note.body || <span style={{ opacity: 0.68 }}><em>No content</em></span>}
        </pre>
        <div className="note-meta-row" style={{ marginTop: "2em" }}>
          <button
            className="primary-btn"
            type="button"
            onClick={handleEditNote}
            aria-label="Edit note"
          >
            Edit
          </button>
          <button
            className="danger-btn"
            type="button"
            onClick={() => handleDeleteNote(note.id)}
            aria-label="Delete note"
          >
            Delete
          </button>
        </div>
      </section>
    );
  }

  // MAIN RENDER
  return (
    <div className="notes-app-container" data-theme="light">
      {renderSidebar()}
      {renderMain()}
    </div>
  );
}

export default App;
