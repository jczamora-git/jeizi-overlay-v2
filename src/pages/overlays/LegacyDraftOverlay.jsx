import { useEffect, useState } from "react";
import { getCurrentOverlayData } from "../../services/api";
import WinIndicators from "../../components/overlay/WinIndicators";
import banningBg from "../../game_ui/banning.png";
import { resolveAssetUrl } from "../../utils/assetUrl";
import "../../styles/overlays/overlay-base.css";
import "../../styles/overlays/legacy-draft-overlay.css";

const getSeriesLength = (mode) => {
  const normalized = String(mode || "").toUpperCase();
  if (normalized === "BO3") return 3;
  if (normalized === "BO5") return 5;
  if (normalized === "BO7") return 7;
  return 1;
};

const formatBestOf = (mode) => {
  if (!mode) return "";
  const value = String(mode).toUpperCase().replace("BO", "");
  return `BEST OF ${value}`;
};

const formatMatchTitle = (title) => {
  if (!title) return "";
  const normalized = String(title).toUpperCase();
  if (normalized === "ELIMINATION") {
    return "ELIMINATION ROUND";
  }
  return normalized;
};

const getTeamLogo = (team) =>
  team?.logo_url ||
  team?.logo ||
  team?.image_url ||
  team?.image ||
  team?.team_logo_url ||
  team?.team_logo ||
  "";

function LegacyDraftOverlay() {
  const [data, setData] = useState({
    match: null,
    blue_team: null,
    red_team: null,
    game: null,
  });

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const overlayData = await getCurrentOverlayData();
        if (isMounted) {
          setData(overlayData);
        }
      } catch (error) {
        if (isMounted) {
          setData({ match: null, blue_team: null, red_team: null, game: null });
        }
      }
    };

    loadData();
    const timer = setInterval(loadData, 1000);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  const match = data.match || {};
  const blueTeam = data.blue_team || {};
  const redTeam = data.red_team || {};
  const game = data.game || {};
  const seriesTotal = getSeriesLength(match.mode);
  const blueLogo = getTeamLogo(blueTeam);
  const redLogo = getTeamLogo(redTeam);
  const resolvedBlueLogo = blueLogo ? resolveAssetUrl(blueLogo) : "";
  const resolvedRedLogo = redLogo ? resolveAssetUrl(redLogo) : "";

  return (
    <div className="overlay-stage legacy-draft-overlay">
      <img className="overlay-frame" src={banningBg} alt="" draggable="false" />
      <div className="overlay-data-layer">
        {resolvedBlueLogo ? (
          <div className="legacy-draft-blue-team-logo-mask">
            <img
              className="legacy-draft-blue-team-logo"
              src={resolvedBlueLogo}
              alt={`${blueTeam.name || "Blue team"} logo`}
              draggable="false"
            />
          </div>
        ) : null}
        {resolvedRedLogo ? (
          <div className="legacy-draft-red-team-logo-mask">
            <img
              className="legacy-draft-red-team-logo"
              src={resolvedRedLogo}
              alt={`${redTeam.name || "Red team"} logo`}
              draggable="false"
            />
          </div>
        ) : null}
        <div className="legacy-draft-blue-team-name">
          {String(blueTeam.name || blueTeam.short_name || "Blue").toUpperCase()}
        </div>
        <div className="legacy-draft-red-team-name">
          {String(redTeam.name || redTeam.short_name || "Red").toUpperCase()}
        </div>
        <div className="legacy-draft-match-title">
          {formatMatchTitle(match.title)}
        </div>
        <div className="legacy-draft-match-mode">{formatBestOf(match.mode)}</div>
        <div className="legacy-draft-game-no">{`GAME ${game.game_no || "-"}`}</div>
        <WinIndicators
          className="legacy-draft-blue-indicators"
          total={seriesTotal}
          score={match.blue_score ?? 0}
          side="blue"
          size={28}
          gap={0}
        />
        <WinIndicators
          className="legacy-draft-red-indicators"
          total={seriesTotal}
          score={match.red_score ?? 0}
          side="red"
          size={28}
          gap={0}
        />
      </div>
    </div>
  );
}

export default LegacyDraftOverlay;
