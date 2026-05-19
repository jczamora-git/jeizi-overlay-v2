const express = require("express");
const { pool } = require("../db");

const router = express.Router();

function getMaxGamesByMode(mode) {
  switch (mode) {
    case "BO1":
      return 1;
    case "BO3":
      return 3;
    case "BO5":
      return 5;
    case "BO7":
      return 7;
    default:
      return 1;
  }
}

async function recalculateMatchScore(matchId) {
  if (!matchId) {
    return;
  }

  const [matchRows] = await pool.query(
    "SELECT blue_team_id, red_team_id FROM matches WHERE id = ?",
    [matchId]
  );
  const match = matchRows[0];
  if (!match) {
    return;
  }

  const [winnerRows] = await pool.query(
    "SELECT winner_team_id FROM games WHERE match_id = ? AND winner_team_id IS NOT NULL",
    [matchId]
  );

  let blueScore = 0;
  let redScore = 0;
  winnerRows.forEach((row) => {
    if (String(row.winner_team_id) === String(match.blue_team_id)) {
      blueScore += 1;
    } else if (String(row.winner_team_id) === String(match.red_team_id)) {
      redScore += 1;
    }
  });

  await pool.query(
    "UPDATE matches SET blue_score = ?, red_score = ? WHERE id = ?",
    [blueScore, redScore, matchId]
  );
}

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT g.id, g.match_id, g.game_no, g.map_id, g.status, g.winner_team_id, " +
        "m.match_no, m.title AS match_title, m.blue_team_id, m.red_team_id, " +
        "bt.name AS blue_team_name, rt.name AS red_team_name, " +
        "mp.name AS map_name " +
        "FROM games g " +
        "LEFT JOIN matches m ON g.match_id = m.id " +
        "LEFT JOIN teams bt ON m.blue_team_id = bt.id " +
        "LEFT JOIN teams rt ON m.red_team_id = rt.id " +
        "LEFT JOIN maps mp ON g.map_id = mp.id " +
        "ORDER BY g.match_id ASC, g.game_no ASC"
    );
    res.json(rows);
  } catch (error) {
    console.error("Failed to fetch games", error);
    res.status(500).json({ message: "Failed to fetch games" });
  }
});

router.get("/current", async (req, res) => {
  try {
    const [matchRows] = await pool.query(
      "SELECT * FROM matches WHERE status IN ('active','live') ORDER BY queue_order ASC LIMIT 1"
    );
    const match = matchRows[0];
    if (!match) {
      return res.json(null);
    }

    const [gameRows] = await pool.query(
      "SELECT * FROM games WHERE match_id = ? AND status IN ('setup','drafting','live') ORDER BY game_no ASC LIMIT 1",
      [match.id]
    );
    res.json(gameRows[0] || null);
  } catch (error) {
    console.error("Failed to fetch current game", error);
    res.status(500).json({ message: "Failed to fetch current game" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { match_id, game_no, map_id, status } = req.body;

    if (!match_id) {
      return res.status(400).json({ message: "match_id is required" });
    }

    const [matchRows] = await pool.query("SELECT mode FROM matches WHERE id = ?", [match_id]);
    const match = matchRows[0];
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    const [countRows] = await pool.query(
      "SELECT COUNT(*) AS game_count FROM games WHERE match_id = ?",
      [match_id]
    );
    const gameCount = Number(countRows[0]?.game_count || 0);
    const maxGames = getMaxGamesByMode(match.mode);

    if (gameCount >= maxGames) {
      return res.status(400).json({ message: "Maximum games reached for this match mode." });
    }

    let finalGameNo = game_no;
    if (!finalGameNo) {
      const [rows] = await pool.query(
        "SELECT COALESCE(MAX(game_no), 0) + 1 AS next_game_no FROM games WHERE match_id = ?",
        [match_id]
      );
      finalGameNo = rows[0]?.next_game_no || 1;
    }

    const [result] = await pool.query(
      "INSERT INTO games (match_id, game_no, map_id, status) VALUES (?,?,?,?)",
      [match_id, finalGameNo, map_id || null, status || "setup"]
    );

    const io = req.app.get("io");
    if (io) {
      io.emit("matches:changed");
    }

    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error("Failed to create game", error);
    res.status(500).json({ message: "Failed to create game" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { match_id, game_no, map_id, status, winner_team_id } = req.body;
    const fields = [];
    const values = [];

    if (match_id !== undefined) {
      fields.push("match_id = ?");
      values.push(match_id);
    }
    if (game_no !== undefined) {
      fields.push("game_no = ?");
      values.push(game_no);
    }
    if (Object.prototype.hasOwnProperty.call(req.body, "map_id")) {
      fields.push("map_id = ?");
      values.push(map_id || null);
    }
    if (status !== undefined) {
      fields.push("status = ?");
      values.push(status);
    }
    if (Object.prototype.hasOwnProperty.call(req.body, "winner_team_id")) {
      fields.push("winner_team_id = ?");
      values.push(winner_team_id || null);
    }

    if (!fields.length) {
      return res.status(400).json({ message: "No fields to update" });
    }

    values.push(id);
    await pool.query(`UPDATE games SET ${fields.join(", ")} WHERE id = ?`, values);

    if (Object.prototype.hasOwnProperty.call(req.body, "winner_team_id")) {
      let matchId = match_id;
      if (!matchId) {
        const [rows] = await pool.query("SELECT match_id FROM games WHERE id = ?", [id]);
        matchId = rows[0]?.match_id;
      }
      await recalculateMatchScore(matchId);
    }

    const io = req.app.get("io");
    if (io) {
      io.emit("matches:changed");
    }

    res.json({ id: Number(id) });
  } catch (error) {
    console.error("Failed to update game", error);
    res.status(500).json({ message: "Failed to update game" });
  }
});

router.put("/:id/set-active", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    await connection.beginTransaction();

    const [gameRows] = await connection.query("SELECT * FROM games WHERE id = ?", [id]);
    const game = gameRows[0];
    if (!game) {
      await connection.rollback();
      return res.status(404).json({ message: "Game not found" });
    }

    await connection.query(
      "UPDATE games SET status = 'queued' WHERE match_id = ? AND status IN ('setup','drafting','live') AND status <> 'finished'",
      [game.match_id]
    );
    await connection.query("UPDATE games SET status = 'setup' WHERE id = ?", [id]);

    await connection.commit();
    const io = req.app.get("io");
    if (io) {
      io.emit("matches:changed");
    }

    res.json({ id: Number(id), status: "setup" });
  } catch (error) {
    await connection.rollback();
    console.error("Failed to set active game", error);
    res.status(500).json({ message: "Failed to set active game" });
  } finally {
    connection.release();
  }
});

router.put("/:id/winner", async (req, res) => {
  try {
    const { id } = req.params;
    const { winner_team_id } = req.body;
    const [gameRows] = await pool.query("SELECT match_id FROM games WHERE id = ?", [id]);
    const game = gameRows[0];
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    await pool.query("UPDATE games SET winner_team_id = ?, status = 'finished' WHERE id = ?", [
      winner_team_id || null,
      id,
    ]);

    await recalculateMatchScore(game.match_id);

    const io = req.app.get("io");
    if (io) {
      io.emit("matches:changed");
    }

    res.json({ id: Number(id), winner_team_id, status: "finished" });
  } catch (error) {
    console.error("Failed to set game winner", error);
    res.status(500).json({ message: "Failed to set game winner" });
  }
});

router.put("/:id/reset-result", async (req, res) => {
  try {
    const { id } = req.params;
    const [gameRows] = await pool.query("SELECT match_id FROM games WHERE id = ?", [id]);
    const game = gameRows[0];
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    await pool.query("UPDATE games SET winner_team_id = NULL, status = 'setup' WHERE id = ?", [
      id,
    ]);

    await recalculateMatchScore(game.match_id);

    const io = req.app.get("io");
    if (io) {
      io.emit("matches:changed");
    }

    res.json({ id: Number(id), winner_team_id: null, status: "setup" });
  } catch (error) {
    console.error("Failed to reset game result", error);
    res.status(500).json({ message: "Failed to reset game result" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [gameRows] = await pool.query("SELECT match_id FROM games WHERE id = ?", [id]);
    const game = gameRows[0];

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    await pool.query("DELETE FROM games WHERE id = ?", [id]);
    await recalculateMatchScore(game.match_id);

    const io = req.app.get("io");
    if (io) {
      io.emit("matches:changed");
    }

    res.json({ id: Number(id), deleted: true });
  } catch (error) {
    console.error("Failed to delete game", error);
    res.status(500).json({ message: "Failed to delete game" });
  }
});

module.exports = router;
