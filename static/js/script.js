// static/js/script.js

document.addEventListener('DOMContentLoaded', function() {
    initCountdown();
    initRSVPForm();
    initMusicControl();
    initScrollReveal(); // Nueva función
    initLightbox();
    initGiftRegistry();
});

function initCountdown() {
    const daysEl = document.getElementById('days');
    if (!daysEl) return; // <--- LÍNEA SALVAVIDAS: Si no hay contador, salir.

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
    if (!form) return; // <--- LÍNEA SALVAVIDAS: Si no hay formulario, salir.

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

// Función para el Visor de Fotos (Lightbox)
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return; // <--- LÍNEA SALVAVIDAS: Si no hay lightbox, salir.

    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.lightbox-close');
    const galleryImages = document.querySelectorAll('.marquee-track img');

    // Abrir visor al tocar una foto
    galleryImages.forEach(img => {
        img.addEventListener('click', function() {
            lightboxImg.src = this.src; // Copia la ruta de la foto tocada
            lightbox.classList.add('active');
        });
    });

    // Cerrar visor al tocar la "X"
    closeBtn.addEventListener('click', () => {
        lightbox.classList.remove('active');
    });

    // Cerrar visor al tocar cualquier parte del fondo oscuro
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.classList.remove('active');
        }
    });
}

function initGiftRegistry() {
    const actionButtons = document.querySelectorAll('.btn-gift-action');
    const cancelButtons = document.querySelectorAll('.btn-gift-cancel');

    if (actionButtons.length === 0) return; // Si no estamos en la página de regalos, salir

    // 1. Cargar estados de la base de datos al entrar a la página
    fetch('/api/regalos/estado')
        .then(res => res.json())
        .then(data => {
            if (data.success && data.reservas) {
                data.reservas.forEach(reserva => {
                    marcarComoReservadoEnPantalla(reserva.gift_id, reserva.reserved_by);
                });
            }
        })
        .catch(err => console.error("Error cargando estados de regalos:", err)); // <--- ¡CAMBIAR .error POR .catch!

    // 2. Escuchar clics para RESERVAR
    actionButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const giftId = this.getAttribute('data-gift-id');
            
            // Pedimos el nombre al usuario
            const name = prompt("Para reservar este regalo, por favor ingresá tu nombre o el de tu familia:");
            
            if (!name || name.trim() === "") {
                alert("Reserva cancelada. Es necesario ingresar un nombre.");
                return;
            }

            this.innerText = "Reservando...";
            this.disabled = true;

            fetch('/api/regalos/reservar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gift_id: giftId, reserved_by: name })
            })
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    alert("¡Muchas gracias! El regalo ha sido reservado para ustedes.");
                    marcarComoReservadoEnPantalla(giftId, name);
                } else {
                    alert("Hubo un error o el regalo ya fue reservado por otra persona.");
                    this.innerText = "Quiero reservar este regalo";
                    this.disabled = false;
                }
            })
            .catch(err => {
                console.error(err);
                alert("Error de conexión. Intentá de nuevo.");
                this.innerText = "Quiero reservar este regalo";
                this.disabled = false;
            });
        });
    });

    // 3. Escuchar clics para CANCELAR / SUSPENDER
    cancelButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const giftId = this.getAttribute('data-gift-id');
            
            if (!confirm("¿Estás seguro de que querés suspender la reserva de este regalo? Volverá a estar disponible para todos.")) {
                return;
            }

            fetch('/api/regalos/cancelar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gift_id: giftId })
            })
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    alert("La reserva ha sido suspendida.");
                    marcarComoDisponibleEnPantalla(giftId);
                } else {
                    alert("No se pudo suspender la reserva. Intentá de nuevo.");
                }
            });
        });
    });

    // Funciones auxiliares para modificar la interfaz visual
    function marcarComoReservadoEnPantalla(giftId, nombrePersona) {
        const actionBtn = document.querySelector(`.btn-gift-action[data-gift-id="${giftId}"]`);
        const cancelBtn = document.querySelector(`.btn-gift-cancel[data-gift-id="${giftId}"]`);
        
        if (actionBtn) {
            actionBtn.innerText = `Reservado por ${nombrePersona}`;
            actionBtn.className = "btn-gift-action btn-gift-grey"; // Cambia estilo a gris elegante
            actionBtn.disabled = true;
        }
        if (cancelBtn) {
            cancelBtn.style.display = "block"; // Muestra el botón de suspender reserva
        }
    }

    function marcarComoDisponibleEnPantalla(giftId) {
        const actionBtn = document.querySelector(`.btn-gift-action[data-gift-id="${giftId}"]`);
        const cancelBtn = document.querySelector(`.btn-gift-cancel[data-gift-id="${giftId}"]`);
        
        if (actionBtn) {
            actionBtn.innerText = "Quiero reservar este regalo";
            actionBtn.className = "btn-gift-action btn-gift-blue"; // Vuelve a color azul celeste
            actionBtn.disabled = false;
        }
        if (cancelBtn) {
            cancelBtn.style.display = "none"; // Oculta el botón de suspender reserva
        }
    }
}