const express = require("express");
const app = express();
const pool = require("./db");

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is listening on port: ${PORT}`)
})