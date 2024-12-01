// Funktion zur Navigation
function showSection(sectionId) {
    document.querySelectorAll('section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

window.showSection = showSection; // Funktion global verfügbar machen

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

// Druckfunktion
function printSelectedTasks(listId) {
    const tasks = document.querySelectorAll(`#${listId} li`);
    const selectedTasks = Array.from(tasks).map(task => task.textContent.trim()).join('\n\n');
    const newWindow = window.open('', '', 'width=600,height=400');
    newWindow.document.write('<pre>' + selectedTasks + '</pre>');
    newWindow.print();
    newWindow.close();
}

window.printSelectedTasks = printSelectedTasks; // Funktion global verfügbar machen
