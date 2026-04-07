const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const dataFilePath = path.join(__dirname, "../data/patients.json");

function readPatients() {
  const data = fs.readFileSync(dataFilePath, "utf8");
  return JSON.parse(data);
}

function writePatients(patients) {
  fs.writeFileSync(dataFilePath, JSON.stringify(patients, null, 2));
}

// Get all patients
router.get("/", (req, res) => {
  try {
    const patients = readPatients();
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: "Error reading patient data" });
  }
});

// Add a patient
router.post("/", (req, res) => {
  try {
    const patients = readPatients();

    const newPatient = {
      id: Date.now().toString(),
      fullName: req.body.fullName,
      age: req.body.age,
      gender: req.body.gender,
      phone: req.body.phone,
      email: req.body.email,
      medicalCondition: req.body.medicalCondition,
    };

    patients.push(newPatient);
    writePatients(patients);

    res.status(201).json(newPatient);
  } catch (error) {
    res.status(500).json({ message: "Error saving patient data" });
  }
});

// Delete a patient
router.delete("/:id", (req, res) => {
  try {
    const patients = readPatients();
    const filteredPatients = patients.filter(
      (patient) => patient.id !== req.params.id
    );

    writePatients(filteredPatients);
    res.status(200).json({ message: "Patient deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting patient data" });
  }
});

module.exports = router;