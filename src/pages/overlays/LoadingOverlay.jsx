import { useEffect, useState } from "react";
import { getCurrentOverlayData } from "../../services/api";
import loadingBg from "../../game_ui/loading.png";
import { resolveAssetUrl } from "../../utils/assetUrl";
import "../../styles/overlays/overlay-base.css";
import "../../styles/overlays/loading-overlay.css";

function LoadingOverlay() {
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
  const casterLabel = data.casters
    ?.map((caster) => caster.name)
    .filter(Boolean)
    .join(" / ") || "";

  return (
    <div className="overlay-canvas overlay-stage">
      <img className="overlay-bg" src={loadingBg} alt="" />
      <div className="overlay-text loading-title">{match.title || "Match"}</div>
      <div className="overlay-text loading-mode">{match.mode || ""}</div>
      <div className="overlay-text loading-game">Game {game.game_no || "-"}</div>
      <div className="overlay-text loading-casters">{casterLabel}</div>

      <div className="overlay-text loading-blue-name">{blueTeam.name || "Blue"}</div>
      {blueTeam.logo && (
        <img
          className="loading-blue-logo"
          src={resolveAssetUrl(blueTeam.logo)}
          alt="Blue team"
        />
      )}

      <div className="overlay-text loading-red-name">{redTeam.name || "Red"}</div>
      {redTeam.logo && (
        <img
          className="loading-red-logo"
          src={resolveAssetUrl(redTeam.logo)}
          alt="Red team"
        />
      )}
    </div>
  );
}

export default LoadingOverlay;
