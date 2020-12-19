const express = require('express');
const app = express();
const cors = require('cors');


// Middleware
app.use(express.json());
app.use(cors())


// Import Routes
const questionsRoute = require("./routes/questions");


// Route Middlewares
app.use("/api/questions", questionsRoute);


module.exports = app