
import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Users,
  UserRound,
  Briefcase,
  Trash2,
  X,
  RefreshCw,
  ShieldAlert,
  Eye,
  Filter,
} from "lucide-react";

import api from "../services/api";
import "./Suspects.css";

function Suspects() {
  const [suspects, setSuspects] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [caseFilter, setCaseFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [selectedSuspect, setSelectedSuspect] = useState(null);

  const [formData, setFormData] = useState({
    case: "",
    name: "",
    age: "",
    occupation: "",
    status: "person_of_interest",
    description: "",
    photo: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const suspectsResponse = await api.get("/suspects/");
        const casesResponse = await api.get("/cases/");

        const suspectsData = Array.isArray(suspectsResponse.data)
          ? suspectsResponse.data
          : suspectsResponse.data.results || [];

        const casesData = Array.isArray(casesResponse.data)
          ? casesResponse.data
          : casesResponse.data.results || [];

        setSuspects(suspectsData);
        setCases(casesData);
      } catch (err) {
        console.error(err);
        setError("Unable to load suspect records.");
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

      const suspectsResponse = await api.get("/suspects/");
      const casesResponse = await api.get("/cases/");

      const suspectsData = Array.isArray(suspectsResponse.data)
        ? suspectsResponse.data
        : suspectsResponse.data.results || [];

      const casesData = Array.isArray(casesResponse.data)
        ? casesResponse.data
        : casesResponse.data.results || [];

      setSuspects(suspectsData);
      setCases(casesData);
    } catch (err) {
      console.error(err);
      setError("Unable to refresh suspect records.");
    } finally {
      setLoading(false);
    }
  };

  const getCase = (caseId) => {
    return cases.find(
      (currentCase) => String(currentCase.id) === String(caseId)
    );
  };

  const getCaseName = (caseId) => {
    const currentCase = getCase(caseId);

    if (!currentCase) {
      return "Unknown Case";
    }

    return currentCase.title || "Untitled Case";
  };

  const getCaseNumber = (caseId) => {
    const currentCase = getCase(caseId);

    if (!currentCase) {
      return "CASE-UNKNOWN";
    }

    return currentCase.case_number || `CASE-${currentCase.id}`;
  };

  const filteredSuspects = suspects.filter((suspect) => {
    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      !searchText ||
      suspect.name?.toLowerCase().includes(searchText) ||
      suspect.occupation?.toLowerCase().includes(searchText) ||
      suspect.description?.toLowerCase().includes(searchText);

    const matchesStatus =
      statusFilter === "all" || suspect.status === statusFilter;

    const matchesCase =
      caseFilter === "all" ||
      String(suspect.case) === String(caseFilter);

    return matchesSearch && matchesStatus && matchesCase;
  });

  const totalSuspects = suspects.length;

  const personOfInterestCount = suspects.filter(
    (suspect) => suspect.status === "person_of_interest"
  ).length;

  const wantedCount = suspects.filter(
    (suspect) => suspect.status === "wanted"
  ).length;

  const clearedCount = suspects.filter(
    (suspect) => suspect.status === "cleared"
  ).length;

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      case: "",
      name: "",
      age: "",
      occupation: "",
      status: "person_of_interest",
      description: "",
      photo: "",
    });
  };

  const openModal = () => {
    resetForm();
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (!saving) {
      setShowModal(false);
      resetForm();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.case) {
      setError("Please select a case.");
      return;
    }

    if (!formData.name.trim()) {
      setError("Please enter the suspect name.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        case: Number(formData.case),
        name: formData.name.trim(),
        age: formData.age ? Number(formData.age) : null,
        occupation: formData.occupation.trim(),
        status: formData.status,
        description: formData.description.trim(),
        photo: formData.photo.trim(),
      };

      await api.post("/suspects/", payload);

      setShowModal(false);
      resetForm();

      await refreshData();
    } catch (err) {
      console.error("Create suspect error:", err);

      const data = err.response?.data;

      if (data?.detail) {
        setError(data.detail);
      } else if (data) {
        const messages = Object.entries(data)
          .map(([field, value]) => {
            const message = Array.isArray(value)
              ? value.join(", ")
              : String(value);

            return `${field}: ${message}`;
          })
          .join(" | ");

        setError(messages || "Unable to create suspect.");
      } else {
        setError("Unable to create suspect.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this suspect?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(`/suspects/${id}/`);

      setSuspects((previous) =>
        previous.filter((suspect) => suspect.id !== id)
      );

      if (selectedSuspect?.id === id) {
        setSelectedSuspect(null);
      }
    } catch (err) {
      console.error(err);
      setError("Unable to delete suspect.");
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      person_of_interest: "Person of Interest",
      suspect: "Suspect",
      wanted: "Wanted",
      cleared: "Cleared",
      detained: "Detained",
      released: "Released",
    };

    return labels[status] || status || "Unknown";
  };

  const getStatusClass = (status) => {
    const classes = {
      person_of_interest: "status-interest",
      suspect: "status-suspect",
      wanted: "status-wanted",
      cleared: "status-cleared",
      detained: "status-detained",
      released: "status-released",
    };

    return classes[status] || "status-default";
  };

  const formatDate = (date) => {
    if (!date) {
      return "Unknown";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Unknown";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="suspects-page">
      <div className="suspects-background">
        <div className="scan-line"></div>
        <div className="grid-overlay"></div>
      </div>

      <div className="suspects-content">
        <div className="page-header">
          <div>
            <div className="eyebrow">
              <ShieldAlert size={15} />
              <span>INVESTIGATION DATABASE</span>
            </div>

            <h1>Suspect Management</h1>

            <p>
              Track individuals connected to active investigations and monitor
              their current status.
            </p>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={refreshData}
              disabled={loading}
            >
              <RefreshCw size={17} />
              Refresh
            </button>

            <button
              type="button"
              className="primary-button"
              onClick={openModal}
            >
              <Plus size={18} />
              Add Suspect
            </button>
          </div>
        </div>

        {error && (
          <div className="suspect-error">
            <ShieldAlert size={18} />
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="error-close"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="suspect-stats">
          <div className="suspect-stat-card">
            <div className="stat-icon">
              <Users size={22} />
            </div>

            <div>
              <span>Total Suspects</span>
              <strong>{totalSuspects}</strong>
            </div>
          </div>

          <div className="suspect-stat-card">
            <div className="stat-icon">
              <UserRound size={22} />
            </div>

            <div>
              <span>Persons of Interest</span>
              <strong>{personOfInterestCount}</strong>
            </div>
          </div>

          <div className="suspect-stat-card">
            <div className="stat-icon">
              <ShieldAlert size={22} />
            </div>

            <div>
              <span>Wanted</span>
              <strong>{wantedCount}</strong>
            </div>
          </div>

          <div className="suspect-stat-card">
            <div className="stat-icon">
              <Eye size={22} />
            </div>

            <div>
              <span>Cleared</span>
              <strong>{clearedCount}</strong>
            </div>
          </div>
        </div>

        <div className="suspect-toolbar">
          <div className="search-box">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search suspects..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="suspect-filter">
            <Filter size={17} />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="person_of_interest">
                Person of Interest
              </option>
              <option value="suspect">Suspect</option>
              <option value="wanted">Wanted</option>
              <option value="cleared">Cleared</option>
              <option value="detained">Detained</option>
              <option value="released">Released</option>
            </select>
          </div>

          <div className="suspect-filter">
            <Briefcase size={17} />

            <select
              value={caseFilter}
              onChange={(event) => setCaseFilter(event.target.value)}
            >
              <option value="all">All Cases</option>

              {cases.map((currentCase) => (
                <option key={currentCase.id} value={currentCase.id}>
                  {currentCase.case_number || `CASE-${currentCase.id}`} -{" "}
                  {currentCase.title || "Untitled Case"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="suspects-loading">
            <div className="loading-spinner"></div>
            <p>Loading suspect database...</p>
          </div>
        ) : filteredSuspects.length === 0 ? (
          <div className="suspects-empty">
            <div className="empty-icon">
              <Users size={34} />
            </div>

            <h2>No suspects found</h2>

            <p>
              {suspects.length === 0
                ? "No suspect records have been added yet."
                : "Try changing your search or filter settings."}
            </p>

            {suspects.length === 0 && (
              <button
                type="button"
                className="primary-button"
                onClick={openModal}
              >
                <Plus size={18} />
                Add First Suspect
              </button>
            )}
          </div>
        ) : (
          <div className="suspects-grid">
            {filteredSuspects.map((suspect) => (
              <article className="suspect-card" key={suspect.id}>
                <div className="suspect-card-top">
                  <div className="suspect-avatar">
                    {suspect.photo ? (
                      <img
                        src={suspect.photo}
                        alt={suspect.name || "Suspect"}
                      />
                    ) : (
                      <UserRound size={30} />
                    )}
                  </div>

                  <span
                    className={`status-badge ${getStatusClass(
                      suspect.status
                    )}`}
                  >
                    {getStatusLabel(suspect.status)}
                  </span>
                </div>

                <div className="suspect-card-body">
                  <span className="suspect-id">
                    SUSPECT-{String(suspect.id).padStart(4, "0")}
                  </span>

                  <h2>{suspect.name || "Unnamed Suspect"}</h2>

                  <div className="suspect-case">
                    <Briefcase size={15} />

                    <div>
                      <strong>{getCaseNumber(suspect.case)}</strong>
                      <span>{getCaseName(suspect.case)}</span>
                    </div>
                  </div>

                  <div className="suspect-details">
                    <div>
                      <span>Age</span>

                      <strong>
                        {suspect.age !== null &&
                        suspect.age !== undefined
                          ? suspect.age
                          : "N/A"}
                      </strong>
                    </div>

                    <div>
                      <span>Occupation</span>

                      <strong>
                        {suspect.occupation || "Not specified"}
                      </strong>
                    </div>
                  </div>

                  <p className="suspect-description">
                    {suspect.description
                      ? suspect.description.length > 130
                        ? `${suspect.description.slice(0, 130)}...`
                        : suspect.description
                      : "No description available."}
                  </p>

                  <div className="suspect-card-footer">
                    <span>
                      Added {formatDate(suspect.created_at)}
                    </span>

                    <div className="card-actions">
                      <button
                        type="button"
                        className="icon-button"
                        title="View suspect"
                        onClick={() => setSelectedSuspect(suspect)}
                      >
                        <Eye size={17} />
                      </button>

                      <button
                        type="button"
                        className="icon-button delete-button"
                        title="Delete suspect"
                        onClick={() => handleDelete(suspect.id)}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="suspect-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="eyebrow">
                  <ShieldAlert size={14} />
                  NEW RECORD
                </span>

                <h2>Add Suspect</h2>

                <p>Create a new suspect profile.</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="case">Related Case</label>

                  <select
                    id="case"
                    name="case"
                    value={formData.case}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a case</option>

                    {cases.map((currentCase) => (
                      <option key={currentCase.id} value={currentCase.id}>
                        {currentCase.case_number ||
                          `CASE-${currentCase.id}`}{" "}
                        - {currentCase.title || "Untitled Case"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="name">Full Name</label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter suspect name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="age">Age</label>

                  <input
                    id="age"
                    name="age"
                    type="number"
                    min="0"
                    max="150"
                    placeholder="Age"
                    value={formData.age}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="occupation">Occupation</label>

                  <input
                    id="occupation"
                    name="occupation"
                    type="text"
                    placeholder="Occupation"
                    value={formData.occupation}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status</label>

                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="person_of_interest">
                      Person of Interest
                    </option>
                    <option value="suspect">Suspect</option>
                    <option value="wanted">Wanted</option>
                    <option value="cleared">Cleared</option>
                    <option value="detained">Detained</option>
                    <option value="released">Released</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="photo">Photo URL</label>

                  <input
                    id="photo"
                    name="photo"
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    value={formData.photo}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="description">Description</label>

                  <textarea
                    id="description"
                    name="description"
                    rows="5"
                    placeholder="Enter information about this suspect..."
                    value={formData.description}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <RefreshCw size={17} className="spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />
                      Create Suspect
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedSuspect && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedSuspect(null)}
        >
          <div
            className="suspect-detail-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="eyebrow">
                  <Eye size={14} />
                  SUSPECT PROFILE
                </span>

                <h2>{selectedSuspect.name || "Unnamed Suspect"}</h2>

                <p>
                  {getCaseNumber(selectedSuspect.case)} ·{" "}
                  {getCaseName(selectedSuspect.case)}
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => setSelectedSuspect(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="profile-content">
              <div className="profile-image">
                {selectedSuspect.photo ? (
                  <img
                    src={selectedSuspect.photo}
                    alt={selectedSuspect.name || "Suspect"}
                  />
                ) : (
                  <UserRound size={48} />
                )}
              </div>

              <div className="profile-main">
                <span
                  className={`status-badge ${getStatusClass(
                    selectedSuspect.status
                  )}`}
                >
                  {getStatusLabel(selectedSuspect.status)}
                </span>

                <div className="profile-info-grid">
                  <div>
                    <span>Age</span>

                    <strong>
                      {selectedSuspect.age !== null &&
                      selectedSuspect.age !== undefined
                        ? selectedSuspect.age
                        : "N/A"}
                    </strong>
                  </div>

                  <div>
                    <span>Occupation</span>

                    <strong>
                      {selectedSuspect.occupation || "Not specified"}
                    </strong>
                  </div>

                  <div>
                    <span>Case</span>

                    <strong>
                      {getCaseNumber(selectedSuspect.case)}
                    </strong>
                  </div>

                  <div>
                    <span>Added</span>

                    <strong>
                      {formatDate(selectedSuspect.created_at)}
                    </strong>
                  </div>
                </div>

                <div className="profile-description">
                  <span>Description</span>

                  <p>
                    {selectedSuspect.description ||
                      "No description available."}
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="danger-button"
                onClick={() => {
                  const id = selectedSuspect.id;
                  setSelectedSuspect(null);
                  handleDelete(id);
                }}
              >
                <Trash2 size={17} />
                Delete Record
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={() => setSelectedSuspect(null)}
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

export default Suspects;

