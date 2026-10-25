require("dotenv").config();
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

async function startServer() {
    try {
        await connectDatabase();

        app.listen(PORT, () => {
            console.log(`Bloggr running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start Bloggr:", error.message);
        process.exit(1);
    }
}

startServer();
