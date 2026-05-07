let translations = {};

// Cargar traducciones
async function loadTranslations() {
    const response = await fetch('translations.json');
    translations = await response.json();
    applyLanguage(localStorage.getItem('lang') || 'es');
}

// Aplicar idioma
function applyLanguage(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = translations[lang][key];
    });
    document.getElementById('langSwitcher').value = lang;
    localStorage.setItem('lang', lang);
}

// Alternar Tema (Bootstrap 5.3 nativo)
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-bs-theme', newTheme);
    themeToggle.textContent = newTheme === 'light' ? '🌙' : '☀️';
    localStorage.setItem('theme', newTheme);
});

// Selector de idioma
document.getElementById('langSwitcher').addEventListener('change', (e) => {
    applyLanguage(e.target.value);
});

// Inicialización
window.onload = () => {
    loadTranslations();
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-bs-theme', savedTheme);
    themeToggle.textContent = savedTheme === 'light' ? '🌙' : '☀️';
};
