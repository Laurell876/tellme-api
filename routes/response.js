const router = require("express").Router();
const pool = require("../db");
const adminCheck = require("../middleware/adminCheck");
const verifyToken = require("../middleware/verifyToken");

const { createResponseValidation } = require("../validation");

// RESPOND TO QUESTION

router.post("/", verifyToken, async (req, res) => {
  try {
    const { error, value } = createResponseValidation(req.body);
    if (error) return res.status(400).send(error);

    const { description, title, questionId } = value;

    // Check is question Exists
    const selectResult = await pool.query(
      "SELECT * FROM question WHERE id = $1",
      [questionId]
    );
    const question = selectResult.rows[0];
    if (!question) {
      return res.status(404).send({ message: "Question not found" });
    }

    // Create response
    const text =
      "INSERT INTO response(user_id, question_id,title, description) VALUES ($1, $2, $3, $4) RETURNING *";
    const values = [req.user.id, question.id, title, description];

    const newResponse = await pool.query(text, values);

    res.json(newResponse.rows[0]);
  } catch (e) {
    console.error(e.stack);
    res.status(400).send(e);
  }
});

// DELETE RESPONSE

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const id = req.params.id;

    const selectResult = await pool.query(
      "SELECT * FROM response WHERE id = $1",
      [id]
    );
    const response = selectResult.rows[0];
    if (!response) {
      return res.status(404).send({ message: "Question not found" });
    }
    if (response.user_id !== req.user.id && req.user.is_admin === "f") {
      return res.status(401).send({ message: "Unauthorized" });
    }

    const text = "DELETE FROM response WHERE id = $1 RETURNING *";
    const values = [id];
    const result = await pool.query(text, values);

    res.json(result.rows[0]);
  } catch (e) {
    console.error(e.stack);
    res.status(400).send(e);
  }
});

// LIKE RESPONSE - ensure response isnt already liked

router.post("/:id/like-response", verifyToken, async (req, res) => {
  try {
    const id = req.params.id;

    // FIND RESPONSE
    const selectResult = await pool.query(
      "SELECT * FROM response WHERE id = $1",
      [id]
    );
    const response = selectResult.rows[0];
    if (!response) {
      return res.status(404).send({ message: "Question not found" });
    }

    // IF THE RESPONSE WAS ALREADY LIKED UNLIKE IT
    const alreadyLikedQuery = await pool.query(
      "SELECT * FROM response_like WHERE user_id = $1 AND response_id = $2",
      [req.user.id, response.id]
    );
    const alreadyLiked = alreadyLikedQuery.rows[0];
    if (alreadyLiked) {
      const unlikedResponse = await pool.query(
        "DELETE FROM response_like WHERE user_id = $1 AND response_id = $2 RETURNING *",
        [req.user.id, response.id]
      );
      return res.json({
        ...unlikedResponse.rows[0],
        message: "Response unliked",
      });
    }

    // LIKE RESPONSE

    const text =
      "INSERT INTO response_like(user_id, response_id) VALUES ($1, $2) RETURNING *";
    const values = [req.user.id, response.id];

    const newResponseLike = await pool.query(text, values);

    return res.json({ ...newResponseLike.rows[0], message: "Response liked" });
  } catch (e) {
    console.error(e.stack);
    res.status(400).send(e);
  }
});

// return number of likes the response has
router.get("/:id/likes", verifyToken, async (req, res) => {
  try {
    const id = req.params.id;

    // FIND RESPONSE
    const selectResult = await pool.query(
      "SELECT * FROM response WHERE id = $1",
      [id]
    );
    const response = selectResult.rows[0];
    if (!response) {
      return res.status(404).send({ message: "Question not found" });
    }

    const numberOfLikesQuery = await pool.query(
      "SELECT COUNT(*) FROM response_like WHERE response_id = $1",
      [response.id]
    );
    const numberOfLikes = numberOfLikesQuery.rows[0];
    return res.status(200).send({responseId: response.id, likes: parseInt(numberOfLikes.count) });
  } catch (e) {
    console.error(e.stack);
    res.status(400).send(e);
  }
});

module.exports = router;
