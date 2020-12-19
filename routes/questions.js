const router = require("express").Router();
const pool = require("../db");

const { createQuestionValidation } = require("../validation");


// GET ALL QUESTIONS BY CATEGORY

router.get("/category/:id", async (req, res) => {
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
router.get("/", async (req, res) => {
    try {
      const question = await pool.query("SELECT * FROM question");
      res.json(question.rows);
    } catch (e) {
      console.error(e.stack);
      res.status(400).send(e);
    }
  });
  

// GET A QUESTION

router.get("/:id", async (req, res) => {
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

router.post("/", async (req, res) => {
  try {
    const { error, value } = createQuestionValidation(req.body);
    if (error) return res.status(400).send(error);

    const { description, title } = value;
    const userId = 2;
    const categoryId = 1;

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

router.delete("/:id", async (req, res) => {
  try {
    // ensure user is either an admin or the person that created the question

    const id = req.params.id;
    const text = "DELETE FROM question WHERE id = $1 RETURNING *";
    const values = [id];
    const result = await pool.query(text, values);
    if (result.rowCount == 0) {
      return res.status(404).send({ message: "Question not found"});
    }
    res.json(result.rows[0]);
  } catch (e) {
    console.error(e.stack);
    res.status(400).send(e);
  }
});

module.exports = router;
