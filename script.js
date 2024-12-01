// Firebase-Konfiguration
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";

// Firebase initialisieren
const firebaseConfig = {
    apiKey: "AIzaSyD2HoPzrR_xeeT3YM2INtSGFmh7yZH2-x0",
    authDomain: "aufgabemanagement.firebaseapp.com",
    projectId: "aufgabemanagement",
    storageBucket: "aufgabemanagement.appspot.com",
    messagingSenderId: "868800147456",
    appId: "1:868800147456:web:f4f8cc2e39100f819a68e5",
    measurementId: "G-NSPT7LPEQ0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Funktion zur Navigation
function showSection(sectionId) {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

// DOMContentLoaded - Initialisiert die Seite
document.addEventListener('DOMContentLoaded', () => {
    showSection('eintrag'); // Standardmäßig die 'eintrag'-Sektion anzeigen

    const taskForm = document.getElementById('taskForm');
    taskForm.addEventListener('submit', async function (event) {
        event.preventDefault(); // Verhindert das Standardverhalten des Formulars
        await addTask(); // Fügt die Aufgabe hinzu
        showSection('meldungen'); // Navigiert zur "Meldung Gekommen"-Sektion
    });

    loadTasks(); // Lädt vorhandene Aufgaben
});

// Aufgabe hinzufügen
async function addTask() {
    const haus = document.getElementById('haus').value;
    const problem = document.getElementById('problem').value;
    const priorität = document.getElementById('priorität').value;
    const fotoInput = document.getElementById('foto');
    const foto = fotoInput.files[0] ? URL.createObjectURL(fotoInput.files[0]) : null;

    const task = {
        haus,
        problem,
        priorität,
        foto,
        status: 'meldungen',
        timestamp: new Date()
    };

    try {
        const docRef = await addDoc(collection(db, "tasks"), task);
        console.log("Aufgabe hinzugefügt mit ID: ", docRef.id);
        renderTask({ id: docRef.id, ...task }, 'meldungenList'); // Zeigt die Aufgabe in der "Meldung Gekommen"-Liste an
        document.getElementById('taskForm').reset(); // Formular zurücksetzen
    } catch (error) {
        console.error("Fehler beim Hinzufügen der Aufgabe: ", error);
    }
}

// Aufgaben anzeigen
function renderTask(task, listId) {
    const list = document.getElementById(listId);
    const listItem = document.createElement('li');
    listItem.setAttribute('data-id', task.id);

    listItem.innerHTML = `
        <strong>Haus:</strong> ${task.haus}<br>
        <strong>Problem:</strong> ${task.problem}<br>
        <strong>Priorität:</strong> ${task.priorität}
    `;

    if (task.foto) {
        const img = document.createElement('img');
        img.src = task.foto;
        listItem.appendChild(img);
    }

    const actions = document.createElement('div');

    if (listId === 'meldungenList') {
        const inArbeitButton = document.createElement('button');
        inArbeitButton.textContent = 'In Arbeit setzen';
        inArbeitButton.addEventListener('click', () => updateTaskStatus(task.id, 'aufgaben'));
        actions.appendChild(inArbeitButton);
    } else if (listId === 'aufgabenList') {
        const archivierenButton = document.createElement('button');
        archivierenButton.textContent = 'Archivieren';
        archivierenButton.addEventListener('click', () => updateTaskStatus(task.id, 'archiv'));
        actions.appendChild(archivierenButton);
    } else if (listId === 'archivList') {
        const löschenButton = document.createElement('button');
        löschenButton.textContent = 'Löschen';
        löschenButton.addEventListener('click', () => deleteTask(task.id));
        actions.appendChild(löschenButton);
    }

    listItem.appendChild(actions);
    list.appendChild(listItem);
}

// Aufgaben laden
async function loadTasks() {
    const querySnapshot = await getDocs(collection(db, "tasks"));
    querySnapshot.forEach((doc) => {
        const task = { id: doc.id, ...doc.data() };
        renderTask(task, `${task.status}List`);
    });
}

// Aufgabenstatus aktualisieren
async function updateTaskStatus(taskId, newStatus) {
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, { status: newStatus });
    document.querySelector(`li[data-id='${taskId}']`).remove(); // Entfernt die Aufgabe aus der aktuellen Liste
    loadTasks(); // Aktualisiert die Ansicht
}

// Aufgabe löschen
async function deleteTask(taskId) {
    await deleteDoc(doc(db, "tasks", taskId));
    document.querySelector(`li[data-id='${taskId}']`).remove(); // Entfernt die Aufgabe aus der Ansicht
}
