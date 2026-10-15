import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  FileSearch,
  Lightbulb,
  RefreshCw,
  Shield,
  User,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import "./EvidenceGraph.css";

const filterByCase = (items, caseId) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.filter(
    (item) => String(item.case) === String(caseId)
  );
};

function EvidenceGraph() {
  const navigate = useNavigate();

  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState("");

  const [evidence, setEvidence] = useState([]);
  const [suspects, setSuspects] = useState([]);
  const [investigations, setInvestigations] = useState([]);
  const [clues, setClues] = useState([]);

  const [selectedNode, setSelectedNode] = useState(null);

  const [loading, setLoading] = useState(true);
  const [graphLoading, setGraphLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedCase = useMemo(() => {
    return cases.find(
      (item) => String(item.id) === String(selectedCaseId)
    );
  }, [cases, selectedCaseId]);

  const fetchCases = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/cases/");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      setCases(data);

      if (data.length > 0) {
        setSelectedCaseId(String(data[0].id));
      }
    } catch (err) {
      console.error("Unable to load cases:", err);
      setError("Unable to load investigation cases.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGraphData = useCallback(async (caseId) => {
    if (!caseId) {
      return;
    }

    try {
      setGraphLoading(true);
      setError("");
      setSelectedNode(null);

      const [
        evidenceResponse,
        suspectsResponse,
        investigationsResponse,
        cluesResponse,
      ] = await Promise.all([
        api.get("/evidence/"),
        api.get("/suspects/"),
        api.get("/investigations/"),
        api.get("/clues/"),
      ]);

      const evidenceData = Array.isArray(
        evidenceResponse.data
      )
        ? evidenceResponse.data
        : evidenceResponse.data.results || [];

      const suspectsData = Array.isArray(
        suspectsResponse.data
      )
        ? suspectsResponse.data
        : suspectsResponse.data.results || [];

      const investigationsData = Array.isArray(
        investigationsResponse.data
      )
        ? investigationsResponse.data
        : investigationsResponse.data.results || [];

      const cluesData = Array.isArray(
        cluesResponse.data
      )
        ? cluesResponse.data
        : cluesResponse.data.results || [];

      setEvidence(
        filterByCase(evidenceData, caseId)
      );

      setSuspects(
        filterByCase(suspectsData, caseId)
      );

      setInvestigations(
        filterByCase(
          investigationsData,
          caseId
        )
      );

      setClues(
        filterByCase(cluesData, caseId)
      );
    } catch (err) {
      console.error(
        "Unable to load graph data:",
        err
      );

      setError(
        "Unable to load relationship data."
      );
    } finally {
      setGraphLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCases();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [fetchCases]);

  useEffect(() => {
    if (!selectedCaseId) {
      return;
    }

    const timer = setTimeout(() => {
      fetchGraphData(selectedCaseId);
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [selectedCaseId, fetchGraphData]);

  const totalConnections =
    evidence.length +
    suspects.length +
    investigations.length +
    clues.length;

  const handleRefresh = () => {
    fetchGraphData(selectedCaseId);
  };

  const handleNodeClick = (type, data) => {
    setSelectedNode({
      type,
      data,
    });
  };

  const closeDetails = () => {
    setSelectedNode(null);
  };

  const getNodeClass = (type, id) => {
    if (
      selectedNode?.type === type &&
      String(selectedNode.data.id) === String(id)
    ) {
      return "graph-node graph-small-node graph-node-selected";
    }

    return "graph-node graph-small-node";
  };

  if (loading) {
    return (
      <div className="evidence-graph-page">
        <div className="graph-loading">
          <RefreshCw
            size={30}
            className="graph-spin"
          />

          <h2>
            Loading Investigation Graph
          </h2>

          <p>
            Building the relationship network...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="evidence-graph-page">
      <div className="graph-header">
        <div>
          <button
            type="button"
            className="graph-back-button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            <ArrowLeft size={17} />
            Dashboard
          </button>

          <div className="graph-title-row">
            <div className="graph-title-icon">
              <Activity size={25} />
            </div>

            <div>
              <span className="graph-eyebrow">
                DIGITAL FORENSICS
              </span>

              <h1>
                Evidence Relationship Graph
              </h1>

              <p>
                Visualize relationships between
                cases, evidence, suspects, clues
                and investigations.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="graph-refresh-button"
          onClick={handleRefresh}
          disabled={graphLoading}
        >
          <RefreshCw
            size={17}
            className={
              graphLoading
                ? "graph-spin"
                : ""
            }
          />

          Refresh
        </button>
      </div>

      {error && (
        <div className="graph-error">
          <AlertCircle size={19} />

          <span>{error}</span>
        </div>
      )}

      <div className="graph-controls">
        <div className="graph-control-group">
          <label htmlFor="case-select">
            SELECT INVESTIGATION CASE
          </label>

          <select
            id="case-select"
            value={selectedCaseId}
            onChange={(event) => {
              setSelectedCaseId(
                event.target.value
              );
              setSelectedNode(null);
            }}
          >
            {cases.map((item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.case_number} —{" "}
                {item.title}
              </option>
            ))}
          </select>
        </div>

        <div className="graph-summary">
          <div>
            <strong>
              {totalConnections}
            </strong>

            <span>
              Connections
            </span>
          </div>

          <div>
            <strong>
              {evidence.length}
            </strong>

            <span>
              Evidence
            </span>
          </div>

          <div>
            <strong>
              {suspects.length}
            </strong>

            <span>
              Suspects
            </span>
          </div>

          <div>
            <strong>
              {clues.length}
            </strong>

            <span>
              Clues
            </span>
          </div>
        </div>
      </div>

      {selectedCase && (
        <div className="graph-workspace">
          <div className="graph-canvas">
            <div className="graph-grid"></div>

            <div className="graph-line line-evidence"></div>

            <div className="graph-line line-suspects"></div>

            <div className="graph-line line-investigations"></div>

            <div className="graph-line line-clues"></div>

            <button
              type="button"
              className={
                selectedNode?.type === "case"
                  ? "graph-node graph-case-node graph-node-selected"
                  : "graph-node graph-case-node"
              }
              onClick={() =>
                handleNodeClick(
                  "case",
                  selectedCase
                )
              }
            >
              <div className="graph-node-icon">
                <Briefcase size={24} />
              </div>

              <div>
                <span className="graph-node-type">
                  CASE
                </span>

                <strong>
                  {selectedCase.case_number}
                </strong>

                <p>
                  {selectedCase.title}
                </p>
              </div>
            </button>

            <div className="graph-column graph-evidence-column">
              <div className="graph-column-title">
                <FileSearch size={17} />

                Evidence

                <span>
                  {evidence.length}
                </span>
              </div>

              {evidence.length === 0 ? (
                <div className="graph-empty-node">
                  No evidence
                </div>
              ) : (
                evidence.map((item) => (
                  <button
                    type="button"
                    className={getNodeClass(
                      "evidence",
                      item.id
                    )}
                    key={`evidence-${item.id}`}
                    onClick={() =>
                      handleNodeClick(
                        "evidence",
                        item
                      )
                    }
                  >
                    <div className="graph-small-icon evidence-icon">
                      <FileSearch size={17} />
                    </div>

                    <div>
                      <span className="graph-node-type">
                        EVIDENCE
                      </span>

                      <strong>
                        {item.title}
                      </strong>

                      <p>
                        {item.evidence_type ||
                          "Unknown type"}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="graph-column graph-suspect-column">
              <div className="graph-column-title">
                <Users size={17} />

                Suspects

                <span>
                  {suspects.length}
                </span>
              </div>

              {suspects.length === 0 ? (
                <div className="graph-empty-node">
                  No suspects
                </div>
              ) : (
                suspects.map((item) => (
                  <button
                    type="button"
                    className={getNodeClass(
                      "suspect",
                      item.id
                    )}
                    key={`suspect-${item.id}`}
                    onClick={() =>
                      handleNodeClick(
                        "suspect",
                        item
                      )
                    }
                  >
                    <div className="graph-small-icon suspect-icon">
                      <User size={17} />
                    </div>

                    <div>
                      <span className="graph-node-type">
                        SUSPECT
                      </span>

                      <strong>
                        {item.name}
                      </strong>

                      <p>
                        {item.status ||
                          "Under review"}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="graph-column graph-investigation-column">
              <div className="graph-column-title">
                <Shield size={17} />

                Investigations

                <span>
                  {investigations.length}
                </span>
              </div>

              {investigations.length === 0 ? (
                <div className="graph-empty-node">
                  No investigations
                </div>
              ) : (
                investigations.map((item) => (
                  <button
                    type="button"
                    className={getNodeClass(
                      "investigation",
                      item.id
                    )}
                    key={`investigation-${item.id}`}
                    onClick={() =>
                      handleNodeClick(
                        "investigation",
                        item
                      )
                    }
                  >
                    <div className="graph-small-icon investigation-icon">
                      <Shield size={17} />
                    </div>

                    <div>
                      <span className="graph-node-type">
                        INVESTIGATION
                      </span>

                      <strong>
                        {item.title}
                      </strong>

                      <p>
                        {item.findings
                          ? "Findings recorded"
                          : "Investigation active"}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="graph-column graph-clue-column">
              <div className="graph-column-title">
                <Lightbulb size={17} />

                Clues

                <span>
                  {clues.length}
                </span>
              </div>

              {clues.length === 0 ? (
                <div className="graph-empty-node">
                  No clues
                </div>
              ) : (
                clues.map((item) => (
                  <button
                    type="button"
                    className={getNodeClass(
                      "clue",
                      item.id
                    )}
                    key={`clue-${item.id}`}
                    onClick={() =>
                      handleNodeClick(
                        "clue",
                        item
                      )
                    }
                  >
                    <div className="graph-small-icon clue-icon">
                      <Lightbulb size={17} />
                    </div>

                    <div>
                      <span className="graph-node-type">
                        CLUE
                      </span>

                      <strong>
                        {item.title}
                      </strong>

                      <p>
                        {item.resolved
                          ? "Resolved"
                          : "Unresolved"}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {selectedNode && (
            <div className="graph-details-panel">
              <div className="graph-details-header">
                <div>
                  <span className="graph-details-eyebrow">
                    SELECTED NODE
                  </span>

                  <h2>
                    {selectedNode.type}
                    {" "}
                    DETAILS
                  </h2>
                </div>

                <button
                  type="button"
                  className="graph-details-close"
                  onClick={closeDetails}
                  aria-label="Close details"
                >
                  <X size={19} />
                </button>
              </div>

              {selectedNode.type === "case" && (
                <div className="graph-details-content">
                  <div className="graph-detail-icon case-detail-icon">
                    <Briefcase size={23} />
                  </div>

                  <div className="graph-detail-main">
                    <span>
                      CASE NUMBER
                    </span>

                    <strong>
                      {selectedNode.data.case_number ||
                        "N/A"}
                    </strong>
                  </div>

                  <div className="graph-detail-row">
                    <span>
                      Title
                    </span>

                    <strong>
                      {selectedNode.data.title ||
                        "N/A"}
                    </strong>
                  </div>

                  <div className="graph-detail-row">
                    <span>
                      Status
                    </span>

                    <strong>
                      {selectedNode.data.status ||
                        "N/A"}
                    </strong>
                  </div>

                  <div className="graph-detail-row">
                    <span>
                      Priority
                    </span>

                    <strong>
                      {selectedNode.data.priority ||
                        "N/A"}
                    </strong>
                  </div>

                  <div className="graph-detail-description">
                    <span>
                      Description
                    </span>

                    <p>
                      {selectedNode.data.description ||
                        "No description available."}
                    </p>
                  </div>
                </div>
              )}

              {selectedNode.type === "evidence" && (
                <div className="graph-details-content">
                  <div className="graph-detail-icon evidence-detail-icon">
                    <FileSearch size={23} />
                  </div>

                  <div className="graph-detail-main">
                    <span>
                      EVIDENCE
                    </span>

                    <strong>
                      {selectedNode.data.title ||
                        "Untitled Evidence"}
                    </strong>
                  </div>

                  <div className="graph-detail-row">
                    <span>
                      Type
                    </span>

                    <strong>
                      {selectedNode.data.evidence_type ||
                        "N/A"}
                    </strong>
                  </div>

                  <div className="graph-detail-row">
                    <span>
                      Verification
                    </span>

                    <strong
                      className={
                        selectedNode.data.verified
                          ? "detail-success"
                          : "detail-warning"
                      }
                    >
                      {selectedNode.data.verified
                        ? "Verified"
                        : "Unverified"}
                    </strong>
                  </div>

                  <div className="graph-detail-status">
                    {selectedNode.data.verified ? (
                      <>
                        <CheckCircle2 size={18} />
                        Evidence integrity status:
                        verified
                      </>
                    ) : (
                      <>
                        <XCircle size={18} />
                        Evidence requires
                        verification
                      </>
                    )}
                  </div>

                  <div className="graph-detail-row">
                    <span>
                      SHA-256
                    </span>

                    <strong className="hash-value">
                      {selectedNode.data.file_hash ||
                        "Hash unavailable"}
                    </strong>
                  </div>

                  <div className="graph-detail-description">
                    <span>
                      Description
                    </span>

                    <p>
                      {selectedNode.data.description ||
                        "No description available."}
                    </p>
                  </div>
                </div>
              )}

              {selectedNode.type === "suspect" && (
                <div className="graph-details-content">
                  <div className="graph-detail-icon suspect-detail-icon">
                    <User size={23} />
                  </div>

                  <div className="graph-detail-main">
                    <span>
                      SUSPECT
                    </span>

                    <strong>
                      {selectedNode.data.name ||
                        "Unknown"}
                    </strong>
                  </div>

                  <div className="graph-detail-row">
                    <span>
                      Age
                    </span>

                    <strong>
                      {selectedNode.data.age ||
                        "N/A"}
                    </strong>
                  </div>

                  <div className="graph-detail-row">
                    <span>
                      Occupation
                    </span>

                    <strong>
                      {selectedNode.data.occupation ||
                        "N/A"}
                    </strong>
                  </div>

                  <div className="graph-detail-row">
                    <span>
                      Status
                    </span>

                    <strong>
                      {selectedNode.data.status ||
                        "N/A"}
                    </strong>
                  </div>

                  <div className="graph-detail-description">
                    <span>
                      Description
                    </span>

                    <p>
                      {selectedNode.data.description ||
                        "No description available."}
                    </p>
                  </div>
                </div>
              )}

              {selectedNode.type ===
                "investigation" && (
                <div className="graph-details-content">
                  <div className="graph-detail-icon investigation-detail-icon">
                    <Shield size={23} />
                  </div>

                  <div className="graph-detail-main">
                    <span>
                      INVESTIGATION
                    </span>

                    <strong>
                      {selectedNode.data.title ||
                        "Untitled Investigation"}
                    </strong>
                  </div>

                  <div className="graph-detail-row">
                    <span>
                      Investigator
                    </span>

                    <strong>
                      {selectedNode.data.investigator_username ||
                        selectedNode.data.investigator ||
                        "N/A"}
                    </strong>
                  </div>

                  <div className="graph-detail-description">
                    <span>
                      Findings
                    </span>

                    <p>
                      {selectedNode.data.findings ||
                        "No findings recorded."}
                    </p>
                  </div>
                </div>
              )}

              {selectedNode.type === "clue" && (
                <div className="graph-details-content">
                  <div className="graph-detail-icon clue-detail-icon">
                    <Lightbulb size={23} />
                  </div>

                  <div className="graph-detail-main">
                    <span>
                      CLUE
                    </span>

                    <strong>
                      {selectedNode.data.title ||
                        "Untitled Clue"}
                    </strong>
                  </div>

                  <div className="graph-detail-row">
                    <span>
                      Importance
                    </span>

                    <strong>
                      {selectedNode.data.importance ||
                        "N/A"}
                    </strong>
                  </div>

                  <div className="graph-detail-row">
                    <span>
                      Resolution
                    </span>

                    <strong
                      className={
                        selectedNode.data.resolved
                          ? "detail-success"
                          : "detail-warning"
                      }
                    >
                      {selectedNode.data.resolved
                        ? "Resolved"
                        : "Unresolved"}
                    </strong>
                  </div>

                  <div className="graph-detail-description">
                    <span>
                      Description
                    </span>

                    <p>
                      {selectedNode.data.description ||
                        "No description available."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!selectedCase && (
        <div className="graph-no-case">
          <Briefcase size={30} />

          <h2>
            No Investigation Cases
          </h2>

          <p>
            Create a case first to visualize
            its relationships.
          </p>
        </div>
      )}
    </div>
  );
}

export default EvidenceGraph;