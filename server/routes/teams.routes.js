const express = require("express");
const { pool } = require("../db");
const { uploadTeamLogo } = require("../middleware/upload");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM teams ORDER BY name ASC");
    res.json(rows);
  } catch (error) {
    console.error("Failed to fetch teams", error);
    res.status(500).json({ message: "Failed to fetch teams" });
  }
});

router.post("/", uploadTeamLogo.single("logo"), async (req, res) => {
  try {
    const { name, shortname, logo } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Team name is required" });
    }

    const logoPath = req.file ? `/uploads/teams/${req.file.filename}` : logo || null;

    const [result] = await pool.query(
      "INSERT INTO teams (name, shortname, logo) VALUES (?,?,?)",
      [name, shortname || null, logoPath]
    );

    res.status(201).json({
      id: result.insertId,
      name,
      shortname: shortname || null,
      logo: logoPath,
    });
  } catch (error) {
    console.error("Failed to create team", error);
    res.status(500).json({ message: "Failed to create team" });
  }
});

router.put("/:id", uploadTeamLogo.single("logo"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, shortname, logo } = req.body;

    let nextLogo = null;
    const hasLogoField = Object.prototype.hasOwnProperty.call(req.body, "logo");

    if (req.file) {
      nextLogo = `/uploads/teams/${req.file.filename}`;
    } else if (hasLogoField) {
      nextLogo = logo || null;
    } else {
      const [rows] = await pool.query("SELECT logo FROM teams WHERE id = ?", [id]);
      nextLogo = rows[0]?.logo ?? null;
    }

    await pool.query(
      "UPDATE teams SET name = ?, shortname = ?, logo = ? WHERE id = ?",
      [name, shortname || null, nextLogo, id]
    );

    res.json({ id: Number(id), name, shortname: shortname || null, logo: nextLogo });
  } catch (error) {
    console.error("Failed to update team", error);
    res.status(500).json({ message: "Failed to update team" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM teams WHERE id = ?", [id]);
    res.status(204).send();
  } catch (error) {
    console.error("Failed to delete team", error);
    res.status(500).json({ message: "Failed to delete team" });
  }
});

module.exports = router;
