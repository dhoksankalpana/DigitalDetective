import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Clock,
  Briefcase,
  CalendarDays,
  Trash2,
  X,
  RefreshCw,
  Eye,
  Filter,
  MapPin,
} from "lucide-react";

import api from "../services/api";
import "./Timeline.css";

function Timeline() {
  const [events, setEvents] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [caseFilter, setCaseFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [formData, setFormData] = useState({
    case: "",
    title: "",
    description: "",
    event_date: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [eventsResponse, casesResponse] = await Promise.all([
          api.get("/timeline/"),
          api.get("/cases/"),
        ]);

        setEvents(
          Array.isArray(eventsResponse.data)
            ? eventsResponse.data
            : eventsResponse.data.results || []
        );

        setCases(
          Array.isArray(casesResponse.data)
            ? casesResponse.data
            : casesResponse.data.results || []
        );
      } catch (err) {
        console.error(err);
        setError("Unable to load timeline events.");
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

      const [eventsResponse, casesResponse] = await Promise.all([
        api.get("/timeline/"),
        api.get("/cases/"),
      ]);

      setEvents(
        Array.isArray(eventsResponse.data)
          ? eventsResponse.data
          : eventsResponse.data.results || []
      );

      setCases(
        Array.isArray(casesResponse.data)
          ? casesResponse.data
          : casesResponse.data.results || []
      );
    } catch (err) {
      console.error(err);
      setError("Unable to refresh timeline.");
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

  const filteredEvents = events.filter((event) => {
    const text = search.toLowerCase();

    const matchesSearch =
      event.title?.toLowerCase().includes(text) ||
      event.description?.toLowerCase().includes(text) ||
      getCaseTitle(event.case).toLowerCase().includes(text);

    const matchesCase =
      caseFilter === "all" ||
      String(event.case) === String(caseFilter);

    return matchesSearch && matchesCase;
  });

  const sortedEvents = [...filteredEvents].sort(
    (a, b) =>
      new Date(a.event_date).getTime() -
      new Date(b.event_date).getTime()
  );

  const openCreateModal = () => {
    setFormData({
      case: cases.length > 0 ? String(cases[0].id) : "",
      title: "",
      description: "",
      event_date: "",
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

    if (
      !formData.case ||
      !formData.title ||
      !formData.event_date
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await api.post("/timeline/", {
        case: Number(formData.case),
        title: formData.title,
        description: formData.description,
        event_date: new Date(formData.event_date).toISOString(),
      });

      setShowModal(false);

      setFormData({
        case: "",
        title: "",
        description: "",
        event_date: "",
      });

      await refreshData();
    } catch (err) {
      console.error(err);

      if (err.response?.data) {
        setError(JSON.stringify(err.response.data));
      } else {
        setError("Unable to create timeline event.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this timeline event?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/timeline/${id}/`);
      setSelectedEvent(null);
      await refreshData();
    } catch (err) {
      console.error(err);
      setError("Unable to delete timeline event.");
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

  const totalEvents = events.length;

  const casesWithEvents = new Set(
    events.map((event) => event.case)
  ).size;

  const upcomingEvents = events.filter(
    (event) => new Date(event.event_date) > new Date()
  ).length;

  return (
    <div className="timeline-page">
      <div className="timeline-grid"></div>

      <div className="timeline-container">
        <header className="timeline-header">
          <div>
            <div className="timeline-eyebrow">
              <Clock size={16} />
              INVESTIGATION CHRONOLOGY
            </div>

            <h1>Timeline</h1>

            <p>
              Reconstruct case events and track the sequence of
              investigative activity.
            </p>
          </div>

          <div className="timeline-header-actions">
            <button
              className="timeline-refresh-btn"
              onClick={refreshData}
            >
              <RefreshCw size={17} />
              Refresh
            </button>

            <button
              className="timeline-add-btn"
              onClick={openCreateModal}
              disabled={cases.length === 0}
            >
              <Plus size={18} />
              New Event
            </button>
          </div>
        </header>

        {error && (
          <div className="timeline-error">
            <span>{error}</span>

            <button onClick={() => setError("")}>
              <X size={17} />
            </button>
          </div>
        )}

        <section className="timeline-stats">
          <div className="timeline-stat-card">
            <div className="timeline-stat-icon">
              <Clock size={22} />
            </div>

            <div>
              <span>Total Events</span>
              <strong>{totalEvents}</strong>
            </div>
          </div>

          <div className="timeline-stat-card">
            <div className="timeline-stat-icon">
              <Briefcase size={22} />
            </div>

            <div>
              <span>Cases With Events</span>
              <strong>{casesWithEvents}</strong>
            </div>
          </div>

          <div className="timeline-stat-card">
            <div className="timeline-stat-icon">
              <CalendarDays size={22} />
            </div>

            <div>
              <span>Upcoming</span>
              <strong>{upcomingEvents}</strong>
            </div>
          </div>

          <div className="timeline-stat-card">
            <div className="timeline-stat-icon">
              <Eye size={22} />
            </div>

            <div>
              <span>Visible Events</span>
              <strong>{filteredEvents.length}</strong>
            </div>
          </div>
        </section>

        <section className="timeline-toolbar">
          <div className="timeline-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search timeline events..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            {search && (
              <button onClick={() => setSearch("")}>
                <X size={16} />
              </button>
            )}
          </div>

          <div className="timeline-filter">
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
          <div className="timeline-loading">
            <div className="timeline-spinner"></div>
            <p>Loading timeline...</p>
          </div>
        ) : sortedEvents.length === 0 ? (
          <div className="timeline-empty">
            <Clock size={48} />

            <h2>No timeline events found</h2>

            <p>
              Add events to reconstruct the chronology of a case.
            </p>

            {cases.length > 0 && (
              <button
                className="timeline-add-btn"
                onClick={openCreateModal}
              >
                <Plus size={18} />
                Create Event
              </button>
            )}
          </div>
        ) : (
          <section className="timeline-list">
            <div className="timeline-line"></div>

            {sortedEvents.map((event, index) => (
              <article
                className="timeline-event"
                key={event.id}
              >
                <div className="timeline-marker">
                  <span>{index + 1}</span>
                </div>

                <div className="timeline-event-card">
                  <div className="timeline-event-top">
                    <div className="timeline-event-date">
                      <CalendarDays size={15} />
                      {formatDateTime(event.event_date)}
                    </div>

                    <button
                      className="timeline-view-btn"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <Eye size={16} />
                      View
                    </button>
                  </div>

                  <div className="timeline-event-content">
                    <span className="timeline-case-label">
                      {getCaseTitle(event.case)}
                    </span>

                    <h2>{event.title}</h2>

                    {event.description && (
                      <p>{event.description}</p>
                    )}
                  </div>

                  <div className="timeline-event-footer">
                    <div>
                      <MapPin size={15} />
                      Case Event
                    </div>

                    <span>
                      Recorded {formatDate(event.created_at)}
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
          className="timeline-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="timeline-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="timeline-modal-header">
              <div>
                <span>NEW TIMELINE RECORD</span>
                <h2>Create Event</h2>
              </div>

              <button onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="timeline-form-group">
                <label>Related Case</label>

                <div className="timeline-input-wrapper">
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

              <div className="timeline-form-group">
                <label>Event Title</label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter event title"
                  required
                />
              </div>

              <div className="timeline-form-group">
                <label>Event Date & Time</label>

                <input
                  type="datetime-local"
                  name="event_date"
                  value={formData.event_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="timeline-form-group">
                <label>Description</label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe what happened..."
                  rows="6"
                ></textarea>
              </div>

              <div className="timeline-modal-actions">
                <button
                  type="button"
                  className="timeline-cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="timeline-submit-btn"
                  disabled={saving}
                >
                  {saving ? "Creating..." : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedEvent && (
        <div
          className="timeline-modal-overlay"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="timeline-detail-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="timeline-modal-header">
              <div>
                <span>TIMELINE RECORD</span>
                <h2>{selectedEvent.title}</h2>
              </div>

              <button onClick={() => setSelectedEvent(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="timeline-detail-grid">
              <div className="timeline-detail-item">
                <span>RELATED CASE</span>

                <strong>
                  {getCaseTitle(selectedEvent.case)}
                </strong>
              </div>

              <div className="timeline-detail-item">
                <span>EVENT DATE</span>

                <strong>
                  {formatDateTime(selectedEvent.event_date)}
                </strong>
              </div>

              <div className="timeline-detail-item">
                <span>RECORDED</span>

                <strong>
                  {formatDate(selectedEvent.created_at)}
                </strong>
              </div>
            </div>

            <div className="timeline-detail-description">
              <span>EVENT DESCRIPTION</span>

              <p>
                {selectedEvent.description ||
                  "No description provided."}
              </p>
            </div>

            <div className="timeline-detail-actions">
              <button
                className="timeline-delete-btn"
                onClick={() =>
                  handleDelete(selectedEvent.id)
                }
              >
                <Trash2 size={17} />
                Delete Event
              </button>

              <button
                className="timeline-cancel-btn"
                onClick={() => setSelectedEvent(null)}
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

export default Timeline;