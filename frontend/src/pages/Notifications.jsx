import { useEffect, useState } from "react";
import {
  Bell,
  Search,
  Check,
  CheckCheck,
  Trash2,
  X,
  RefreshCw,
  Eye,
  Filter,
  AlertTriangle,
  Info,
  ShieldAlert,
  Clock,
} from "lucide-react";

import api from "../services/api";
import "./Notifications.css";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/notifications/");

        setNotifications(
          Array.isArray(response.data)
            ? response.data
            : response.data.results || []
        );
      } catch (err) {
        console.error(err);
        setError("Unable to load notifications.");
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const refreshNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/notifications/");

      setNotifications(
        Array.isArray(response.data)
          ? response.data
          : response.data.results || []
      );
    } catch (err) {
      console.error(err);
      setError("Unable to refresh notifications.");
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    const text = search.toLowerCase();

    const matchesSearch =
      notification.title?.toLowerCase().includes(text) ||
      notification.message?.toLowerCase().includes(text);

    const matchesType =
      typeFilter === "all" ||
      notification.notification_type === typeFilter;

    return matchesSearch && matchesType;
  });

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  const readCount = notifications.filter(
    (notification) => notification.is_read
  ).length;

  const getNotificationType = (notification) => {
    if (!notification.notification_type) {
      return "info";
    }

    return notification.notification_type.toLowerCase();
  };

  const getTypeLabel = (type) => {
    const labels = {
      info: "Information",
      warning: "Warning",
      alert: "Alert",
      success: "Success",
      system: "System",
    };

    return labels[type] || type;
  };

  const getTypeIcon = (type) => {
    if (type === "warning") {
      return <AlertTriangle size={19} />;
    }

    if (type === "alert") {
      return <ShieldAlert size={19} />;
    }

    if (type === "success") {
      return <CheckCheck size={19} />;
    }

    return <Info size={19} />;
  };

  const getTypeClass = (type) => {
    if (type === "warning") {
      return "notification-warning";
    }

    if (type === "alert") {
      return "notification-alert";
    }

    if (type === "success") {
      return "notification-success";
    }

    return "notification-info";
  };

  const formatDate = (date) => {
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

  const markAsRead = async (notification) => {
    try {
      await api.patch(`/notifications/${notification.id}/`, {
        is_read: true,
      });

      setNotifications((previous) =>
        previous.map((item) =>
          item.id === notification.id
            ? { ...item, is_read: true }
            : item
        )
      );

      setSelectedNotification((previous) =>
        previous && previous.id === notification.id
          ? { ...previous, is_read: true }
          : previous
      );
    } catch (err) {
      console.error(err);
      setError("Unable to mark notification as read.");
    }
  };

  const markAsUnread = async (notification) => {
    try {
      await api.patch(`/notifications/${notification.id}/`, {
        is_read: false,
      });

      setNotifications((previous) =>
        previous.map((item) =>
          item.id === notification.id
            ? { ...item, is_read: false }
            : item
        )
      );

      setSelectedNotification((previous) =>
        previous && previous.id === notification.id
          ? { ...previous, is_read: false }
          : previous
      );
    } catch (err) {
      console.error(err);
      setError("Unable to mark notification as unread.");
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(
      (notification) => !notification.is_read
    );

    try {
      await Promise.all(
        unreadNotifications.map((notification) =>
          api.patch(`/notifications/${notification.id}/`, {
            is_read: true,
          })
        )
      );

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );
    } catch (err) {
      console.error(err);
      setError("Unable to mark all notifications as read.");
    }
  };

  const deleteNotification = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this notification?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/notifications/${id}/`);

      setNotifications((previous) =>
        previous.filter((notification) => notification.id !== id)
      );

      setSelectedNotification(null);
    } catch (err) {
      console.error(err);
      setError("Unable to delete notification.");
    }
  };

  return (
    <div className="notifications-page">
      <div className="notifications-grid"></div>

      <div className="notifications-container">
        <header className="notifications-header">
          <div>
            <div className="notifications-eyebrow">
              <Bell size={16} />
              SECURE ALERT NETWORK
            </div>

            <h1>Notifications</h1>

            <p>
              Monitor system alerts, case activity and important
              investigation updates.
            </p>
          </div>

          <div className="notifications-header-actions">
            <button
              className="notifications-refresh-btn"
              onClick={refreshNotifications}
            >
              <RefreshCw size={17} />
              Refresh
            </button>

            <button
              className="notifications-read-all-btn"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <CheckCheck size={17} />
              Mark All Read
            </button>
          </div>
        </header>

        {error && (
          <div className="notifications-error">
            <span>{error}</span>

            <button onClick={() => setError("")}>
              <X size={17} />
            </button>
          </div>
        )}

        <section className="notifications-stats">
          <div className="notification-stat-card">
            <div className="notification-stat-icon">
              <Bell size={22} />
            </div>

            <div>
              <span>Total Notifications</span>
              <strong>{notifications.length}</strong>
            </div>
          </div>

          <div className="notification-stat-card">
            <div className="notification-stat-icon unread-icon">
              <ShieldAlert size={22} />
            </div>

            <div>
              <span>Unread</span>
              <strong>{unreadCount}</strong>
            </div>
          </div>

          <div className="notification-stat-card">
            <div className="notification-stat-icon read-icon">
              <Check size={22} />
            </div>

            <div>
              <span>Read</span>
              <strong>{readCount}</strong>
            </div>
          </div>

          <div className="notification-stat-card">
            <div className="notification-stat-icon">
              <Eye size={22} />
            </div>

            <div>
              <span>Visible Results</span>
              <strong>{filteredNotifications.length}</strong>
            </div>
          </div>
        </section>

        <section className="notifications-toolbar">
          <div className="notifications-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search notifications..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            {search && (
              <button onClick={() => setSearch("")}>
                <X size={16} />
              </button>
            )}
          </div>

          <div className="notifications-filter">
            <Filter size={17} />

            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              <option value="all">All Types</option>
              <option value="info">Information</option>
              <option value="warning">Warning</option>
              <option value="alert">Alert</option>
              <option value="success">Success</option>
              <option value="system">System</option>
            </select>
          </div>
        </section>

        {loading ? (
          <div className="notifications-loading">
            <div className="notifications-spinner"></div>
            <p>Loading secure notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="notifications-empty">
            <Bell size={48} />

            <h2>No notifications found</h2>

            <p>
              There are currently no notifications matching your
              search.
            </p>
          </div>
        ) : (
          <section className="notifications-list">
            {filteredNotifications.map((notification) => {
              const type = getNotificationType(notification);

              return (
                <article
                  className={`notification-card ${
                    notification.is_read
                      ? "notification-card-read"
                      : "notification-card-unread"
                  }`}
                  key={notification.id}
                >
                  <div
                    className={`notification-icon ${getTypeClass(type)}`}
                  >
                    {getTypeIcon(type)}
                  </div>

                  <div className="notification-main">
                    <div className="notification-card-header">
                      <div>
                        <div className="notification-type">
                          {getTypeLabel(type)}
                        </div>

                        <h2>{notification.title}</h2>
                      </div>

                      {!notification.is_read && (
                        <span className="unread-badge">
                          UNREAD
                        </span>
                      )}
                    </div>

                    <p className="notification-message">
                      {notification.message}
                    </p>

                    <div className="notification-footer">
                      <div>
                        <Clock size={14} />
                        {formatDate(notification.created_at)}
                      </div>

                      <div className="notification-actions">
                        <button
                          onClick={() =>
                            setSelectedNotification(notification)
                          }
                        >
                          <Eye size={15} />
                          View
                        </button>

                        {notification.is_read ? (
                          <button
                            onClick={() =>
                              markAsUnread(notification)
                            }
                          >
                            <Bell size={15} />
                            Unread
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              markAsRead(notification)
                            }
                          >
                            <Check size={15} />
                            Mark Read
                          </button>
                        )}

                        <button
                          className="notification-delete"
                          onClick={() =>
                            deleteNotification(notification.id)
                          }
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>

      {selectedNotification && (
        <div
          className="notification-modal-overlay"
          onClick={() => setSelectedNotification(null)}
        >
          <div
            className="notification-detail-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="notification-modal-header">
              <div>
                <span>SECURE NOTIFICATION</span>

                <h2>{selectedNotification.title}</h2>
              </div>

              <button
                onClick={() => setSelectedNotification(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="notification-detail-body">
              <div className="notification-detail-type">
                {getTypeIcon(
                  getNotificationType(selectedNotification)
                )}

                <span>
                  {getTypeLabel(
                    getNotificationType(selectedNotification)
                  )}
                </span>
              </div>

              <div className="notification-detail-message">
                <span>MESSAGE</span>

                <p>{selectedNotification.message}</p>
              </div>

              <div className="notification-detail-info">
                <div>
                  <span>STATUS</span>

                  <strong>
                    {selectedNotification.is_read
                      ? "Read"
                      : "Unread"}
                  </strong>
                </div>

                <div>
                  <span>CREATED</span>

                  <strong>
                    {formatDate(
                      selectedNotification.created_at
                    )}
                  </strong>
                </div>
              </div>
            </div>

            <div className="notification-modal-actions">
              {selectedNotification.is_read ? (
                <button
                  className="notification-modal-unread"
                  onClick={() =>
                    markAsUnread(selectedNotification)
                  }
                >
                  <Bell size={16} />
                  Mark Unread
                </button>
              ) : (
                <button
                  className="notification-modal-read"
                  onClick={() =>
                    markAsRead(selectedNotification)
                  }
                >
                  <Check size={16} />
                  Mark as Read
                </button>
              )}

              <button
                className="notification-modal-delete"
                onClick={() =>
                  deleteNotification(selectedNotification.id)
                }
              >
                <Trash2 size={16} />
                Delete
              </button>

              <button
                className="notification-modal-close"
                onClick={() => setSelectedNotification(null)}
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

export default Notifications;