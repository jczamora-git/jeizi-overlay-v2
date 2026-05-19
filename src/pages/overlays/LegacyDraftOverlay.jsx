import banningBg from "../../game_ui/banning.png";
import "../../styles/overlays/overlay-base.css";
import "../../styles/overlays/legacy-draft-overlay.css";

function LegacyDraftOverlay() {
  return (
    <div className="overlay-stage legacy-draft-overlay">
      <img className="overlay-frame" src={banningBg} alt="" draggable="false" />
      <div className="overlay-data-layer">
        {/* <div className="legacy-draft-placeholder">Legacy Draft Overlay</div> */}
      </div>
    </div>
  );
}

export default LegacyDraftOverlay;
