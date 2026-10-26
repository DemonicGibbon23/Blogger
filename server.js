require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");

const connectDatabase = require("./src/config/database");
const authRoutes = require("./src/routes/authRoutes");
const blogRoutes = require("./src/routes/blogRoutes");
const commentRoutes = require("./src/routes/commentRoutes");
const voteRoutes = require("./src/routes/voteRoutes");
const reportRoutes = require("./src/routes/reportRoutes");
const userRoutes = require("./src/routes/userRoutes");

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === "production";

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Security headers (manual, no helmet dependency) ───────────────────────────
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "0"); // modern browsers use CSP instead
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' 'unsafe-inline'; img-src 'self' data:"
  );
  next();
});

// ── Session ───────────────────────────────────────────────────────────────────
const sessionSecret = process.env.SESSION_SECRET || "change-me-in-production-use-env";
if (!process.env.SESSION_SECRET) {
  console.warn("[WARN] SESSION_SECRET is not set in .env – using insecure default.");
}

const sessionStore = MongoStore.create({
  mongoUrl: process.env.MONGO_URI,
  collectionName: "sessions",
  ttl: 7 * 24 * 60 * 60,
  autoRemove: "native"
});

app.use(
  session({
    name: "bloggr.sid",
    secret: sessionSecret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    }
  })
);

// ── Static files ──────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "public")));

// ── API Routes ─────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Bloggr server is running!" });
});

// ── Centralized error handler ─────────────────────────────────────────────────
// Must be last, after all routes
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  const status = err.status || 500;
  res.status(status).json({
    message: isProduction ? "Something went wrong" : err.message
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────
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
