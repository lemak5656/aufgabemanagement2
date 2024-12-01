function showPage(pageId) {
    document.querySelectorAll('section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

document.addEventListener('DOMContentLoaded', function () {
    showPage('eintrag'); // Standardmäßig die "eintrag"-Seite anzeigen
});
