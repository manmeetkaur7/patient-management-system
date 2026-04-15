const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const dataFilePath = path.join(__dirname, "../data/patients.json");

function readPatients() {
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, "[]");
  }

  const data = fs.readFileSync(dataFilePath, "utf8");
  return JSON.parse(data || "[]");
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
    console.error("GET /api/patients error:", error);
    res.status(500).json({ message: "Error reading patient data" });
  }
});

// Add patient
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
      appointments: [],
    };

    patients.push(newPatient);
    writePatients(patients);

    res.status(201).json(newPatient);
  } catch (error) {
    console.error("POST /api/patients error:", error);
    res.status(500).json({ message: "Error saving patient data" });
  }
});

// Update patient
router.put("/:id", (req, res) => {
  try {
    const patients = readPatients();
    const patientIndex = patients.findIndex(
      (patient) => patient.id === req.params.id
    );

    if (patientIndex === -1) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const existingAppointments = patients[patientIndex].appointments || [];

    patients[patientIndex] = {
      ...patients[patientIndex],
      fullName: req.body.fullName,
      age: req.body.age,
      gender: req.body.gender,
      phone: req.body.phone,
      email: req.body.email,
      medicalCondition: req.body.medicalCondition,
      appointments: existingAppointments,
    };

    writePatients(patients);
    res.status(200).json(patients[patientIndex]);
  } catch (error) {
    console.error("PUT /api/patients/:id error:", error);
    res.status(500).json({ message: "Error updating patient data" });
  }
});

// Delete patient
router.delete("/:id", (req, res) => {
  try {
    const patients = readPatients();
    const filteredPatients = patients.filter(
      (patient) => patient.id !== req.params.id
    );

    if (filteredPatients.length === patients.length) {
      return res.status(404).json({ message: "Patient not found" });
    }

    writePatients(filteredPatients);
    res.status(200).json({ message: "Patient deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/patients/:id error:", error);
    res.status(500).json({ message: "Error deleting patient data" });
  }
});

// Add appointment
router.post("/:id/appointments", (req, res) => {
  try {
    const patients = readPatients();
    const patientIndex = patients.findIndex(
      (patient) => patient.id === req.params.id
    );

    if (patientIndex === -1) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const newAppointment = {
      id: Date.now().toString(),
      date: req.body.date,
      time: req.body.time,
      reason: req.body.reason,
    };

    if (!patients[patientIndex].appointments) {
      patients[patientIndex].appointments = [];
    }

    patients[patientIndex].appointments.push(newAppointment);
    writePatients(patients);

    res.status(201).json(newAppointment);
  } catch (error) {
    console.error("POST /api/patients/:id/appointments error:", error);
    res.status(500).json({ message: "Error scheduling appointment" });
  }
});

module.exports = router;