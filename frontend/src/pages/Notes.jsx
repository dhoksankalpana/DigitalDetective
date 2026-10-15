import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  FileText,
  Briefcase,
  User,
  Trash2,
  X,
  RefreshCw,
  Eye,
  CalendarDays,
  Filter,
  Edit3,
} from "lucide-react";

import api from "../services/api";
import "./Notes.css";

function Notes() {
  const [notes, setNotes] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [caseFilter, setCaseFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  const [formData, setFormData] = useState({
    case: "",
    content: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [notesResponse, casesResponse] = await Promise.all([
          api.get("/notes/"),
          api.get("/cases/"),
        ]);

        setNotes(
          Array.isArray(notesResponse.data)
            ? notesResponse.data
            : notesResponse.data.results || []
        );

        setCases(
          Array.isArray(casesResponse.data)
            ? casesResponse.data
            : casesResponse.data.results || []
        );
      } catch (err) {
        console.error(err);
        setError("Unable to load case notes.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const refreshData = async () => {
    try {
      setLoading(true);
      setError("");

      const [notesResponse, casesResponse] = await Promise.all([
        api.get("/notes/"),
        api.get("/cases/"),
      ]);

      setNotes(
        Array.isArray(notesResponse.data)
          ? notesResponse.data
          : notesResponse.data.results || []
      );

      setCases(
        Array.isArray(casesResponse.data)
          ? casesResponse.data
          : casesResponse.data.results || []
      );
    } catch (err) {
      console.error(err);
      setError("Unable to refresh case notes.");
    } finally {
      setLoading(false);
    }
  };

  const getCaseTitle = (caseId) => {
    const currentCase = cases.find(
      (item) => String(item.id) === String(caseId)
    );

    if (!currentCase) {
      return "Unknown Case";
    }

    return `${currentCase.case_number} — ${currentCase.title}`;
  };

  const filteredNotes = notes.filter((note) => {
    const text = search.toLowerCase();

    const matchesSearch =
      note.content?.toLowerCase().includes(text) ||
      getCaseTitle(note.case).toLowerCase().includes(text) ||
      note.author_username?.toLowerCase().includes(text);

    const matchesCase =
      caseFilter === "all" ||
      String(note.case) === String(caseFilter);

    return matchesSearch && matchesCase;
  });

  const openCreateModal = () => {
    setFormData({
      case: cases.length > 0 ? String(cases[0].id) : "",
      content: "",
    });

    setError("");
    setShowModal(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.case || !formData.content.trim()) {
      setError("Please select a case and enter a note.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await api.post("/notes/", {
        case: Number(formData.case),
        content: formData.content,
      });

      setShowModal(false);

      setFormData({
        case: "",
        content: "",
      });

      await refreshData();
    } catch (err) {
      console.error(err);

      if (err.response?.data) {
        setError(JSON.stringify(err.response.data));
      } else {
        setError("Unable to create case note.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this case note?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/notes/${id}/`);
      setSelectedNote(null);
      await refreshData();
    } catch (err) {
      console.error(err);
      setError("Unable to delete case note.");
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "Unknown";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) {
      return "Unknown";
    }

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPreview = (content) => {
    if (!content) {
      return "No content available.";
    }

    if (content.length > 220) {
      return `${content.substring(0, 220)}...`;
    }

    return content;
  };

  return (
    <div className="notes-page">
      <div className="notes-grid"></div>

      <div className="notes-container">
        <header className="notes-header">
          <div>
            <div className="notes-eyebrow">
              <FileText size={16} />
              INVESTIGATOR NOTES
            </div>

            <h1>Case Notes</h1>

            <p>
              Record observations, theories and investigative notes
              linked directly to your cases.
            </p>
          </div>

          <div className="notes-header-actions">
            <button
              className="notes-refresh-btn"
              onClick={refreshData}
            >
              <RefreshCw size={17} />
              Refresh
            </button>

            <button
              className="notes-add-btn"
              onClick={openCreateModal}
              disabled={cases.length === 0}
            >
              <Plus size={18} />
              New Note
            </button>
          </div>
        </header>

        {error && (
          <div className="notes-error">
            <span>{error}</span>

            <button onClick={() => setError("")}>
              <X size={17} />
            </button>
          </div>
        )}

        <section className="notes-stats">
          <div className="notes-stat-card">
            <div className="notes-stat-icon">
              <FileText size={22} />
            </div>

            <div>
              <span>Total Notes</span>
              <strong>{notes.length}</strong>
            </div>
          </div>

          <div className="notes-stat-card">
            <div className="notes-stat-icon">
              <Briefcase size={22} />
            </div>

            <div>
              <span>Cases With Notes</span>
              <strong>
                {new Set(notes.map((note) => note.case)).size}
              </strong>
            </div>
          </div>

          <div className="notes-stat-card">
            <div className="notes-stat-icon">
              <User size={22} />
            </div>

            <div>
              <span>Authors</span>
              <strong>
                {
                  new Set(
                    notes
                      .map((note) => note.author)
                      .filter(Boolean)
                  ).size
                }
              </strong>
            </div>
          </div>

          <div className="notes-stat-card">
            <div className="notes-stat-icon">
              <Eye size={22} />
            </div>

            <div>
              <span>Visible Notes</span>
              <strong>{filteredNotes.length}</strong>
            </div>
          </div>
        </section>

        <section className="notes-toolbar">
          <div className="notes-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search case notes..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            {search && (
              <button onClick={() => setSearch("")}>
                <X size={16} />
              </button>
            )}
          </div>

          <div className="notes-filter">
            <Filter size={17} />

            <select
              value={caseFilter}
              onChange={(event) => setCaseFilter(event.target.value)}
            >
              <option value="all">All Cases</option>

              {cases.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.case_number} — {item.title}
                </option>
              ))}
            </select>
          </div>
        </section>

        {loading ? (
          <div className="notes-loading">
            <div className="notes-spinner"></div>
            <p>Loading case notes...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="notes-empty">
            <FileText size={48} />

            <h2>No case notes found</h2>

            <p>
              Create a note to start recording investigative
              observations.
            </p>

            {cases.length > 0 && (
              <button
                className="notes-add-btn"
                onClick={openCreateModal}
              >
                <Plus size={18} />
                Create Note
              </button>
            )}
          </div>
        ) : (
          <section className="notes-list">
            {filteredNotes.map((note) => (
              <article className="note-card" key={note.id}>
                <div className="note-card-top">
                  <div className="note-icon">
                    <FileText size={22} />
                  </div>

                  <div className="note-heading">
                    <span className="note-case-label">
                      {getCaseTitle(note.case)}
                    </span>

                    <h2>
                      {note.author_username ||
                        `Investigator #${note.author}`}
                    </h2>
                  </div>

                  <button
                    className="note-view-btn"
                    onClick={() => setSelectedNote(note)}
                  >
                    <Eye size={16} />
                    View
                  </button>
                </div>

                <div className="note-content">
                  <p>{getPreview(note.content)}</p>
                </div>

                <div className="note-footer">
                  <div>
                    <CalendarDays size={15} />
                    Created {formatDate(note.created_at)}
                  </div>

                  <div>
                    <Edit3 size={15} />
                    Updated {formatDate(note.updated_at)}
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>

      {showModal && (
        <div
          className="notes-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="notes-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="notes-modal-header">
              <div>
                <span>NEW INVESTIGATOR NOTE</span>
                <h2>Create Case Note</h2>
              </div>

              <button onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="notes-form-group">
                <label>Related Case</label>

                <div className="notes-input-wrapper">
                  <Briefcase size={17} />

                  <select
                    name="case"
                    value={formData.case}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a case</option>

                    {cases.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.case_number} — {item.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="notes-form-group">
                <label>Investigation Note</label>

                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Write your investigative observations, theories or findings..."
                  rows="10"
                  required
                ></textarea>
              </div>

              <div className="notes-modal-actions">
                <button
                  type="button"
                  className="notes-cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="notes-submit-btn"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedNote && (
        <div
          className="notes-modal-overlay"
          onClick={() => setSelectedNote(null)}
        >
          <div
            className="notes-detail-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="notes-modal-header">
              <div>
                <span>CASE NOTE RECORD</span>
                <h2>Investigation Note</h2>
              </div>

              <button onClick={() => setSelectedNote(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="notes-detail-grid">
              <div className="notes-detail-item">
                <span>RELATED CASE</span>

                <strong>
                  {getCaseTitle(selectedNote.case)}
                </strong>
              </div>

              <div className="notes-detail-item">
                <span>AUTHOR</span>

                <strong>
                  {selectedNote.author_username ||
                    `Investigator #${selectedNote.author}`}
                </strong>
              </div>

              <div className="notes-detail-item">
                <span>CREATED</span>

                <strong>
                  {formatDateTime(selectedNote.created_at)}
                </strong>
              </div>

              <div className="notes-detail-item">
                <span>UPDATED</span>

                <strong>
                  {formatDateTime(selectedNote.updated_at)}
                </strong>
              </div>
            </div>

            <div className="notes-detail-content">
              <span>INVESTIGATIVE NOTE</span>

              <p>{selectedNote.content}</p>
            </div>

            <div className="notes-detail-actions">
              <button
                className="notes-delete-btn"
                onClick={() =>
                  handleDelete(selectedNote.id)
                }
              >
                <Trash2 size={17} />
                Delete Note
              </button>

              <button
                className="notes-cancel-btn"
                onClick={() => setSelectedNote(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Notes;