document.addEventListener('DOMContentLoaded', () => {
    showSection('eintrag');

    const taskForm = document.getElementById('taskForm');
    taskForm.addEventListener('submit', function(event) {
        event.preventDefault();
        addTask();
    });
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
        id: Date.now(),
        haus,
        problem,
        priorität,
        foto: foto ? URL.createObjectURL(foto) : null
    };

    renderTask(task, 'meldungenList');
    document.getElementById('taskForm').reset();
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
        listItem.appendChild(img);
    }

    const actions = document.createElement('div');

    if (listId === 'meldungenList') {
        const inArbeitButton = document.createElement('button');
        inArbeitButton.textContent = 'In Arbeit setzen';
        inArbeitButton.addEventListener('click', () => moveTask(task.id, 'aufgabenList'));
        actions.appendChild(inArbeitButton);
    } else if (listId === 'aufgabenList') {
        const archivierenButton = document.createElement('button');
        archivierenButton.textContent = 'Archivieren';
        archivierenButton.addEventListener('click', () => moveTask(task.id, 'archivList'));
        actions.appendChild(archivierenButton);
    } else if (listId === 'archivList') {
        const löschenButton = document.createElement('button');
        löschenButton.textContent = 'Löschen';
        löschenButton.addEventListener('click
::contentReference[oaicite:0]{index=0}
 
