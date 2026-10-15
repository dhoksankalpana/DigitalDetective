import { useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  Briefcase,
  CheckCircle2,
  FileSearch,
  ListChecks,
  RefreshCw,
  ShieldAlert,
  Target,
  Users,
  XCircle,
} from "lucide-react";
import api from "../services/api";
import "./Analytics.css";

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchAnalytics = async () => {
    try {
      setError("");

      const response = await api.get("/cases/analytics/");

      setAnalytics(response.data);
    } catch (err) {
      console.error("Analytics error:", err);

      if (err.response?.status === 401) {
        setError("Your session has expired. Please sign in again.");
      } else {
        setError(
          "Unable to load investigation analytics. Please try again."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAnalytics();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-loading">
          <div className="analytics-loader"></div>
          <p>Loading investigation analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div className="analytics-error">
          <XCircle size={48} />
          <h2>Analytics Unavailable</h2>
          <p>{error}</p>

          <button
            className="analytics-retry-button"
            onClick={handleRefresh}
          >
            <RefreshCw size={17} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const cases = analytics?.cases || {};
  const evidence = analytics?.evidence || {};
  const suspects = analytics?.suspects || {};
  const investigations = analytics?.investigations || {};
  const clues = analytics?.clues || {};
  const tasks = analytics?.tasks || {};

  const evidenceVerificationPercentage =
    evidence.total > 0
      ? Math.round((evidence.verified / evidence.total) * 100)
      : 0;

  const clueResolutionPercentage =
    clues.total > 0
      ? Math.round((clues.resolved / clues.total) * 100)
      : 0;

  const taskCompletionPercentage =
    tasks.total > 0
      ? Math.round((tasks.completed / tasks.total) * 100)
      : 0;

  const caseClosurePercentage =
    cases.total > 0
      ? Math.round((cases.closed / cases.total) * 100)
      : 0;

  const priorityTotal =
    cases.high_priority +
    cases.medium_priority +
    cases.low_priority;

  const highPriorityPercentage =
    priorityTotal > 0
      ? Math.round((cases.high_priority / priorityTotal) * 100)
      : 0;

  const mediumPriorityPercentage =
    priorityTotal > 0
      ? Math.round((cases.medium_priority / priorityTotal) * 100)
      : 0;

  const lowPriorityPercentage =
    priorityTotal > 0
      ? Math.round((cases.low_priority / priorityTotal) * 100)
      : 0;

  return (
    <div className="analytics-page">
      <div className="analytics-background">
        <div className="analytics-grid"></div>
        <div className="analytics-glow analytics-glow-one"></div>
        <div className="analytics-glow analytics-glow-two"></div>
      </div>

      <div className="analytics-container">
        <div className="analytics-header">
          <div>
            <div className="analytics-kicker">
              <span className="analytics-kicker-line"></span>
              INVESTIGATION INTELLIGENCE
            </div>

            <h1>Advanced Analytics</h1>

            <p>
              Monitor investigation activity, evidence verification,
              case progress and operational workload.
            </p>
          </div>

          <button
            className="analytics-refresh-button"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              size={17}
              className={refreshing ? "refresh-spinning" : ""}
            />
            {refreshing ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>

        <section className="analytics-section">
          <div className="analytics-section-heading">
            <div>
              <span className="analytics-section-kicker">
                CASE INTELLIGENCE
              </span>
              <h2>Case Overview</h2>
            </div>

            <BarChart3 size={23} />
          </div>

          <div className="analytics-card-grid">
            <div className="analytics-stat-card">
              <div className="analytics-stat-icon">
                <Briefcase size={22} />
              </div>

              <div>
                <span>Total Cases</span>
                <strong>{cases.total}</strong>
              </div>
            </div>

            <div className="analytics-stat-card">
              <div className="analytics-stat-icon active">
                <Activity size={22} />
              </div>

              <div>
                <span>Active Cases</span>
                <strong>{cases.open}</strong>
              </div>
            </div>

            <div className="analytics-stat-card">
              <div className="analytics-stat-icon completed">
                <CheckCircle2 size={22} />
              </div>

              <div>
                <span>Closed Cases</span>
                <strong>{cases.closed}</strong>
              </div>
            </div>

            <div className="analytics-stat-card">
              <div className="analytics-stat-icon danger">
                <ShieldAlert size={22} />
              </div>

              <div>
                <span>High Priority</span>
                <strong>{cases.high_priority}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="analytics-section">
          <div className="analytics-section-heading">
            <div>
              <span className="analytics-section-kicker">
                DIGITAL EVIDENCE
              </span>
              <h2>Evidence Intelligence</h2>
            </div>

            <FileSearch size={23} />
          </div>

          <div className="analytics-two-column">
            <div className="analytics-panel">
              <div className="analytics-panel-header">
                <div>
                  <span>Total Evidence</span>
                  <strong>{evidence.total}</strong>
                </div>

                <FileSearch size={25} />
              </div>

              <div className="analytics-progress-info">
                <div>
                  <span>Verification Rate</span>
                  <strong>{evidenceVerificationPercentage}%</strong>
                </div>

                <span>
                  {evidence.verified} of {evidence.total} verified
                </span>
              </div>

              <div className="analytics-progress-bar">
                <div
                  className="analytics-progress-fill cyan"
                  style={{
                    width: `${evidenceVerificationPercentage}%`,
                  }}
                ></div>
              </div>

              <div className="analytics-breakdown">
                <div>
                  <span className="breakdown-dot verified-dot"></span>
                  Verified
                  <strong>{evidence.verified}</strong>
                </div>

                <div>
                  <span className="breakdown-dot unverified-dot"></span>
                  Unverified
                  <strong>{evidence.unverified}</strong>
                </div>
              </div>
            </div>

            <div className="analytics-panel">
              <div className="analytics-panel-header">
                <div>
                  <span>Evidence Status</span>
                  <strong>
                    {evidence.verified}/{evidence.total}
                  </strong>
                </div>

                <Target size={25} />
              </div>

              <div className="analytics-status-list">
                <div className="analytics-status-row">
                  <span>Verified Evidence</span>
                  <strong>{evidence.verified}</strong>
                </div>

                <div className="analytics-status-row">
                  <span>Unverified Evidence</span>
                  <strong>{evidence.unverified}</strong>
                </div>

                <div className="analytics-status-row">
                  <span>Total Evidence</span>
                  <strong>{evidence.total}</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="analytics-section">
          <div className="analytics-section-heading">
            <div>
              <span className="analytics-section-kicker">
                INVESTIGATION ACTIVITY
              </span>
              <h2>Investigation Metrics</h2>
            </div>

            <Users size={23} />
          </div>

          <div className="analytics-card-grid three">
            <div className="analytics-stat-card large">
              <div className="analytics-stat-icon purple">
                <Users size={22} />
              </div>

              <div>
                <span>Suspects</span>
                <strong>{suspects.total}</strong>
                <small>Registered in cases</small>
              </div>
            </div>

            <div className="analytics-stat-card large">
              <div className="analytics-stat-icon blue">
                <Activity size={22} />
              </div>

              <div>
                <span>Investigations</span>
                <strong>{investigations.total}</strong>
                <small>Investigation records</small>
              </div>
            </div>

            <div className="analytics-stat-card large">
              <div className="analytics-stat-icon orange">
                <Target size={22} />
              </div>

              <div>
                <span>Total Clues</span>
                <strong>{clues.total}</strong>
                <small>Tracked investigation clues</small>
              </div>
            </div>
          </div>
        </section>

        <section className="analytics-section">
          <div className="analytics-section-heading">
            <div>
              <span className="analytics-section-kicker">
                CLUE ANALYSIS
              </span>
              <h2>Clue Resolution</h2>
            </div>

            <Target size={23} />
          </div>

          <div className="analytics-panel wide-panel">
            <div className="analytics-panel-header">
              <div>
                <span>Resolution Progress</span>
                <strong>{clueResolutionPercentage}%</strong>
              </div>

              <span className="analytics-large-number">
                {clues.resolved}/{clues.total}
              </span>
            </div>

            <div className="analytics-progress-bar large">
              <div
                className="analytics-progress-fill purple"
                style={{
                  width: `${clueResolutionPercentage}%`,
                }}
              ></div>
            </div>

            <div className="analytics-breakdown">
              <div>
                <span className="breakdown-dot resolved-dot"></span>
                Resolved
                <strong>{clues.resolved}</strong>
              </div>

              <div>
                <span className="breakdown-dot unresolved-dot"></span>
                Unresolved
                <strong>{clues.unresolved}</strong>
              </div>

              <div>
                <span className="breakdown-dot total-dot"></span>
                Total
                <strong>{clues.total}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="analytics-section">
          <div className="analytics-section-heading">
            <div>
              <span className="analytics-section-kicker">
                OPERATIONAL WORKLOAD
              </span>
              <h2>Task Performance</h2>
            </div>

            <ListChecks size={23} />
          </div>

          <div className="analytics-two-column">
            <div className="analytics-panel">
              <div className="analytics-panel-header">
                <div>
                  <span>Completion Rate</span>
                  <strong>{taskCompletionPercentage}%</strong>
                </div>

                <ListChecks size={25} />
              </div>

              <div className="analytics-progress-bar">
                <div
                  className="analytics-progress-fill green"
                  style={{
                    width: `${taskCompletionPercentage}%`,
                  }}
                ></div>
              </div>

              <div className="analytics-breakdown">
                <div>
                  <span className="breakdown-dot completed-dot"></span>
                  Completed
                  <strong>{tasks.completed}</strong>
                </div>

                <div>
                  <span className="breakdown-dot pending-dot"></span>
                  Pending
                  <strong>{tasks.pending}</strong>
                </div>
              </div>
            </div>

            <div className="analytics-panel">
              <div className="analytics-panel-header">
                <div>
                  <span>Task Distribution</span>
                  <strong>{tasks.total}</strong>
                </div>
              </div>

              <div className="analytics-status-list">
                <div className="analytics-status-row">
                  <span>Completed</span>
                  <strong>{tasks.completed}</strong>
                </div>

                <div className="analytics-status-row">
                  <span>In Progress</span>
                  <strong>{tasks.in_progress}</strong>
                </div>

                <div className="analytics-status-row">
                  <span>Pending</span>
                  <strong>{tasks.pending}</strong>
                </div>

                <div className="analytics-status-row">
                  <span>Cancelled</span>
                  <strong>{tasks.cancelled}</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="analytics-section">
          <div className="analytics-section-heading">
            <div>
              <span className="analytics-section-kicker">
                PRIORITY ANALYSIS
              </span>
              <h2>Case Priority Distribution</h2>
            </div>

            <ShieldAlert size={23} />
          </div>

          <div className="analytics-panel wide-panel">
            <div className="priority-row">
              <div className="priority-row-label">
                <span className="priority-indicator high"></span>
                <span>High Priority</span>
                <strong>{cases.high_priority}</strong>
              </div>

              <div className="priority-bar">
                <div
                  className="priority-fill high"
                  style={{
                    width: `${highPriorityPercentage}%`,
                  }}
                ></div>
              </div>

              <span>{highPriorityPercentage}%</span>
            </div>

            <div className="priority-row">
              <div className="priority-row-label">
                <span className="priority-indicator medium"></span>
                <span>Medium Priority</span>
                <strong>{cases.medium_priority}</strong>
              </div>

              <div className="priority-bar">
                <div
                  className="priority-fill medium"
                  style={{
                    width: `${mediumPriorityPercentage}%`,
                  }}
                ></div>
              </div>

              <span>{mediumPriorityPercentage}%</span>
            </div>

            <div className="priority-row">
              <div className="priority-row-label">
                <span className="priority-indicator low"></span>
                <span>Low Priority</span>
                <strong>{cases.low_priority}</strong>
              </div>

              <div className="priority-bar">
                <div
                  className="priority-fill low"
                  style={{
                    width: `${lowPriorityPercentage}%`,
                  }}
                ></div>
              </div>

              <span>{lowPriorityPercentage}%</span>
            </div>
          </div>
        </section>

        <section className="analytics-section">
          <div className="analytics-section-heading">
            <div>
              <span className="analytics-section-kicker">
                CASE COMPLETION
              </span>
              <h2>Investigation Closure</h2>
            </div>

            <CheckCircle2 size={23} />
          </div>

          <div className="analytics-panel wide-panel">
            <div className="closure-content">
              <div className="closure-score">
                <strong>{caseClosurePercentage}%</strong>
                <span>Cases Closed</span>
              </div>

              <div className="closure-details">
                <div>
                  <span>Total Cases</span>
                  <strong>{cases.total}</strong>
                </div>

                <div>
                  <span>Open / Active</span>
                  <strong>{cases.open}</strong>
                </div>

                <div>
                  <span>Closed / Resolved</span>
                  <strong>{cases.closed}</strong>
                </div>
              </div>
            </div>

            <div className="analytics-progress-bar large">
              <div
                className="analytics-progress-fill green"
                style={{
                  width: `${caseClosurePercentage}%`,
                }}
              ></div>
            </div>
          </div>
        </section>

        <div className="analytics-footer">
          <span>DIGITALDETECTIVE</span>
          <span>INVESTIGATION ANALYTICS ONLINE</span>
        </div>
      </div>
    </div>
  );
}

export default Analytics;