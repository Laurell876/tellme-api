const router = require("express").Router();
const pool = require("../db");
const verifyToken = require("../middleware/verifyToken");

const {
  createQuestionValidation,
  questionSearchValidation,
} = require("../validation");

// SEARCH FOR A QUESTION
router.get("/search", verifyToken, async (req, res) => {
  try {
    const { error, value } = questionSearchValidation(req.query);
    if (error) return res.status(400).send(error);
    const searchTerm = value.searchTerm;

    const text =
      "SELECT * FROM question WHERE UPPER(title) like '% $1 %' OR  UPPER(description) like '% $1 %'";
    const values = [searchTerm];
    const searchRes = await pool.query(text, values);

    res.json(searchRes.rows);
  } catch (e) {
    console.error(e.stack);
    res.status(400).send(e);
  }
});

// GET ALL QUESTIONS BY CATEGORY

router.get("/category/:id", verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    const text = "SELECT * FROM question WHERE category_id = $1";
    const values = [id];
    const question = await pool.query(text, values);
    res.json(question.rows);
  } catch (e) {
    console.error(e.stack);
    res.status(400).send(e);
  }
});

// GET ALL QUESTIONS
router.get("/", verifyToken, async (req, res) => {
  try {
    const question = await pool.query("SELECT * FROM question");
    res.json(question.rows);
  } catch (e) {
    console.error(e.stack);
    res.status(400).send(e);
  }
});

// GET A QUESTION

router.get("/:id", verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    const text = "SELECT * FROM question WHERE id = $1";
    const values = [id];
    const question = await pool.query(text, values);
    res.json(question.rows[0]);
  } catch (e) {
    console.error(e.stack);
    res.status(400).send(e);
  }
});

// CREATE A QUESTION

router.post("/", verifyToken, async (req, res) => {
  try {
    const { error, value } = createQuestionValidation(req.body);
    if (error) return res.status(400).send(error);

    const { description, title, categoryId } = value;
    const userId = req.user.id;

    const text =
      "INSERT INTO question(user_id, title, description, category_id) VALUES ($1, $2, $3, $4) RETURNING *";
    const values = [userId, title, description, categoryId];

    const newQuestion = await pool.query(text, values);

    res.json(newQuestion.rows[0]);
  } catch (e) {
    console.error(e.stack);
    res.status(400).send(e);
  }
});

// DELETE A QUESTION

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const id = req.params.id;

    const selectResult = await pool.query(
      "SELECT * FROM question WHERE id = $1",
      [id]
    );
    const question = selectResult.rows[0];
    if (!question) {
      return res.status(404).send({ message: "Question not found" });
    }
    if (question.user_id !== req.user.id && req.user.is_admin === "f") {
      return res.status(401).send({ message: "Unauthorized" });
    }

    const text = "DELETE FROM question WHERE id = $1 RETURNING *";
    const values = [id];
    const result = await pool.query(text, values);

    res.json(result.rows[0]);
  } catch (e) {
    console.error(e.stack);
    res.status(400).send(e);
  }
});

module.exports = router;
