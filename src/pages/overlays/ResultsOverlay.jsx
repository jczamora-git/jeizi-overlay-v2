import { useEffect, useState } from "react";
import { getCurrentOverlayData } from "../../services/api";
import resultsBg from "../../game_ui/battle-results.png";
import "../../styles/overlays/overlay-base.css";
import "../../styles/overlays/results-overlay.css";

function ResultsOverlay() {
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

  const winnerId = game.winner_team_id;
  const blueResult = winnerId && winnerId === blueTeam.id ? "Victory" : "Defeat";
  const redResult = winnerId && winnerId === redTeam.id ? "Victory" : "Defeat";

  return (
    <div className="overlay-canvas overlay-stage">
      <img className="overlay-bg" src={resultsBg} alt="" />
      <div className="overlay-text results-blue-name">{blueTeam.name || "Blue"}</div>
      <div className="overlay-text results-red-name">{redTeam.name || "Red"}</div>
      <div className="overlay-text results-blue-status">{winnerId ? blueResult : ""}</div>
      <div className="overlay-text results-red-status">{winnerId ? redResult : ""}</div>
      <div className="overlay-text results-score">
        {match.blue_score ?? 0} - {match.red_score ?? 0}
      </div>
    </div>
  );
}

export default ResultsOverlay;
