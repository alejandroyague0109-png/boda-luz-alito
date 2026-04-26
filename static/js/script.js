// static/js/script.js

document.addEventListener('DOMContentLoaded', function() {
    initCountdown();
    initRSVPForm();
    initMusicControl();
    initScrollReveal(); // Nueva función
});

function initCountdown() {
    const weddingDate = new Date("August 15, 2026 12:00:00").getTime();

    function update() {
        const now = new Date().getTime();
        const difference = weddingDate - now;

        if (difference < 0) return;

        document.getElementById('days').innerText = Math.floor(difference / (1000 * 60 * 60 * 24));
        document.getElementById('hours').innerText = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        document.getElementById('minutes').innerText = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        // SEGUNDOS AGREGADOS
        document.getElementById('seconds').innerText = Math.floor((difference % (1000 * 60)) / 1000);
    }

    update();
    setInterval(update, 1000);
}

// FUNCIÓN PARA APARICIÓN SUAVE AL DESPLAZARSE (IDA Y VUELTA)
function initScrollReveal() {
    const observerOptions = {
        threshold: 0.15 // Se activa cuando el 15% del elemento es visible
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Entra a la pantalla -> Aparece suavemente
                entry.target.classList.add('active');
            } else {
                // Sale de la pantalla -> Desaparece suavemente
                entry.target.classList.remove('active');
            }
        });
    }, observerOptions);

    // Observamos todas las secciones que tengan la clase 'reveal'
    document.querySelectorAll('.reveal').forEach(section => {
        observer.observe(section);
    });
}

// Control de Música Minimalista (Autoplay Forzado)
function initMusicControl() {
    const musicBtn = document.getElementById('music-btn');
    const audio = document.getElementById('wedding-song');
    
    // Función central para arrancar la música
    const tryPlayMusic = () => {
        audio.play().then(() => {
            // Si el navegador nos deja, cambiamos el ícono y dejamos de insistir
            musicBtn.innerHTML = "⏸️";
            removeListeners();
        }).catch(e => {
            // El navegador bloqueó el autoplay silenciosamente, esperamos la interacción
        });
    };

    // Quitamos los eventos una vez que la música ya arrancó para ahorrar memoria
    const removeListeners = () => {
        document.removeEventListener('click', tryPlayMusic);
        document.removeEventListener('touchstart', tryPlayMusic);
        document.removeEventListener('scroll', tryPlayMusic);
    };

    // 1. Intentamos apenas carga la página (funciona a veces en PC)
    tryPlayMusic();

    // 2. Si falló, la música arrancará al primer toque de pantalla, clic o al hacer scroll
    document.addEventListener('click', tryPlayMusic);
    document.addEventListener('touchstart', tryPlayMusic, { passive: true });
    document.addEventListener('scroll', tryPlayMusic, { passive: true });

    // Comportamiento del botón manual
    musicBtn.addEventListener('click', function(e) {
        e.stopPropagation(); // Evita conflictos con el clic general
        if (audio.paused) {
            audio.play();
            musicBtn.innerHTML = "⏸️";
            removeListeners(); // Si lo prendió manual, dejamos de espiar
        } else {
            audio.pause();
            musicBtn.innerHTML = "▶️";
        }
    });
}

// Envío del Formulario
function initRSVPForm() {
    const form = document.getElementById('rsvp-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.innerText = "Enviando...";
        submitBtn.disabled = true;

        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => data[key] = value);

        fetch('/api/rsvp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(res => {
            if (res.success) {
                alert('¡Confirmación enviada con éxito! Nos vemos en la boda.');
                form.reset();
            } else {
                alert('Hubo un error al enviar. Por favor, intenta de nuevo.');
            }
        })
        .catch(err => {
            console.error('Error:', err);
            alert('Error de conexión. Intenta de nuevo más tarde.');
        })
        .finally(() => {
            submitBtn.innerText = "Confirmar Asistencia";
            submitBtn.disabled = false;
        });
    });
}