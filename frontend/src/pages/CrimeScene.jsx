import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  MapPin,
  Shield,
  Search,
  Users,
  Lightbulb,
  Clock3,
  FileSearch,
  X,
  RefreshCw,
  Save,
  RotateCcw,
} from "lucide-react";

import api from "../services/api";
import "./CrimeScene.css";

function CrimeScene() {
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState("");

  const [evidence, setEvidence] = useState([]);
  const [suspects, setSuspects] = useState([]);
  const [clues, setClues] = useState([]);
  const [timeline, setTimeline] = useState([]);

  const [markerPositions, setMarkerPositions] = useState({});
  const [draggingMarker, setDraggingMarker] = useState(null);

  const [selectedMarker, setSelectedMarker] = useState(null);

  const [loading, setLoading] = useState(true);
  const [sceneLoading, setSceneLoading] = useState(false);
  const [savingLayout, setSavingLayout] = useState(false);

  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const dragMovedRef = useRef(false);

  useEffect(() => {
    const loadCases = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/cases/");

        const caseData =
          response.data?.results ||
          response.data ||
          [];

        setCases(caseData);

        if (caseData.length > 0) {
          setSelectedCase(String(caseData[0].id));
        }
      } catch (err) {
        console.error("Crime scene cases error:", err);
        setError("Unable to load investigation cases.");
      } finally {
        setLoading(false);
      }
    };

    loadCases();
  }, []);

  useEffect(() => {
    if (!selectedCase) {
      return;
    }

    const loadSceneData = async () => {
      try {
        setSceneLoading(true);
        setError("");
        setActionMessage("");
        setSelectedMarker(null);

        const [
          evidenceResponse,
          suspectsResponse,
          cluesResponse,
          timelineResponse,
          positionsResponse,
        ] = await Promise.all([
          api.get(`/evidence/?case=${selectedCase}`),
          api.get(`/suspects/?case=${selectedCase}`),
          api.get(`/clues/?case=${selectedCase}`),
          api.get(`/timeline/?case=${selectedCase}`),
          api.get(`/scene-positions/?case=${selectedCase}`),
        ]);

        setEvidence(
          evidenceResponse.data?.results ||
            evidenceResponse.data ||
            []
        );

        setSuspects(
          suspectsResponse.data?.results ||
            suspectsResponse.data ||
            []
        );

        setClues(
          cluesResponse.data?.results ||
            cluesResponse.data ||
            []
        );

        setTimeline(
          timelineResponse.data?.results ||
            timelineResponse.data ||
            []
        );

        const savedPositions =
          positionsResponse.data?.results ||
          positionsResponse.data ||
          [];

        const positionMap = {};

        savedPositions.forEach((item) => {
          positionMap[item.marker_id] = {
            left: Number(item.left),
            top: Number(item.top),
          };
        });

        setMarkerPositions(positionMap);
      } catch (err) {
        console.error("Crime scene data error:", err);

        setEvidence([]);
        setSuspects([]);
        setClues([]);
        setTimeline([]);
        setMarkerPositions({});

        setError(
          "Unable to load crime scene investigation data."
        );
      } finally {
        setSceneLoading(false);
      }
    };

    loadSceneData();
  }, [selectedCase]);

  useEffect(() => {
    if (!draggingMarker) {
      return;
    }

    const handleMouseMove = (event) => {
      const sceneMap = document.querySelector(
        ".scene-map"
      );

      if (!sceneMap) {
        return;
      }

      const rect = sceneMap.getBoundingClientRect();

      let left =
        ((event.clientX - rect.left) / rect.width) * 100;

      let top =
        ((event.clientY - rect.top) / rect.height) * 100;

      left = Math.max(3, Math.min(97, left));
      top = Math.max(5, Math.min(95, top));

      dragMovedRef.current = true;

      setMarkerPositions((previous) => ({
        ...previous,
        [draggingMarker]: {
          left,
          top,
        },
      }));
    };

    const handleMouseUp = () => {
      setDraggingMarker(null);
    };

    document.addEventListener(
      "mousemove",
      handleMouseMove
    );

    document.addEventListener(
      "mouseup",
      handleMouseUp
    );

    return () => {
      document.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      document.removeEventListener(
        "mouseup",
        handleMouseUp
      );
    };
  }, [draggingMarker]);

  const currentCase = useMemo(() => {
    return cases.find(
      (item) =>
        String(item.id) === String(selectedCase)
    );
  }, [cases, selectedCase]);

  const markers = useMemo(() => {
    const result = [];

    evidence.forEach((item, index) => {
      const positions = [
        { left: 25, top: 32 },
        { left: 46, top: 26 },
        { left: 69, top: 35 },
        { left: 33, top: 67 },
        { left: 61, top: 69 },
        { left: 78, top: 61 },
      ];

      const defaultPosition =
        positions[index % positions.length];

      const markerId = `evidence-${item.id}`;

      const position =
        markerPositions[markerId] ||
        defaultPosition;

      result.push({
        id: markerId,
        sourceId: item.id,
        type: "evidence",
        title: item.title,
        description:
          item.description ||
          "No evidence description available.",
        label: `E-${index + 1}`,
        verified: item.verified,
        position,
        icon: FileSearch,
      });
    });

    suspects.forEach((item, index) => {
      const positions = [
        { left: 58, top: 44 },
        { left: 25, top: 55 },
        { left: 76, top: 43 },
        { left: 47, top: 73 },
      ];

      const defaultPosition =
        positions[index % positions.length];

      const markerId = `suspect-${item.id}`;

      const position =
        markerPositions[markerId] ||
        defaultPosition;

      result.push({
        id: markerId,
        sourceId: item.id,
        type: "suspect",
        title: item.name,
        description:
          item.description ||
          "No suspect description available.",
        label: `S-${index + 1}`,
        status: item.status,
        position,
        icon: Users,
      });
    });

    clues.forEach((item, index) => {
      const positions = [
        { left: 38, top: 42 },
        { left: 67, top: 52 },
        { left: 20, top: 76 },
        { left: 82, top: 74 },
      ];

      const defaultPosition =
        positions[index % positions.length];

      const markerId = `clue-${item.id}`;

      const position =
        markerPositions[markerId] ||
        defaultPosition;

      result.push({
        id: markerId,
        sourceId: item.id,
        type: "clue",
        title: item.title,
        description:
          item.description ||
          "No clue description available.",
        label: `C-${index + 1}`,
        importance: item.importance,
        resolved: item.resolved,
        position,
        icon: Lightbulb,
      });
    });

    timeline.slice(0, 4).forEach((item, index) => {
      const positions = [
        { left: 30, top: 22 },
        { left: 52, top: 55 },
        { left: 72, top: 25 },
        { left: 87, top: 55 },
      ];

      const defaultPosition =
        positions[index % positions.length];

      const markerId = `timeline-${item.id}`;

      const position =
        markerPositions[markerId] ||
        defaultPosition;

      result.push({
        id: markerId,
        sourceId: item.id,
        type: "timeline",
        title: item.title,
        description:
          item.description ||
          "No timeline description available.",
        label: `T-${index + 1}`,
        eventDate: item.event_date,
        position,
        icon: Clock3,
      });
    });

    return result;
  }, [
    evidence,
    suspects,
    clues,
    timeline,
    markerPositions,
  ]);

  const statistics = {
    evidence: evidence.length,
    suspects: suspects.length,
    clues: clues.length,
    timeline: timeline.length,
  };

  const handleMarkerMouseDown = (
    event,
    markerId
  ) => {
    event.preventDefault();
    event.stopPropagation();

    dragMovedRef.current = false;
    setDraggingMarker(markerId);
  };

  const handleMarkerClick = (
    event,
    marker
  ) => {
    event.stopPropagation();

    if (dragMovedRef.current) {
      dragMovedRef.current = false;
      return;
    }

    setSelectedMarker(marker);
  };

  const handleSaveLayout = async () => {
    if (!selectedCase) {
      return;
    }

    if (markers.length === 0) {
      setActionMessage(
        "There are no scene markers to save."
      );
      return;
    }

    try {
      setSavingLayout(true);
      setError("");
      setActionMessage("");

      const response = await api.get(
        `/scene-positions/?case=${selectedCase}`
      );

      const existingPositions =
        response.data?.results ||
        response.data ||
        [];

      const existingMap = {};

      existingPositions.forEach((item) => {
        existingMap[item.marker_id] = item;
      });

      await Promise.all(
        markers.map(async (marker) => {
          const position =
            markerPositions[marker.id] ||
            marker.position;

          const existing =
            existingMap[marker.id];

          const payload = {
            case: Number(selectedCase),
            marker_id: marker.id,
            left: Number(position.left.toFixed(2)),
            top: Number(position.top.toFixed(2)),
          };

          if (existing) {
            return api.patch(
              `/scene-positions/${existing.id}/`,
              payload
            );
          }

          return api.post(
            "/scene-positions/",
            payload
          );
        })
      );

      setActionMessage(
        "Crime scene layout saved successfully."
      );
    } catch (err) {
      console.error(
        "Crime scene layout save error:",
        err
      );

      const responseData = err.response?.data;

      if (
        responseData &&
        typeof responseData === "object"
      ) {
        const messages = Object.values(responseData)
          .flat()
          .map((message) => String(message));

        setError(
          messages.join(" ") ||
            "Unable to save crime scene layout."
        );
      } else {
        setError(
          "Unable to save crime scene layout."
        );
      }
    } finally {
      setSavingLayout(false);
    }
  };

  const handleResetLayout = async () => {
    if (!selectedCase) {
      return;
    }

    try {
      setSavingLayout(true);
      setError("");
      setActionMessage("");

      const response = await api.get(
        `/scene-positions/?case=${selectedCase}`
      );

      const savedPositions =
        response.data?.results ||
        response.data ||
        [];

      await Promise.all(
        savedPositions.map((item) =>
          api.delete(
            `/scene-positions/${item.id}/`
          )
        )
      );

      setMarkerPositions({});
      setSelectedMarker(null);

      setActionMessage(
        "Crime scene layout reset successfully."
      );
    } catch (err) {
      console.error(
        "Crime scene layout reset error:",
        err
      );

      setError(
        "Unable to reset crime scene layout."
      );
    } finally {
      setSavingLayout(false);
    }
  };

  const handleRefresh = async () => {
    if (!selectedCase) {
      return;
    }

    try {
      setSceneLoading(true);
      setError("");
      setActionMessage("");

      const [
        evidenceResponse,
        suspectsResponse,
        cluesResponse,
        timelineResponse,
        positionsResponse,
      ] = await Promise.all([
        api.get(`/evidence/?case=${selectedCase}`),
        api.get(`/suspects/?case=${selectedCase}`),
        api.get(`/clues/?case=${selectedCase}`),
        api.get(`/timeline/?case=${selectedCase}`),
        api.get(
          `/scene-positions/?case=${selectedCase}`
        ),
      ]);

      setEvidence(
        evidenceResponse.data?.results ||
          evidenceResponse.data ||
          []
      );

      setSuspects(
        suspectsResponse.data?.results ||
          suspectsResponse.data ||
          []
      );

      setClues(
        cluesResponse.data?.results ||
          cluesResponse.data ||
          []
      );

      setTimeline(
        timelineResponse.data?.results ||
          timelineResponse.data ||
          []
      );

      const savedPositions =
        positionsResponse.data?.results ||
        positionsResponse.data ||
        [];

      const positionMap = {};

      savedPositions.forEach((item) => {
        positionMap[item.marker_id] = {
          left: Number(item.left),
          top: Number(item.top),
        };
      });

      setMarkerPositions(positionMap);
    } catch (err) {
      console.error(
        "Crime scene refresh error:",
        err
      );

      setError(
        "Unable to refresh crime scene data."
      );
    } finally {
      setSceneLoading(false);
    }
  };

  const SelectedMarkerIcon =
    selectedMarker?.icon;

  return (
    <div className="crime-scene-page">
      <div className="crime-scene-header">
        <div>
          <div className="crime-scene-eyebrow">
            <Shield size={15} />
            DIGITAL CRIME SCENE
          </div>

          <h1>Interactive Crime Scene</h1>

          <p>
            Reconstruct the investigation environment
            and explore evidence, suspects, clues and
            timeline events.
          </p>
        </div>

        <div className="scene-header-actions">
          <button
            className="scene-action-button"
            onClick={handleSaveLayout}
            disabled={
              savingLayout ||
              sceneLoading ||
              !selectedCase
            }
            type="button"
          >
            <Save size={15} />

            {savingLayout
              ? "Saving..."
              : "Save Layout"}
          </button>

          <button
            className="scene-action-button reset"
            onClick={handleResetLayout}
            disabled={
              savingLayout ||
              sceneLoading ||
              !selectedCase
            }
            type="button"
          >
            <RotateCcw size={15} />
            Reset
          </button>

          <button
            className="crime-scene-refresh"
            onClick={handleRefresh}
            disabled={
              sceneLoading ||
              savingLayout ||
              !selectedCase
            }
            type="button"
          >
            <RefreshCw
              size={17}
              className={
                sceneLoading ? "spin" : ""
              }
            />

            Refresh Scene
          </button>
        </div>
      </div>

      {error && (
        <div className="crime-scene-error">
          <span>{error}</span>
        </div>
      )}

      {actionMessage && (
        <div className="scene-action-message">
          {actionMessage}
        </div>
      )}

      <div className="crime-scene-controls">
        <div className="scene-case-selector">
          <label htmlFor="crime-scene-case">
            SELECT INVESTIGATION CASE
          </label>

          <div className="scene-select-wrapper">
            <Search size={17} />

            <select
              id="crime-scene-case"
              value={selectedCase}
              onChange={(event) => {
                setSelectedCase(
                  event.target.value
                );
                setSelectedMarker(null);
                setMarkerPositions({});
                setActionMessage("");
              }}
            >
              {cases.length === 0 && (
                <option value="">
                  No cases available
                </option>
              )}

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
        </div>

        <div className="scene-current-case">
          <span>ACTIVE CASE</span>

          <strong>
            {currentCase?.case_number || "—"}
          </strong>
        </div>
      </div>

      {loading ? (
        <div className="crime-scene-loading">
          Loading investigation scene...
        </div>
      ) : (
        <>
          <div className="scene-stat-grid">
            <div className="scene-stat evidence-stat">
              <div className="scene-stat-icon">
                <FileSearch size={20} />
              </div>

              <div>
                <span>Evidence</span>
                <strong>
                  {statistics.evidence}
                </strong>
              </div>
            </div>

            <div className="scene-stat suspect-stat">
              <div className="scene-stat-icon">
                <Users size={20} />
              </div>

              <div>
                <span>Suspects</span>
                <strong>
                  {statistics.suspects}
                </strong>
              </div>
            </div>

            <div className="scene-stat clue-stat">
              <div className="scene-stat-icon">
                <Lightbulb size={20} />
              </div>

              <div>
                <span>Clues</span>
                <strong>
                  {statistics.clues}
                </strong>
              </div>
            </div>

            <div className="scene-stat timeline-stat">
              <div className="scene-stat-icon">
                <Clock3 size={20} />
              </div>

              <div>
                <span>Events</span>
                <strong>
                  {statistics.timeline}
                </strong>
              </div>
            </div>
          </div>

          <div className="crime-scene-workspace">
            <div className="crime-scene-card">
              <div className="crime-scene-card-header">
                <div>
                  <span>
                    SCENE RECONSTRUCTION
                  </span>

                  <h2>
                    {currentCase?.title ||
                      "Investigation Scene"}
                  </h2>
                </div>

                <div className="scene-live-status">
                  <span></span>
                  LIVE DATA
                </div>
              </div>

              <div className="scene-map-wrapper">
                <div className="scene-map">
                  <div className="scene-wall wall-top"></div>
                  <div className="scene-wall wall-bottom"></div>
                  <div className="scene-wall wall-left"></div>
                  <div className="scene-wall wall-right"></div>

                  <div className="scene-room room-living">
                    <span>LIVING AREA</span>
                  </div>

                  <div className="scene-room room-office">
                    <span>OFFICE</span>
                  </div>

                  <div className="scene-room room-bedroom">
                    <span>BEDROOM</span>
                  </div>

                  <div className="scene-room room-storage">
                    <span>STORAGE</span>
                  </div>

                  <div className="scene-room room-hall">
                    <span>HALLWAY</span>
                  </div>

                  <div className="scene-door door-one"></div>
                  <div className="scene-door door-two"></div>
                  <div className="scene-door door-three"></div>

                  <div className="scene-window window-one"></div>
                  <div className="scene-window window-two"></div>

                  {markers.map((marker) => {
                    const Icon = marker.icon;

                    const isDragging =
                      draggingMarker ===
                      marker.id;

                    return (
                      <button
                        key={marker.id}
                        className={`scene-marker marker-${marker.type} ${
                          isDragging
                            ? "marker-dragging"
                            : ""
                        }`}
                        style={{
                          left: `${marker.position.left}%`,
                          top: `${marker.position.top}%`,
                        }}
                        onMouseDown={(event) =>
                          handleMarkerMouseDown(
                            event,
                            marker.id
                          )
                        }
                        onClick={(event) =>
                          handleMarkerClick(
                            event,
                            marker
                          )
                        }
                        type="button"
                        title={marker.title}
                      >
                        <span className="marker-pulse"></span>

                        <span className="marker-icon">
                          <Icon size={15} />
                        </span>

                        <span className="marker-label">
                          {marker.label}
                        </span>
                      </button>
                    );
                  })}

                  {markers.length === 0 && (
                    <div className="empty-scene">
                      <MapPin size={30} />

                      <strong>
                        No scene markers
                      </strong>

                      <span>
                        Add evidence, suspects,
                        clues or timeline events
                        to this case.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="scene-legend">
                <div>
                  <span className="legend-dot legend-evidence"></span>
                  Evidence
                </div>

                <div>
                  <span className="legend-dot legend-suspect"></span>
                  Suspect
                </div>

                <div>
                  <span className="legend-dot legend-clue"></span>
                  Clue
                </div>

                <div>
                  <span className="legend-dot legend-timeline"></span>
                  Timeline
                </div>
              </div>
            </div>

            <div className="scene-information-panel">
              {selectedMarker ? (
                <>
                  <div className="scene-detail-header">
                    <div
                      className={`detail-type-icon detail-${selectedMarker.type}`}
                    >
                      {SelectedMarkerIcon && (
                        <SelectedMarkerIcon
                          size={21}
                        />
                      )}
                    </div>

                    <button
                      className="scene-detail-close"
                      onClick={() =>
                        setSelectedMarker(null)
                      }
                      type="button"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="scene-detail-type">
                    {selectedMarker.type}
                  </div>

                  <h3>
                    {selectedMarker.title}
                  </h3>

                  <p className="scene-detail-description">
                    {selectedMarker.description}
                  </p>

                  <div className="scene-detail-grid">
                    <div>
                      <span>Marker</span>

                      <strong>
                        {selectedMarker.label}
                      </strong>
                    </div>

                    <div>
                      <span>Category</span>

                      <strong>
                        {selectedMarker.type}
                      </strong>
                    </div>

                    {selectedMarker.verified !==
                      undefined && (
                      <div>
                        <span>
                          Verification
                        </span>

                        <strong>
                          {selectedMarker.verified
                            ? "Verified"
                            : "Unverified"}
                        </strong>
                      </div>
                    )}

                    {selectedMarker.status && (
                      <div>
                        <span>Status</span>

                        <strong>
                          {selectedMarker.status}
                        </strong>
                      </div>
                    )}

                    {selectedMarker.importance && (
                      <div>
                        <span>Importance</span>

                        <strong>
                          {selectedMarker.importance}
                        </strong>
                      </div>
                    )}

                    {selectedMarker.eventDate && (
                      <div>
                        <span>
                          Event Date
                        </span>

                        <strong>
                          {selectedMarker.eventDate}
                        </strong>
                      </div>
                    )}
                  </div>

                  <div className="scene-detail-footer">
                    <MapPin size={16} />

                    Scene marker selected
                  </div>
                </>
              ) : (
                <div className="scene-empty-panel">
                  <div className="scene-empty-icon">
                    <MapPin size={28} />
                  </div>

                  <h3>
                    Select a Scene Marker
                  </h3>

                  <p>
                    Click any marker on the crime
                    scene to inspect the investigation
                    object and view its details.
                  </p>

                  <div className="scene-instruction">
                    <span>01</span>
                    Select a marker
                  </div>

                  <div className="scene-instruction">
                    <span>02</span>
                    Inspect the information
                  </div>

                  <div className="scene-instruction">
                    <span>03</span>
                    Connect the evidence to your
                    investigation
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CrimeScene;