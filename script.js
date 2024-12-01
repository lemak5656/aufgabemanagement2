// Firebase-Konfiguration
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getFirestore, collection, addDoc, updateDoc, onSnapshot, doc } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";

// Firebase initialisieren
const firebaseConfig = {
    apiKey: "AIzaSyD2HoPzrR_xeeT3YM2INtSGFmh7yZH2-x0",
    authDomain: "aufgabemanagement.firebaseapp.com",
    projectId: "aufgabemanagement",
    storageBucket: "aufgabemanagement.firebasestorage.app",
    messagingSenderId: "868800147456",
    appId: "1:868800147456:web:f4f8cc2e39100f819a68e5",
    measurementId: "G-NSPT7LPEQ0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ImgBB API-Schlüssel
const imgbbApiKey = "089c18aad823c1319810440f66ee7053"; // Ersetze durch deinen Schlüssel

// Passwortschutz
const PASSWORD = "uplandparcs"; // Passwort
document.getElementById('login-button').addEventListener('click', () => {
    const enteredPassword = document.getElementById('password-input').value;
    if (enteredPassword === PASSWORD) {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        loadTasks(); // Aufgaben laden nach Login
    } else {
        alert('Falsches Passwort.');
    }
});

// Navigation zwischen Abschnitten
function showSection(sectionId) {
    document.querySelectorAll('section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

window.showSection = showSection; // Funktion global verfügbar machen

// Aufgaben hinzufügen
document.getElementById('taskForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const haus = document.getElementById('haus').value;
    const problem = document.getElementById('problem').value;
    const priorität = document.getElementById('priorität').value;
    const fotoInput = document.getElementById('foto');

    let fotoURL = null;

    if (fotoInput.files.length > 0) {
        fotoURL = await uploadToImgBB(fotoInput.files[0]);
    }

    await addDoc(collection(db, "tasks"), {
        haus,
        problem,
        priorität,
        foto: fotoURL,
        status: "meldungen",
        erledigt: false
    });

    document.getElementById('taskForm').reset();
});

// ImgBB Foto-Upload
async function uploadToImgBB(file) {
    const formData = new FormData();
    formData.append("image", file);
    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
            method: "POST",
            body: formData
        });
        const data = await response.json();
        return data.data.url; // URL des hochgeladenen Bildes
    } catch (error) {
        console.error("Fehler beim Hochladen des Fotos:", error);
        return null;
    }
}

// Aufgaben laden
function loadTasks() {
    onSnapshot(collection(db, "tasks"), (snapshot) => {
        document.getElementById("meldungenList").innerHTML = "";
        document.getElementById("aufgabenList").innerHTML = "";
        document.getElementById("archivList").innerHTML = "";

        snapshot.forEach((doc) => {
            const task = { id: doc.id, ...doc.data() };
            renderTask(task);
        });
    });
}

// Aufgabe anzeigen
function renderTask(task) {
    const listId = `${task.status}List`;
    const list = document.getElementById(listId);
    if (!list) return;

    const listItem = document.createElement('li');
    listItem.innerHTML = `
        <strong>Haus:</strong> ${task.haus}<br>
        <strong>Problem:</strong> ${task.problem}<br>
        <strong>Priorität:</strong> ${task.priorität}<br>
        ${task.foto ? `<img src="${task.foto}" alt="Foto" style="max-width: 200px;">` : ''}
        <button onclick="updateTaskStatus('${task.id}', '${task.status === 'meldungen' ? 'aufgaben' : 'archiv'}')">
            ${task.status === 'meldungen' ? 'In Arbeit setzen' : 'Archivieren'}
        </button>
    `;
    list.appendChild(listItem);
}

// Aufgabenstatus aktualisieren
async function updateTaskStatus(taskId, newStatus) {
    try {
        await updateDoc(doc(db, "tasks", taskId), { status: newStatus });
        console.log(`Aufgabe ${taskId} verschoben nach ${newStatus}.`);
    } catch (error) {
        console.error("Fehler beim Aktualisieren
