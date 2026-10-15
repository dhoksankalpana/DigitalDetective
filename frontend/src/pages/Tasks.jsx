import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
  AlertTriangle,
  ListChecks,
} from "lucide-react";
import api from "../services/api";
import "./Tasks.css";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [cases, setCases] = useState([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const [showCreateForm, setShowCreateForm] = useState(false);

  const [form, setForm] = useState({
    case: "",
    title: "",
    description: "",
    priority: "medium",
    status: "pending",
    due_date: "",
  });

  const loadData = async () => {
    try {
      const [tasksResponse, casesResponse] =
        await Promise.all([
          api.get("/tasks/"),
          api.get("/cases/"),
        ]);

      const taskData = Array.isArray(tasksResponse.data)
        ? tasksResponse.data
        : tasksResponse.data?.results || [];

      const caseData = Array.isArray(casesResponse.data)
        ? casesResponse.data
        : casesResponse.data?.results || [];

      setTasks(taskData);
      setCases(caseData);
      setError("");
    } catch (err) {
      console.error("Load tasks and cases error:", err);

      if (err.response?.status === 401) {
        setError(
          "Your session has expired. Please sign in again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "You do not have permission to view investigation tasks."
        );
      } else {
        setError(
          "Unable to load investigation tasks."
        );
      }
    } finally {
      setLoading(false);
    }
  };

 useEffect(() => {
  let cancelled = false;

  const fetchInitialData = async () => {
    try {
      const [tasksResponse, casesResponse] =
        await Promise.all([
          api.get("/tasks/"),
          api.get("/cases/"),
        ]);

      if (cancelled) {
        return;
      }

      const taskData = Array.isArray(tasksResponse.data)
        ? tasksResponse.data
        : tasksResponse.data?.results || [];

      const caseData = Array.isArray(casesResponse.data)
        ? casesResponse.data
        : casesResponse.data?.results || [];

      setTasks(taskData);
      setCases(caseData);
      setError("");
    } catch (err) {
      if (cancelled) {
        return;
      }

      console.error(
        "Load tasks and cases error:",
        err
      );

      if (err.response?.status === 401) {
        setError(
          "Your session has expired. Please sign in again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "You do not have permission to view investigation tasks."
        );
      } else {
        setError(
          "Unable to load investigation tasks."
        );
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  };

  fetchInitialData();

  return () => {
    cancelled = true;
  };
}, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreateTask = async (event) => {
    event.preventDefault();

    if (!form.case) {
      setError("Please select a case.");
      return;
    }

    if (!form.title.trim()) {
      setError("Please enter a task title.");
      return;
    }

    try {
      setCreating(true);
      setError("");
      setMessage("");

      const payload = {
        case: Number(form.case),
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        status: form.status,
        due_date: form.due_date || null,
      };

      const response = await api.post(
        "/tasks/",
        payload
      );

      setTasks((previous) => [
        response.data,
        ...previous,
      ]);

      setForm({
        case: "",
        title: "",
        description: "",
        priority: "medium",
        status: "pending",
        due_date: "",
      });

      setShowCreateForm(false);

      setMessage(
        "Investigation task created successfully."
      );
    } catch (err) {
      console.error(
        "Create task error:",
        err
      );

      const responseData = err.response?.data;

      if (
        responseData &&
        typeof responseData === "object"
      ) {
        const messages = Object.entries(
          responseData
        ).flatMap(([field, values]) => {
          const list = Array.isArray(values)
            ? values
            : [values];

          return list.map(
            (value) =>
              `${field}: ${value}`
          );
        });

        setError(
          messages.join(" ") ||
            "Unable to create investigation task."
        );
      } else {
        setError(
          "Unable to create investigation task."
        );
      }
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (
    task,
    newStatus
  ) => {
    try {
      setUpdatingId(task.id);
      setError("");
      setMessage("");

      const response = await api.patch(
        `/tasks/${task.id}/`,
        {
          status: newStatus,
        }
      );

      setTasks((previous) =>
        previous.map((item) =>
          item.id === task.id
            ? response.data
            : item
        )
      );

      setMessage(
        "Task status updated successfully."
      );
    } catch (err) {
      console.error(
        "Update task error:",
        err
      );

      const responseData =
        err.response?.data;

      if (
        responseData &&
        typeof responseData === "object"
      ) {
        const messages = Object.values(
          responseData
        )
          .flat()
          .map((value) =>
            String(value)
          );

        setError(
          messages.join(" ") ||
            "Unable to update task status."
        );
      } else {
        setError(
          "Unable to update task status."
        );
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this investigation task?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingId(id);
      setError("");
      setMessage("");

      await api.delete(
        `/tasks/${id}/`
      );

      setTasks((previous) =>
        previous.filter(
          (task) => task.id !== id
        )
      );

      setMessage(
        "Investigation task deleted successfully."
      );
    } catch (err) {
      console.error(
        "Delete task error:",
        err
      );

      setError(
        "Unable to delete investigation task."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredTasks = tasks.filter(
    (task) => {
      const searchValue =
        search.toLowerCase().trim();

      const title =
        task.title || "";

      const description =
        task.description || "";

      const caseTitle =
        task.case_title || "";

      const caseNumber =
        task.case_number || "";

      const matchesSearch =
        title
          .toLowerCase()
          .includes(searchValue) ||
        description
          .toLowerCase()
          .includes(searchValue) ||
        caseTitle
          .toLowerCase()
          .includes(searchValue) ||
        caseNumber
          .toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "all" ||
        task.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    }
  );

  const getPriorityLabel = (
    priority
  ) => {
    const labels = {
      low: "Low",
      medium: "Medium",
      high: "High",
      critical: "Critical",
    };

    return labels[priority] || priority;
  };

  const getStatusLabel = (
    status
  ) => {
    const labels = {
      pending: "Pending",
      in_progress: "In Progress",
      completed: "Completed",
      cancelled: "Cancelled",
    };

    return labels[status] || status;
  };

  const formatDate = (date) => {
    if (!date) {
      return "No due date";
    }

    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const totalTasks = tasks.length;

  const pendingTasks =
    tasks.filter(
      (task) =>
        task.status === "pending"
    ).length;

  const activeTasks =
    tasks.filter(
      (task) =>
        task.status ===
        "in_progress"
    ).length;

  const completedTasks =
    tasks.filter(
      (task) =>
        task.status ===
        "completed"
    ).length;

  const overdueTasks =
    tasks.filter(
      (task) => task.is_overdue
    ).length;

  return (
    <div className="tasks-page">

      <div className="tasks-background-grid"></div>

      <div className="tasks-glow tasks-glow-one"></div>

      <div className="tasks-glow tasks-glow-two"></div>

      <div className="tasks-container">

        <div className="tasks-header">

          <div>

            <div className="tasks-eyebrow">
              <ListChecks size={16} />
              INVESTIGATION OPERATIONS
            </div>

            <h1>
              Investigation Tasks
            </h1>

            <p>
              Assign, monitor and manage
              investigation tasks across
              active digital cases.
            </p>

          </div>

          <div className="tasks-header-actions">

            <button
              type="button"
              className="tasks-refresh-button"
              onClick={loadData}
              disabled={loading}
            >
              <RefreshCw
                size={17}
                className={
                  loading
                    ? "tasks-spin"
                    : ""
                }
              />

              Refresh
            </button>

            <button
              type="button"
              className="tasks-create-button"
              onClick={() => {
                setShowCreateForm(true);
                setError("");
                setMessage("");
              }}
            >
              <Plus size={18} />

              New Task
            </button>

          </div>

        </div>

        {error && (
          <div className="tasks-alert tasks-alert-error">

            <AlertTriangle size={18} />

            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
            >
              <X size={17} />
            </button>

          </div>
        )}

        {message && (
          <div className="tasks-alert tasks-alert-success">

            <CheckCircle2 size={18} />

            <span>
              {message}
            </span>

            <button
              type="button"
              onClick={() =>
                setMessage("")
              }
            >
              <X size={17} />
            </button>

          </div>
        )}

        <div className="tasks-stat-grid">

          <div className="tasks-stat-card">

            <div className="tasks-stat-icon">
              <ListChecks size={21} />
            </div>

            <div>
              <span>
                Total Tasks
              </span>

              <strong>
                {totalTasks}
              </strong>
            </div>

          </div>

          <div className="tasks-stat-card">

            <div className="tasks-stat-icon">
              <Clock3 size={21} />
            </div>

            <div>
              <span>
                Pending
              </span>

              <strong>
                {pendingTasks}
              </strong>
            </div>

          </div>

          <div className="tasks-stat-card">

            <div className="tasks-stat-icon">
              <RefreshCw size={21} />
            </div>

            <div>
              <span>
                In Progress
              </span>

              <strong>
                {activeTasks}
              </strong>
            </div>

          </div>

          <div className="tasks-stat-card">

            <div className="tasks-stat-icon">
              <CheckCircle2 size={21} />
            </div>

            <div>
              <span>
                Completed
              </span>

              <strong>
                {completedTasks}
              </strong>
            </div>

          </div>

          <div className="tasks-stat-card tasks-stat-danger">

            <div className="tasks-stat-icon">
              <AlertTriangle size={21} />
            </div>

            <div>
              <span>
                Overdue
              </span>

              <strong>
                {overdueTasks}
              </strong>
            </div>

          </div>

        </div>

        <div className="tasks-toolbar">

          <div className="tasks-search">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search task, case or description..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >
            <option value="all">
              All Statuses
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="in_progress">
              In Progress
            </option>

            <option value="completed">
              Completed
            </option>

            <option value="cancelled">
              Cancelled
            </option>
          </select>

          <select
            value={priorityFilter}
            onChange={(event) =>
              setPriorityFilter(
                event.target.value
              )
            }
          >
            <option value="all">
              All Priorities
            </option>

            <option value="critical">
              Critical
            </option>

            <option value="high">
              High
            </option>

            <option value="medium">
              Medium
            </option>

            <option value="low">
              Low
            </option>
          </select>

        </div>

        {loading ? (
          <div className="tasks-loading">

            <RefreshCw
              size={28}
              className="tasks-spin"
            />

            <span>
              Loading investigation tasks...
            </span>

          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="tasks-empty">

            <ListChecks size={42} />

            <h3>
              No investigation tasks found
            </h3>

            <p>
              Create your first task or
              adjust your search filters.
            </p>

            <button
              type="button"
              className="tasks-create-button"
              onClick={() =>
                setShowCreateForm(true)
              }
            >
              <Plus size={18} />

              Create Task
            </button>

          </div>
        ) : (
          <div className="tasks-list">

            {filteredTasks.map(
              (task) => (
                <div
                  className={`task-card ${
                    task.is_overdue
                      ? "task-card-overdue"
                      : ""
                  }`}
                  key={task.id}
                >

                  <div className="task-card-main">

                    <div className="task-card-top">

                      <div>

                        <span className="task-case">
                          {
                            task.case_number ||
                            "CASE"
                          }
                        </span>

                        <h3>
                          {task.title}
                        </h3>

                      </div>

                      <div className="task-badges">

                        <span
                          className={`task-priority priority-${task.priority}`}
                        >
                          {getPriorityLabel(
                            task.priority
                          )}
                        </span>

                        <span
                          className={`task-status status-${task.status}`}
                        >
                          {getStatusLabel(
                            task.status
                          )}
                        </span>

                      </div>

                    </div>

                    {task.description && (
                      <p className="task-description">
                        {
                          task.description
                        }
                      </p>
                    )}

                    <div className="task-meta">

                      <span>
                        Case:{" "}
                        <strong>
                          {
                            task.case_title ||
                            "Unknown Case"
                          }
                        </strong>
                      </span>

                      <span>
                        Due:{" "}
                        <strong
                          className={
                            task.is_overdue
                              ? "task-overdue-text"
                              : ""
                          }
                        >
                          {formatDate(
                            task.due_date
                          )}
                        </strong>
                      </span>

                      {task.assigned_to_username && (
                        <span>
                          Assigned:{" "}
                          <strong>
                            {
                              task.assigned_to_username
                            }
                          </strong>
                        </span>
                      )}

                    </div>

                  </div>

                  <div className="task-card-actions">

                    {task.status !==
                      "completed" && (
                      <button
                        type="button"
                        className="task-complete-button"
                        onClick={() =>
                          handleStatusChange(
                            task,
                            "completed"
                          )
                        }
                        disabled={
                          updatingId ===
                          task.id
                        }
                      >
                        <CheckCircle2
                          size={16}
                        />

                        Complete
                      </button>
                    )}

                    {task.status ===
                      "pending" && (
                      <button
                        type="button"
                        className="task-progress-button"
                        onClick={() =>
                          handleStatusChange(
                            task,
                            "in_progress"
                          )
                        }
                        disabled={
                          updatingId ===
                          task.id
                        }
                      >
                        <Clock3
                          size={16}
                        />

                        Start
                      </button>
                    )}

                    {task.status ===
                      "in_progress" && (
                      <button
                        type="button"
                        className="task-progress-button"
                        onClick={() =>
                          handleStatusChange(
                            task,
                            "pending"
                          )
                        }
                        disabled={
                          updatingId ===
                          task.id
                        }
                      >
                        <Clock3
                          size={16}
                        />

                        Pause
                      </button>
                    )}

                    <button
                      type="button"
                      className="task-delete-button"
                      onClick={() =>
                        handleDelete(
                          task.id
                        )
                      }
                      disabled={
                        updatingId ===
                        task.id
                      }
                    >
                      <Trash2
                        size={16}
                      />
                    </button>

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </div>

      {showCreateForm && (
        <div className="task-modal-overlay">

          <div className="task-modal">

            <div className="task-modal-header">

              <div>

                <span>
                  NEW INVESTIGATION TASK
                </span>

                <h2>
                  Create Task
                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCreateForm(
                    false
                  )
                }
              >
                <X size={20} />
              </button>

            </div>

            <form
              onSubmit={
                handleCreateTask
              }
            >

              <div className="task-form-group">

                <label>
                  Case
                </label>

                <select
                  name="case"
                  value={form.case}
                  onChange={
                    handleInputChange
                  }
                  required
                >

                  <option value="">
                    Select a case
                  </option>

                  {cases.map(
                    (caseItem) => (
                      <option
                        key={
                          caseItem.id
                        }
                        value={
                          caseItem.id
                        }
                      >
                        {
                          caseItem.case_number
                        }{" "}
                        —{" "}
                        {
                          caseItem.title
                        }
                      </option>
                    )
                  )}

                </select>

              </div>

              <div className="task-form-group">

                <label>
                  Task Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={
                    handleInputChange
                  }
                  placeholder="Enter investigation task"
                  required
                />

              </div>

              <div className="task-form-group">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  value={
                    form.description
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Describe what needs to be investigated..."
                  rows="4"
                />

              </div>

              <div className="task-form-row">

                <div className="task-form-group">

                  <label>
                    Priority
                  </label>

                  <select
                    name="priority"
                    value={
                      form.priority
                    }
                    onChange={
                      handleInputChange
                    }
                  >

                    <option value="low">
                      Low
                    </option>

                    <option value="medium">
                      Medium
                    </option>

                    <option value="high">
                      High
                    </option>

                    <option value="critical">
                      Critical
                    </option>

                  </select>

                </div>

                <div className="task-form-group">

                  <label>
                    Status
                  </label>

                  <select
                    name="status"
                    value={
                      form.status
                    }
                    onChange={
                      handleInputChange
                    }
                  >

                    <option value="pending">
                      Pending
                    </option>

                    <option value="in_progress">
                      In Progress
                    </option>

                    <option value="completed">
                      Completed
                    </option>

                    <option value="cancelled">
                      Cancelled
                    </option>

                  </select>

                </div>

              </div>

              <div className="task-form-group">

                <label>
                  Due Date
                </label>

                <input
                  type="date"
                  name="due_date"
                  value={
                    form.due_date
                  }
                  onChange={
                    handleInputChange
                  }
                />

              </div>

              <div className="task-modal-actions">

                <button
                  type="button"
                  className="task-cancel-button"
                  onClick={() =>
                    setShowCreateForm(
                      false
                    )
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="tasks-create-button"
                  disabled={
                    creating
                  }
                >

                  {creating ? (
                    <>
                      <RefreshCw
                        size={17}
                        className="tasks-spin"
                      />

                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />

                      Create Task
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

export default Tasks;