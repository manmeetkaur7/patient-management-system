const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend (client folder)
app.use(express.static(path.join(__dirname, "../client")));

// Route for homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

// API routes
const patientRoutes = require("./routes/patientRoutes");
app.use("/api/patients", patientRoutes);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});