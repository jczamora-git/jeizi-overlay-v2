import { useEffect, useState } from "react";
import {
  createDraftAction,
  deleteDraftAction,
  getDraftActions,
  getGames,
  getHeroes,
  updateDraftAction,
} from "../../services/api";

const emptyForm = {
  team_side: "BLUE",
  action_type: "PICK",
  hero_id: "",
  action_order: "",
  locked: false,
};

function DraftController() {
  const [games, setGames] = useState([]);
  const [heroes, setHeroes] = useState([]);
  const [selectedGameId, setSelectedGameId] = useState("");
  const [actions, setActions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const loadBaseData = async () => {
    const [gameData, heroData] = await Promise.all([getGames(), getHeroes()]);
    setGames(gameData);
    setHeroes(heroData);
  };

  const loadActions = async (gameId) => {
    if (!gameId) {
      setActions([]);
      return;
    }
    const draftData = await getDraftActions(gameId);
    setActions(draftData);
  };

  useEffect(() => {
    loadBaseData();
  }, []);

  useEffect(() => {
    loadActions(selectedGameId);
  }, [selectedGameId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedGameId) {
      return;
    }

    const payload = {
      ...form,
      game_id: Number(selectedGameId),
      hero_id: form.hero_id || null,
      action_order: Number(form.action_order || 0),
      locked: Boolean(form.locked),
    };

    if (editingId) {
      await updateDraftAction(editingId, payload);
    } else {
      await createDraftAction(payload);
    }

    setForm(emptyForm);
    setEditingId(null);
    await loadActions(selectedGameId);
  };

  const handleEdit = (action) => {
    setEditingId(action.id);
    setForm({
      team_side: action.team_side || "BLUE",
      action_type: action.action_type || "PICK",
      hero_id: action.hero_id || "",
      action_order: action.action_order || "",
      locked: Boolean(action.locked),
    });
  };

  const handleDelete = async (actionId) => {
    if (!window.confirm("Delete this action?")) {
      return;
    }
    await deleteDraftAction(actionId);
    await loadActions(selectedGameId);
  };

  const grouped = actions.reduce(
    (acc, action) => {
      const key = action.team_side === "RED" ? "red" : "blue";
      acc[key].push(action);
      return acc;
    },
    { blue: [], red: [] }
  );

  return (
    <div className="controller-page">
      <h1>Draft Controller</h1>

      <section className="panel form-grid">
        <label>
          Game
          <select
            value={selectedGameId}
            onChange={(event) => setSelectedGameId(event.target.value)}
          >
            <option value="">Select game</option>
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                Match {game.match_id} - Game {game.game_no}
              </option>
            ))}
          </select>
        </label>
      </section>

      <form className="panel form-grid" onSubmit={handleSubmit}>
        <label>
          Team Side
          <select
            value={form.team_side}
            onChange={(event) => setForm({ ...form, team_side: event.target.value })}
          >
            <option value="BLUE">BLUE</option>
            <option value="RED">RED</option>
          </select>
        </label>
        <label>
          Action Type
          <select
            value={form.action_type}
            onChange={(event) => setForm({ ...form, action_type: event.target.value })}
          >
            <option value="BAN">BAN</option>
            <option value="PICK">PICK</option>
          </select>
        </label>
        <label>
          Hero
          <select
            value={form.hero_id}
            onChange={(event) => setForm({ ...form, hero_id: event.target.value })}
          >
            <option value="">Select hero</option>
            {heroes.map((hero) => (
              <option key={hero.id} value={hero.id}>
                {hero.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Action Order
          <input
            value={form.action_order}
            onChange={(event) => setForm({ ...form, action_order: event.target.value })}
          />
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={form.locked}
            onChange={(event) => setForm({ ...form, locked: event.target.checked })}
          />
          Locked
        </label>
        <div className="form-actions">
          <button type="submit">{editingId ? "Save" : "Add Action"}</button>
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
        <h2>Draft Actions</h2>
        <div className="draft-grid">
          <div>
            <h3>Blue Side</h3>
            <ul>
              {grouped.blue.map((action) => (
                <li key={action.id}>
                  #{action.action_order} {action.action_type} - {action.hero_name || "-"}
                  <div className="inline-actions">
                    <button onClick={() => handleEdit(action)}>Edit</button>
                    <button className="secondary" onClick={() => handleDelete(action.id)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Red Side</h3>
            <ul>
              {grouped.red.map((action) => (
                <li key={action.id}>
                  #{action.action_order} {action.action_type} - {action.hero_name || "-"}
                  <div className="inline-actions">
                    <button onClick={() => handleEdit(action)}>Edit</button>
                    <button className="secondary" onClick={() => handleDelete(action.id)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DraftController;
