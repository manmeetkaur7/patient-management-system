const form = document.getElementById("patientForm");
const tableBody = document.getElementById("patientTableBody");
const API_URL = "http://localhost:5000/api/patients";

async function fetchPatients() {
  const response = await fetch(API_URL);
  const patients = await response.json();

  tableBody.innerHTML = "";

  patients.forEach((patient) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${patient.fullName}</td>
      <td>${patient.age}</td>
      <td>${patient.gender}</td>
      <td>${patient.phone}</td>
      <td>${patient.email}</td>
      <td>${patient.medicalCondition}</td>
      <td>
        <button class="delete-btn" onclick="deletePatient('${patient.id}')">Delete</button>
      </td>
    `;

    tableBody.appendChild(row);
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newPatient = {
    fullName: document.getElementById("fullName").value,
    age: document.getElementById("age").value,
    gender: document.getElementById("gender").value,
    phone: document.getElementById("phone").value,
    email: document.getElementById("email").value,
    medicalCondition: document.getElementById("medicalCondition").value,
  };

  await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newPatient),
  });

  form.reset();
  fetchPatients();
});

async function deletePatient(id) {
  await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  fetchPatients();
}

fetchPatients();