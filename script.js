// Navigation zwischen den Abschnitten
function showSection(sectionId) {
    document.querySelectorAll('section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

window.showSection = showSection;

// Aufgaben hinzufügen
document.getElementById('taskForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const haus = document.getElementById('haus').value;
    const problem = document.getElementById('problem').value;
    const priorität = document.getElementById('priorität').value;
    const fotoInput = document.getElementById('foto');

    let fotoDataURL = null;

    if (fotoInput.files.length > 0) {
        const file = fotoInput.files[0];
        const reader = new FileReader();
        reader.onload = function (e) {
            fotoDataURL = e.target.result;
            addTaskToList('meldungenList', haus, problem, priorität, fotoDataURL);
        };
        reader.readAsDataURL(file);
    } else {
        addTaskToList('meldungenList', haus, problem, priorität, null);
    }

    document.getElementById('taskForm').reset();
});

// Aufgabe zur Liste hinzufügen
function addTaskToList(listId, haus, problem, priorität, fotoDataURL) {
    const list = document.getElementById(listId);
    const listItem = document.createElement('li');

    listItem.innerHTML = `
        <input type="checkbox" class="task-checkbox">
        <strong>Haus:</strong> ${haus}<br>
        <strong>Problem:</strong> ${problem}<br>
        <strong>Priorität:</strong> ${priorität}<br>
        ${fotoDataURL ? `<img src="${fotoDataURL}" alt="Foto">` : ''}
        <div>
            <label for="abteilung">Abteilung:</label>
            <select class="abteilung">
                <option value="Keine">Keine</option>
                <option value="Hausverwaltung">Hausverwaltung</option>
                <option value="Hausmeister">Hausmeister</option>
                <option value="Rezeption">Rezeption</option>
            </select>
            <button onclick="moveTaskTo('aufgabenList', this)">In Arbeit setzen</button>
        </div>
    `;

    list.appendChild(listItem);
}

// Aufgabe in eine andere Liste verschieben
function moveTaskTo(targetListId, button) {
    const listItem = button.parentElement.parentElement;
    const targetList = document.getElementById(targetListId);
    targetList.appendChild(listItem);
}

// Aufgaben filtern
function filterTasks(listId, filterInputId) {
    const filter = document.getElementById(filterInputId).value.toLowerCase();
    const tasks = document.querySelectorAll(`#${listId} li`);
    tasks.forEach(task => {
        const content = task.textContent.toLowerCase();
        task.style.display = content.includes(filter) ? "block" : "none";
    });
}

document.getElementById('meldungenFilter').addEventListener('input', () => filterTasks('meldungenList', 'meldungenFilter'));
document.getElementById('aufgabenFilter').addEventListener('input', () => filterTasks('aufgabenList', 'aufgabenFilter'));

// Aufgaben drucken
function printSelectedTasks(listId) {
    const tasks = document.querySelectorAll(`#${listId} li .task-checkbox:checked`);
    const selectedTasks = Array.from(tasks).map(task => {
        const parent = task.parentElement;
        return parent.textContent.trim();
    }).join('\n\n');

    const newWindow = window.open('', '', 'width=600,height=400');
    newWindow.document.write('<pre>' + selectedTasks + '</pre>');
    newWindow.print();
    newWindow.close();
}

window.printSelectedTasks = printSelectedTasks;
