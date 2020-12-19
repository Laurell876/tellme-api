const express = require('express');
const app = express();
const cors = require('cors');


// Middleware
app.use(express.json());
app.use(cors())


// Import Routes
const questionsRoute = require("./routes/questions");
const authRoute = require("./routes/auth");


// Route Middlewares
app.use("/api/questions", questionsRoute);
app.use("/api/auth", authRoute);


module.exports = app