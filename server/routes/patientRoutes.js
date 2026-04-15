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

// Get all patients with optional search
router.get("/", (req, res) => {
  try {
    const patients = readPatients();
    const searchTerm = (req.query.search || "").toLowerCase();

    const filteredPatients = searchTerm
      ? patients.filter((patient) => {
          const haystack = [
            patient.fullName,
            patient.email,
            patient.phone,
            patient.medicalCondition,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return haystack.includes(searchTerm);
        })
      : patients;

    res.status(200).json(filteredPatients);
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
      appointments: [],
    };

    patients.push(newPatient);
    writePatients(patients);

    res.status(201).json(newPatient);
  } catch (error) {
    res.status(500).json({ message: "Error saving patient data" });
  }
});

// Update a patient
router.put("/:id", (req, res) => {
  try {
    const patients = readPatients();
    const patientIndex = patients.findIndex(
      (patient) => patient.id === req.params.id
    );

    if (patientIndex === -1) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const updatedPatient = {
      ...patients[patientIndex],
      ...req.body,
    };

    patients[patientIndex] = updatedPatient;
    writePatients(patients);

    res.status(200).json(updatedPatient);
  } catch (error) {
    res.status(500).json({ message: "Error updating patient data" });
  }
});

// Delete a patient
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
    res.status(500).json({ message: "Error deleting patient data" });
  }
});

// Schedule an appointment for a patient
router.post("/:id/appointments", (req, res) => {
  try {
    const patients = readPatients();
    const patient = patients.find((p) => p.id === req.params.id);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const newAppointment = {
      id: Date.now().toString(),
      date: req.body.date,
      time: req.body.time,
      reason: req.body.reason,
    };

    patient.appointments = patient.appointments || [];
    patient.appointments.push(newAppointment);
    writePatients(patients);

    res.status(201).json(newAppointment);
  } catch (error) {
    res.status(500).json({ message: "Error scheduling appointment" });
  }
});

module.exports = router;
