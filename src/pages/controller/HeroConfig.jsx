import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { createHero, deleteHero, getHeroes, updateHero } from "../../services/api";
import { resolveAssetUrl } from "../../utils/assetUrl";

const emptyForm = { name: "", role: "", image_path: "" };

function HeroConfig() {
  const [heroes, setHeroes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [brokenImages, setBrokenImages] = useState({});
  const [confirmState, setConfirmState] = useState({
    open: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    variant: "",
    onConfirm: () => {},
  });
  const fileInputRef = useRef(null);

  const loadHeroes = async () => {
    const data = await getHeroes();
    setHeroes(data);
  };

  useEffect(() => {
    loadHeroes();
  }, []);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [imageFile]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setImageFile(null);
    setImagePreview("");
  };

  const closeConfirm = () => {
    setConfirmState((prev) => ({
      ...prev,
      open: false,
      onConfirm: () => {},
    }));
  };

  const openConfirm = ({
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "",
    onConfirm,
  }) => {
    setConfirmState({
      open: true,
      title,
      message,
      confirmText,
      cancelText,
      variant,
      onConfirm,
    });
  };

  const saveHero = async (payload) => {
    if (editingId) {
      await updateHero(editingId, payload);
    } else {
      await createHero(payload);
    }

    resetForm();
    await loadHeroes();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      return;
    }

    const payload = new FormData();
    payload.append("name", form.name);
    payload.append("role", form.role || "");
    if (form.image_path) {
      payload.append("image_path", form.image_path);
    }
    if (imageFile) {
      payload.append("image", imageFile);
    }

    const isEditing = Boolean(editingId);
    openConfirm({
      title: isEditing ? "Save Changes" : "Create Hero",
      message: isEditing ? "Apply these changes?" : "Create this hero with the entered details?",
      confirmText: isEditing ? "Save Changes" : "Create",
      onConfirm: async () => {
        await saveHero(payload);
        closeConfirm();
      },
    });
  };

  const handleEdit = (hero) => {
    setForm({
      name: hero.name || "",
      role: hero.role || "",
      image_path: hero.image_path || "",
    });
    setEditingId(hero.id);
    setImageFile(null);
    setImagePreview("");
  };

  const handleImagePick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (event) => {
    setImageFile(event.target.files?.[0] || null);
  };

  const handleRemoveImage = (event) => {
    event.stopPropagation();
    setImageFile(null);
  };

  const previewUrl = imagePreview || resolveAssetUrl(form.image_path);

  const handleDelete = (hero) => {
    openConfirm({
      title: "Delete Hero",
      message: `Are you sure you want to delete ${hero.name}? This action cannot be undone.`,
      confirmText: "Delete",
      variant: "danger",
      onConfirm: async () => {
        await deleteHero(hero.id);
        await loadHeroes();
        closeConfirm();
      },
    });
  };

  return (
    <div className="controller-page">
      <h1>Heroes</h1>

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
          Role
          <input
            value={form.role}
            onChange={(event) => setForm({ ...form, role: event.target.value })}
          />
        </label>
        <label>
          Hero Image Upload
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
          <div
            className="custom-upload"
            role="button"
            tabIndex={0}
            onClick={handleImagePick}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleImagePick();
              }
            }}
          >
            {previewUrl ? (
              <div className="custom-upload-preview">
                <img className="upload-thumb" src={previewUrl} alt="Hero preview" />
                <div className="upload-file-name">
                  {imageFile ? imageFile.name : "Using saved image"}
                </div>
              </div>
            ) : (
              <div className="custom-upload-placeholder">Choose Hero Image</div>
            )}
            <div className="custom-upload-actions">
              <button type="button" className="btn-upload" onClick={(event) => {
                event.stopPropagation();
                handleImagePick();
              }}>
                {previewUrl ? "Change" : "Choose Hero Image"}
              </button>
              {imageFile && (
                <button type="button" className="btn-remove" onClick={handleRemoveImage}>
                  Remove
                </button>
              )}
            </div>
          </div>
        </label>
        <label>
          Manual Image Path
          <input
            value={form.image_path}
            onChange={(event) => setForm({ ...form, image_path: event.target.value })}
            placeholder="/legacy/heroes/akai.png"
          />
        </label>
        <div className="form-actions">
          <button type="submit">{editingId ? "Save" : "Add Hero"}</button>
          {editingId && (
            <button
              type="button"
              className="secondary"
              onClick={() => {
                resetForm();
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <section className="panel">
        <h2>Hero List</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Role</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {heroes.map((hero) => (
              <tr key={hero.id}>
                <td>{hero.id}</td>
                <td>{hero.name}</td>
                <td>{hero.role || "-"}</td>
                <td>
                  {hero.image_path ? (
                    <>
                      {!brokenImages[hero.id] && (
                        <img
                          className="table-image-preview"
                          src={resolveAssetUrl(hero.image_path)}
                          alt={hero.name}
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                            setBrokenImages((prev) => ({ ...prev, [hero.id]: true }));
                          }}
                        />
                      )}
                      {brokenImages[hero.id] && (
                        <div className="table-image-placeholder">
                          {resolveAssetUrl(hero.image_path)}
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="table-image-placeholder">No Image</span>
                  )}
                </td>
                <td>
                  <button onClick={() => handleEdit(hero)}>Edit</button>
                  <button className="secondary" onClick={() => handleDelete(hero)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {confirmState.open
        ? createPortal(
            <ConfirmationModal
              open={confirmState.open}
              title={confirmState.title}
              message={confirmState.message}
              confirmText={confirmState.confirmText}
              cancelText={confirmState.cancelText}
              variant={confirmState.variant}
              onConfirm={confirmState.onConfirm}
              onCancel={closeConfirm}
            />,
            document.body
          )
        : null}
    </div>
  );
}

export default HeroConfig;
