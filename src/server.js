import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pool from "./config/db.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Node.js Backend Running 🚀");
});

// Simple DB health check route
app.get("/db-health", async (req, res) => {
  try {
    const result = await pool.query("SELECT 1 AS ok");
    res.json({ status: "ok", db: result.rows[0].ok });
  } catch (err) {
    console.error("DB health check failed:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  // Try a startup query to verify connection
  try {
    const result = await pool.query("SELECT current_database() AS db, current_user AS user");
    console.log("Connected to DB:", result.rows[0]);
  } catch (err) {
    console.error("DB connection on startup failed:", err.message);
  }
});
