import { useEffect, useRef, useState } from "react";
import { createMap, deleteMap, getMaps, updateMap } from "../../services/api";
import { resolveAssetUrl } from "../../utils/assetUrl";

const emptyForm = { name: "", icon_path: "" };

function MapConfig() {
  const [maps, setMaps] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState("");
  const [brokenIcons, setBrokenIcons] = useState({});
  const fileInputRef = useRef(null);

  const loadMaps = async () => {
    const data = await getMaps();
    setMaps(data);
  };

  useEffect(() => {
    loadMaps();
  }, []);

  useEffect(() => {
    if (!iconFile) {
      setIconPreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(iconFile);
    setIconPreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [iconFile]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      return;
    }

    const payload = new FormData();
    payload.append("name", form.name);
    if (iconFile) {
      payload.append("icon", iconFile);
    } else if (form.icon_path) {
      payload.append("icon_path", form.icon_path);
    }

    if (editingId) {
      await updateMap(editingId, payload);
    } else {
      await createMap(payload);
    }

    setForm(emptyForm);
    setEditingId(null);
    setIconFile(null);
    setIconPreview("");
    await loadMaps();
  };

  const handleEdit = (map) => {
    setForm({
      name: map.name || "",
      icon_path: map.icon_path || "",
    });
    setEditingId(map.id);
    setIconFile(null);
    setIconPreview("");
  };

  const handleIconPick = () => {
    fileInputRef.current?.click();
  };

  const handleIconChange = (event) => {
    setIconFile(event.target.files?.[0] || null);
  };

  const handleRemoveIcon = (event) => {
    event.stopPropagation();
    setIconFile(null);
  };

  const previewUrl = iconPreview || resolveAssetUrl(form.icon_path);

  const handleDelete = async (mapId) => {
    if (!window.confirm("Delete this map?")) {
      return;
    }
    await deleteMap(mapId);
    await loadMaps();
  };

  return (
    <div className="controller-page">
      <h1>Maps</h1>

      <form className="panel form-grid" onSubmit={handleSubmit}>
        <label>
          Name
          <input
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
        </label>
        <label>
          Map Icon Upload
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
            style={{ display: "none" }}
            onChange={handleIconChange}
          />
          <div
            className="custom-upload"
            role="button"
            tabIndex={0}
            onClick={handleIconPick}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleIconPick();
              }
            }}
          >
            {previewUrl ? (
              <div className="custom-upload-preview">
                <img className="upload-thumb" src={previewUrl} alt="Map preview" />
                <div className="upload-file-name">
                  {iconFile ? iconFile.name : "Using saved icon"}
                </div>
              </div>
            ) : (
              <div className="custom-upload-placeholder">Choose Map Icon</div>
            )}
            <div className="custom-upload-actions">
              <button type="button" className="btn-upload" onClick={(event) => {
                event.stopPropagation();
                handleIconPick();
              }}>
                {previewUrl ? "Change" : "Choose Map Icon"}
              </button>
              {iconFile && (
                <button type="button" className="btn-remove" onClick={handleRemoveIcon}>
                  Remove
                </button>
              )}
            </div>
          </div>
        </label>
        <label>
          Manual Icon Path
          <input
            value={form.icon_path}
            onChange={(event) => setForm({ ...form, icon_path: event.target.value })}
            placeholder="/uploads/maps/map.png"
          />
        </label>
        <div className="form-actions">
          <button type="submit">{editingId ? "Save" : "Add Map"}</button>
          {editingId && (
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <section className="panel">
        <h2>Map List</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Icon</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {maps.map((map) => (
              <tr key={map.id}>
                <td>{map.id}</td>
                <td>{map.name}</td>
                <td>
                  {map.icon_path ? (
                    <>
                      {!brokenIcons[map.id] && (
                        <img
                          className="table-image-preview"
                          src={resolveAssetUrl(map.icon_path)}
                          alt={map.name}
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                            setBrokenIcons((prev) => ({ ...prev, [map.id]: true }));
                          }}
                        />
                      )}
                      {brokenIcons[map.id] && (
                        <div className="table-image-placeholder">
                          {resolveAssetUrl(map.icon_path)}
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="table-image-placeholder">No Icon</span>
                  )}
                </td>
                <td>
                  <button onClick={() => handleEdit(map)}>Edit</button>
                  <button className="secondary" onClick={() => handleDelete(map.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default MapConfig;
