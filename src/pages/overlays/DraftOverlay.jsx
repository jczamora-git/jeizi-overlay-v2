import { useEffect, useState } from "react";
import { getCurrentOverlayData } from "../../services/api";
import banningBg from "../../game_ui/banning.png";
import { resolveAssetUrl } from "../../utils/assetUrl";
import "../../styles/overlays/overlay-base.css";
import "../../styles/overlays/draft-overlay.css";

function DraftOverlay() {
  const [data, setData] = useState({
    match: null,
    blue_team: null,
    red_team: null,
    draft_actions: [],
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
          setData({ match: null, blue_team: null, red_team: null, draft_actions: [] });
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
  const actions = data.draft_actions || [];

  const blueActions = actions.filter((action) => action.team_side === "BLUE");
  const redActions = actions.filter((action) => action.team_side === "RED");

  return (
    <div className="overlay-canvas overlay-stage draft-overlay">
      <img className="overlay-bg" src={banningBg} alt="" />
      <div className="overlay-text draft-blue-name">{blueTeam.name || "Blue"}</div>
      <div className="overlay-text draft-red-name">{redTeam.name || "Red"}</div>
      <div className="overlay-text draft-score">
        {match.blue_score ?? 0} - {match.red_score ?? 0}
      </div>

      {blueTeam.logo && (
        <img
          className="draft-blue-logo"
          src={resolveAssetUrl(blueTeam.logo)}
          alt="Blue team"
        />
      )}
      {redTeam.logo && (
        <img
          className="draft-red-logo"
          src={resolveAssetUrl(redTeam.logo)}
          alt="Red team"
        />
      )}

      <div className="draft-column draft-blue-column">
        {blueActions.map((action) => (
          <div key={action.id} className="draft-action">
            <div className="draft-action-label">
              {action.action_type} {action.action_order}
            </div>
            {action.hero_image_path ? (
              <img
                src={resolveAssetUrl(action.hero_image_path)}
                alt={action.hero_name || "Hero"}
              />
            ) : (
              <div className="draft-action-placeholder">{action.hero_name || "-"}</div>
            )}
          </div>
        ))}
      </div>

      <div className="draft-column draft-red-column">
        {redActions.map((action) => (
          <div key={action.id} className="draft-action">
            <div className="draft-action-label">
              {action.action_type} {action.action_order}
            </div>
            {action.hero_image_path ? (
              <img
                src={resolveAssetUrl(action.hero_image_path)}
                alt={action.hero_name || "Hero"}
              />
            ) : (
              <div className="draft-action-placeholder">{action.hero_name || "-"}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default DraftOverlay;
