const router = require("express").Router();
const pool = require("../db");
const adminCheck = require("../middleware/adminCheck");
const verifyToken = require("../middleware/verifyToken");

const { createCategoryValidation } = require("../validation");

// GET ALL CATEGORIES
router.get("/", verifyToken, async (req, res) => {
  try {
    const query = await pool.query("SELECT * FROM category");
    res.json(query.rows);
  } catch (e) {
    console.error(e.stack);
    res.status(400).send(e);
  }
});

// GET A CATEGORY

router.get("/:id", verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    const text = "SELECT * FROM category WHERE id = $1";
    const values = [id];
    const query = await pool.query(text, values);

    if (!query.rows[0]) {
      return res.status(404).send({ message: "Category not found" });
    }

    res.json(query.rows[0]);
  } catch (e) {
    console.error(e.stack);
    res.status(400).send(e);
  }
});

// CREATE A Category

router.post("/", verifyToken, async (req, res) => {
  try {
    adminCheck(req, res);

    const { error, value } = createCategoryValidation(req.body);
    if (error) return res.status(400).send(error);

    const { title } = value;

    const text = "INSERT INTO category(title) VALUES ($1) RETURNING *";
    const values = [title];

    const newCategory = await pool.query(text, values);

    res.json(newCategory.rows[0]);
  } catch (e) {
    console.error(e.stack);
    res.status(400).send(e);
  }
});

// DELETE A Category

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    adminCheck(req, res);

    const id = req.params.id;

    const selectResult = await pool.query(
      "SELECT * FROM category WHERE id = $1",
      [id]
    );
    const category = selectResult.rows[0];
    if (!category) {
      return res.status(404).send({ message: "Category not found" });
    }

    const text = "DELETE FROM category WHERE id = $1 RETURNING *";
    const values = [id];
    const result = await pool.query(text, values);

    res.json(result.rows[0]);
  } catch (e) {
    console.error(e.stack);
    res.status(400).send(e);
  }
});

module.exports = router;
