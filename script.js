// Firebase Configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ImgBB API Key
const imgbbApiKey = "VOTRE_CLE_API_ICI"; // Remplacez par votre clé API ImgBB

// Navigation entre les sections
function showSection(sectionId) {
    document.querySelectorAll('section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

window.showSection = showSection;

// Ajouter une tâche
document.getElementById('taskForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const haus = document.getElementById('haus').value;
    const problem = document.getElementById('problem').value;
    const priorität = document.getElementById('priorität').value;
    const fotoInput = document.getElementById('foto');

    let fotoURL = null;

    if (fotoInput.files.length > 0) {
        const file = fotoInput.files[0];
        fotoURL = await uploadToImgBB(file); // Téléchargez la photo sur ImgBB
    }

    await saveTaskToDatabase(haus, problem, priorität, fotoURL);

    document.getElementById('taskForm').reset();
});

// Télécharger une photo sur ImgBB
async function uploadToImgBB(file) {
    const formData = new FormData();
    formData.append("image", file);

    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
            method: "POST",
            body: formData,
        });
        const data = await response.json();
        return data.data.url; // Retourne l'URL de la photo
    } catch (error) {
        console.error("Erreur lors du téléchargement de la photo:", error);
        return null;
    }
}

// Enregistrer une tâche dans Firebase
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
        });
        console.log("Tâche ajoutée avec succès.");
    } catch (error) {
        console.error("Erreur lors de l'ajout de la tâche:", error);
    }
}

// Charger et afficher les tâches
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
                console.error(`Liste ${targetList} non trouvée.`);
            }
        });
    });
}

// Afficher une tâche
function renderTask(task, listId) {
    const list = document.getElementById(listId);

    if (!list) {
        console.error(`Liste avec l'ID ${listId} non trouvée.`);
        return;
    }

    const listItem = document.createElement('li');

    listItem.innerHTML = `
        <input type="checkbox" class="task-checkbox">
        <strong>Haus:</strong> ${task.haus}<br>
        <strong>Problem:</strong> ${task.problem}<br>
        <strong>Priorität:</strong> ${task.priorität}<br>
        ${task.foto ? `<img src="${task.foto}" alt="Photo" style="max-width: 200px;">` : ''}
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
            <textarea class="kommentar" placeholder="Ajouter un commentaire..." data-id="${task.id}">${task.kommentar || ""}</textarea>
        </div>
    `;

    // Ajouter des actions
    const actions = document.createElement('div');
    actions.style.marginTop = "10px";

    if (listId === "meldungenList") {
        const inArbeitButton = document.createElement('button');
        inArbeitButton.textContent = "Mettre en travail";
        inArbeitButton.addEventListener("click", async () => {
            await updateTaskStatus(task.id, "aufgaben");
        });
        actions.appendChild(inArbeitButton);
    } else if (listId === "aufgabenList") {
        const archivierenButton = document.createElement('button');
        archivierenButton.textContent = "Archiver";
        archivierenButton.addEventListener("click", async () => {
            await updateTaskStatus(task.id, "archiv");
        });
        actions.appendChild(archivierenButton);
    } else if (listId === "archivList") {
        const löschenButton = document.createElement('button');
        löschenButton.textContent = "Supprimer";
        löschenButton.addEventListener("click", async () => {
            await deleteTask(task.id);
        });
        actions.appendChild(löschenButton);
    }

    listItem.appendChild(actions);
    list.appendChild(listItem);

    // Suivre les changements de commentaire
    listItem.querySelector(".kommentar").addEventListener("input", async (e) => {
        const kommentar = e.target.value;
        const taskId = e.target.dataset.id;
        await updateDoc(doc(db, "tasks", taskId), { kommentar });
        console.log(`Commentaire mis à jour pour la tâche ${taskId}.`);
    });
}

// Mettre à jour le statut d'une tâche
async function updateTaskStatus(taskId, newStatus) {
    try {
        await updateDoc(doc(db, "tasks", taskId), { status: newStatus });
        console.log(`Tâche ${taskId} déplacée vers ${newStatus}.`);
    } catch (error) {
        console.error("Erreur lors de la mise à jour du statut:", error);
    }
}

// Supprimer une tâche
async function deleteTask(taskId) {
    try {
        await deleteDoc(doc(db, "tasks", taskId));
        console.log(`Tâche ${taskId} supprimée.`);
    } catch (error) {
        console.error("Erreur lors de la suppression de la tâche:", error);
    }
}

// Charger les tâches au démarrage
loadTasks();
