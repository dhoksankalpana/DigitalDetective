import { useEffect, useState } from "react";
import {
  CheckCircle2,
  FileText,
  History,
  Image,
  Video,
  Music,
  HardDrive,
  Package,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  X,
  RefreshCw,
  Fingerprint,
} from "lucide-react";
import api from "../services/api";
import "./Evidence.css";

function Evidence() {
  const [evidence, setEvidence] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);
  const [checkingIntegrityId, setCheckingIntegrityId] = useState(null);

  const [integrityResults, setIntegrityResults] = useState({});
  const [actionMessage, setActionMessage] = useState("");

  const [custodyEvidence, setCustodyEvidence] = useState(null);
  const [custodyLoading, setCustodyLoading] = useState(false);

  const [formData, setFormData] = useState({
    case: "",
    title: "",
    description: "",
    evidence_type: "document",
    file: null,
    verified: false,
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError("");

        const [evidenceResponse, casesResponse] = await Promise.all([
          api.get("/evidence/"),
          api.get("/cases/"),
        ]);

        const evidenceData = Array.isArray(evidenceResponse.data)
          ? evidenceResponse.data
          : evidenceResponse.data?.results || [];

        const casesData = Array.isArray(casesResponse.data)
          ? casesResponse.data
          : casesResponse.data?.results || [];

        setEvidence(evidenceData);
        setCases(casesData);
      } catch (err) {
        console.error("Evidence loading error:", err);

        if (err.response?.status === 401) {
          setError("Your session has expired. Please log in again.");
        } else {
          setError("Unable to load evidence records.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const getCaseTitle = (caseId) => {
    const selectedCase = cases.find(
      (item) => String(item.id) === String(caseId)
    );

    return selectedCase?.title || `Case #${caseId}`;
  };

  const getEvidenceIcon = (type) => {
    switch (type) {
      case "document":
        return <FileText size={22} />;

      case "image":
        return <Image size={22} />;

      case "video":
        return <Video size={22} />;

      case "audio":
        return <Music size={22} />;

      case "digital":
        return <HardDrive size={22} />;

      case "physical":
        return <Package size={22} />;

      default:
        return <MoreHorizontal size={22} />;
    }
  };

  const filteredEvidence = evidence.filter((item) => {
    const searchValue = search.toLowerCase().trim();

    const matchesSearch =
      item.title?.toLowerCase().includes(searchValue) ||
      item.description?.toLowerCase().includes(searchValue) ||
      getCaseTitle(item.case).toLowerCase().includes(searchValue);

    const matchesType =
      typeFilter === "all" || item.evidence_type === typeFilter;

    return matchesSearch && matchesType;
  });

  const totalEvidence = evidence.length;

  const verifiedEvidence = evidence.filter(
    (item) => item.verified
  ).length;

  const pendingEvidence = totalEvidence - verifiedEvidence;

  const activeCases = cases.filter(
    (item) =>
      item.status !== "closed" &&
      item.status !== "resolved" &&
      item.status !== "completed"
  ).length;

  const handleInputChange = (event) => {
    const { name, value, type, checked, files } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : type === "file"
            ? files?.[0] || null
            : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.case || !formData.title || !formData.evidence_type) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setActionMessage("");

      const data = new FormData();

      data.append("case", formData.case);
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("evidence_type", formData.evidence_type);
      data.append("verified", String(formData.verified));

      if (formData.file) {
        data.append("file", formData.file);
      }

      const response = await api.post("/evidence/", data);

      setEvidence((previous) => [response.data, ...previous]);

      setFormData({
        case: "",
        title: "",
        description: "",
        evidence_type: "document",
        file: null,
        verified: false,
      });

      setShowModal(false);
      setActionMessage("Evidence added successfully.");
    } catch (err) {
      console.error("Evidence creation error:", err);
      console.log("STATUS:", err.response?.status);
      console.log("BACKEND RESPONSE:", err.response?.data);

      const responseData = err.response?.data;

      if (responseData && typeof responseData === "object") {
        const messages = Object.entries(responseData).flatMap(
          ([field, values]) => {
            const list = Array.isArray(values) ? values : [values];

            return list.map((message) => `${field}: ${message}`);
          }
        );

        setError(
          messages.join(" ") || "Unable to create evidence."
        );
      } else {
        setError("Unable to create evidence.");
      }
    } finally {
      setSaving(false);
    }
  };

    
  
       const handleVerification = async (id, verified) => {
  try {
    setVerifyingId(id);
    setError("");
    setActionMessage("");

    const endpoint = verified
      ? `/evidence/${id}/unverify/`
      : `/evidence/${id}/verify/`;

    const response = await api.patch(endpoint);

    setEvidence((previous) =>
      previous.map((item) =>
        item.id === id ? response.data : item
      )
    );

    setActionMessage(
      verified
        ? "Evidence marked as unverified."
        : "Evidence verified successfully."
    );
  } catch (err) {
    console.error("Evidence verification error:", err);

    const responseData = err.response?.data;

    if (responseData && typeof responseData === "object") {
      const messages = Object.values(responseData)
        .flat()
        .map((message) => String(message));

      setError(
        messages.join(" ") ||
          "Unable to update evidence verification status."
      );
    } else {
      setError(
        "Unable to update evidence verification status."
      );
    }
  } finally {
    setVerifyingId(null);
  }
};

     
     

  const handleIntegrityCheck = async (id) => {
    try {
      setCheckingIntegrityId(id);
      setError("");
      setActionMessage("");

      const response = await api.get(
        `/evidence/${id}/verify_integrity/`
      );

      setIntegrityResults((previous) => ({
        ...previous,
        [id]: response.data,
      }));

      if (response.data.integrity_status === "verified") {
        setActionMessage("File integrity verified successfully.");
      } else if (response.data.integrity_status === "tampered") {
        setError(
          "Warning: This evidence file may have been modified."
        );
      } else if (
        response.data.integrity_status === "hash_created"
      ) {
        setActionMessage(
          "File hash generated and stored successfully."
        );
      } else {
        setError(
          response.data.message ||
            "Unable to verify file integrity."
        );
      }
    } catch (err) {
      console.error("Evidence integrity error:", err);

      const responseData = err.response?.data;

      if (responseData?.message) {
        setError(responseData.message);
      } else {
        setError("Unable to check file integrity.");
      }
    } finally {
      setCheckingIntegrityId(null);
    }
  };

  const handleChainOfCustody = async (id) => {
    try {
      setCustodyLoading(true);
      setError("");
      setActionMessage("");
      setCustodyEvidence(null);

      const response = await api.get(
        `/evidence/${id}/chain_of_custody/`
      );

      setCustodyEvidence(response.data);
    } catch (err) {
      console.error("Chain of custody error:", err);

      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Unable to load chain of custody.");
      }
    } finally {
      setCustodyLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this evidence?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");
      setActionMessage("");

      await api.delete(`/evidence/${id}/`);

      setEvidence((previous) =>
        previous.filter((item) => item.id !== id)
      );

      setIntegrityResults((previous) => {
        const updatedResults = { ...previous };
        delete updatedResults[id];
        return updatedResults;
      });

      setActionMessage("Evidence deleted successfully.");
    } catch (err) {
      console.error("Evidence deletion error:", err);
      setError("Unable to delete evidence.");
    } finally {
      setDeletingId(null);
    }
  };

  const resetModal = () => {
    setShowModal(false);

    setFormData({
      case: "",
      title: "",
      description: "",
      evidence_type: "document",
      file: null,
      verified: false,
    });

    setError("");
  };

  if (loading) {
    return (
      <div className="evidence-page">
        <div className="evidence-loading">
          <RefreshCw className="spin" size={32} />
          <p>Loading evidence records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="evidence-page">
      <div className="evidence-header">
        <div>
          <div className="eyebrow">
            <ShieldCheck size={16} />
            DIGITAL FORENSICS
          </div>

          <h1>Evidence Vault</h1>

          <p>
            Collect, verify and manage investigation evidence from one
            secure workspace.
          </p>
        </div>

        <button
          className="primary-btn"
          onClick={() => {
            setError("");
            setActionMessage("");
            setShowModal(true);
          }}
        >
          <Plus size={18} />
          Add Evidence
        </button>
      </div>

      {error && (
        <div className="evidence-alert error-alert">
          <ShieldAlert size={18} />

          <span>{error}</span>

          <button onClick={() => setError("")}>
            <X size={17} />
          </button>
        </div>
      )}

      {actionMessage && (
        <div className="evidence-alert success-alert">
          <CheckCircle2 size={18} />

          <span>{actionMessage}</span>

          <button onClick={() => setActionMessage("")}>
            <X size={17} />
          </button>
        </div>
      )}

      <div className="evidence-stats">
        <div className="evidence-stat-card">
          <div className="stat-icon">
            <Package size={20} />
          </div>

          <div>
            <span>Total Evidence</span>
            <strong>{totalEvidence}</strong>
          </div>
        </div>

        <div className="evidence-stat-card">
          <div className="stat-icon verified-icon">
            <ShieldCheck size={20} />
          </div>

          <div>
            <span>Verified</span>
            <strong>{verifiedEvidence}</strong>
          </div>
        </div>

        <div className="evidence-stat-card">
          <div className="stat-icon pending-icon">
            <ShieldAlert size={20} />
          </div>

          <div>
            <span>Pending Verification</span>
            <strong>{pendingEvidence}</strong>
          </div>
        </div>

        <div className="evidence-stat-card">
          <div className="stat-icon">
            <HardDrive size={20} />
          </div>

          <div>
            <span>Active Cases</span>
            <strong>{activeCases}</strong>
          </div>
        </div>
      </div>

      <div className="evidence-toolbar">
        <div className="search-box">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search evidence, descriptions or cases..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value)}
        >
          <option value="all">All Types</option>
          <option value="document">Document</option>
          <option value="image">Image</option>
          <option value="video">Video</option>
          <option value="audio">Audio</option>
          <option value="physical">Physical</option>
          <option value="digital">Digital</option>
          <option value="other">Other</option>
        </select>
      </div>

      {filteredEvidence.length === 0 ? (
        <div className="evidence-empty">
          <Package size={46} />

          <h2>No evidence found</h2>

          <p>
            {evidence.length === 0
              ? "No evidence records have been added yet."
              : "Try changing your search or filter."}
          </p>

          {evidence.length === 0 && (
            <button
              className="primary-btn"
              onClick={() => {
                setError("");
                setActionMessage("");
                setShowModal(true);
              }}
            >
              <Plus size={18} />
              Add First Evidence
            </button>
          )}
        </div>
      ) : (
        <div className="evidence-grid">
          {filteredEvidence.map((item) => {
            const integrity = integrityResults[item.id];

            return (
              <div className="evidence-card" key={item.id}>
                <div className="evidence-card-top">
                  <div className="evidence-type-icon">
                    {getEvidenceIcon(item.evidence_type)}
                  </div>

                  <div className="evidence-card-actions">
                    <button
                      className={
                        item.verified
                          ? "verify-btn verified"
                          : "verify-btn"
                      }
                      disabled={verifyingId === item.id}
                      onClick={() =>
                        handleVerification(item.id, item.verified)
                      }
                      title={
                        item.verified
                          ? "Mark as unverified"
                          : "Verify evidence"
                      }
                    >
                      {verifyingId === item.id ? (
                        <RefreshCw className="spin" size={16} />
                      ) : item.verified ? (
                        <ShieldCheck size={16} />
                      ) : (
                        <ShieldAlert size={16} />
                      )}

                      {item.verified ? "Verified" : "Verify"}
                    </button>

                    <button
                      className="delete-btn"
                      disabled={deletingId === item.id}
                      onClick={() => handleDelete(item.id)}
                      title="Delete evidence"
                    >
                      {deletingId === item.id ? (
                        <RefreshCw className="spin" size={17} />
                      ) : (
                        <Trash2 size={17} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="evidence-card-body">
                  <span className="evidence-type-label">
                    {item.evidence_type}
                  </span>

                  <h3>{item.title}</h3>

                  <p>
                    {item.description ||
                      "No description provided."}
                  </p>

                  <div className="evidence-case">
                    <span>CASE</span>
                    <strong>
                      {getCaseTitle(item.case)}
                    </strong>
                  </div>

                  {item.file_hash && (
                    <div className="evidence-hash">
                      <div className="hash-heading">
                        <Fingerprint size={16} />
                        <span>SHA-256 HASH</span>
                      </div>

                      <code title={item.file_hash}>
                        {item.file_hash}
                      </code>
                    </div>
                  )}

                  {item.file && (
                    <button
                      className="integrity-btn"
                      disabled={
                        checkingIntegrityId === item.id
                      }
                      onClick={() =>
                        handleIntegrityCheck(item.id)
                      }
                    >
                      {checkingIntegrityId === item.id ? (
                        <RefreshCw
                          className="spin"
                          size={16}
                        />
                      ) : (
                        <Fingerprint size={16} />
                      )}

                      {checkingIntegrityId === item.id
                        ? "Checking..."
                        : "Verify File Integrity"}
                    </button>
                  )}

                  {integrity && (
                    <div
                      className={`integrity-result ${
                        integrity.integrity_status === "verified"
                          ? "integrity-success"
                          : integrity.integrity_status ===
                              "tampered"
                            ? "integrity-danger"
                            : "integrity-warning"
                      }`}
                    >
                      {integrity.integrity_status ===
                      "verified" ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        <ShieldAlert size={16} />
                      )}

                      <span>{integrity.message}</span>
                    </div>
                  )}
                </div>

                <div className="evidence-card-footer">
                  <div>
                    <span>Collected by</span>

                    <strong>
                      {item.collected_by_username ||
                        "Unknown"}
                    </strong>
                  </div>

                  <div>
                    <span>Added</span>

                    <strong>
                      {item.created_at
                        ? new Date(
                            item.created_at
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </strong>
                  </div>
                </div>

                {item.file && (
                  <a
                    className="evidence-file-link"
                    href={item.file}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FileText size={16} />
                    Open Evidence File
                  </a>
                )}

                <button
                  className="custody-btn"
                  onClick={() =>
                    handleChainOfCustody(item.id)
                  }
                  disabled={custodyLoading}
                >
                  {custodyLoading ? (
                    <RefreshCw
                      className="spin"
                      size={16}
                    />
                  ) : (
                    <History size={16} />
                  )}

                  View Chain of Custody
                </button>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="evidence-modal">
            <div className="modal-header">
              <div>
                <div className="eyebrow">
                  <ShieldCheck size={15} />
                  NEW RECORD
                </div>

                <h2>Add Evidence</h2>
              </div>

              <button
                className="modal-close"
                onClick={resetModal}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Related Case *</label>

                <select
                  name="case"
                  value={formData.case}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a case</option>

                  {cases.map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.case_number} — {item.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Evidence Title *</label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter evidence title"
                  required
                />
              </div>

              <div className="form-group">
                <label>Evidence Type *</label>

                <select
                  name="evidence_type"
                  value={formData.evidence_type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="document">
                    Document
                  </option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                  <option value="physical">
                    Physical
                  </option>
                  <option value="digital">Digital</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the evidence..."
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>Evidence File</label>

                <input
                  type="file"
                  name="file"
                  onChange={handleInputChange}
                />
              </div>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  name="verified"
                  checked={formData.verified}
                  onChange={handleInputChange}
                />

                <span>
                  Mark this evidence as verified
                </span>
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={resetModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <RefreshCw
                        className="spin"
                        size={17}
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />
                      Add Evidence
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {custodyLoading && !custodyEvidence && (
        <div className="modal-overlay">
          <div className="custody-modal">
            <div className="custody-loading">
              <RefreshCw
                className="spin"
                size={32}
              />
              <p>Loading evidence history...</p>
            </div>
          </div>
        </div>
      )}

      {custodyEvidence && (
        <div
          className="modal-overlay"
          onClick={() => setCustodyEvidence(null)}
        >
          <div
            className="custody-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <div className="eyebrow">
                  <History size={15} />
                  EVIDENCE HISTORY
                </div>

                <h2>Chain of Custody</h2>

                <p>
                  {custodyEvidence.evidence_title}
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setCustodyEvidence(null)
                }
              >
                <X size={20} />
              </button>
            </div>

            {custodyEvidence.activities?.length > 0 ? (
              <div className="custody-timeline">
                {custodyEvidence.activities.map(
                  (activity, index) => (
                    <div
                      className="custody-item"
                      key={activity.id}
                    >
                      <div className="custody-line">
                        <div className="custody-dot">
                          <History size={15} />
                        </div>

                        {index !==
                          custodyEvidence.activities.length -
                            1 && (
                          <div className="custody-connector" />
                        )}
                      </div>

                      <div className="custody-content">
                        <div className="custody-top">
                          <span className="custody-action">
                            {activity.action_label}
                          </span>

                          <span className="custody-date">
                            {new Date(
                              activity.created_at
                            ).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <p>
                          {activity.description}
                        </p>

                        <div className="custody-user">
                          <ShieldCheck size={14} />
                          Performed by{" "}
                          {activity.user || "Unknown"}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="custody-empty">
                <History size={40} />

                <h3>
                  No custody activity yet
                </h3>

                <p>
                  No recorded activity is available
                  for this evidence.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Evidence;