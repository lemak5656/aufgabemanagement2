// Firebase-Konfiguration
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyD2HoPzrR_xeeT3YM2INtSGFmh7yZH2-x0",
    authDomain: "aufgabemanagement.firebaseapp.com",
    projectId: "aufgabemanagement",
    storageBucket: "aufgabemanagement.firebasestorage.app",
    messagingSenderId: "868800147456",
    appId: "1:868800147456:web:f4f8cc2e39100f819a68e5",
    measurementId: "G-NSPT7LPEQ0"
};

// Firebase initialisieren
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ImgBB API-Schlüssel
const imgbbApiKey = "089c18aad823c1319810440f66ee7053"; // Ersetze durch deinen ImgBB API-Schlüssel

// Navigation zwischen den Abschnitten
function showSection(sectionId) {
    document.querySelectorAll('section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

window.showSection = showSection;

// Aufgabe hinzufügen
document.getElementById('taskForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const haus = document.getElementById('haus').value;
    const problem = document.getElementById('problem').value;
    const priorität = document.getElementById('priorität').value;
    const fotoInput = document.getElementById('foto');

    let fotoURL = null;

    if (fotoInput.files.length > 0) {
        const file = fotoInput.files[0];
        fotoURL = await uploadToImgBB(file); // Foto auf ImgBB hochladen
    }

    await saveTaskToDatabase(haus, problem, priorität, fotoURL);

    document.getElementById('taskForm').reset();
});

// Foto auf ImgBB hochladen
async function uploadToImgBB(file) {
    const formData = new FormData();
    formData.append("image", file);

    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
            method: "POST",
            body: formData,
        });
        const data = await response.json();
        return data.data.url; // URL des hochgeladenen Bildes
    } catch (error) {
        console.error("Fehler beim Hochladen des Fotos:", error);
        return null;
    }
}

// Aufgabe in Firebase speichern
async function saveTaskToDatabase(haus, problem, priorität, foto) {
    try {
        await addDoc(collection(db, "tasks"), {
            haus,
            problem,
            priorität,
            foto,
            status: "meldungen",
            abteilung: "Keine",
            kommentar: "",
            erledigt: false,
        });
        console.log("Aufgabe erfolgreich hinzugefügt.");
    } catch (error) {
        console.error("Fehler beim Hinzufügen der Aufgabe:", error);
    }
}

// Aufgaben aus Firebase laden und anzeigen
async function loadTasks() {
    onSnapshot(collection(db, "tasks"), (snapshot) => {
        document.getElementById("meldungenList").innerHTML = "";
        document.getElementById("aufgabenList").innerHTML = "";
        document.getElementById("archivList").innerHTML = "";

        snapshot.forEach((doc) => {
            const task = { id: doc.id, ...doc.data() };
            const targetList = `${task.status}List`;
            if (document.getElementById(targetList)) {
                renderTask(task, targetList);
            } else {
                console.error(`Liste ${targetList} nicht gefunden.`);
            }
        });
    });
}

// Aufgabe anzeigen
function renderTask(task, listId) {
    const list = document.getElementById(listId);

    if (!list) {
        console.error(`Liste mit ID ${listId} nicht gefunden.`);
        return;
    }

    const listItem = document.createElement('li');
    listItem.style.color = task.erledigt ? "green" : "red"; // Grün, wenn erledigt, sonst rot

    listItem.innerHTML = `
        <input type="checkbox" class="task-checkbox">
        <strong>Haus:</strong> ${task.haus}<br>
        <strong>Problem:</strong> ${task.problem}<br>
        <strong>Priorität:</strong> ${task.priorität}<br>
        ${task.foto ? `<img src="${task.foto}" alt="Foto" style="max-width: 200px;">` : ''}
        <div>
            <label for="abteilung">Abteilung:</label>
            <select class="abteilung" data-id="${task.id}">
                <option value="Keine" ${task.abteilung === "Keine" ? "selected" : ""}>Keine</option>
                <option value="Hausverwaltung" ${task.abteilung === "Hausverwaltung" ? "selected" : ""}>Hausverwaltung</option>
                <option value="Hausmeister" ${task.abteilung === "Hausmeister" ? "selected" : ""}>Hausmeister</option>
                <option value="Rezeption" ${task.abteilung === "Rezeption" ? "selected" : ""}>Rezeption</option>
            </select>
        </div>
        <div>
            <textarea class="kommentar" placeholder="Kommentar hinzufügen..." data-id="${task.id}">${task.kommentar || ""}</textarea>
        </div>
        <div style="margin-top: 10px;">
            ${task.erledigt ? "<strong>Erledigt</strong>" : ""}
        </div>
    `;

    // Aktionen hinzufügen
    const actions = document.createElement('div');
    actions.style.marginTop = "10px";

    if (listId === "meldungenList") {
        const inArbeitButton = document.createElement('button');
        inArbeitButton.textContent = "In Arbeit setzen";
        inArbeitButton.addEventListener("click", async () => {
            await updateTaskStatus(task.id, "aufgaben");
        });
        actions.appendChild(inArbeitButton);
    } else if (listId === "aufgabenList") {
        const erledigtButton = document.createElement('button');
        erledigtButton.textContent = "Erledigt";
        erledigtButton.addEventListener("click", async () => {
            await updateTaskErledigt(task.id, !task.erledigt); // Status wechseln
        });

        const archivierenButton = document.createElement('button');
        archivierenButton.textContent = "Archivieren";
        archivierenButton.addEventListener("click", async () => {
            await updateTaskStatus(task.id, "archiv");
        });

        actions.appendChild(erledigtButton);
        actions.appendChild(archivierenButton);
    } else if (listId === "archivList") {
        const löschenButton = document.createElement('button');
        löschenButton.textContent = "Löschen";
        löschenButton.addEventListener("click", async () => {
            await deleteTask(task.id);
        });
        actions.appendChild(löschenButton);
    }

    listItem.appendChild(actions);
    list.appendChild(listItem);

    // Abteilungsänderung überwachen
    listItem.querySelector(".abteilung").addEventListener("change", async (e) => {
        const newAbteilung = e.target.value;
        const taskId = e.target.dataset.id;
        await updateDoc(doc(db, "tasks", taskId), { abteilung: newAbteilung });
        console.log(`Abteilung für Aufgabe ${taskId} aktualisiert.`);
    });

    // Kommentaränderung überwachen
    listItem.querySelector(".kommentar").addEventListener("input", async (e) => {
        const kommentar = e.target.value;
        const taskId = e.target.dataset.id;
        await updateDoc(doc(db, "tasks", taskId), { kommentar });
        console.log(`Kommentar für Aufgabe ${taskId} aktualisiert.`);
    });
}

// Aufgabenstatus aktualisieren
async function updateTaskStatus(taskId, newStatus) {
    try {
        await updateDoc(doc(db, "tasks", taskId), { status: newStatus });
        console.log(`Aufgabe ${taskId} nach ${newStatus} verschoben.`);
    } catch (error) {
        console.error("Fehler beim Aktualisieren des Status:", error);
    }
}

// Aufgabe erledigt markieren
async function updateTaskErledigt(taskId, erledigtStatus) {
    try {
        await updateDoc(doc(db, "tasks", taskId), { erledigt: erledigtStatus });
        console.log(`Aufgabe ${taskId} als ${erledigtStatus ? "erledigt" : "nicht erledigt"} markiert.`);
    } catch (
