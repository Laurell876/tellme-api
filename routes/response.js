const router = require("express").Router();
const pool = require("../db");
const adminCheck = require("../middleware/adminCheck");
const verifyToken = require("../middleware/verifyToken");

const { createCategoryValidation } = require("../validation");

// RESPOND TO QUESTION


// DELETE RESPONSE

// LIKE RESPONSE - ensure response isnt already liked

// REMOVE LIKE FROM RESPONSE
module.exports = router;
