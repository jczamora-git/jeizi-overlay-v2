const express = require("express");
const { pool } = require("../db");
const { uploadMapIcon } = require("../middleware/upload");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM maps ORDER BY name ASC");
    res.json(rows);
  } catch (error) {
    console.error("Failed to fetch maps", error);
    res.status(500).json({ message: "Failed to fetch maps" });
  }
});

router.post("/", uploadMapIcon.single("icon"), async (req, res) => {
  try {
    const { name, icon_path } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Map name is required" });
    }

    const iconPath = req.file ? `/uploads/maps/${req.file.filename}` : icon_path || null;

    const [result] = await pool.query("INSERT INTO maps (name, icon_path) VALUES (?,?)", [
      name,
      iconPath,
    ]);

    res.status(201).json({ id: result.insertId, name, icon_path: iconPath });
  } catch (error) {
    console.error("Failed to create map", error);
    res.status(500).json({ message: "Failed to create map" });
  }
});

router.put(":id", uploadMapIcon.single("icon"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon_path } = req.body;

    let nextIconPath = null;
    const hasIconField = Object.prototype.hasOwnProperty.call(req.body, "icon_path");

    if (req.file) {
      nextIconPath = `/uploads/maps/${req.file.filename}`;
    } else if (hasIconField) {
      nextIconPath = icon_path || null;
    } else {
      const [rows] = await pool.query("SELECT icon_path FROM maps WHERE id = ?", [id]);
      nextIconPath = rows[0]?.icon_path ?? null;
    }

    await pool.query("UPDATE maps SET name = ?, icon_path = ? WHERE id = ?", [
      name,
      nextIconPath,
      id,
    ]);

    res.json({ id: Number(id), name, icon_path: nextIconPath });
  } catch (error) {
    console.error("Failed to update map", error);
    res.status(500).json({ message: "Failed to update map" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM maps WHERE id = ?", [id]);
    res.status(204).send();
  } catch (error) {
    console.error("Failed to delete map", error);
    res.status(500).json({ message: "Failed to delete map" });
  }
});

module.exports = router;
