// Firebase-Konfiguration
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getFirestore, collection, addDoc, updateDoc, onSnapshot, doc } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";

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
const imgbbApiKey = "089c18aad823c1319810440f66ee7053";

function showSection(sectionId) {
    document.querySelectorAll('section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

window.showSection = showSection;

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
        erledigt: false,
        kommentar: "",
        abteilung: ""
    });

    document.getElementById('taskForm').reset();
});

async function uploadToImgBB(file) {
    const formData = new FormData();
    formData.append("image", file);

    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
            method: "POST",
            body: formData
        });

        if (!response.ok) throw new Error(`Fehler: ${response.statusText}`);

        const data = await response.json();
        return data.data.url;
    } catch (error) {
        console.error("Foto-Upload fehlgeschlagen:", error);
        return null;
    }
}

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

function renderTask(task) {
    const listId = `${task.status}List`;
    const list = document.getElementById(listId);
    if (!list) return;

    const listItem = document.createElement('li');
    listItem.className = task.erledigt ? "erledigt" : "nichterledigt";
    listItem.innerHTML = `
        <strong>Haus:</strong> ${task.haus}<br>
        <strong>Problem:</strong> ${task.problem}<br>
        <strong>Priorität:</strong> ${task.priorität}<br>
        ${task.foto ? `<img src="${task.foto}" alt="Foto">` : ""}
        <input type="text" placeholder="Kommentar" value="${task.kommentar}" onchange="updateComment('${task.id}', this.value)">
        <select onchange="assignToDepartment('${task.id}', this.value)">
            <option value="">Abteilung zuweisen</option>
            <option value="Rezeption">
