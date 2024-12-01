// Firebase-Konfiguration
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
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

// Aufgaben hinzufügen
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
        kommentare: [],
        timestamp: new Date()
    };

    try {
        const docRef = await addDoc(collection(db, "tasks"), task);
        console.log("Aufgabe hinzugefügt mit ID:", docRef.id);
        document.getElementById('taskForm').reset();
    } catch (error) {
        console.error("Fehler beim Hinzufügen der Aufgabe:", error);
    }
}

// Aufgaben laden und live aktualisieren
onSnapshot(collection(db, "tasks"), snapshot => {
    document.getElementById("meldungenList").innerHTML = "";
    document.getElementById("aufgabenList").innerHTML = "";
    document.getElementById("archivList").innerHTML = "";

    snapshot.forEach(doc => {
        const task = { id: doc.id, ...doc.data() };
        renderTask(task, `${task.status}List`);
    });
});

// Aufgaben rendern
function renderTask(task, listId) {
    const list = document.getElementById(listId);
    const listItem = document.createElement('li');
    listItem.innerHTML = `
        <strong>Haus:</strong> ${task.haus}<br>
        <strong>Problem:</strong> ${task.problem}<br>
        <strong>Priorität:</strong> ${task.priorität}<br>
        <strong>Abteilung:</strong> ${task.abteilung}<br>
        ${task.foto ? `<img src="${task.foto}" alt="Foto">` : ''}
    `;

    const actions = document.createElement('div');

    if (listId === 'meldungenList') {
        const abteilungSelect = document.createElement('select');
        abteilungSelect.innerHTML = `
            <option value="Hausverwaltung">Hausverwaltung</option>
            <option value="Hausmeister">Hausmeister</option>
            <option value="Rezeption">Rezeption</option>
        `;
        abteilungSelect.addEventListener('change', async () => {
            await updateTask(task.id, { abteilung: abteilungSelect.value });
        });

        const inArbeitButton = document.createElement('button');
        inArbeitButton.textContent
