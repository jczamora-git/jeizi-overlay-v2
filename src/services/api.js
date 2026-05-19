const API_BASE = "/api";

async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const headers = isFormData ? options.headers : { "Content-Type": "application/json" };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const getTeams = () => request("/teams");
export const createTeam = (payload) =>
  request("/teams", { method: "POST", body: payload });
export const updateTeam = (id, payload) =>
  request(`/teams/${id}`, { method: "PUT", body: payload });
export const deleteTeam = (id) => request(`/teams/${id}`, { method: "DELETE" });

export const getMatches = () => request("/matches");
export const getCurrentMatch = () => request("/matches/current");
export const createMatch = async (payload) => {
  const response = await fetch("/api/matches", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.message || result?.error || "Failed to create match");
  }

  return result;
};
export const deleteMatch = (id) => request(`/matches/${id}`, { method: "DELETE" });
export async function updateMatch(id, data) {
  const res = await fetch(`/api/matches/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(result?.error || result?.message || "Failed to update match");
  }

  return result;
}
export const startMatch = (id) => request(`/matches/${id}/start`, { method: "PUT" });
export const finishMatch = (id) => request(`/matches/${id}/finish`, { method: "PUT" });
export const updateMatchScore = (id, payload) =>
  request(`/matches/${id}/score`, { method: "PUT", body: JSON.stringify(payload) });
export const loadNextMatch = () => request("/matches/load-next", { method: "PUT" });

export const getGames = () => request("/games");
export const getCurrentGame = () => request("/games/current");
export const createGame = (payload) =>
  request("/games", { method: "POST", body: JSON.stringify(payload) });
export const updateGame = (id, payload) =>
  request(`/games/${id}`, { method: "PUT", body: JSON.stringify(payload) });
export const deleteGame = (id) => request(`/games/${id}`, { method: "DELETE" });
export const setGameWinner = (id, payload) =>
  request(`/games/${id}/winner`, { method: "PUT", body: JSON.stringify(payload) });
export const resetGameWinner = (id) =>
  request(`/games/${id}/reset-result`, { method: "PUT" });

export const getMaps = () => request("/maps");
export const createMap = (payload) =>
  request("/maps", { method: "POST", body: payload });
export const updateMap = (id, payload) =>
  request(`/maps/${id}`, { method: "PUT", body: payload });
export const deleteMap = (id) => request(`/maps/${id}`, { method: "DELETE" });

export const getHeroes = () => request("/heroes");
export const createHero = (payload) =>
  request("/heroes", { method: "POST", body: payload });
export const updateHero = (id, payload) =>
  request(`/heroes/${id}`, { method: "PUT", body: payload });
export const deleteHero = (id) => request(`/heroes/${id}`, { method: "DELETE" });

export const getCasters = () => request("/casters");
export const createCaster = (payload) =>
  request("/casters", { method: "POST", body: payload });
export const updateCaster = (id, payload) =>
  request(`/casters/${id}`, { method: "PUT", body: payload });
export const deleteCaster = (id) => request(`/casters/${id}`, { method: "DELETE" });

export const getDraftActions = (gameId) => request(`/draft/${gameId}`);
export const createDraftAction = (payload) =>
  request("/draft", { method: "POST", body: JSON.stringify(payload) });
export const updateDraftAction = (id, payload) =>
  request(`/draft/${id}`, { method: "PUT", body: JSON.stringify(payload) });
export const deleteDraftAction = (id) => request(`/draft/${id}`, { method: "DELETE" });

export const getCurrentOverlayData = () => request("/current-overlay-data");
