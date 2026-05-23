import { useEffect, useMemo, useState } from "react";
import Toast from "../../components/common/Toast";
import { getOverlaySettings, updateOverlaySetting } from "../../services/api";

function OverlayControlsPage() {
  const [settings, setSettings] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [pending, setPending] = useState({});
  const [toast, setToast] = useState({ message: "", type: "info" });

  const overlayControls = useMemo(
    () => [
      {
        key: "game_overlay",
        title: "Game Overlay",
        description: "Controls whether the live gameplay overlay is visible in OBS.",
      },
      {
        key: "loading_overlay",
        title: "Loading Screen Overlay",
        description: "Controls whether the loading screen overlay is visible in OBS.",
      },
    ],
    []
  );

  const closeToast = () => setToast({ message: "", type: "info" });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const loadSettings = async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await getOverlaySettings();
      setSettings(data || {});
    } catch (loadError) {
      console.error("Failed to load overlay settings", loadError);
      setError(loadError?.message || "Failed to load overlay settings.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleToggle = async (overlayKey) => {
    if (pending[overlayKey]) {
      return;
    }

    const currentEnabled = settings?.[overlayKey] !== false;
    const nextEnabled = !currentEnabled;

    setPending((prev) => ({ ...prev, [overlayKey]: true }));
    setSettings((prev) => ({ ...prev, [overlayKey]: nextEnabled }));

    try {
      await updateOverlaySetting(overlayKey, nextEnabled);
      showToast(
        nextEnabled ? "Overlay enabled." : "Overlay disabled.",
        nextEnabled ? "success" : "info"
      );
    } catch (updateError) {
      console.error("Failed to update overlay setting", updateError);
      setSettings((prev) => ({ ...prev, [overlayKey]: currentEnabled }));
      showToast(updateError?.message || "Failed to update overlay setting.", "error");
    } finally {
      setPending((prev) => ({ ...prev, [overlayKey]: false }));
    }
  };

  return (
    <div className="controller-page overlay-controls-page">
      <div className="toast-container">
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      </div>

      <div className="page-header">
        <div className="page-title-group">
          <h1>Overlay Controls</h1>
          <div className="page-subtitle">Enable or disable overlay scenes used by OBS.</div>
        </div>
      </div>

      <div className="overlay-controls-grid">
        {isLoading ? (
          <section className="modern-card overlay-control-card">Loading overlay settings...</section>
        ) : error ? (
          <section className="modern-card overlay-control-card overlay-control-error">
            {error}
            <button type="button" className="button-secondary" onClick={loadSettings}>
              Retry
            </button>
          </section>
        ) : (
          overlayControls.map((control) => {
            const isEnabled = settings?.[control.key] !== false;
            const isPending = pending?.[control.key];

            return (
              <section key={control.key} className="modern-card overlay-control-card">
                <div className="overlay-control-row">
                  <div className="overlay-control-main">
                    <div className="overlay-control-title">{control.title}</div>
                    <div className="overlay-control-description">{control.description}</div>
                  </div>
                  <div className="overlay-control-actions">
                    <div className="overlay-control-status">
                      <span
                        className={`overlay-control-status-text${
                          isEnabled ? " is-enabled" : " is-disabled"
                        }`}
                      >
                        {isEnabled ? "Enabled" : "Disabled"}
                      </span>
                      <span className="overlay-control-status-subtext">
                        {isEnabled ? "Visible in OBS" : "Hidden from OBS"}
                      </span>
                    </div>
                    <button
                      type="button"
                      className={`button-secondary overlay-toggle-button${
                        isEnabled ? " is-enabled" : " is-disabled"
                      }`}
                      onClick={() => handleToggle(control.key)}
                      disabled={isPending}
                    >
                      {isPending ? "Saving..." : isEnabled ? "Disable" : "Enable"}
                    </button>
                  </div>
                </div>
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}

export default OverlayControlsPage;
