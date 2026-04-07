const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const patientRoutes = require("./routes/patientRoutes");
app.use("/api/patients", patientRoutes);

app.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});