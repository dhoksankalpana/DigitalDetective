import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  RefreshCw,
  Briefcase,
  MapPin,
  CalendarDays,
  Eye,
  Trash2,
  ShieldAlert,
  X,
  Activity,
  CheckCircle2,
  Clock3,
  ArrowUpDown,
} from "lucide-react";

import api from "../services/api";
import "./Cases.css";

function Cases() {
  const navigate = useNavigate();

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    case_number: "",
    title: "",
    description: "",
    location: "",
    status: "open",
    priority: "medium",
  });

  useEffect(() => {
    let mounted = true;

    const loadCases = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/cases/");

        if (mounted) {
          const data = response.data?.results || response.data || [];
          setCases(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Cases API error:", err);

        if (mounted) {
          if (err.response?.status === 401) {
            setError("Your session has expired. Please log in again.");
          } else {
            setError("Unable to load case files.");
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadCases();

    return () => {
      mounted = false;
    };
  }, []);

  const refreshCases = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/cases/");
      const data = response.data?.results || response.data || [];

      setCases(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Cases refresh error:", err);

      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else {
        setError("Unable to refresh case files.");
      }
    } finally {
      setLoading(false);
    }
  };

  const caseStats = useMemo(() => {
    const total = cases.length;

    const open = cases.filter((item) => {
      const status = String(item.status || "").toLowerCase();
      return (
        status === "open" ||
        status === "active" ||
        status === "in_progress" ||
        status === "in-progress"
      );
    }).length;

    const closed = cases.filter((item) => {
      const status = String(item.status || "").toLowerCase();
      return (
        status === "closed" ||
        status === "resolved" ||
        status === "completed"
      );
    }).length;

    const highPriority = cases.filter(
      (item) =>
        String(item.priority || "").toLowerCase() === "high"
    ).length;

    return {
      total,
      open,
      closed,
      highPriority,
    };
  }, [cases]);

  const filteredCases = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    const filtered = cases.filter((caseItem) => {
      const searchableText = [
        caseItem.title,
        caseItem.case_number,
        caseItem.location,
        caseItem.description,
        caseItem.status,
        caseItem.priority,
      ]
        .map((value) => String(value || "").toLowerCase())
        .join(" ");

      const matchesSearch =
        !searchValue || searchableText.includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        String(caseItem.status || "").toLowerCase() === statusFilter;

      const matchesPriority =
        priorityFilter === "all" ||
        String(caseItem.priority || "").toLowerCase() === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "oldest") {
        return (
          new Date(a.created_at || 0) -
          new Date(b.created_at || 0)
        );
      }

      if (sortBy === "title") {
        return String(a.title || "").localeCompare(
          String(b.title || "")
        );
      }

      if (sortBy === "priority") {
        const priorityOrder = {
          high: 3,
          medium: 2,
          low: 1,
        };

        return (
          (priorityOrder[
            String(b.priority || "").toLowerCase()
          ] || 0) -
          (priorityOrder[
            String(a.priority || "").toLowerCase()
          ] || 0)
        );
      }

      return (
        new Date(b.created_at || 0) -
        new Date(a.created_at || 0)
      );
    });
  }, [
    cases,
    search,
    statusFilter,
    priorityFilter,
    sortBy,
  ]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreateCase = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.case_number.trim() || !formData.title.trim()) {
      setError("Case number and title are required.");
      return;
    }

    try {
      setCreating(true);

      await api.post("/cases/", {
        case_number: formData.case_number.trim(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        status: formData.status,
        priority: formData.priority,
      });

      setFormData({
        case_number: "",
        title: "",
        description: "",
        location: "",
        status: "open",
        priority: "medium",
      });

      setShowCreateForm(false);

      await refreshCases();
    } catch (err) {
      console.error("Create case error:", err);

      const data = err.response?.data;

      if (data?.case_number) {
        setError(
          Array.isArray(data.case_number)
            ? data.case_number[0]
            : data.case_number
        );
      } else if (data?.title) {
        setError(
          Array.isArray(data.title)
            ? data.title[0]
            : data.title
        );
      } else if (data?.detail) {
        setError(data.detail);
      } else {
        setError("Unable to create the case.");
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCase = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this case?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(`/cases/${id}/`);

      setCases((previous) =>
        previous.filter((caseItem) => caseItem.id !== id)
      );
    } catch (err) {
      console.error("Delete case error:", err);

      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else {
        setError("Unable to delete the case.");
      }
    }
  };

  const getStatusClass = (status) => {
    const value = String(status || "").toLowerCase();

    if (
      value === "open" ||
      value === "active" ||
      value === "in_progress" ||
      value === "in-progress"
    ) {
      return "status-badge status-open";
    }

    if (
      value === "closed" ||
      value === "resolved" ||
      value === "completed"
    ) {
      return "status-badge status-closed";
    }

    return "status-badge status-pending";
  };

  const getPriorityClass = (priority) => {
    const value = String(priority || "").toLowerCase();

    if (value === "high") {
      return "case-priority priority-high";
    }

    if (value === "low") {
      return "case-priority priority-low";
    }

    return "case-priority priority-medium";
  };

  const formatDate = (date) => {
    if (!date) {
      return "Recently";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Recently";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="cases-page">
      <div className="dashboard-background">
        <div className="dashboard-grid"></div>
        <div className="dashboard-glow dashboard-glow-one"></div>
        <div className="dashboard-glow dashboard-glow-two"></div>
      </div>

      <div className="cases-container">
        <header className="cases-header">
          <div>
            <div className="cases-eyebrow">
              <ShieldAlert size={16} />
              INVESTIGATION CASE MANAGEMENT
            </div>

            <h1>Case Files</h1>

            <p>
              Search, monitor and manage active digital investigation
              cases.
            </p>
          </div>

          <div className="cases-header-actions">
            <button
              className="btn btn-secondary"
              onClick={refreshCases}
              disabled={loading}
            >
              <RefreshCw size={17} />
              Refresh
            </button>

            <button
              className="btn btn-primary"
              onClick={() => {
                setError("");
                setShowCreateForm(true);
              }}
            >
              <Plus size={17} />
              New Case
            </button>
          </div>
        </header>

        {error && (
          <div className="dashboard-error">
            <ShieldAlert size={19} />
            <span>{error}</span>

            <button
              className="icon-button"
              onClick={() => setError("")}
              title="Close error"
            >
              <X size={17} />
            </button>
          </div>
        )}

        <section className="cases-stats">
          <div className="case-stat-card">
            <div className="case-stat-icon">
              <Briefcase size={20} />
            </div>

            <div>
              <span>Total Cases</span>
              <strong>{caseStats.total}</strong>
            </div>
          </div>

          <div className="case-stat-card">
            <div className="case-stat-icon">
              <Activity size={20} />
            </div>

            <div>
              <span>Active Cases</span>
              <strong>{caseStats.open}</strong>
            </div>
          </div>

          <div className="case-stat-card">
            <div className="case-stat-icon">
              <CheckCircle2 size={20} />
            </div>

            <div>
              <span>Closed Cases</span>
              <strong>{caseStats.closed}</strong>
            </div>
          </div>

          <div className="case-stat-card">
            <div className="case-stat-icon">
              <ShieldAlert size={20} />
            </div>

            <div>
              <span>High Priority</span>
              <strong>{caseStats.highPriority}</strong>
            </div>
          </div>
        </section>

        <section className="cases-toolbar">
          <div className="case-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search case number, title, description or location..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="active">Active</option>
            <option value="in_progress">In Progress</option>
            <option value="closed">Closed</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(event) =>
              setPriorityFilter(event.target.value)
            }
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Title A-Z</option>
            <option value="priority">Priority</option>
          </select>

          <div className="cases-count">
            <ArrowUpDown size={17} />
            {filteredCases.length} of {cases.length} cases
          </div>
        </section>

        {loading ? (
          <div className="cases-loading">
            <div className="loader"></div>
            <p>Scanning case database...</p>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="cases-empty">
            <Briefcase size={42} />

            <h2>
              {cases.length === 0
                ? "No case files yet"
                : "No matching cases"}
            </h2>

            <p>
              {cases.length === 0
                ? "Create your first investigation case to begin."
                : "Try changing your search or filter settings."}
            </p>

            {cases.length === 0 && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  setError("");
                  setShowCreateForm(true);
                }}
              >
                <Plus size={17} />
                Create First Case
              </button>
            )}
          </div>
        ) : (
          <section className="cases-grid">
            {filteredCases.map((caseItem) => (
              <article
                className="case-card"
                key={caseItem.id}
              >
                <div className="case-card-top">
                  <div className="case-card-icon">
                    <Briefcase size={21} />
                  </div>

                  <span
                    className={getStatusClass(
                      caseItem.status
                    )}
                  >
                    {caseItem.status || "Pending"}
                  </span>
                </div>

                <div className="case-number">
                  {caseItem.case_number || "CASE FILE"}
                </div>

                <h2>
                  {caseItem.title || "Untitled Case"}
                </h2>

                <p className="case-description">
                  {caseItem.description ||
                    "No case description has been provided."}
                </p>

                <div className="case-details">
                  {caseItem.location && (
                    <div className="case-detail">
                      <MapPin size={15} />
                      <span>{caseItem.location}</span>
                    </div>
                  )}

                  <div className="case-detail">
                    <CalendarDays size={15} />
                    <span>
                      {formatDate(caseItem.created_at)}
                    </span>
                  </div>

                  <div className="case-detail">
                    <span
                      className={getPriorityClass(
                        caseItem.priority
                      )}
                    >
                      Priority:{" "}
                      {caseItem.priority || "Medium"}
                    </span>
                  </div>
                </div>

                <div className="case-card-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() =>
                      navigate(`/cases/${caseItem.id}`)
                    }
                  >
                    <Eye size={16} />
                    View Case
                  </button>

                  <div className="case-card-actions">
                    <button
                      className="case-action delete"
                      title="Delete case"
                      onClick={() =>
                        handleDeleteCase(caseItem.id)
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}

        <footer className="dashboard-footer">
          <span>
            DigitalDetective Investigation Network
          </span>

          <span>
            {cases.length} case files indexed
          </span>
        </footer>
      </div>

      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <div className="panel-title">
                  <Plus size={19} />
                  Create New Case
                </div>

                <p>
                  Register a new investigation file.
                </p>
              </div>

              <button
                className="icon-button"
                onClick={() =>
                  setShowCreateForm(false)
                }
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCase}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="case_number">
                    Case Number
                  </label>

                  <input
                    id="case_number"
                    type="text"
                    name="case_number"
                    placeholder="DD-2026-001"
                    value={formData.case_number}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="case_title">
                    Case Title
                  </label>

                  <input
                    id="case_title"
                    type="text"
                    name="title"
                    placeholder="The Midnight Signal"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="case_location">
                    Location
                  </label>

                  <input
                    id="case_location"
                    type="text"
                    name="location"
                    placeholder="Pune"
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="case_status">
                    Status
                  </label>

                  <select
                    id="case_status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="open">Open</option>
                    <option value="active">Active</option>
                    <option value="in_progress">
                      In Progress
                    </option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="case_priority">
                    Priority
                  </label>

                  <select
                    id="case_priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div className="form-group form-group-full">
                  <label htmlFor="case_description">
                    Description
                  </label>

                  <textarea
                    id="case_description"
                    name="description"
                    placeholder="Enter investigation details..."
                    rows="5"
                    value={formData.description}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() =>
                    setShowCreateForm(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={creating}
                >
                  {creating ? (
                    <>
                      <RefreshCw
                        size={17}
                        className="spin"
                      />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />
                      Create Case
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cases;