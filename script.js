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
    const fotoInput = document.getElementById('foto');
    const foto = fotoInput.files[0] ? URL.createObjectURL(fotoInput.files[0]) : null;

    const task = {
        haus,
        problem,
        priorität,
        foto,
        status: 'meldungen',
        abteilung: 'Keine',
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
    listItem.setAttribute('data-id', task.id);

    listItem.innerHTML = `
        <strong>Haus:</strong> ${task.haus}<br>
        <strong>Problem:</strong> ${task.problem}<br>
        <strong>Priorität:</strong> ${task.priorität}<br>
        <strong>Abteilung:</strong> ${task.abteilung}<br>
        ${task.foto ? `<img src="${task.foto}" alt="Foto" style="max-width: 200px;">` : ''}
    `;

    const actions = document.createElement('div');

    // Buttons für Meldungen
    if (listId === 'meldungenList') {
        const abteilungSelect = document.createElement('select');
        abteilungSelect.innerHTML = `
            <option value="Hausverwaltung">Hausverwaltung</option>
            <option value="Hausmeister">Hausmeister</option>
            <option value="Rezeption">Rezeption</option>
        `;
        abteilungSelect.addEventListener('change', async () => {
            await updateTask(task.id, { abteilung: abteilungSelect.value });
            listItem.querySelector('strong:nth-child(5)').textContent = `Abteilung: ${abteilungSelect.value}`;
        });

        const inArbeitButton = document.createElement('button');
        inArbeitButton.textContent = 'In Arbeit setzen';
        inArbeitButton.addEventListener('click', async () => {
            await updateTaskStatus(task.id, 'aufgaben');
            listItem.remove();
        });

        actions.appendChild(abteilungSelect);
        actions.appendChild(inArbeitButton);
    }

    // Buttons für Offene Aufgaben
    if (listId === 'aufgabenList') {
        const erledigtButton = document.createElement('button');
        erledigtButton.textContent = 'Erledigt';
        erledigtButton.addEventListener('click', async () => {
            await updateTaskStatus(task.id, 'archiv');
            listItem.remove();
        });

        const druckenButton = document.createElement('button');
        druckenButton.textContent = 'Drucken';
        druckenButton.addEventListener('click', () => {
            druckenTask(task);
        });

        actions.appendChild(erledigtButton);
        actions.appendChild(druckenButton);
    }

    // Buttons für Archiv
    if (listId === 'archivList') {
        const löschenButton = document.createElement('button');
        löschenButton.textContent = 'Löschen';
        löschenButton.addEventListener('click', async () => {
            await deleteTask(task.id);
            listItem.remove();
        });

        actions.appendChild(löschenButton);
    }

    listItem.appendChild(actions);
    list.appendChild(listItem);
}

// Aufgabenstatus aktualisieren
async function updateTaskStatus(taskId, newStatus) {
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, { status: newStatus });
    console.log(`Status der Aufgabe ${taskId} auf ${newStatus} geändert.`);
}

// Aufgaben aktualisieren (z. B. Abteilung ändern)
async function updateTask(taskId, updates) {
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, updates);
    console.log(`Aufgabe ${taskId} aktualisiert:`, updates);
}

// Aufgabe löschen
async function deleteTask(taskId) {
    const taskRef = doc(db, "tasks", taskId);
    await deleteDoc(taskRef);
    console.log(`Aufgabe ${taskId} gelöscht.`);
}

// Aufgabe drucken
function druckenTask(task) {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Aufgabe Drucken</title>
            </head>
            <body>
                <h2>Aufgabendetails</h2>
                <p><strong>Haus:</strong> ${task.haus}</p>
                <p><strong>Problem:</strong> ${task.problem}</p>
                <p><strong>Priorität:</strong> ${task.priorität}</p>
                <p><strong>Abteilung:</strong> ${task.abteilung}</p>
                ${task.foto ? `<img src="${task.foto}" alt="Foto" style="max-width: 300px;">` : ''}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Event Listener
document.getElementById('taskForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    await addTask();
    showSection('meldungen');
});

document.addEventListener('DOMContentLoaded', loadTasks);
