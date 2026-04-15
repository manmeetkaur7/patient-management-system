const form = document.getElementById("patientForm");
const tableBody = document.getElementById("patientTableBody");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const appointmentForm = document.getElementById("appointmentForm");
const appointmentPatient = document.getElementById("appointmentPatient");
const appointmentDate = document.getElementById("appointmentDate");
const appointmentTime = document.getElementById("appointmentTime");
const appointmentReason = document.getElementById("appointmentReason");
const appointmentList = document.getElementById("appointmentList");
const patientStatus = document.getElementById("patientStatus");

function getApiBaseUrl() {
  const configuredUrl = (window.PATIENT_API_BASE_URL || "").trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  const isLocalFrontend =
    window.location.protocol === "file:" ||
    (["localhost", "127.0.0.1"].includes(window.location.hostname) &&
      window.location.port !== "5000");

  return isLocalFrontend ? "http://localhost:5000" : "";
}

const API_URL = `${getApiBaseUrl()}/api/patients`;

let editingPatientId = null;
let currentSearchTerm = "";
let patientsCache = [];
let allPatientsCache = [];

async function fetchPatients() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Fetched patients:", data);

    if (Array.isArray(data)) {
      allPatientsCache = data;
    } else if (data && Array.isArray(data.patients)) {
      allPatientsCache = data.patients;
    } else {
      throw new Error("API did not return patient data in array format");
    }

    applyFilters();
  } catch (error) {
    console.error("Failed to fetch patients", error);
    updatePatientStatus(`Unable to load patients: ${error.message}`);
  }
}

function applyFilters() {
  const term = currentSearchTerm.trim().toLowerCase();
  patientsCache = term
    ? allPatientsCache.filter((patient) => matchesSearch(patient, term))
    : [...allPatientsCache];

  renderPatients(patientsCache);
  populatePatientDropdown(allPatientsCache);
  renderAppointments(allPatientsCache);
}

function matchesSearch(patient, term) {
  const haystack = [
    patient.fullName,
    patient.email,
    patient.phone,
    patient.medicalCondition,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(term);
}

function updatePatientStatus(message) {
  if (message) {
    patientStatus.textContent = message;
    patientStatus.classList.remove("hidden");
  } else {
    patientStatus.textContent = "";
    patientStatus.classList.add("hidden");
  }
}

function renderPatients(patients) {
  tableBody.innerHTML = "";

  if (!patients.length) {
    tableBody.innerHTML = '<tr><td colspan="8">No patients found.</td></tr>';
    const status = currentSearchTerm
      ? `No patients found for "${currentSearchTerm}".`
      : "No patient records available yet.";
    updatePatientStatus(status);
    return;
  }

  updatePatientStatus("");

  patients.forEach((patient) => {
    const row = document.createElement("tr");
    const nextAppt = getNextAppointment(patient.appointments || []);

    row.innerHTML = `
      <td>${patient.fullName || ""}</td>
      <td>${patient.age || ""}</td>
      <td>${patient.gender || ""}</td>
      <td>${patient.phone || ""}</td>
      <td>${patient.email || ""}</td>
      <td>${patient.medicalCondition || ""}</td>
      <td>${formatAppointment(nextAppt)}</td>
      <td class="actions">
        <button class="secondary" onclick="editPatient('${patient.id}')">Edit</button>
        <button class="secondary" onclick="scheduleAppointment('${patient.id}')">Schedule</button>
        <button class="delete-btn" onclick="deletePatient('${patient.id}')">Delete</button>
      </td>
    `;

    tableBody.appendChild(row);
  });
}

function populatePatientDropdown(patients) {
  const currentValue = appointmentPatient.value;
  appointmentPatient.innerHTML = '<option value="">Select patient</option>';

  patients.forEach((patient) => {
    const option = document.createElement("option");
    option.value = patient.id;
    option.textContent = patient.fullName;
    appointmentPatient.appendChild(option);
  });

  if (patients.some((patient) => patient.id === currentValue)) {
    appointmentPatient.value = currentValue;
  }
}

function renderAppointments(patients) {
  const upcomingAppointments = [];

  patients.forEach((patient) => {
    (patient.appointments || []).forEach((appointment) => {
      upcomingAppointments.push({
        ...appointment,
        patientName: patient.fullName,
      });
    });
  });

  if (!upcomingAppointments.length) {
    appointmentList.innerHTML = '<p class="muted">No appointments scheduled yet.</p>';
    return;
  }

  upcomingAppointments.sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA - dateB;
  });

  appointmentList.innerHTML = upcomingAppointments
    .map(
      (appointment) => `
        <div class="appointment-card">
          <h4>${appointment.patientName}</h4>
          <p>${appointment.date} at ${appointment.time}</p>
          <p>${appointment.reason}</p>
        </div>
      `
    )
    .join("");
}

function getNextAppointment(appointments) {
  if (!appointments.length) return null;

  const sorted = [...appointments].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA - dateB;
  });

  return sorted[0];
}

function formatAppointment(appointment) {
  if (!appointment) return "No appointment";
  const reasonText = appointment.reason ? ` - ${appointment.reason}` : "";
  return `${appointment.date} ${appointment.time}${reasonText}`;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const patientPayload = {
    fullName: document.getElementById("fullName").value,
    age: document.getElementById("age").value,
    gender: document.getElementById("gender").value,
    phone: document.getElementById("phone").value,
    email: document.getElementById("email").value,
    medicalCondition: document.getElementById("medicalCondition").value,
  };

  const endpoint = editingPatientId ? `${API_URL}/${editingPatientId}` : API_URL;
  const method = editingPatientId ? "PUT" : "POST";

  try {
    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patientPayload),
    });

    if (!response.ok) {
      throw new Error(`Failed to save patient: ${response.status}`);
    }

    form.reset();
    exitEditMode();
    fetchPatients();
  } catch (error) {
    console.error("Unable to save patient", error);
    alert("Unable to save patient. Please try again.");
  }
});

cancelEditBtn.addEventListener("click", () => {
  form.reset();
  exitEditMode();
});

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  currentSearchTerm = searchInput.value.trim();
  applyFilters();
});

searchInput.addEventListener("input", () => {
  if (!searchInput.value.trim()) {
    currentSearchTerm = "";
    applyFilters();
  }
});

clearSearchBtn.addEventListener("click", () => {
  searchInput.value = "";
  currentSearchTerm = "";
  applyFilters();
});

appointmentForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!appointmentPatient.value) return;

  const payload = {
    date: appointmentDate.value,
    time: appointmentTime.value,
    reason: appointmentReason.value,
  };

  try {
    const response = await fetch(
      `${API_URL}/${appointmentPatient.value}/appointments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to schedule appointment: ${response.status}`);
    }

    appointmentForm.reset();
    fetchPatients();
  } catch (error) {
    console.error("Unable to schedule appointment", error);
    alert("Unable to schedule appointment. Please try again.");
  }
});

function editPatient(id) {
  const patient = allPatientsCache.find((p) => p.id === id);
  if (!patient) return;

  editingPatientId = id;
  document.getElementById("fullName").value = patient.fullName || "";
  document.getElementById("age").value = patient.age || "";
  document.getElementById("gender").value = patient.gender || "";
  document.getElementById("phone").value = patient.phone || "";
  document.getElementById("email").value = patient.email || "";
  document.getElementById("medicalCondition").value = patient.medicalCondition || "";

  submitBtn.textContent = "Update Patient";
  cancelEditBtn.classList.remove("hidden");
}

function scheduleAppointment(id) {
  const patient = allPatientsCache.find((p) => p.id === id);
  if (!patient) return;

  appointmentPatient.value = patient.id;
  appointmentReason.placeholder = `Reason (e.g., follow-up for ${patient.fullName})`;
  appointmentForm.scrollIntoView({ behavior: "smooth", block: "start" });
  appointmentDate.focus();
}

async function deletePatient(id) {
  const shouldDelete = window.confirm(
    "Are you sure you want to delete this patient?"
  );

  if (!shouldDelete) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete patient: ${response.status}`);
    }

    if (editingPatientId === id) {
      form.reset();
      exitEditMode();
    }

    fetchPatients();
  } catch (error) {
    console.error("Unable to delete patient", error);
    alert("Unable to delete patient. Please try again.");
  }
}

function exitEditMode() {
  editingPatientId = null;
  submitBtn.textContent = "Add Patient";
  cancelEditBtn.classList.add("hidden");
}

window.deletePatient = deletePatient;
window.editPatient = editPatient;
window.scheduleAppointment = scheduleAppointment;

fetchPatients();
