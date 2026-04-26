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
// Control de Música Minimalista
function initMusicControl() {
    const musicBtn = document.getElementById('music-btn');
    const audio = document.getElementById('wedding-song');
    
    // El audio no suele reproducirse automáticamente por bloqueos del navegador.
    // Se activará cuando el usuario haga clic en la pantalla por primera vez.
    let audioStarted = false;
    
    document.body.addEventListener('click', function() {
        if (!audioStarted) {
            audio.play().catch(e => console.log("Autoplay prevenido"));
            musicBtn.innerHTML = "⏸️";
            audioStarted = true;
        }
    }, { once: true });

    musicBtn.addEventListener('click', function(e) {
        e.stopPropagation(); // Evita que dispare el evento del body
        if (audio.paused) {
            audio.play();
            musicBtn.innerHTML = "⏸️"; 
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