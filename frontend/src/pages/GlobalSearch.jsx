import { useEffect, useMemo, useState } from "react";
import {
  Search,
  X,
  FileSearch,
  Briefcase,
  UserRound,
  Database,
  ClipboardList,
  Lightbulb,
  StickyNote,
  RefreshCw,
} from "lucide-react";
import api from "../services/api";
import "./GlobalSearch.css";

function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const [cases, setCases] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [suspects, setSuspects] = useState([]);
  const [investigations, setInvestigations] = useState([]);
  const [clues, setClues] = useState([]);
  const [notes, setNotes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const casesResponse = await api.get("/cases/");
      const evidenceResponse = await api.get("/evidence/");
      const suspectsResponse = await api.get("/suspects/");
      const investigationsResponse = await api.get(
        "/investigations/"
      );
      const cluesResponse = await api.get("/clues/");
      const notesResponse = await api.get("/notes/");

      setCases(
        casesResponse.data.results ||
          casesResponse.data ||
          []
      );

      setEvidence(
        evidenceResponse.data.results ||
          evidenceResponse.data ||
          []
      );

      setSuspects(
        suspectsResponse.data.results ||
          suspectsResponse.data ||
          []
      );

      setInvestigations(
        investigationsResponse.data.results ||
          investigationsResponse.data ||
          []
      );

      setClues(
        cluesResponse.data.results ||
          cluesResponse.data ||
          []
      );

      setNotes(
        notesResponse.data.results ||
          notesResponse.data ||
          []
      );
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load investigation records."
      );
    } finally {
      setLoading(false);
    }
  }

useEffect(() => {
  const timer = setTimeout(() => {
    loadData();
  }, 0);

  return () => clearTimeout(timer);
}, []);

  const normalize = (value) => {
    return String(value || "").toLowerCase();
  };

  const filteredResults = useMemo(() => {
    const search = query.trim().toLowerCase();

    const matches = (item, fields) => {
      if (!search) {
        return true;
      }

      return fields.some((field) =>
        normalize(item[field]).includes(search)
      );
    };

    return {
      cases: cases.filter((item) =>
        matches(item, [
          "case_number",
          "title",
          "description",
          "location",
          "status",
          "priority",
        ])
      ),

      evidence: evidence.filter((item) =>
        matches(item, [
          "title",
          "description",
          "evidence_type",
          "collected_by_username",
        ])
      ),

      suspects: suspects.filter((item) =>
        matches(item, [
          "name",
          "occupation",
          "status",
          "description",
        ])
      ),

      investigations: investigations.filter((item) =>
        matches(item, [
          "title",
          "findings",
          "investigator_username",
        ])
      ),

      clues: clues.filter((item) =>
        matches(item, [
          "title",
          "description",
        ])
      ),

      notes: notes.filter((item) =>
        matches(item, [
          "content",
        ])
      ),
    };
  }, [
    query,
    cases,
    evidence,
    suspects,
    investigations,
    clues,
    notes,
  ]);

  const resultGroups = [
    {
      key: "cases",
      label: "Cases",
      icon: Briefcase,
      data: filteredResults.cases,
    },
    {
      key: "evidence",
      label: "Evidence",
      icon: Database,
      data: filteredResults.evidence,
    },
    {
      key: "suspects",
      label: "Suspects",
      icon: UserRound,
      data: filteredResults.suspects,
    },
    {
      key: "investigations",
      label: "Investigations",
      icon: ClipboardList,
      data: filteredResults.investigations,
    },
    {
      key: "clues",
      label: "Clues",
      icon: Lightbulb,
      data: filteredResults.clues,
    },
    {
      key: "notes",
      label: "Notes",
      icon: StickyNote,
      data: filteredResults.notes,
    },
  ];

  const visibleGroups =
    filter === "all"
      ? resultGroups
      : resultGroups.filter(
          (group) => group.key === filter
        );

  const totalResults = Object.values(
    filteredResults
  ).reduce(
    (total, items) => total + items.length,
    0
  );

  const getTitle = (group, item) => {
    if (group === "cases") {
      return `${item.case_number || "CASE"} — ${
        item.title || "Untitled Case"
      }`;
    }

    if (group === "notes") {
      return item.content || "Investigation Note";
    }

    return (
      item.title ||
      item.name ||
      "Untitled Record"
    );
  };

  const getDescription = (group, item) => {
    if (group === "cases") {
      return (
        item.description ||
        "No case description available."
      );
    }

    if (group === "notes") {
      return "Case investigation note";
    }

    return (
      item.description ||
      item.findings ||
      "No additional information available."
    );
  };

  return (
    <div className="page-container global-search-page">
      <div className="page-header">
        <div>
          <div className="eyebrow">
            <FileSearch size={16} />
            DIGITAL INTELLIGENCE
          </div>

          <h1>Global Search</h1>

          <p>
            Search across cases, evidence, suspects,
            investigations, clues and notes.
          </p>
        </div>

        <button
          className="btn btn-secondary"
          onClick={loadData}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div className="search-panel">
        <div className="global-search-input">
          <Search size={22} />

          <input
            type="text"
            placeholder="Search investigations..."
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
          />

          {query && (
            <button
              type="button"
              className="search-clear"
              onClick={() => setQuery("")}
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="search-filters">
          <button
            className={
              filter === "all" ? "active" : ""
            }
            onClick={() => setFilter("all")}
          >
            All
          </button>

          <button
            className={
              filter === "cases" ? "active" : ""
            }
            onClick={() => setFilter("cases")}
          >
            Cases
          </button>

          <button
            className={
              filter === "evidence" ? "active" : ""
            }
            onClick={() => setFilter("evidence")}
          >
            Evidence
          </button>

          <button
            className={
              filter === "suspects" ? "active" : ""
            }
            onClick={() => setFilter("suspects")}
          >
            Suspects
          </button>

          <button
            className={
              filter === "investigations"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter("investigations")
            }
          >
            Investigations
          </button>

          <button
            className={
              filter === "clues" ? "active" : ""
            }
            onClick={() => setFilter("clues")}
          >
            Clues
          </button>

          <button
            className={
              filter === "notes" ? "active" : ""
            }
            onClick={() => setFilter("notes")}
          >
            Notes
          </button>
        </div>
      </div>

      {!loading && !error && (
        <div className="search-summary">
          <span>
            <strong>{totalResults}</strong> records found
          </span>

          {query && (
            <span>
              for <strong>"{query}"</strong>
            </span>
          )}
        </div>
      )}

      {loading && (
        <div className="search-state">
          <div className="loader"></div>
          <p>Scanning investigation records...</p>
        </div>
      )}

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      {!loading &&
        !error &&
        visibleGroups.map((group) => {
          if (group.data.length === 0) {
            return null;
          }

          const Icon = group.icon;

          return (
            <section
              className="search-results-section"
              key={group.key}
            >
              <div className="section-heading">
                <div className="section-title">
                  <Icon size={19} />
                  <h2>{group.label}</h2>
                </div>

                <span>{group.data.length}</span>
              </div>

              <div className="search-results-grid">
                {group.data.map((item) => (
                  <div
                    className="search-result-card"
                    key={`${group.key}-${item.id}`}
                  >
                    <div className="result-icon">
                      <Icon size={19} />
                    </div>

                    <div className="result-content">
                      <h3>
                        {getTitle(
                          group.key,
                          item
                        )}
                      </h3>

                      <p>
                        {getDescription(
                          group.key,
                          item
                        )}
                      </p>

                      <span className="result-meta">
                        Record ID #{item.id}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

      {!loading &&
        !error &&
        totalResults === 0 && (
          <div className="empty-search">
            <Search size={42} />

            <h2>No records found</h2>

            <p>
              Try another search term or change the
              selected category.
            </p>

            {query && (
              <button
                className="btn btn-primary"
                onClick={() => setQuery("")}
              >
                Clear Search
              </button>
            )}
          </div>
        )}
    </div>
  );
}

export default GlobalSearch;