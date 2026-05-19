const express = require("express");
const { pool } = require("../db");

const router = express.Router();

router.get("/:gameId", async (req, res) => {
  try {
    const { gameId } = req.params;
    const [rows] = await pool.query(
      "SELECT da.*, h.name AS hero_name, h.image_path AS hero_image_path FROM draft_actions da LEFT JOIN heroes h ON da.hero_id = h.id WHERE da.game_id = ? ORDER BY da.action_order ASC",
      [gameId]
    );
    res.json(rows);
  } catch (error) {
    console.error("Failed to fetch draft actions", error);
    res.status(500).json({ message: "Failed to fetch draft actions" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { game_id, team_side, action_type, hero_id, action_order, locked } = req.body;

    const [result] = await pool.query(
      "INSERT INTO draft_actions (game_id, team_side, action_type, hero_id, action_order, locked) VALUES (?,?,?,?,?,?)",
      [game_id, team_side, action_type, hero_id, action_order, locked ? 1 : 0]
    );

    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error("Failed to create draft action", error);
    res.status(500).json({ message: "Failed to create draft action" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { game_id, team_side, action_type, hero_id, action_order, locked } = req.body;

    await pool.query(
      "UPDATE draft_actions SET game_id = ?, team_side = ?, action_type = ?, hero_id = ?, action_order = ?, locked = ? WHERE id = ?",
      [game_id, team_side, action_type, hero_id, action_order, locked ? 1 : 0, id]
    );

    res.json({ id: Number(id) });
  } catch (error) {
    console.error("Failed to update draft action", error);
    res.status(500).json({ message: "Failed to update draft action" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM draft_actions WHERE id = ?", [id]);
    res.status(204).send();
  } catch (error) {
    console.error("Failed to delete draft action", error);
    res.status(500).json({ message: "Failed to delete draft action" });
  }
});

module.exports = router;
