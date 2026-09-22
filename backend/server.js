const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDatabase = require("./src/config/database");
const authRoutes = require("./src/routes/auth.routes");

dotenv.config();

const app = express();


// Middleware
app.use(cors());
app.use(express.json());


// Routes
app.use("/api/auth", authRoutes);


// Basic test route
app.get("/", (req, res) => {
    res.json({
        message: "Bloggr backend is running"
    });
});


// Connect to database and start server
const startServer = async () => {

    await connectDatabase();

    app.listen(process.env.PORT, () => {
        console.log(
            `Server running at http://localhost:${process.env.PORT}`
        );
    });

};

startServer();