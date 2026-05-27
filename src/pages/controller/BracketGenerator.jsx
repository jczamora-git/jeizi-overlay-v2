import { useEffect, useMemo, useState } from "react";
import CustomDropdown from "../../components/common/CustomDropdown";
import Toast from "../../components/common/Toast";
import { getTeams, previewBracket } from "../../services/api";

const defaultRoundModes = {
  Elimination: "BO1",
  "Top 16": "BO1",
  "Quarter-Finals": "BO3",
  "Semi-Finals": "BO3",
  Finals: "BO5",
};

const modeOptions = ["BO1", "BO3", "BO5", "BO7"].map((mode) => ({
  value: mode,
  label: mode,
}));

const roundModeKeys = [
  "Elimination",
  "Top 16",
  "Quarter-Finals",
  "Semi-Finals",
  "Finals",
];

const listRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  padding: "12px 14px",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: "14px",
  background: "rgba(9, 11, 16, 0.65)",
};

const listInfoStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  minWidth: 0,
};

const sectionGridStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(280px, 1fr) minmax(320px, 1.2fr)",
  gap: "18px",
};

const summaryGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: "12px",
};

const bracketTreeStyle = {
  display: "flex",
  gap: "40px",
  overflowX: "auto",
  overflowY: "hidden",
  padding: "24px 8px 32px",
  alignItems: "flex-start",
};

const bracketRoundStyle = {
  minWidth: "260px",
  flex: "0 0 260px",
};

const bracketRoundHeaderStyle = {
  position: "sticky",
  top: 0,
  zIndex: 2,
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  marginBottom: "18px",
  padding: "14px 16px",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: "14px",
  background: "rgba(13, 16, 23, 0.94)",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
};

const bracketRoundMatchesBaseStyle = {
  display: "flex",
  flexDirection: "column",
};

const bracketMatchCardStyle = {
  position: "relative",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  background: "rgba(8, 13, 24, 0.92)",
  borderRadius: "12px",
  overflow: "visible",
  boxShadow: "0 12px 32px rgba(0, 0, 0, 0.22)",
};

const bracketMatchConnectorStyle = {
  position: "absolute",
  top: "50%",
  right: "-20px",
  width: "20px",
  height: "1px",
  background: "rgba(255, 255, 255, 0.14)",
};

const bracketMatchTitleStyle = {
  padding: "10px 12px 8px",
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "rgba(255, 255, 255, 0.72)",
  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
};

const bracketTeamRowStyle = {
  display: "grid",
  gridTemplateColumns: "36px 1fr 28px",
  alignItems: "center",
  gap: "10px",
  minHeight: "42px",
  padding: "0 12px",
};

const bracketSeedStyle = {
  fontSize: "12px",
  fontWeight: 700,
  color: "rgba(255, 255, 255, 0.55)",
};

const bracketTeamNameStyle = {
  minWidth: 0,
  fontSize: "13px",
  fontWeight: 600,
  color: "#f7f8fb",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const bracketScoreStyle = {
  textAlign: "right",
  fontSize: "13px",
  color: "rgba(255, 255, 255, 0.42)",
};

const byeBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "40px",
  padding: "2px 8px",
  borderRadius: "999px",
  background: "rgba(255, 94, 0, 0.16)",
  color: "#ff9b61",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
};

function getRoundSpacing(roundIndex) {
  return Math.pow(2, roundIndex) * 18;
}

function getRoundPaddingTop(roundIndex) {
  return roundIndex === 0 ? 0 : getRoundSpacing(roundIndex - 1) / 2 + 20;
}

function BracketGenerator() {
  const [teams, setTeams] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [roundModes, setRoundModes] = useState(defaultRoundModes);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "info" });

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const teamData = await getTeams();
        setTeams(Array.isArray(teamData) ? teamData : []);
      } catch (error) {
        console.error("Failed to load teams", error);
        setTeams([]);
        setToast({ message: error?.message || "Failed to load teams.", type: "error" });
      } finally {
        setIsLoading(false);
      }
    };

    loadTeams();
  }, []);

  const availableTeams = useMemo(() => {
    const selectedIds = new Set(selectedTeams.map((team) => Number(team.id)));
    return teams.filter((team) => !selectedIds.has(Number(team.id)));
  }, [selectedTeams, teams]);

  const closeToast = () => setToast({ message: "", type: "info" });

  const handleAddTeam = (team) => {
    setSelectedTeams((current) => [...current, team]);
  };

  const handleMoveTeam = (index, direction) => {
    setSelectedTeams((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) {
        return current;
      }

      const next = [...current];
      const [moved] = next.splice(index, 1);
      next.splice(nextIndex, 0, moved);
      return next;
    });
  };

  const handleRemoveTeam = (teamId) => {
    setSelectedTeams((current) => current.filter((team) => Number(team.id) !== Number(teamId)));
  };

  const handlePreview = async () => {
    if (selectedTeams.length < 2) {
      setToast({ message: "Select at least 2 teams to preview a bracket.", type: "error" });
      return;
    }

    setIsPreviewing(true);

    try {
      const payload = {
        participants: selectedTeams.map((team, index) => ({
          team_id: Number(team.id),
          seed: index + 1,
          name: team.name,
        })),
        roundModes,
      };

      const result = await previewBracket(payload);
      setPreview(result?.bracket || null);
      setToast({ message: "Bracket preview generated.", type: "success" });
    } catch (error) {
      console.error("Failed to preview bracket", error);
      setPreview(null);
      setToast({ message: error?.message || "Failed to preview bracket.", type: "error" });
    } finally {
      setIsPreviewing(false);
    }
  };

  return (
    <div className="controller-page">
      <div className="toast-container">
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      </div>

      <div className="page-header match-page-header">
        <div className="page-title-group">
          <h1>Bracket</h1>
          <div className="page-subtitle">
            Preview a single-elimination bracket without creating matches yet.
          </div>
        </div>
        <div className="toolbar match-toolbar">
          <button
            type="button"
            className="button-primary"
            onClick={handlePreview}
            disabled={isPreviewing}
          >
            {isPreviewing ? "Generating..." : "Preview Bracket"}
          </button>
        </div>
      </div>

      <div className="match-section-stack">
        <section className="modern-card" style={{ overflow: "visible" }}>
          <div className="panel-header">
            <h2>Bracket Setup</h2>
          </div>

          <div style={sectionGridStyle}>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="helper-text">
                Available teams are added into the bracket in seed order based on selection order.
              </div>
              {isLoading ? (
                <div className="modern-card muted">Loading teams...</div>
              ) : availableTeams.length ? (
                availableTeams.map((team) => (
                  <div key={team.id} style={listRowStyle}>
                    <div style={listInfoStyle}>
                      <strong>{team.name}</strong>
                      <span className="helper-text">{team.shortname || `Team #${team.id}`}</span>
                    </div>
                    <button
                      type="button"
                      className="button-secondary"
                      onClick={() => handleAddTeam(team)}
                    >
                      Add
                    </button>
                  </div>
                ))
              ) : (
                <div className="modern-card muted">No more teams available to add.</div>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="panel-header" style={{ padding: 0 }}>
                <h2>Selected Teams</h2>
                <div className="helper-text">{selectedTeams.length} participants</div>
              </div>

              {selectedTeams.length ? (
                selectedTeams.map((team, index) => (
                  <div key={team.id} style={listRowStyle}>
                    <div style={listInfoStyle}>
                      <strong>{`Seed ${index + 1} - ${team.name}`}</strong>
                      <span className="helper-text">{team.shortname || `Team #${team.id}`}</span>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="button-ghost"
                        onClick={() => handleMoveTeam(index, -1)}
                        disabled={index === 0}
                      >
                        Move Up
                      </button>
                      <button
                        type="button"
                        className="button-ghost"
                        onClick={() => handleMoveTeam(index, 1)}
                        disabled={index === selectedTeams.length - 1}
                      >
                        Move Down
                      </button>
                      <button
                        type="button"
                        className="button-danger-outline"
                        onClick={() => handleRemoveTeam(team.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="modern-card muted">Select teams to start building the bracket.</div>
              )}
            </div>
          </div>
        </section>

        <section className="modern-card" style={{ overflow: "visible" }}>
          <div className="panel-header">
            <h2>Round Modes</h2>
          </div>

          <div
            className="form-grid modal-form-grid"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}
          >
            {roundModeKeys.map((roundKey) => (
              <div key={roundKey} className="form-group">
                {roundKey}
                <CustomDropdown
                  value={roundModes[roundKey]}
                  options={modeOptions}
                  placeholder="Select mode"
                  onChange={(selectedValue) =>
                    setRoundModes((current) => ({
                      ...current,
                      [roundKey]: selectedValue,
                    }))
                  }
                />
              </div>
            ))}
          </div>
        </section>

        <section className="modern-card">
          <div className="panel-header">
            <h2>Bracket Preview</h2>
          </div>

          {!preview ? (
            <div className="modern-card muted">
              Select teams, adjust round modes, then click Preview Bracket.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={summaryGridStyle}>
                <div className="modern-card">
                  <div className="helper-text">Bracket Size</div>
                  <strong>{preview.bracket_size}</strong>
                </div>
                <div className="modern-card">
                  <div className="helper-text">Participants</div>
                  <strong>{preview.participant_count}</strong>
                </div>
                <div className="modern-card">
                  <div className="helper-text">BYEs</div>
                  <strong>{preview.byes}</strong>
                </div>
              </div>

              <section className="modern-card" style={{ overflow: "hidden" }}>
                <div style={bracketTreeStyle}>
                  {preview.rounds?.map((round, roundIndex) => (
                    <div key={round.round_no} style={bracketRoundStyle}>
                      <div style={bracketRoundHeaderStyle}>
                        <strong>{round.title}</strong>
                        <div className="helper-text">{round.mode}</div>
                        <div className="helper-text">
                          {round.matches?.length || 0} match
                          {round.matches?.length === 1 ? "" : "es"}
                        </div>
                      </div>

                      <div
                        style={{
                          ...bracketRoundMatchesBaseStyle,
                          gap: `${getRoundSpacing(roundIndex)}px`,
                          paddingTop: `${getRoundPaddingTop(roundIndex)}px`,
                        }}
                      >
                        {round.matches?.map((match) => {
                          const teamAName = match.team_a_name || "TBD";
                          const teamBName = match.team_b_name || "TBD";
                          const isByeTeamA = String(teamAName).toUpperCase() === "BYE";
                          const isByeTeamB = String(teamBName).toUpperCase() === "BYE";

                          return (
                            <div
                              key={`${round.round_no}-${match.bracket_match_no}`}
                              style={bracketMatchCardStyle}
                            >
                              {roundIndex < (preview.rounds?.length || 0) - 1 ? (
                                <span style={bracketMatchConnectorStyle} aria-hidden="true" />
                              ) : null}
                              <div style={bracketMatchTitleStyle}>
                                {`Match ${match.bracket_match_no}`}
                              </div>
                              <div
                                style={{
                                  ...bracketTeamRowStyle,
                                  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                                }}
                              >
                                <span style={bracketSeedStyle}>{match.seed_a ?? "-"}</span>
                                <span style={bracketTeamNameStyle}>{teamAName}</span>
                                <span style={bracketScoreStyle}>
                                  {isByeTeamA ? <span style={byeBadgeStyle}>BYE</span> : "-"}
                                </span>
                              </div>
                              <div style={bracketTeamRowStyle}>
                                <span style={bracketSeedStyle}>{match.seed_b ?? "-"}</span>
                                <span style={bracketTeamNameStyle}>{teamBName}</span>
                                <span style={bracketScoreStyle}>
                                  {isByeTeamB ? <span style={byeBadgeStyle}>BYE</span> : "-"}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default BracketGenerator;
