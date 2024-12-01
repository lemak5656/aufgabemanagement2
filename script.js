// Firebase-Konfiguration
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-storage.js";

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
const storage = getStorage(app);

// Navigation
function showSection(sectionId) {
    document.querySelectorAll('section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

window.showSection = showSection; // Funktion global verfügbar machen

// Aufgabe hinzufügen
async function addTask() {
    const haus = document.getElementById('haus').value;
    const problem = document.getElementById('problem').value;
    const priorität = document.getElementById('priorität').value;
    const fotoInput = document.getElementById('foto');
    let fotoURL = null;

    // Foto hochladen
    if (fotoInput && fotoInput.files.length > 0) {
        const file = fotoInput.files[0];
        const storageRef = ref(storage, `fotos/${file.name}`);
        await uploadBytes(storageRef, file);
        fotoURL = await getDownloadURL(storageRef);
    }

    const task = {
        haus,
        problem,
        priorität,
        foto: fotoURL,
        status: 'meldungen',
        abteilung: 'Keine',
        timestamp: new Date()
    };

    try {
        const docRef = await addDoc(collection(db, "tasks"), task);
        console.log("Aufgabe hinzugefügt mit ID:", docRef.id);
        renderTask({ id: docRef.id, ...task }, 'meldungenList');
        document.getElementById('taskForm').reset();
    } catch (error) {
        console.error("Fehler beim Hinzufügen der Aufgabe:", error);
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

// Aufgaben anzeigen
function renderTask(task, listId) {
    const list = document.getElementById(listId);
    const listItem = document.createElement('li');
    listItem.innerHTML = `
        <strong>Haus:</strong> ${task.haus}<br>
        <strong>Problem:</strong> ${task.problem}<br>
        <strong>Priorität:</strong> ${task.priorität}<br>
        ${task.foto ? `<img src="${task.foto}" alt="Foto">` : ''}
    `;

    const actions = document.createElement('div');

    if (listId === 'meldungenList') {
        const inArbeitButton = document.createElement('button');
        inArbeitButton.textContent = 'In Arbeit setzen';
        inArbeitButton.addEventListener('click', async () => {
            await updateTaskStatus(task.id, 'aufgaben');
            listItem.remove();
        });

        actions.appendChild(inArbeitButton);
    } else if (listId === 'aufgabenList') {
        const erledigtButton = document.createElement('button');
        erledigtButton.textContent = 'Erledigt';
        erledigtButton.addEventListener('click', async () => {
            await updateTaskStatus(task.id, 'archiv');
            listItem.remove();
        });

        actions.appendChild(erledigtButton);
    } else if (listId === 'archivList') {
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

// Status aktualisieren
async function updateTaskStatus(taskId, newStatus) {
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, { status: newStatus });
}

// Aufgabe löschen
async function deleteTask(taskId) {
    const taskRef = doc(db, "tasks", taskId);
    await deleteDoc(taskRef);
}

// Event-Listener
document.getElementById('taskForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    await addTask();
    showSection('meldungen');
});

document.addEventListener('DOMContentLoaded', loadTasks);
