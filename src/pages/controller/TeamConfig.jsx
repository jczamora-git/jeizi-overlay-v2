import { useEffect, useRef, useState } from "react";
import { createTeam, deleteTeam, getTeams, updateTeam } from "../../services/api";
import { resolveAssetUrl } from "../../utils/assetUrl";

const emptyForm = { name: "", shortname: "", logoPath: "" };

function TeamConfig() {
  const [teams, setTeams] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [brokenLogos, setBrokenLogos] = useState({});
  const fileInputRef = useRef(null);

  const loadTeams = async () => {
    const data = await getTeams();
    setTeams(data);
  };

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    if (!logoFile) {
      setLogoPreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(logoFile);
    setLogoPreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [logoFile]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      return;
    }

    const payload = new FormData();
    payload.append("name", form.name);
    if (form.shortname) {
      payload.append("shortname", form.shortname);
    }
    if (logoFile) {
      payload.append("logo", logoFile);
    } else if (form.logoPath) {
      payload.append("logo", form.logoPath);
    }

    if (editingId) {
      await updateTeam(editingId, payload);
    } else {
      await createTeam(payload);
    }

    setForm(emptyForm);
    setEditingId(null);
    setLogoFile(null);
    setLogoPreview("");
    await loadTeams();
  };

  const handleEdit = (team) => {
    setForm({
      name: team.name || "",
      shortname: team.shortname || "",
      logoPath: team.logo || "",
    });
    setEditingId(team.id);
    setLogoFile(null);
    setLogoPreview("");
  };

  const handleLogoPick = () => {
    fileInputRef.current?.click();
  };

  const handleLogoChange = (event) => {
    setLogoFile(event.target.files?.[0] || null);
  };

  const handleRemoveLogo = (event) => {
    event.stopPropagation();
    setLogoFile(null);
  };

  const previewUrl = logoPreview || resolveAssetUrl(form.logoPath);

  const handleDelete = async (teamId) => {
    if (!window.confirm("Delete this team?")) {
      return;
    }
    await deleteTeam(teamId);
    await loadTeams();
  };

  return (
    <div className="controller-page">
      <h1>Teams</h1>

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
          Shortname
          <input
            value={form.shortname}
            onChange={(event) => setForm({ ...form, shortname: event.target.value })}
          />
        </label>
        <label>
          Logo Upload
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
            style={{ display: "none" }}
            onChange={handleLogoChange}
          />
          <div
            className="custom-upload"
            role="button"
            tabIndex={0}
            onClick={handleLogoPick}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleLogoPick();
              }
            }}
          >
            {previewUrl ? (
              <div className="custom-upload-preview">
                <img className="upload-thumb" src={previewUrl} alt="Logo preview" />
                <div className="upload-file-name">
                  {logoFile ? logoFile.name : "Using saved logo"}
                </div>
              </div>
            ) : (
              <div className="custom-upload-placeholder">Choose Logo</div>
            )}
            <div className="custom-upload-actions">
              <button type="button" className="btn-upload" onClick={(event) => {
                event.stopPropagation();
                handleLogoPick();
              }}>
                {previewUrl ? "Change" : "Choose Logo"}
              </button>
              {logoFile && (
                <button type="button" className="btn-remove" onClick={handleRemoveLogo}>
                  Remove
                </button>
              )}
            </div>
          </div>
        </label>
        <label>
          Manual Logo Path
          <input
            value={form.logoPath}
            onChange={(event) => setForm({ ...form, logoPath: event.target.value })}
            placeholder="/uploads/teams/logo.png"
          />
        </label>
        <div className="form-actions">
          <button type="submit">{editingId ? "Save" : "Add Team"}</button>
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
        <h2>Team List</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Shortname</th>
              <th>Logo</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => (
              <tr key={team.id}>
                <td>{team.id}</td>
                <td>{team.name}</td>
                <td>{team.shortname || "-"}</td>
                <td>
                  {team.logo ? (
                    <>
                      {!brokenLogos[team.id] && (
                        <img
                          className="table-image-preview"
                          src={resolveAssetUrl(team.logo)}
                          alt={team.name}
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                            setBrokenLogos((prev) => ({ ...prev, [team.id]: true }));
                          }}
                        />
                      )}
                      {brokenLogos[team.id] && (
                        <div className="table-image-placeholder">
                          {resolveAssetUrl(team.logo)}
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="table-image-placeholder">No Logo</span>
                  )}
                </td>
                <td>
                  <button onClick={() => handleEdit(team)}>Edit</button>
                  <button className="secondary" onClick={() => handleDelete(team.id)}>
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

export default TeamConfig;
