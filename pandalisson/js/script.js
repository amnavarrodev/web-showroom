/**
 * Global Connect Argentina - Scripts principales
 * Funcionalidad: Menú responsive, scroll effects, validación de formulario
 */

// ========== MENÚ HAMBURGUESA ==========
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Cerrar menú al hacer click en un enlace
document.querySelectorAll('#navLinks a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

// ========== SOMBRA EN NAVBAR AL HACER SCROLL ==========
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ========== VALIDACIÓN DEL FORMULARIO ==========
const form = document.getElementById('formContacto');

form.addEventListener('submit', function(e) {
    // Validación adicional antes de enviar
    const nombre = form.querySelector('input[name="nombre"]').value.trim();
    const email = form.querySelector('input[name="email"]').value.trim();
    const mensaje = form.querySelector('textarea[name="mensaje"]').value.trim();
    
    let errores = [];
    
    if (nombre.length < 2) {
        errores.push('El nombre debe tener al menos 2 caracteres.');
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errores.push('Por favor, ingresá un correo electrónico válido.');
    }
    
    if (mensaje.length < 10) {
        errores.push('El mensaje debe tener al menos 10 caracteres.');
    }
    
    if (errores.length > 0) {
        e.preventDefault();
        alert('⚠️ Por favor, corregí los siguientes errores:\n\n' + errores.join('\n'));
        return false;
    }
    
    // Si todo está bien, mostrar mensaje de carga
    const btn = form.querySelector('button');
    const textoOriginal = btn.textContent;
    btn.textContent = 'Enviando...';
    btn.disabled = true;
    
    // Restaurar botón después de un tiempo (por si el envío falla)
    setTimeout(() => {
        btn.textContent = textoOriginal;
        btn.disabled = false;
    }, 5000);
});