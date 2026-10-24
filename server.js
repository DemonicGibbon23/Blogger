require("dotenv").config;
const express = require("express");
const path = require("path");
const connectDatabase = require("./src/config/database");

const app = express();
const PORT = 5000;

connectDatabase();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Bloggr server is running!"
  });
});

app.get("/api/:name", (req, res) => {
  const name = req.params.name;
  res.json({
    message: "Hello "+name
  });
})

app.listen(PORT, () => {
  console.log(`Bloggr is running at http:localhost:${PORT}`);
});
