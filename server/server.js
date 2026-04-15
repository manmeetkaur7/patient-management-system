const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API routes
const patientRoutes = require("./routes/patientRoutes");
app.use("/api/patients", patientRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Serve frontend after API routes so API requests never receive index.html.
app.use(express.static(path.join(__dirname, "../client")));

// Frontend fallback for Render/single-service deployments.
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
