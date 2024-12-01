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

// Funktion zur Navigation
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
        timestamp: new Date(),
    };

    try {
        await addDoc(collection(db, "tasks"), task);
        console.log("Aufgabe erfolgreich hinzugefügt.");
        document.getElementById('taskForm').reset();
    } catch (error) {
        console.error("Fehler beim Hinzufügen der Aufgabe:", error);
    }
}

// Aufgaben live laden
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
        ${task.foto ? `<img src="${task.foto}" alt="Foto" style="max-width: 200px;">` : ''}
    `;

    const actions = document.createElement('div');

    if (listId === 'meldungenList') {
        const abteilungSelect = document.createElement('select');
        abteilungSelect.innerHTML = `
            <option value="Keine" ${task.abteilung === "Keine" ? "selected" : ""}>Keine</option>
            <option value="Hausverwaltung" ${task.abteilung === "Hausverwaltung" ? "selected" : ""}>Hausverwaltung</option>
            <option value="Hausmeister" ${task.abteilung === "Hausmeister" ? "selected" : ""}>Hausmeister</option>
            <option value="Rezeption" ${task.abteilung === "Rezeption" ? "selected" : ""}>Rezeption</option>
        `;

        abteilungSelect.addEventListener('change', async () => {
            const neueAbteilung = abteilungSelect.value;
            await updateTask(task.id, { abteilung: neueAbteilung });
        });

        const inArbeitButton = document.createElement('button');
        inArbeitButton.textContent = 'In Arbeit setzen';
        inArbeitButton.addEventListener('click', async () => {
            await updateTaskStatus(task.id, 'aufgaben');
            listItem.remove();
        });

        actions.appendChild(abteilungSelect);
        actions.appendChild(inArbeitButton);
    } else if (listId === 'aufgabenList') {
        const erledigtButton = document.createElement('button');
        erledigtButton.textContent = 'Erledigt';
        erledigtButton.addEventListener('click', async () => {
            await updateTaskStatus(task.id, 'archiv');
            listItem.remove();
        });

        const kommentarInput = document.createElement('textarea');
        kommentarInput.placeholder = "Kommentar hinzufügen";
        kommentarInput.addEventListener('change', async () => {
            const kommentar = kommentarInput.value.trim();
            if (kommentar) {
                await updateTask(task.id, { kommentar });
                alert("Kommentar hinzugefügt!");
                kommentarInput.value = "";
            }
        });

        actions.appendChild(erledigtButton);
        actions.appendChild(kommentarInput);
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

// Aufgabenstatus aktualisieren
async function updateTaskStatus(taskId, newStatus) {
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, { status: newStatus });
    console.log(`Status der Aufgabe ${taskId} wurde auf ${newStatus} aktualisiert.`);
}

// Aufgabenattribute aktualisieren (z. B. Abteilung oder Kommentar)
async function updateTask(taskId, updates) {
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, updates);
    console.log(`Aufgabe ${taskId} wurde aktualisiert:`, updates);
}

// Aufgabe löschen
async function deleteTask(taskId) {
    const taskRef = doc(db, "tasks", taskId);
    await deleteDoc(taskRef);
    console.log(`Aufgabe ${taskId} wurde gelöscht.`);
}

// Event-Listener
document.getElementById('taskForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    await addTask();
    showSection('meldungen');
});
