// Firebase-Konfiguration
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";

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
    document.querySelectorAll('section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

window.showSection = showSection; // Funktion global verfügbar machen

// Aufgaben hinzufügen
async function addTask() {
    const haus = document.getElementById('haus').value;
    const problem = document.getElementById('problem').value;
    const priorität = document.getElementById('priorität').value;

    const task = {
        haus,
        problem,
        priorität,
        status: 'meldungen',
        timestamp: new Date()
    };

    try {
        const docRef = await addDoc(collection(db, "tasks"), task);
        console.log("Aufgabe hinzugefügt mit ID: ", docRef.id);
        renderTask({ id: docRef.id, ...task }, 'meldungenList');
        document.getElementById('taskForm').reset();
    } catch (error) {
        console.error("Fehler beim Hinzufügen der Aufgabe: ", error);
    }
}

// Aufgaben laden
async function loadTasks() {
    const querySnapshot = await getDocs(collection(db, "tasks"));
    querySnapshot.forEach(doc => {
        const task = { id: doc.id, ...doc.data() };
        renderTask(task, `${task.status}List`);
    });
}

// Aufgaben rendern
function renderTask(task, listId) {
    const list = document.getElementById(listId);
    const listItem = document.createElement('li');
    listItem.innerHTML = `
        <strong>Haus:</strong> ${task.haus}<br>
        <strong>Problem:</strong> ${task.problem}<br>
        <strong>Priorität:</strong> ${task.priorität}
    `;
    list.appendChild(listItem);
}

document.getElementById('taskForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    await addTask();
    showSection('meldungen');
});

document.addEventListener('DOMContentLoaded', loadTasks);
