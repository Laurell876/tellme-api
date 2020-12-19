const express = require('express');
const app = express();
const cors = require('cors');


// Middleware
app.use(express.json());
app.use(cors())


// Import Routes
const questionsRoute = require("./routes/questions");
const authRoute = require("./routes/auth");
const categoryRoute = require("./routes/category");
const responseRoute = require("./routes/response");


// Route Middlewares
app.use("/api/questions", questionsRoute);
app.use("/api/auth", authRoute);
app.use("/api/category", categoryRoute);
app.use("/api/response", responseRoute);


module.exports = app