import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Search,
  Fingerprint,
  Users,
  Plus,
  ArrowRight,
  Clock3,
  Activity,
  ShieldCheck,
  LogOut,
  Bell,
  FileSearch,
  RefreshCw,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  BarChart3,
} from "lucide-react";

import useAuth from "../hooks/useAuth";
import api from "../services/api";
import "./Dashboard.css";

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [cases, setCases] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [suspects, setSuspects] = useState([]);
  const [investigations, setInvestigations] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [dashboardStats, setDashboardStats] = useState({
    active_cases: 0,
    total_cases: 0,
    total_evidence: 0,
    verified_evidence: 0,
    total_suspects: 0,
    unresolved_clues: 0,
    resolved_clues: 0,
    total_investigations: 0,
    unread_notifications: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          casesResponse,
          evidenceResponse,
          suspectsResponse,
          investigationsResponse,
          notificationsResponse,
          statsResponse,
        ] = await Promise.all([
          api.get("/cases/"),
          api.get("/evidence/"),
          api.get("/suspects/"),
          api.get("/investigations/"),
          api.get("/notifications/"),
          api.get("/dashboard/stats/"),
        ]);

        const getData = (response) => {
          return response.data.results || response.data || [];
        };

        setCases(getData(casesResponse));
        setEvidence(getData(evidenceResponse));
        setSuspects(getData(suspectsResponse));
        setInvestigations(getData(investigationsResponse));
        setNotifications(getData(notificationsResponse));
        setDashboardStats(statsResponse.data);
      } catch (err) {
        console.error("Dashboard API error:", err);

        if (err.response?.status === 401) {
          setError("Your session has expired. Please log in again.");
        } else {
          setError("Unable to load dashboard data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const activeCases = dashboardStats.active_cases;

  const unreadNotifications = dashboardStats.unread_notifications;

  const recentCases = [...cases]
    .sort(
      (a, b) =>
        new Date(b.created_at || 0) - new Date(a.created_at || 0)
    )
    .slice(0, 3);

  const verificationRate =
    dashboardStats.total_evidence > 0
      ? Math.round(
          (dashboardStats.verified_evidence /
            dashboardStats.total_evidence) *
            100
        )
      : 0;

  const totalClues =
    dashboardStats.resolved_clues +
    dashboardStats.unresolved_clues;

  const clueResolutionRate =
    totalClues > 0
      ? Math.round(
          (dashboardStats.resolved_clues / totalClues) * 100
        )
      : 0;

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
    <div className="dashboard-page">
      <div className="dashboard-background">
        <div className="dashboard-grid"></div>

        <div className="dashboard-glow dashboard-glow-one"></div>

        <div className="dashboard-glow dashboard-glow-two"></div>
      </div>

      <div className="dashboard-container">
        <header className="dashboard-header">
          <div>
            <div className="dashboard-eyebrow">
              <Fingerprint size={16} />
              DIGITAL INVESTIGATION COMMAND CENTER
            </div>

            <h1>
              Welcome back,{" "}
              <span>
                {user?.display_name ||
                  user?.user?.username ||
                  user?.username ||
                  "Detective"}
              </span>
            </h1>

            <p>
              Monitor investigations, evidence, suspects and case
              activity from one secure workspace.
            </p>
          </div>

          <div className="dashboard-header-actions">
            <button
              className="icon-button"
              onClick={() => navigate("/notifications")}
              title="Notifications"
            >
              <Bell size={20} />

              {unreadNotifications > 0 && (
                <span className="notification-dot">
                  {unreadNotifications > 9
                    ? "9+"
                    : unreadNotifications}
                </span>
              )}
            </button>

            <button
              className="btn btn-danger dashboard-logout"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </header>

        {error && (
          <div className="dashboard-error">
            <AlertTriangle size={20} />

            <span>{error}</span>

            <button
              className="btn btn-secondary"
              onClick={handleRetry}
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        )}

        <section className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-card-top">
              <div className="stat-icon">
                <Briefcase size={22} />
              </div>

              <span className="stat-label">
                CASE FILES
              </span>
            </div>

            <div className="stat-value">
              {loading
                ? "--"
                : String(dashboardStats.total_cases).padStart(
                    2,
                    "0"
                  )}
            </div>

            <div className="stat-description">
              {loading
                ? "Loading..."
                : `${activeCases} currently active`}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <div className="stat-icon">
                <Search size={22} />
              </div>

              <span className="stat-label">
                INVESTIGATIONS
              </span>
            </div>

            <div className="stat-value">
              {loading
                ? "--"
                : String(
                    dashboardStats.total_investigations
                  ).padStart(2, "0")}
            </div>

            <div className="stat-description">
              Investigation records
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <div className="stat-icon">
                <FileSearch size={22} />
              </div>

              <span className="stat-label">
                EVIDENCE
              </span>
            </div>

            <div className="stat-value">
              {loading
                ? "--"
                : String(
                    dashboardStats.total_evidence
                  ).padStart(2, "0")}
            </div>

            <div className="stat-description">
              {loading
                ? "Loading..."
                : `${dashboardStats.verified_evidence} verified`}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <div className="stat-icon">
                <Users size={22} />
              </div>

              <span className="stat-label">
                SUSPECTS
              </span>
            </div>

            <div className="stat-value">
              {loading
                ? "--"
                : String(
                    dashboardStats.total_suspects
                  ).padStart(2, "0")}
            </div>

            <div className="stat-description">
              Profiles in database
            </div>
          </div>
        </section>

        <section className="dashboard-panel quick-actions-panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">
                <BarChart3 size={19} />
                Investigation Intelligence
              </div>

              <p>
                Live analysis of your investigation workspace
              </p>
            </div>

            <div className="live-indicator">
              <span></span>
              LIVE
            </div>
          </div>

          <div className="quick-actions">
            <div className="quick-action">
              <div className="quick-action-icon">
                <Briefcase size={22} />
              </div>

              <div>
                <strong>
                  {activeCases} Active Cases
                </strong>

                <span>
                  {dashboardStats.total_cases} total case files
                </span>
              </div>

              <ArrowRight size={17} />
            </div>

            <div className="quick-action">
              <div className="quick-action-icon">
                <ShieldCheck size={22} />
              </div>

              <div>
                <strong>
                  {verificationRate}% Evidence Verified
                </strong>

                <span>
                  {dashboardStats.verified_evidence} of{" "}
                  {dashboardStats.total_evidence} verified
                </span>
              </div>

              <ArrowRight size={17} />
            </div>

            <div className="quick-action">
              <div className="quick-action-icon">
                <Lightbulb size={22} />
              </div>

              <div>
                <strong>
                  {dashboardStats.unresolved_clues} Unresolved Clues
                </strong>

                <span>
                  {dashboardStats.resolved_clues} clues resolved
                </span>
              </div>

              <ArrowRight size={17} />
            </div>
          </div>
        </section>

        <div className="dashboard-main-grid">
          <section className="dashboard-panel recent-cases-panel">
            <div className="panel-header">
              <div>
                <div className="panel-title">
                  <Briefcase size={19} />
                  Recent Cases
                </div>

                <p>
                  Latest investigation files
                </p>
              </div>

              <button
                className="panel-link"
                onClick={() => navigate("/cases")}
              >
                View all
                <ArrowRight size={16} />
              </button>
            </div>

            {loading ? (
              <div className="dashboard-loading">
                <div className="loader"></div>

                <span>
                  Loading case files...
                </span>
              </div>
            ) : recentCases.length === 0 ? (
              <div className="dashboard-empty">
                <Briefcase size={32} />

                <h3>No cases found</h3>

                <p>
                  Create your first investigation case.
                </p>

                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/cases")}
                >
                  <Plus size={17} />
                  Create Case
                </button>
              </div>
            ) : (
              <div className="recent-cases-list">
                {recentCases.map((caseItem) => (
                  <div
                    className="recent-case"
                    key={caseItem.id}
                    onClick={() =>
                      navigate(
                        `/cases/${caseItem.id}`
                      )
                    }
                  >
                    <div className="case-icon">
                      <Fingerprint size={20} />
                    </div>

                    <div className="case-info">
                      <div className="case-number">
                        {caseItem.case_number ||
                          "CASE FILE"}
                      </div>

                      <h3>
                        {caseItem.title ||
                          "Untitled Case"}
                      </h3>

                      <div className="case-meta">
                        <span>
                          <Clock3 size={13} />

                          {formatDate(
                            caseItem.created_at
                          )}
                        </span>

                        {caseItem.location && (
                          <span>
                            {caseItem.location}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="case-right">
                      <span
                        className={getStatusClass(
                          caseItem.status
                        )}
                      >
                        {caseItem.status ||
                          "Pending"}
                      </span>

                      <ArrowRight size={17} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="dashboard-panel activity-panel">
            <div className="panel-header">
              <div>
                <div className="panel-title">
                  <Activity size={19} />
                  System Activity
                </div>

                <p>
                  Current investigation data
                </p>
              </div>

              <div className="live-indicator">
                <span></span>
                LIVE
              </div>
            </div>

            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon">
                  <Briefcase size={17} />
                </div>

                <div>
                  <strong>
                    {dashboardStats.total_cases} case files
                  </strong>

                  <p>
                    {activeCases} currently active
                  </p>
                </div>
              </div>

              <div className="activity-item">
                <div className="activity-icon">
                  <FileSearch size={17} />
                </div>

                <div>
                  <strong>
                    {dashboardStats.total_evidence} evidence items
                  </strong>

                  <p>
                    {dashboardStats.verified_evidence} verified
                  </p>
                </div>
              </div>

              <div className="activity-item">
                <div className="activity-icon">
                  <Users size={17} />
                </div>

                <div>
                  <strong>
                    {dashboardStats.total_suspects} suspect profiles
                  </strong>

                  <p>
                    Profiles linked to investigations
                  </p>
                </div>
              </div>

              <div className="activity-item">
                <div className="activity-icon">
                  <Bell size={17} />
                </div>

                <div>
                  <strong>
                    {unreadNotifications} unread alerts
                  </strong>

                  <p>
                    Notifications requiring attention
                  </p>
                </div>
              </div>

              <div className="activity-item">
                <div className="activity-icon">
                  <Lightbulb size={17} />
                </div>

                <div>
                  <strong>
                    {dashboardStats.unresolved_clues} unresolved clues
                  </strong>

                  <p>
                    {clueResolutionRate}% clue resolution rate
                  </p>
                </div>
              </div>
            </div>

            <div className="system-status">
              <div className="system-status-header">
                <ShieldCheck size={20} />
                <span>System Status</span>
              </div>

              <div className="system-status-row">
                <span>Authentication</span>

                <span className="system-online">
                  <span></span>
                  Secure
                </span>
              </div>

              <div className="system-status-row">
                <span>Database</span>

                <span className="system-online">
                  <span></span>
                  Connected
                </span>
              </div>

              <div className="system-status-row">
                <span>Investigation API</span>

                <span className="system-online">
                  <span></span>
                  Online
                </span>
              </div>
            </div>
          </section>
        </div>

        <section className="dashboard-panel quick-actions-panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">
                <Activity size={19} />
                Quick Actions
              </div>

              <p>
                Access investigation tools
              </p>
            </div>
          </div>

          <div className="quick-actions">
            <button
              className="quick-action"
              onClick={() => navigate("/cases")}
            >
              <div className="quick-action-icon">
                <Plus size={22} />
              </div>

              <div>
                <strong>New Case</strong>

                <span>
                  Open a new investigation
                </span>
              </div>

              <ArrowRight size={17} />
            </button>

            <button
              className="quick-action"
              onClick={() => navigate("/evidence")}
            >
              <div className="quick-action-icon">
                <FileSearch size={22} />
              </div>

              <div>
                <strong>Add Evidence</strong>

                <span>
                  Record investigation evidence
                </span>
              </div>

              <ArrowRight size={17} />
            </button>

            <button
              className="quick-action"
              onClick={() => navigate("/suspects")}
            >
              <div className="quick-action-icon">
                <Users size={22} />
              </div>

              <div>
                <strong>Suspect Database</strong>

                <span>
                  Review suspect profiles
                </span>
              </div>

              <ArrowRight size={17} />
            </button>
          </div>
        </section>

        <section className="dashboard-panel quick-actions-panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">
                <CheckCircle2 size={19} />
                Investigation Metrics
              </div>

              <p>
                Current operational indicators
              </p>
            </div>
          </div>

          <div className="quick-actions">
            <div className="quick-action">
              <div className="quick-action-icon">
                <ShieldCheck size={22} />
              </div>

              <div>
                <strong>
                  Evidence Integrity
                </strong>

                <span>
                  {dashboardStats.verified_evidence} verified evidence
                  records
                </span>
              </div>
            </div>

            <div className="quick-action">
              <div className="quick-action-icon">
                <Lightbulb size={22} />
              </div>

              <div>
                <strong>
                  Clue Resolution
                </strong>

                <span>
                  {dashboardStats.resolved_clues} resolved /{" "}
                  {dashboardStats.unresolved_clues} pending
                </span>
              </div>
            </div>

            <div className="quick-action">
              <div className="quick-action-icon">
                <Activity size={22} />
              </div>

              <div>
                <strong>
                  Investigation Records
                </strong>

                <span>
                  {dashboardStats.total_investigations} records
                  available
                </span>
              </div>
            </div>
          </div>
        </section>

        <footer className="dashboard-footer">
          <span>
            DigitalDetective Investigation Network
          </span>

          <span>
            Secure Workspace • API Connected
          </span>
        </footer>
      </div>
    </div>
  );
}

export default Dashboard;