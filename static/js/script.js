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

// Control de Música y Pantalla de Bienvenida
function initMusicControl() {
    const musicBtn = document.getElementById('music-btn');
    const audio = document.getElementById('wedding-song');
    const welcomeOverlay = document.getElementById('welcome-overlay');
    const openBtn = document.getElementById('open-invitation');
    
    // Íconos SVG ultra elegantes (reemplazan a los emojis del celular)
    const iconPlay = `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
    const iconPause = `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;

    // Ponemos el ícono de play por defecto al cargar
    if(musicBtn) musicBtn.innerHTML = iconPlay;
    
    // Al hacer clic en "Abrir Invitación"
    if(openBtn) {
        openBtn.addEventListener('click', function() {
            audio.play().then(() => {
                musicBtn.innerHTML = iconPause; // Cambia a pausa elegantemente
            }).catch(e => console.log("Error al reproducir:", e));
            
            welcomeOverlay.classList.add('hidden');
            window.scrollTo(0, 0);
        });
    }

    // Control manual del botón flotante de música
    if(musicBtn) {
        musicBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (audio.paused) {
                audio.play();
                musicBtn.innerHTML = iconPause;
            } else {
                audio.pause();
                musicBtn.innerHTML = iconPlay;
            }
        });
    }
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