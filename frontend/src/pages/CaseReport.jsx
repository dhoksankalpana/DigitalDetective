import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  RefreshCw,
  Shield,
  CheckCircle2,
  XCircle,
  Users,
  FileSearch,
  Lightbulb,
  Activity,
  ListChecks,
} from "lucide-react";

import api from "../services/api";
import "./CaseReport.css";

function CaseReport() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/cases/${id}/report/`);

      setReport(response.data);
    } catch (err) {
      console.error("Case report error:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load the case report."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReport();
    }, 0);

    return () => clearTimeout(timer);
  }, [id]);

  const formatDate = (value) => {
    if (!value) {
      return "Not available";
    }

    return new Date(value).toLocaleString();
  };

  const formatDateOnly = (value) => {
    if (!value) {
      return "Not available";
    }

    return new Date(value).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="case-report-page">
        <div className="report-loading">
          <RefreshCw
            size={35}
            className="report-spin"
          />

          <h2>Generating Case Report</h2>

          <p>
            Collecting investigation data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="case-report-page">
        <div className="report-error-state">
          <XCircle size={42} />

          <h2>Unable to Generate Report</h2>

          <p>{error}</p>

          <button
            className="report-action-button"
            onClick={fetchReport}
          >
            <RefreshCw size={17} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  const caseInfo = report.case;
  const summary = report.summary;
  const progress = report.progress;

  return (
    <div className="case-report-page">

      <div className="report-top-bar">
        <button
          className="report-back-button"
          onClick={() => navigate(`/cases/${id}`)}
        >
          <ArrowLeft size={18} />
          Back to Case
        </button>

        <button
          className="report-refresh-button"
          onClick={fetchReport}
        >
          <RefreshCw size={17} />
          Refresh Report
        </button>
      </div>

      <header className="report-header">

        <div className="report-header-icon">
          <FileText size={28} />
        </div>

        <div>
          <span className="report-eyebrow">
            DIGITAL INVESTIGATION REPORT
          </span>

          <h1>{caseInfo.title}</h1>

          <p>
            Case {caseInfo.case_number}
          </p>
        </div>

      </header>

      <section className="report-meta-card">

        <div className="report-meta-item">
          <span>CASE NUMBER</span>
          <strong>{caseInfo.case_number}</strong>
        </div>

        <div className="report-meta-item">
          <span>STATUS</span>
          <strong>{caseInfo.status}</strong>
        </div>

        <div className="report-meta-item">
          <span>PRIORITY</span>
          <strong>{caseInfo.priority}</strong>
        </div>

        <div className="report-meta-item">
          <span>LOCATION</span>
          <strong>
            {caseInfo.location || "Not specified"}
          </strong>
        </div>

        <div className="report-meta-item">
          <span>CREATED BY</span>
          <strong>
            {caseInfo.created_by || "Not available"}
          </strong>
        </div>

        <div className="report-meta-item">
          <span>ASSIGNED TO</span>
          <strong>
            {caseInfo.assigned_to || "Not assigned"}
          </strong>
        </div>

      </section>

      <section className="report-section">

        <div className="report-section-header">
          <div>
            <span className="report-section-eyebrow">
              CASE OVERVIEW
            </span>

            <h2>Investigation Summary</h2>
          </div>

          <Shield size={22} />
        </div>

        <div className="report-description">
          {caseInfo.description || "No case description available."}
        </div>

      </section>

      <section className="report-section">

        <div className="report-section-header">
          <div>
            <span className="report-section-eyebrow">
              INVESTIGATION STATUS
            </span>

            <h2>Case Progress</h2>
          </div>

          <Activity size={22} />
        </div>

        <div className="report-progress-card">

          <div className="report-progress-circle">
            <strong>
              {progress.progress}%
            </strong>

            <span>Complete</span>
          </div>

          <div className="report-progress-info">

            <h3>
              {progress.completed_stages} of{" "}
              {progress.total_stages} stages completed
            </h3>

            <div className="report-progress-bar">
              <div
                style={{
                  width: `${progress.progress}%`,
                }}
              ></div>
            </div>

            <div className="report-stage-list">

              {progress.stages.map((stage) => (
                <div
                  key={stage.id}
                  className="report-stage-item"
                >
                  {stage.completed ? (
                    <CheckCircle2
                      size={17}
                      className="report-stage-complete"
                    />
                  ) : (
                    <XCircle
                      size={17}
                      className="report-stage-pending"
                    />
                  )}

                  <div>
                    <strong>{stage.name}</strong>
                    <span>{stage.description}</span>
                  </div>
                </div>
              ))}

            </div>

          </div>

        </div>

      </section>

      <section className="report-summary-grid">

        <div className="report-summary-card">
          <FileSearch size={22} />
          <strong>{summary.evidence_count}</strong>
          <span>Evidence Items</span>
        </div>

        <div className="report-summary-card">
          <CheckCircle2 size={22} />
          <strong>
            {summary.verified_evidence_count}
          </strong>
          <span>Verified Evidence</span>
        </div>

        <div className="report-summary-card">
          <Users size={22} />
          <strong>{summary.suspect_count}</strong>
          <span>Suspects</span>
        </div>

        <div className="report-summary-card">
          <Shield size={22} />
          <strong>
            {summary.investigation_count}
          </strong>
          <span>Investigations</span>
        </div>

        <div className="report-summary-card">
          <Lightbulb size={22} />
          <strong>{summary.clue_count}</strong>
          <span>Clues</span>
        </div>

        <div className="report-summary-card">
          <Activity size={22} />
          <strong>
            {summary.timeline_event_count}
          </strong>
          <span>Timeline Events</span>
        </div>

        <div className="report-summary-card">
          <ListChecks size={22} />
          <strong>{summary.task_count}</strong>
          <span>Tasks</span>
        </div>

        <div className="report-summary-card">
          <CheckCircle2 size={22} />
          <strong>
            {summary.completed_task_count}
          </strong>
          <span>Completed Tasks</span>
        </div>

      </section>

      <section className="report-section">

        <div className="report-section-header">
          <div>
            <span className="report-section-eyebrow">
              DIGITAL EVIDENCE
            </span>

            <h2>Evidence Register</h2>
          </div>

          <FileSearch size={22} />
        </div>

        {report.evidence.length === 0 ? (
          <div className="report-empty">
            No evidence has been added to this case.
          </div>
        ) : (
          <div className="report-table-wrapper">

            <table className="report-table">

              <thead>
                <tr>
                  <th>Evidence</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Collected By</th>
                  <th>Hash</th>
                </tr>
              </thead>

              <tbody>

                {report.evidence.map((item) => (
                  <tr key={item.id}>

                    <td>
                      <strong>{item.title}</strong>
                      <small>
                        {item.description || "No description"}
                      </small>
                    </td>

                    <td>
                      {item.evidence_type}
                    </td>

                    <td>
                      {item.verified ? (
                        <span className="report-status verified">
                          <CheckCircle2 size={14} />
                          Verified
                        </span>
                      ) : (
                        <span className="report-status unverified">
                          <XCircle size={14} />
                          Unverified
                        </span>
                      )}
                    </td>

                    <td>
                      {item.collected_by || "Unknown"}
                    </td>

                    <td>
                      <span className="report-hash">
                        {item.file_hash || "No hash"}
                      </span>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </section>

      <section className="report-section">

        <div className="report-section-header">
          <div>
            <span className="report-section-eyebrow">
              PERSONS OF INTEREST
            </span>

            <h2>Suspect Register</h2>
          </div>

          <Users size={22} />
        </div>

        {report.suspects.length === 0 ? (
          <div className="report-empty">
            No suspects have been added to this case.
          </div>
        ) : (
          <div className="report-card-grid">

            {report.suspects.map((suspect) => (
              <div
                className="report-detail-card"
                key={suspect.id}
              >
                <span className="report-card-label">
                  SUSPECT
                </span>

                <h3>{suspect.name}</h3>

                <p>
                  {suspect.description ||
                    "No description available."}
                </p>

                <div className="report-card-details">

                  <span>
                    <strong>Age:</strong>{" "}
                    {suspect.age || "N/A"}
                  </span>

                  <span>
                    <strong>Occupation:</strong>{" "}
                    {suspect.occupation || "N/A"}
                  </span>

                  <span>
                    <strong>Status:</strong>{" "}
                    {suspect.status || "N/A"}
                  </span>

                </div>

              </div>
            ))}

          </div>
        )}

      </section>

      <section className="report-section">

        <div className="report-section-header">
          <div>
            <span className="report-section-eyebrow">
              INVESTIGATION RECORD
            </span>

            <h2>Investigation Findings</h2>
          </div>

          <Shield size={22} />
        </div>

        {report.investigations.length === 0 ? (
          <div className="report-empty">
            No investigation records available.
          </div>
        ) : (
          <div className="report-card-grid">

            {report.investigations.map(
              (investigation) => (
                <div
                  className="report-detail-card"
                  key={investigation.id}
                >
                  <span className="report-card-label">
                    INVESTIGATION
                  </span>

                  <h3>{investigation.title}</h3>

                  <p>
                    {investigation.findings ||
                      "No findings recorded."}
                  </p>

                  <div className="report-card-details">

                    <span>
                      <strong>Investigator:</strong>{" "}
                      {investigation.investigator ||
                        "Unknown"}
                    </span>

                    <span>
                      <strong>Created:</strong>{" "}
                      {formatDate(
                        investigation.created_at
                      )}
                    </span>

                  </div>
                </div>
              )
            )}

          </div>
        )}

      </section>

      <section className="report-section">

        <div className="report-section-header">
          <div>
            <span className="report-section-eyebrow">
              CLUE ANALYSIS
            </span>

            <h2>Case Clues</h2>
          </div>

          <Lightbulb size={22} />
        </div>

        {report.clues.length === 0 ? (
          <div className="report-empty">
            No clues have been recorded.
          </div>
        ) : (
          <div className="report-card-grid">

            {report.clues.map((clue) => (
              <div
                className="report-detail-card"
                key={clue.id}
              >
                <span className="report-card-label">
                  CLUE
                </span>

                <h3>{clue.title}</h3>

                <p>
                  {clue.description ||
                    "No description available."}
                </p>

                <div className="report-card-details">

                  <span>
                    <strong>Importance:</strong>{" "}
                    {clue.importance}
                  </span>

                  <span>
                    <strong>Resolution:</strong>{" "}
                    {clue.resolved
                      ? "Resolved"
                      : "Unresolved"}
                  </span>

                </div>
              </div>
            ))}

          </div>
        )}

      </section>

      <section className="report-section">

        <div className="report-section-header">
          <div>
            <span className="report-section-eyebrow">
              CHRONOLOGICAL RECORD
            </span>

            <h2>Investigation Timeline</h2>
          </div>

          <Activity size={22} />
        </div>

        {report.timeline.length === 0 ? (
          <div className="report-empty">
            No timeline events have been recorded.
          </div>
        ) : (
          <div className="report-timeline">

            {report.timeline.map((event) => (
              <div
                className="report-timeline-item"
                key={event.id}
              >

                <div className="report-timeline-marker"></div>

                <div>
                  <span>
                    {formatDateOnly(
                      event.event_date
                    )}
                  </span>

                  <h3>{event.title}</h3>

                  <p>
                    {event.description ||
                      "No description available."}
                  </p>
                </div>

              </div>
            ))}

          </div>
        )}

      </section>

      <section className="report-section">

        <div className="report-section-header">
          <div>
            <span className="report-section-eyebrow">
              OPERATIONAL TASKS
            </span>

            <h2>Investigation Tasks</h2>
          </div>

          <ListChecks size={22} />
        </div>

        {report.tasks.length === 0 ? (
          <div className="report-empty">
            No investigation tasks have been recorded.
          </div>
        ) : (
          <div className="report-card-grid">

            {report.tasks.map((task) => (
              <div
                className="report-detail-card"
                key={task.id}
              >

                <span className="report-card-label">
                  TASK
                </span>

                <h3>{task.title}</h3>

                <p>
                  {task.description ||
                    "No description available."}
                </p>

                <div className="report-card-details">

                  <span>
                    <strong>Priority:</strong>{" "}
                    {task.priority}
                  </span>

                  <span>
                    <strong>Status:</strong>{" "}
                    {task.status}
                  </span>

                  <span>
                    <strong>Assigned To:</strong>{" "}
                    {task.assigned_to || "Unassigned"}
                  </span>

                  <span>
                    <strong>Due Date:</strong>{" "}
                    {formatDateOnly(task.due_date)}
                  </span>

                </div>

              </div>
            ))}

          </div>
        )}

      </section>

      <footer className="report-footer">

        <div>
          <Shield size={18} />

          <span>
            DigitalDetective Investigation System
          </span>
        </div>

        <span>
          Report generated by{" "}
          <strong>{report.report.generated_by}</strong>
          {" • "}
          {formatDate(report.report.generated_at)}
        </span>

      </footer>

    </div>
  );
}

export default CaseReport;