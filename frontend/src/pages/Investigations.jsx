import { useEffect, useState } from "react";
import { Search, Plus, FileSearch, Briefcase, User, Trash2, X, RefreshCw, Eye, CalendarDays, Filter } from "lucide-react";
import api from "../services/api";
import "./Investigations.css";

function Investigations() {
  const [investigations, setInvestigations] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [caseFilter, setCaseFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedInvestigation, setSelectedInvestigation] = useState(null);

  const [formData, setFormData] = useState({
    case: "",
    title: "",
    findings: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [investigationsResponse, casesResponse] = await Promise.all([
          api.get("/investigations/"),
          api.get("/cases/"),
        ]);

        setInvestigations(
          Array.isArray(investigationsResponse.data)
            ? investigationsResponse.data
            : investigationsResponse.data.results || []
        );

        setCases(
          Array.isArray(casesResponse.data)
            ? casesResponse.data
            : casesResponse.data.results || []
        );
      } catch (err) {
        console.error(err);
        setError("Unable to load investigations.");
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

      const [investigationsResponse, casesResponse] = await Promise.all([
        api.get("/investigations/"),
        api.get("/cases/"),
      ]);

      setInvestigations(
        Array.isArray(investigationsResponse.data)
          ? investigationsResponse.data
          : investigationsResponse.data.results || []
      );

      setCases(
        Array.isArray(casesResponse.data)
          ? casesResponse.data
          : casesResponse.data.results || []
      );
    } catch (err) {
      console.error(err);
      setError("Unable to refresh investigations.");
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

  const filteredInvestigations = investigations.filter((investigation) => {
    const text = search.toLowerCase();

    const matchesSearch =
      investigation.title?.toLowerCase().includes(text) ||
      investigation.findings?.toLowerCase().includes(text) ||
      getCaseTitle(investigation.case).toLowerCase().includes(text);

    const matchesCase =
      caseFilter === "all" ||
      String(investigation.case) === String(caseFilter);

    return matchesSearch && matchesCase;
  });

  const openCreateModal = () => {
    setFormData({
      case: cases.length > 0 ? String(cases[0].id) : "",
      title: "",
      findings: "",
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

    if (!formData.case || !formData.title || !formData.findings) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await api.post("/investigations/", {
        case: Number(formData.case),
        title: formData.title,
        findings: formData.findings,
      });

      setShowModal(false);

      setFormData({
        case: "",
        title: "",
        findings: "",
      });

      await refreshData();
    } catch (err) {
      console.error(err);

      if (err.response?.data) {
        setError(JSON.stringify(err.response.data));
      } else {
        setError("Unable to create investigation.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this investigation?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/investigations/${id}/`);
      setSelectedInvestigation(null);
      await refreshData();
    } catch (err) {
      console.error(err);
      setError("Unable to delete investigation.");
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

  return (
    <div className="investigations-page">
      <div className="investigations-grid"></div>

      <div className="investigations-container">
        <header className="investigations-header">
          <div>
            <div className="investigations-eyebrow">
              <FileSearch size={16} />
              INVESTIGATION INTELLIGENCE
            </div>

            <h1>Investigations</h1>

            <p>
              Track findings and investigative work from one command center.
            </p>
          </div>

          <div className="investigations-header-actions">
            <button
              className="investigation-refresh-btn"
              onClick={refreshData}
            >
              <RefreshCw size={17} />
              Refresh
            </button>

            <button
              className="investigation-add-btn"
              onClick={openCreateModal}
              disabled={cases.length === 0}
            >
              <Plus size={18} />
              New Investigation
            </button>
          </div>
        </header>

        {error && (
          <div className="investigation-error">
            <span>{error}</span>

            <button onClick={() => setError("")}>
              <X size={17} />
            </button>
          </div>
        )}

        <section className="investigation-stats">
          <div className="investigation-stat-card">
            <div className="investigation-stat-icon">
              <FileSearch size={22} />
            </div>

            <div>
              <span>Total Investigations</span>
              <strong>{investigations.length}</strong>
            </div>
          </div>

          <div className="investigation-stat-card">
            <div className="investigation-stat-icon">
              <Briefcase size={22} />
            </div>

            <div>
              <span>Cases Investigated</span>
              <strong>
                {new Set(investigations.map((item) => item.case)).size}
              </strong>
            </div>
          </div>

          <div className="investigation-stat-card">
            <div className="investigation-stat-icon">
              <User size={22} />
            </div>

            <div>
              <span>Investigators</span>
              <strong>
                {
                  new Set(
                    investigations
                      .map((item) => item.investigator)
                      .filter(Boolean)
                  ).size
                }
              </strong>
            </div>
          </div>

          <div className="investigation-stat-card">
            <div className="investigation-stat-icon">
              <Eye size={22} />
            </div>

            <div>
              <span>Visible Results</span>
              <strong>{filteredInvestigations.length}</strong>
            </div>
          </div>
        </section>

        <section className="investigation-toolbar">
          <div className="investigation-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search investigations..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            {search && (
              <button onClick={() => setSearch("")}>
                <X size={16} />
              </button>
            )}
          </div>

          <div className="investigation-filter">
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
          <div className="investigation-loading">
            <div className="investigation-spinner"></div>
            <p>Loading investigations...</p>
          </div>
        ) : filteredInvestigations.length === 0 ? (
          <div className="investigation-empty">
            <FileSearch size={45} />

            <h2>No investigations found</h2>

            <p>
              Create an investigation to start tracking your findings.
            </p>

            {cases.length > 0 && (
              <button
                className="investigation-add-btn"
                onClick={openCreateModal}
              >
                <Plus size={18} />
                Create Investigation
              </button>
            )}
          </div>
        ) : (
          <section className="investigation-list">
            {filteredInvestigations.map((investigation) => (
              <article
                className="investigation-card"
                key={investigation.id}
              >
                <div className="investigation-card-top">
                  <div className="investigation-card-icon">
                    <FileSearch size={23} />
                  </div>

                  <div className="investigation-card-heading">
                    <span className="investigation-case-label">
                      {getCaseTitle(investigation.case)}
                    </span>

                    <h2>{investigation.title}</h2>
                  </div>

                  <button
                    className="investigation-view-btn"
                    onClick={() =>
                      setSelectedInvestigation(investigation)
                    }
                  >
                    <Eye size={17} />
                    View
                  </button>
                </div>

                <div className="investigation-findings">
                  <span>FINDINGS</span>
                  <p>{investigation.findings}</p>
                </div>

                <div className="investigation-card-footer">
                  <div>
                    <User size={16} />
                    <span>
                      {investigation.investigator_username ||
                        `Investigator #${investigation.investigator}`}
                    </span>
                  </div>

                  <div>
                    <CalendarDays size={16} />
                    <span>
                      {formatDate(investigation.created_at)}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>

      {showModal && (
        <div
          className="investigation-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="investigation-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="investigation-modal-header">
              <div>
                <span>NEW RECORD</span>
                <h2>Create Investigation</h2>
              </div>

              <button onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="investigation-form-group">
                <label>Related Case</label>

                <div className="investigation-input-wrapper">
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

              <div className="investigation-form-group">
                <label>Investigation Title</label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter investigation title"
                  required
                />
              </div>

              <div className="investigation-form-group">
                <label>Findings</label>

                <textarea
                  name="findings"
                  value={formData.findings}
                  onChange={handleChange}
                  placeholder="Enter investigation findings..."
                  rows="7"
                  required
                ></textarea>
              </div>

              <div className="investigation-modal-actions">
                <button
                  type="button"
                  className="investigation-cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="investigation-submit-btn"
                  disabled={saving}
                >
                  {saving ? "Creating..." : "Create Investigation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedInvestigation && (
        <div
          className="investigation-modal-overlay"
          onClick={() => setSelectedInvestigation(null)}
        >
          <div
            className="investigation-detail-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="investigation-modal-header">
              <div>
                <span>INVESTIGATION RECORD</span>
                <h2>{selectedInvestigation.title}</h2>
              </div>

              <button
                onClick={() => setSelectedInvestigation(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="investigation-detail-grid">
              <div className="investigation-detail-item">
                <span>RELATED CASE</span>
                <strong>
                  {getCaseTitle(selectedInvestigation.case)}
                </strong>
              </div>

              <div className="investigation-detail-item">
                <span>INVESTIGATOR</span>
                <strong>
                  {selectedInvestigation.investigator_username ||
                    `Investigator #${selectedInvestigation.investigator}`}
                </strong>
              </div>

              <div className="investigation-detail-item">
                <span>CREATED</span>
                <strong>
                  {formatDate(selectedInvestigation.created_at)}
                </strong>
              </div>

              <div className="investigation-detail-item">
                <span>UPDATED</span>
                <strong>
                  {formatDate(selectedInvestigation.updated_at)}
                </strong>
              </div>
            </div>

            <div className="investigation-detail-findings">
              <span>INVESTIGATIVE FINDINGS</span>

              <p>{selectedInvestigation.findings}</p>
            </div>

            <div className="investigation-detail-actions">
              <button
                className="investigation-delete-btn"
                onClick={() =>
                  handleDelete(selectedInvestigation.id)
                }
              >
                <Trash2 size={17} />
                Delete Investigation
              </button>

              <button
                className="investigation-cancel-btn"
                onClick={() => setSelectedInvestigation(null)}
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

export default Investigations;