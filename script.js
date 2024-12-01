// Firebase-Konfiguration
const firebaseConfig = {
    apiKey: "AIzaSyD2HoPzrR_xeeT3YM2INtSGFmh7yZH2-x0",
    authDomain: "aufgabemanagement.firebaseapp.com",
    projectId: "aufgabemanagement",
    storageBucket: "aufgabemanagement.appspot.com",
    messagingSenderId: "868800147456",
    appId: "1:868800147456:web:f4f8cc2e39100f819a68e5",
    measurementId: "G-NSPT7LPEQ0"
};

// Firebase initialisieren
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', () => {
    showSection('eintrag');

    const taskForm = document.getElementById('taskForm');
    taskForm.addEventListener('submit', function(event) {
        event.preventDefault();
        addTask();
    });

    loadTasks();
});

function showSection(sectionId) {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

function addTask() {
    const haus = document.getElementById('haus').value;
    const problem = document.getElementById('problem').value;
    const priorität = document.getElementById('priorität').value;
    const fotoInput = document.getElementById('foto');
    const foto = fotoInput.files[0];

    const task = {
        haus,
        problem,
        priorität,
        foto: foto ? URL.createObjectURL(foto) : null,
        status: 'meldungen',
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    db.collection('tasks').add(task)
        .then((docRef) => {
            console.log("Aufgabe hinzugefügt mit ID: ", docRef.id);
            renderTask({ id: docRef.id, ...task }, 'meldungenList');
            document.getElementById('taskForm').reset();
        })
        .catch((error) => {
            console.error("Fehler beim Hinzufügen der Aufgabe: ", error);
        });
}

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
        listItem
::contentReference[oaicite:0]{index=0}
 
