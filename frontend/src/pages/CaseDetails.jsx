import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  FileText,
  Clock,
  Edit3,
  FileSearch,
  MapPin,
  RefreshCw,
  ShieldAlert,
  Trash2,
  User,
  Users,
  XCircle,
  Target,
  ListChecks,
  Activity,
} from "lucide-react";

import api from "../services/api";
import "./CaseDetails.css";

function CaseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [suspects, setSuspects] = useState([]);
  const [investigations, setInvestigations] = useState([]);
  const [clues, setClues] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [notes, setNotes] = useState([]);
  const [progressData, setProgressData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(true);
  const [error, setError] = useState("");
  const [progressError, setProgressError] = useState("");

  const filterByCase = useCallback(
    (items) => {
      if (!Array.isArray(items)) {
        return [];
      }

      return items.filter(
        (item) => String(item.case) === String(id)
      );
    },
    [id]
  );

  const fetchProgress = useCallback(async () => {
    if (!id) {
      return;
    }

    try {
      setProgressLoading(true);
      setProgressError("");

      const response = await api.get(
        `/cases/${id}/progress/`
      );

      setProgressData(response.data);
    } catch (err) {
      console.error("Case progress error:", err);

      if (err.response?.status === 404) {
        setProgressError(
          "Progress information not found."
        );
      } else if (err.response?.status === 401) {
        setProgressError(
          "Your session has expired. Please log in again."
        );
      } else {
        setProgressError(
          "Unable to load case progress."
        );
      }

      setProgressData(null);
    } finally {
      setProgressLoading(false);
    }
  }, [id]);

  const fetchCase = useCallback(async () => {
    if (!id) {
      setError("Invalid case ID.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [
        caseResponse,
        evidenceResponse,
        suspectsResponse,
        investigationsResponse,
        cluesResponse,
        timelineResponse,
        notesResponse,
      ] = await Promise.all([
        api.get(`/cases/${id}/`),
        api.get("/evidence/"),
        api.get("/suspects/"),
        api.get("/investigations/"),
        api.get("/clues/"),
        api.get("/timeline/"),
        api.get("/notes/"),
      ]);

      setCaseData(caseResponse.data);

      setEvidence(
        filterByCase(evidenceResponse.data)
      );

      setSuspects(
        filterByCase(suspectsResponse.data)
      );

      setInvestigations(
        filterByCase(investigationsResponse.data)
      );

      setClues(
        filterByCase(cluesResponse.data)
      );

      setTimeline(
        filterByCase(timelineResponse.data)
      );

      setNotes(
        filterByCase(notesResponse.data)
      );
    } catch (err) {
      console.error("Case details error:", err);

      if (err.response?.status === 404) {
        setError("Case file not found.");
      } else if (err.response?.status === 401) {
        setError(
          "Your session has expired. Please log in again."
        );
      } else {
        setError(
          "Unable to load this case file."
        );
      }

      setCaseData(null);
    } finally {
      setLoading(false);
    }
  }, [id, filterByCase]);

  const loadData = useCallback(async () => {
    await Promise.all([
      fetchCase(),
      fetchProgress(),
    ]);
  }, [fetchCase, fetchProgress]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [loadData]);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this case?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(`/cases/${id}/`);

      navigate("/cases");
    } catch (err) {
      console.error("Delete case error:", err);

      if (err.response?.status === 401) {
        setError(
          "Your session has expired. Please log in again."
        );
      } else if (err.response?.status === 404) {
        setError(
          "Case file was not found."
        );
      } else {
        setError(
          "Unable to delete this case."
        );
      }
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  };

  const formatDateTime = (date) => {
    if (!date) {
      return "Not available";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const getStatusClass = (status) => {
    const value = String(
      status || ""
    ).toLowerCase();

    if (
      value === "open" ||
      value === "active" ||
      value === "in_progress" ||
      value === "in-progress"
    ) {
      return "case-status status-open";
    }

    if (
      value === "closed" ||
      value === "resolved" ||
      value === "completed"
    ) {
      return "case-status status-closed";
    }

    return "case-status status-pending";
  };

  const getProgressClass = (progress) => {
    if (progress >= 80) {
      return "progress-high";
    }

    if (progress >= 50) {
      return "progress-medium";
    }

    return "progress-low";
  };

  if (loading) {
    return (
      <div className="case-details-page">
        <div className="case-details-background">
          <div className="case-details-grid"></div>
        </div>

        <div className="case-details-loading">
          <div className="loader"></div>

          <p>
            Decrypting case file...
          </p>
        </div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="case-details-page">
        <div className="case-details-background">
          <div className="case-details-grid"></div>
        </div>

        <div className="case-details-container">
          <button
            className="btn btn-secondary back-button"
            onClick={() => navigate("/cases")}
            type="button"
          >
            <ArrowLeft size={17} />
            Back to Cases
          </button>

          <div className="case-details-error">
            <ShieldAlert size={42} />

            <h1>
              Case File Unavailable
            </h1>

            <p>
              {error ||
                "This case could not be found."}
            </p>

            <button
              className="btn btn-primary"
              onClick={loadData}
              type="button"
            >
              <RefreshCw size={17} />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="case-details-page">
      <div className="case-details-background">
        <div className="case-details-grid"></div>

        <div className="case-details-glow case-details-glow-one"></div>

        <div className="case-details-glow case-details-glow-two"></div>
      </div>

      <div className="case-details-container">
        <div className="case-details-topbar">
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/cases")}
            type="button"
          >
            <ArrowLeft size={17} />
            Back to Cases
          </button>

          <div className="case-details-actions">
            <button
              className="btn btn-secondary"
              onClick={loadData}
              type="button"
            >
              <RefreshCw size={17} />
              Refresh
            </button>

            <button
              className="btn btn-secondary"
              type="button"
            >
              <Edit3 size={17} />
              Edit
            </button>

            <button
              className="case-report-button"
              onClick={() =>
                navigate(`/cases/${id}/report`)
              }
              type="button"
            >
              <FileText size={17} />
              Generate Report
            </button>

            <button
              className="btn btn-danger"
              onClick={handleDelete}
              type="button"
            >
              <Trash2 size={17} />
              Delete
            </button>
          </div>
        </div>

        <header className="case-hero">
          <div className="case-hero-icon">
            <Briefcase size={30} />
          </div>

          <div className="case-hero-content">
            <div className="case-hero-label">
              <span>
                CLASSIFIED INVESTIGATION
              </span>

              <span className="case-hero-line"></span>

              <span>
                {caseData.case_number}
              </span>
            </div>

            <h1>
              {caseData.title}
            </h1>

            <p>
              {caseData.description ||
                "No case description available."}
            </p>

            <div className="case-hero-meta">
              <span>
                <MapPin size={15} />

                {caseData.location ||
                  "Location unavailable"}
              </span>

              <span>
                <CalendarDays size={15} />

                Created{" "}
                {formatDate(
                  caseData.created_at
                )}
              </span>

              <span
                className={getStatusClass(
                  caseData.status
                )}
              >
                {caseData.status ||
                  "Pending"}
              </span>
            </div>
          </div>
        </header>

        <section className="case-summary-grid">
          <div className="summary-card">
            <div className="summary-icon">
              <FileSearch size={21} />
            </div>

            <div>
              <span>
                EVIDENCE
              </span>

              <strong>
                {evidence.length}
              </strong>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">
              <Users size={21} />
            </div>

            <div>
              <span>
                SUSPECTS
              </span>

              <strong>
                {suspects.length}
              </strong>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">
              <ShieldAlert size={21} />
            </div>

            <div>
              <span>
                CLUES
              </span>

              <strong>
                {clues.length}
              </strong>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">
              <Clock size={21} />
            </div>

            <div>
              <span>
                TIMELINE
              </span>

              <strong>
                {timeline.length}
              </strong>
            </div>
          </div>
        </section>

        <section className="case-progress-section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">
                INVESTIGATION STATUS
              </span>

              <h2>
                Case Progress Tracker
              </h2>
            </div>

            <Activity size={24} />
          </div>

          {progressLoading ? (
            <div className="case-progress-loading">
              <div className="loader"></div>

              <p>
                Calculating investigation progress...
              </p>
            </div>
          ) : progressError ? (
            <div className="case-progress-error">
              <ShieldAlert size={28} />

              <div>
                <strong>
                  Progress unavailable
                </strong>

                <p>
                  {progressError}
                </p>
              </div>

              <button
                className="btn btn-secondary"
                onClick={fetchProgress}
                type="button"
              >
                <RefreshCw size={16} />
                Retry
              </button>
            </div>
          ) : progressData ? (
            <div className="case-progress-card">
              <div className="case-progress-overview">
                <div className="progress-score">
                  <div
                    className={`progress-circle ${getProgressClass(
                      progressData.progress
                    )}`}
                  >
                    <strong>
                      {progressData.progress}%
                    </strong>

                    <span>
                      COMPLETE
                    </span>
                  </div>
                </div>

                <div className="progress-overview-content">
                  <div className="progress-overview-top">
                    <div>
                      <span className="progress-label">
                        INVESTIGATION COMPLETION
                      </span>

                      <h3>
                        {progressData.completed_stages} of{" "}
                        {progressData.total_stages} stages completed
                      </h3>
                    </div>

                    <span className="progress-percent">
                      {progressData.progress}%
                    </span>
                  </div>

                  <div className="progress-track">
                    <div
                      className={`progress-fill ${getProgressClass(
                        progressData.progress
                      )}`}
                      style={{
                        width: `${Math.min(
                          Math.max(
                            Number(
                              progressData.progress
                            ) || 0,
                            0
                          ),
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>

                  <div className="progress-stats">
                    <span>
                      <FileSearch size={15} />
                      {progressData.evidence_count} evidence
                    </span>

                    <span>
                      <Users size={15} />
                      {progressData.suspects_count} suspects
                    </span>

                    <span>
                      <ShieldAlert size={15} />
                      {progressData.resolved_clues_count}/
                      {progressData.clues_count} clues resolved
                    </span>

                    <span>
                      <ListChecks size={15} />
                      {progressData.completed_tasks_count}/
                      {progressData.total_tasks_count} tasks complete
                    </span>
                  </div>
                </div>
              </div>

              <div className="progress-stage-list">
                {Array.isArray(
                  progressData.stages
                ) &&
                  progressData.stages.map(
                    (stage, index) => (
                      <div
                        className={`progress-stage ${
                          stage.completed
                            ? "stage-completed"
                            : "stage-pending"
                        }`}
                        key={stage.id}
                      >
                        <div className="stage-number">
                          {stage.completed ? (
                            <CheckCircle2 size={20} />
                          ) : (
                            <span>
                              {index + 1}
                            </span>
                          )}
                        </div>

                        <div className="stage-line-content">
                          <div className="stage-title-row">
                            <strong>
                              {stage.name}
                            </strong>

                            <span
                              className={
                                stage.completed
                                  ? "stage-status stage-status-completed"
                                  : "stage-status stage-status-pending"
                              }
                            >
                              {stage.completed
                                ? "COMPLETED"
                                : "PENDING"}
                            </span>
                          </div>

                          <p>
                            {stage.description}
                          </p>
                        </div>
                      </div>
                    )
                  )}
              </div>
            </div>
          ) : (
            <div className="case-progress-empty">
              <Target size={35} />

              <h3>
                No Progress Data
              </h3>

              <p>
                Progress information is not available for this case.
              </p>
            </div>
          )}
        </section>

        <section className="case-data-section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">
                DIGITAL FORENSICS
              </span>

              <h2>
                Evidence & Clues
              </h2>
            </div>

            <span className="data-count">
              {evidence.length + clues.length} records
            </span>
          </div>

          <div className="data-grid">
            <div className="data-panel">
              <div className="data-panel-header">
                <div className="data-panel-title">
                  <FileSearch size={20} />

                  <span>
                    Evidence
                  </span>
                </div>

                <span className="data-number">
                  {evidence.length}
                </span>
              </div>

              {evidence.length === 0 ? (
                <div className="data-empty">
                  <FileSearch size={30} />

                  <p>
                    No evidence has been recorded for this case.
                  </p>
                </div>
              ) : (
                <div className="data-list">
                  {evidence.map((item) => (
                    <div
                      className="data-item"
                      key={item.id}
                    >
                      <div>
                        <strong>
                          {item.title}
                        </strong>

                        <p>
                          {item.description ||
                            "No evidence description available."}
                        </p>

                        <span className="data-meta">
                          Type:{" "}
                          {item.evidence_type ||
                            "Unknown"}
                        </span>
                      </div>

                      <span
                        className={
                          item.verified
                            ? "verification verified"
                            : "verification unverified"
                        }
                      >
                        {item.verified ? (
                          <>
                            <CheckCircle2 size={14} />
                            Verified
                          </>
                        ) : (
                          <>
                            <XCircle size={14} />
                            Pending
                          </>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="data-panel">
              <div className="data-panel-header">
                <div className="data-panel-title">
                  <ShieldAlert size={20} />

                  <span>
                    Clues
                  </span>
                </div>

                <span className="data-number">
                  {clues.length}
                </span>
              </div>

              {clues.length === 0 ? (
                <div className="data-empty">
                  <ShieldAlert size={30} />

                  <p>
                    No clues have been recorded for this case.
                  </p>
                </div>
              ) : (
                <div className="data-list">
                  {clues.map((clue) => (
                    <div
                      className="data-item"
                      key={clue.id}
                    >
                      <div>
                        <strong>
                          {clue.title}
                        </strong>

                        <p>
                          {clue.description ||
                            "No clue description available."}
                        </p>

                        <span className="data-meta">
                          Importance:{" "}
                          {clue.importance}
                        </span>
                      </div>

                      <span
                        className={
                          clue.resolved
                            ? "verification verified"
                            : "verification unverified"
                        }
                      >
                        {clue.resolved
                          ? "Resolved"
                          : "Open"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="case-data-section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">
                PERSONS OF INTEREST
              </span>

              <h2>
                Suspect Profiles
              </h2>
            </div>

            <span className="data-count">
              {suspects.length} suspects
            </span>
          </div>

          {suspects.length === 0 ? (
            <div className="large-empty">
              <Users size={38} />

              <h3>
                No Suspects Recorded
              </h3>

              <p>
                No suspect profiles have been associated with this
                case yet.
              </p>
            </div>
          ) : (
            <div className="suspect-grid">
              {suspects.map((suspect) => (
                <div
                  className="suspect-card"
                  key={suspect.id}
                >
                  <div className="suspect-avatar">
                    {suspect.photo ? (
                      <img
                        src={suspect.photo}
                        alt={suspect.name}
                      />
                    ) : (
                      <User size={25} />
                    )}
                  </div>

                  <div className="suspect-content">
                    <span className="suspect-label">
                      SUSPECT #{suspect.id}
                    </span>

                    <h3>
                      {suspect.name}
                    </h3>

                    <div className="suspect-details">
                      <span>
                        Age:{" "}
                        {suspect.age || "Unknown"}
                      </span>

                      <span>
                        {suspect.occupation ||
                          "Occupation unknown"}
                      </span>
                    </div>

                    <p>
                      {suspect.description ||
                        "No additional suspect information available."}
                    </p>

                    <span className="suspect-status">
                      {suspect.status ||
                        "Unknown status"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="case-data-section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">
                INVESTIGATION HISTORY
              </span>

              <h2>
                Timeline
              </h2>
            </div>

            <span className="data-count">
              {timeline.length} events
            </span>
          </div>

          {timeline.length === 0 ? (
            <div className="large-empty">
              <Clock size={38} />

              <h3>
                No Timeline Events
              </h3>

              <p>
                Investigation events will appear here as the case
                progresses.
              </p>
            </div>
          ) : (
            <div className="timeline">
              {timeline.map((event) => (
                <div
                  className="timeline-item"
                  key={event.id}
                >
                  <div className="timeline-marker">
                    <Clock size={16} />
                  </div>

                  <div className="timeline-content">
                    <span className="timeline-date">
                      {formatDateTime(
                        event.event_date
                      )}
                    </span>

                    <h3>
                      {event.title}
                    </h3>

                    <p>
                      {event.description ||
                        "No event description available."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="case-data-section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">
                INVESTIGATOR RECORDS
              </span>

              <h2>
                Investigations & Notes
              </h2>
            </div>

            <span className="data-count">
              {investigations.length + notes.length} records
            </span>
          </div>

          <div className="data-grid">
            <div className="data-panel">
              <div className="data-panel-header">
                <div className="data-panel-title">
                  <FileSearch size={20} />

                  <span>
                    Investigation Findings
                  </span>
                </div>

                <span className="data-number">
                  {investigations.length}
                </span>
              </div>

              {investigations.length === 0 ? (
                <div className="data-empty">
                  <FileSearch size={30} />

                  <p>
                    No investigation findings have been recorded.
                  </p>
                </div>
              ) : (
                <div className="data-list">
                  {investigations.map(
                    (investigation) => (
                      <div
                        className="data-item"
                        key={investigation.id}
                      >
                        <div>
                          <strong>
                            {investigation.title}
                          </strong>

                          <p>
                            {investigation.findings ||
                              "No findings recorded."}
                          </p>

                          <span className="data-meta">
                            Updated:{" "}
                            {formatDateTime(
                              investigation.updated_at
                            )}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            <div className="data-panel">
              <div className="data-panel-header">
                <div className="data-panel-title">
                  <Edit3 size={20} />

                  <span>
                    Case Notes
                  </span>
                </div>

                <span className="data-number">
                  {notes.length}
                </span>
              </div>

              {notes.length === 0 ? (
                <div className="data-empty">
                  <Edit3 size={30} />

                  <p>
                    No investigator notes have been added.
                  </p>
                </div>
              ) : (
                <div className="data-list">
                  {notes.map((note) => (
                    <div
                      className="data-item"
                      key={note.id}
                    >
                      <div>
                        <strong>
                          Investigator Note #{note.id}
                        </strong>

                        <p>
                          {note.content}
                        </p>

                        <span className="data-meta">
                          Added:{" "}
                          {formatDateTime(
                            note.created_at
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <footer className="case-details-footer">
          <span>
            DigitalDetective Investigation Network
          </span>

          <span>
            SECURE CASE FILE • ID #{caseData.id}
          </span>
        </footer>
      </div>
    </div>
  );
}

export default CaseDetails;