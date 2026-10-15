import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Lightbulb,
  Briefcase,
  CheckCircle2,
  Clock,
  Trash2,
  X,
  RefreshCw,
  Eye,
  Filter,
  AlertTriangle,
} from "lucide-react";

import api from "../services/api";
import "./Clues.css";

function Clues() {
  const [clues, setClues] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [caseFilter, setCaseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [selectedClue, setSelectedClue] = useState(null);

  const [formData, setFormData] = useState({
    case: "",
    title: "",
    description: "",
    importance: 3,
    resolved: false,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [cluesResponse, casesResponse] = await Promise.all([
          api.get("/clues/"),
          api.get("/cases/"),
        ]);

        setClues(
          Array.isArray(cluesResponse.data)
            ? cluesResponse.data
            : cluesResponse.data.results || []
        );

        setCases(
          Array.isArray(casesResponse.data)
            ? casesResponse.data
            : casesResponse.data.results || []
        );
      } catch (err) {
        console.error(err);
        setError("Unable to load clues.");
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

      const [cluesResponse, casesResponse] = await Promise.all([
        api.get("/clues/"),
        api.get("/cases/"),
      ]);

      setClues(
        Array.isArray(cluesResponse.data)
          ? cluesResponse.data
          : cluesResponse.data.results || []
      );

      setCases(
        Array.isArray(casesResponse.data)
          ? casesResponse.data
          : casesResponse.data.results || []
      );
    } catch (err) {
      console.error(err);
      setError("Unable to refresh clues.");
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

  const filteredClues = clues.filter((clue) => {
    const text = search.toLowerCase();

    const matchesSearch =
      clue.title?.toLowerCase().includes(text) ||
      clue.description?.toLowerCase().includes(text) ||
      getCaseTitle(clue.case).toLowerCase().includes(text);

    const matchesCase =
      caseFilter === "all" ||
      String(clue.case) === String(caseFilter);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "resolved" && clue.resolved) ||
      (statusFilter === "pending" && !clue.resolved);

    return matchesSearch && matchesCase && matchesStatus;
  });

  const openCreateModal = () => {
    setFormData({
      case: cases.length > 0 ? String(cases[0].id) : "",
      title: "",
      description: "",
      importance: 3,
      resolved: false,
    });

    setError("");
    setShowModal(true);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.case || !formData.title || !formData.description) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await api.post("/clues/", {
        case: Number(formData.case),
        title: formData.title,
        description: formData.description,
        importance: Number(formData.importance),
        resolved: formData.resolved,
      });

      setShowModal(false);

      setFormData({
        case: "",
        title: "",
        description: "",
        importance: 3,
        resolved: false,
      });

      await refreshData();
    } catch (err) {
      console.error(err);

      if (err.response?.data) {
        setError(JSON.stringify(err.response.data));
      } else {
        setError("Unable to create clue.");
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleResolved = async (clue) => {
    try {
      setError("");

      await api.patch(`/clues/${clue.id}/`, {
        resolved: !clue.resolved,
      });

      await refreshData();

      if (selectedClue?.id === clue.id) {
        setSelectedClue({
          ...clue,
          resolved: !clue.resolved,
        });
      }
    } catch (err) {
      console.error(err);
      setError("Unable to update clue status.");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this clue?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/clues/${id}/`);
      setSelectedClue(null);
      await refreshData();
    } catch (err) {
      console.error(err);
      setError("Unable to delete clue.");
    }
  };

  const getImportanceLabel = (importance) => {
    if (importance >= 5) {
      return "Critical";
    }

    if (importance >= 4) {
      return "High";
    }

    if (importance >= 3) {
      return "Medium";
    }

    if (importance >= 2) {
      return "Low";
    }

    return "Minor";
  };

  const getImportanceClass = (importance) => {
    if (importance >= 5) {
      return "importance-critical";
    }

    if (importance >= 4) {
      return "importance-high";
    }

    if (importance >= 3) {
      return "importance-medium";
    }

    return "importance-low";
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

  const totalClues = clues.length;

  const resolvedClues = clues.filter(
    (clue) => clue.resolved
  ).length;

  const pendingClues = clues.filter(
    (clue) => !clue.resolved
  ).length;

  const criticalClues = clues.filter(
    (clue) => Number(clue.importance) >= 5
  ).length;

  return (
    <div className="clues-page">
      <div className="clues-grid"></div>

      <div className="clues-container">
        <header className="clues-header">
          <div>
            <div className="clues-eyebrow">
              <Lightbulb size={16} />
              CLUE INTELLIGENCE
            </div>

            <h1>Clue Management</h1>

            <p>
              Track leads, discoveries and unresolved clues across active cases.
            </p>
          </div>

          <div className="clues-header-actions">
            <button
              className="clue-refresh-btn"
              onClick={refreshData}
            >
              <RefreshCw size={17} />
              Refresh
            </button>

            <button
              className="clue-add-btn"
              onClick={openCreateModal}
              disabled={cases.length === 0}
            >
              <Plus size={18} />
              New Clue
            </button>
          </div>
        </header>

        {error && (
          <div className="clue-error">
            <span>{error}</span>

            <button onClick={() => setError("")}>
              <X size={17} />
            </button>
          </div>
        )}

        <section className="clue-stats">
          <div className="clue-stat-card">
            <div className="clue-stat-icon">
              <Lightbulb size={22} />
            </div>

            <div>
              <span>Total Clues</span>
              <strong>{totalClues}</strong>
            </div>
          </div>

          <div className="clue-stat-card">
            <div className="clue-stat-icon">
              <CheckCircle2 size={22} />
            </div>

            <div>
              <span>Resolved</span>
              <strong>{resolvedClues}</strong>
            </div>
          </div>

          <div className="clue-stat-card">
            <div className="clue-stat-icon">
              <Clock size={22} />
            </div>

            <div>
              <span>Pending</span>
              <strong>{pendingClues}</strong>
            </div>
          </div>

          <div className="clue-stat-card">
            <div className="clue-stat-icon">
              <AlertTriangle size={22} />
            </div>

            <div>
              <span>Critical</span>
              <strong>{criticalClues}</strong>
            </div>
          </div>
        </section>

        <section className="clue-toolbar">
          <div className="clue-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search clues..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            {search && (
              <button onClick={() => setSearch("")}>
                <X size={16} />
              </button>
            )}
          </div>

          <div className="clue-filter">
            <Briefcase size={17} />

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

          <div className="clue-filter">
            <Filter size={17} />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </section>

        {loading ? (
          <div className="clue-loading">
            <div className="clue-spinner"></div>
            <p>Loading clues...</p>
          </div>
        ) : filteredClues.length === 0 ? (
          <div className="clue-empty">
            <Lightbulb size={48} />

            <h2>No clues found</h2>

            <p>
              Create a clue to begin tracking investigative leads.
            </p>

            {cases.length > 0 && (
              <button
                className="clue-add-btn"
                onClick={openCreateModal}
              >
                <Plus size={18} />
                Create Clue
              </button>
            )}
          </div>
        ) : (
          <section className="clue-list">
            {filteredClues.map((clue) => (
              <article className="clue-card" key={clue.id}>
                <div className="clue-card-top">
                  <div className="clue-icon">
                    <Lightbulb size={23} />
                  </div>

                  <div className="clue-card-heading">
                    <span className="clue-case-label">
                      {getCaseTitle(clue.case)}
                    </span>

                    <h2>{clue.title}</h2>
                  </div>

                  <div
                    className={`clue-importance ${getImportanceClass(
                      Number(clue.importance)
                    )}`}
                  >
                    {getImportanceLabel(Number(clue.importance))}
                  </div>
                </div>

                <div className="clue-description">
                  <p>{clue.description}</p>
                </div>

                <div className="clue-card-footer">
                  <div
                    className={
                      clue.resolved
                        ? "clue-status resolved"
                        : "clue-status pending"
                    }
                  >
                    {clue.resolved ? (
                      <>
                        <CheckCircle2 size={16} />
                        Resolved
                      </>
                    ) : (
                      <>
                        <Clock size={16} />
                        Pending
                      </>
                    )}
                  </div>

                  <div className="clue-date">
                    <Clock size={15} />
                    {formatDate(clue.created_at)}
                  </div>

                  <div className="clue-actions">
                    <button
                      className="clue-view-btn"
                      onClick={() => setSelectedClue(clue)}
                    >
                      <Eye size={16} />
                      View
                    </button>

                    <button
                      className={
                        clue.resolved
                          ? "clue-toggle-btn pending-action"
                          : "clue-toggle-btn resolve-action"
                      }
                      onClick={() => toggleResolved(clue)}
                    >
                      {clue.resolved ? "Mark Pending" : "Resolve"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>

      {showModal && (
        <div
          className="clue-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="clue-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="clue-modal-header">
              <div>
                <span>NEW CLUE RECORD</span>
                <h2>Create Clue</h2>
              </div>

              <button onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="clue-form-group">
                <label>Related Case</label>

                <div className="clue-input-wrapper">
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

              <div className="clue-form-group">
                <label>Clue Title</label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter clue title"
                  required
                />
              </div>

              <div className="clue-form-group">
                <label>Description</label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the clue and its significance..."
                  rows="6"
                  required
                ></textarea>
              </div>

              <div className="clue-form-group">
                <label>Importance</label>

                <select
                  name="importance"
                  value={formData.importance}
                  onChange={handleChange}
                >
                  <option value="1">1 — Minor</option>
                  <option value="2">2 — Low</option>
                  <option value="3">3 — Medium</option>
                  <option value="4">4 — High</option>
                  <option value="5">5 — Critical</option>
                </select>
              </div>

              <label className="clue-checkbox">
                <input
                  type="checkbox"
                  name="resolved"
                  checked={formData.resolved}
                  onChange={handleChange}
                />

                <span>Mark this clue as resolved</span>
              </label>

              <div className="clue-modal-actions">
                <button
                  type="button"
                  className="clue-cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="clue-submit-btn"
                  disabled={saving}
                >
                  {saving ? "Creating..." : "Create Clue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedClue && (
        <div
          className="clue-modal-overlay"
          onClick={() => setSelectedClue(null)}
        >
          <div
            className="clue-detail-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="clue-modal-header">
              <div>
                <span>CLUE RECORD</span>
                <h2>{selectedClue.title}</h2>
              </div>

              <button onClick={() => setSelectedClue(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="clue-detail-grid">
              <div className="clue-detail-item">
                <span>RELATED CASE</span>
                <strong>
                  {getCaseTitle(selectedClue.case)}
                </strong>
              </div>

              <div className="clue-detail-item">
                <span>IMPORTANCE</span>
                <strong>
                  {getImportanceLabel(
                    Number(selectedClue.importance)
                  )}
                </strong>
              </div>

              <div className="clue-detail-item">
                <span>STATUS</span>
                <strong>
                  {selectedClue.resolved
                    ? "Resolved"
                    : "Pending"}
                </strong>
              </div>

              <div className="clue-detail-item">
                <span>CREATED</span>
                <strong>
                  {formatDate(selectedClue.created_at)}
                </strong>
              </div>
            </div>

            <div className="clue-detail-description">
              <span>CLUE DESCRIPTION</span>

              <p>{selectedClue.description}</p>
            </div>

            <div className="clue-detail-actions">
              <button
                className="clue-delete-btn"
                onClick={() => handleDelete(selectedClue.id)}
              >
                <Trash2 size={17} />
                Delete Clue
              </button>

              <button
                className="clue-resolve-detail-btn"
                onClick={() => toggleResolved(selectedClue)}
              >
                {selectedClue.resolved
                  ? "Mark Pending"
                  : "Mark Resolved"}
              </button>

              <button
                className="clue-cancel-btn"
                onClick={() => setSelectedClue(null)}
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

export default Clues;