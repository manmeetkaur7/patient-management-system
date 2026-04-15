# Patient Management System

A full-stack patient management system built with HTML, CSS, JavaScript, Node.js, and Express. The backend stores data locally in `server/data/patients.json` so you can run everything without a database server.

## Features
- Create, update, and delete patient records with validation feedback in the UI.
- Search patients by name, phone, email, or medical condition directly from the toolbar.
- Schedule appointments per patient and view the upcoming appointment timeline.
- Responsive dashboard-style layout powered by vanilla JS and CSS.
- Simple REST API that persists data to a JSON file for easy local development.

## Project Structure
- `client/` – static frontend (`index.html`, `style.css`, `script.js`).
- `server/` – Express app plus routes, models, and JSON data store.
- `README.md` – project overview and instructions.

## Getting Started
1. Open a terminal in the `server` folder.
2. Install dependencies once with `npm install`.
3. Run `npm run dev` (nodemon) or `npm start` to launch the API on `http://localhost:5000`.
4. Open `client/index.html` in your browser (or serve it with Live Server/VS Code) to use the dashboard.

## API Endpoints
- `GET /api/patients?search=<query>` – fetch patients, optionally filtering by a search term.
- `POST /api/patients` – add a patient.
- `PUT /api/patients/:id` – edit a patient record.
- `DELETE /api/patients/:id` – remove a patient.
- `POST /api/patients/:id/appointments` – schedule an appointment for a patient.

## Frontend Tips
1. Use the search bar to quickly find a patient; clear it to view all records again.
2. Click **Edit** in the table to load a patient into the form, update the details, then submit to save. Use **Cancel Edit** to discard changes.
3. Hit the **Schedule** button in any row to jump to the appointment form with that patient preselected.
4. Fill out the appointment form at the bottom to schedule a new visit?appointments are shown in chronological order.

## Future Improvements
- Replace the JSON file with MongoDB or another persistent datastore.
- Add authentication/authorization for staff members.
- Hook up notifications or calendar sync for appointments.
