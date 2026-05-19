import { useEffect, useRef, useState } from "react";
import { createCaster, deleteCaster, getCasters, updateCaster } from "../../services/api";
import { resolveAssetUrl } from "../../utils/assetUrl";

const emptyForm = { name: "", photo: "" };

function CasterConfig() {
  const [casters, setCasters] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [brokenPhotos, setBrokenPhotos] = useState({});
  const fileInputRef = useRef(null);

  const loadCasters = async () => {
    const data = await getCasters();
    setCasters(data);
  };

  useEffect(() => {
    loadCasters();
  }, []);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(photoFile);
    setPhotoPreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [photoFile]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      return;
    }

    const payload = new FormData();
    payload.append("name", form.name);
    if (form.photo) {
      payload.append("photo", form.photo);
    }
    if (photoFile) {
      payload.append("photo", photoFile);
    }

    if (editingId) {
      await updateCaster(editingId, payload);
    } else {
      await createCaster(payload);
    }

    setForm(emptyForm);
    setEditingId(null);
    setPhotoFile(null);
    setPhotoPreview("");
    await loadCasters();
  };

  const handleEdit = (caster) => {
    setForm({
      name: caster.name || "",
      photo: caster.photo || "",
    });
    setEditingId(caster.id);
    setPhotoFile(null);
    setPhotoPreview("");
  };

  const handleDelete = async (casterId) => {
    if (!window.confirm("Delete this caster?")) {
      return;
    }
    await deleteCaster(casterId);
    await loadCasters();
  };

  const handlePhotoPick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (event) => {
    setPhotoFile(event.target.files?.[0] || null);
  };

  const handleRemovePhoto = (event) => {
    event.stopPropagation();
    setPhotoFile(null);
  };

  const previewUrl = photoPreview || resolveAssetUrl(form.photo);

  return (
    <div className="controller-page">
      <h1>Casters</h1>

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
          Caster Photo Upload
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
            style={{ display: "none" }}
            onChange={handlePhotoChange}
          />
          <div
            className="custom-upload"
            role="button"
            tabIndex={0}
            onClick={handlePhotoPick}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handlePhotoPick();
              }
            }}
          >
            {previewUrl ? (
              <div className="custom-upload-preview">
                <img className="upload-thumb" src={previewUrl} alt="Caster preview" />
                <div className="upload-file-name">
                  {photoFile ? photoFile.name : "Using saved photo"}
                </div>
              </div>
            ) : (
              <div className="custom-upload-placeholder">Choose Caster Photo</div>
            )}
            <div className="custom-upload-actions">
              <button
                type="button"
                className="btn-upload"
                onClick={(event) => {
                  event.stopPropagation();
                  handlePhotoPick();
                }}
              >
                {previewUrl ? "Change" : "Choose Caster Photo"}
              </button>
              {photoFile && (
                <button type="button" className="btn-remove" onClick={handleRemovePhoto}>
                  Remove
                </button>
              )}
            </div>
          </div>
        </label>
        <label>
          Manual Photo Path
          <input
            value={form.photo}
            onChange={(event) => setForm({ ...form, photo: event.target.value })}
            placeholder="/uploads/casters/caster.png"
          />
        </label>
        <div className="form-actions">
          <button type="submit">{editingId ? "Save" : "Add Caster"}</button>
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
        <h2>Caster List</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Photo</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {casters.map((caster) => (
              <tr key={caster.id}>
                <td>{caster.id}</td>
                <td>
                  {caster.photo ? (
                    <>
                      {!brokenPhotos[caster.id] && (
                        <img
                          className="table-image-preview"
                          src={resolveAssetUrl(caster.photo)}
                          alt={caster.name}
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                            setBrokenPhotos((prev) => ({ ...prev, [caster.id]: true }));
                          }}
                        />
                      )}
                      {brokenPhotos[caster.id] && (
                        <div className="table-image-placeholder">
                          {resolveAssetUrl(caster.photo)}
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="table-image-placeholder">No Photo</span>
                  )}
                </td>
                <td>{caster.name}</td>
                <td>
                  <button onClick={() => handleEdit(caster)}>Edit</button>
                  <button className="secondary" onClick={() => handleDelete(caster.id)}>
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

export default CasterConfig;
