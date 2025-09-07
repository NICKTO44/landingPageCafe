
// Por esto:
const isLocalhost = window.location.hostname === 'localhost';
const API_BASE_URL = isLocalhost ? '' : 'https://landingpagecafe-production.up.railway.app';
// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Form submission para pedidos (formulario original)
document.addEventListener('DOMContentLoaded', function() {
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            const whatsappMessage = `Hola! Soy ${name}.%0A%0AMe interesa hacer un pedido:%0A${message}%0A%0AMi teléfono: ${phone}%0AMi email: ${email}`;
            window.open(`https://wa.me/51927391918?text=${whatsappMessage}`, '_blank');
            alert('¡Gracias! Te redirigimos a WhatsApp para completar tu pedido.');
        });
    }
    
    // Cargar testimonios y configurar carrusel
    cargarTestimoniosDB();
    
    // Configurar formulario de testimonios
    const testimonioForm = document.getElementById('testimonioForm');
    if (testimonioForm) {
        testimonioForm.addEventListener('submit', enviarTestimonioNuevo);
    }
});

// Product order function
function orderProduct(productName, price) {
    const productDetails = {
        'Blend Premium': 'Mezcla perfecta de granos arábica de altura. Notas a chocolate y frutos secos',
        'Espresso Intenso': 'Para los amantes del café fuerte. Cuerpo completo y aroma intenso',
        'Origen Especial': 'Granos de una sola finca. Edición limitada con perfil único de sabor',
        'Café Suave': 'Perfecto para comenzar el día. Suave y aromático, ideal para toda la familia',
        'Descafeinado': 'Todo el sabor sin cafeína. Proceso natural que preserva el aroma original',
        'Pack Degustación': 'Prueba nuestros 3 mejores cafés en porciones pequeñas. Ideal para conocer tu favorito'
    };
    
    const message = `🔥 ¡PEDIDO ESPECIAL! ☕%0A%0A📦 Producto: ${productName}%0A💰 Precio: S/ ${price}%0A📝 Descripción: ${productDetails[productName] || 'Producto premium'}%0A%0A¿Podrían confirmar disponibilidad y darme más detalles?`;
    
    window.open(`https://wa.me/51927391918?text=${message}`, '_blank');
}

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.benefit-card, .product-card, .testimonial-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Add parallax effect to hero
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.3;
    const hero = document.querySelector('.hero');
    if (hero && window.innerWidth > 768) {
        hero.style.backgroundPositionY = rate + 'px';
    }
});

// ===== SISTEMA DE TESTIMONIOS CON CARRUSEL =====
let testimoniosData = [];
let currentTestimonioIndex = 0;
let carruselInterval;

async function cargarTestimoniosDB() {
    try {
        console.log('Cargando desde:', `${API_BASE_URL}/api/testimonios`);
        const response = await fetch(`${API_BASE_URL}/api/testimonios`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Datos recibidos:', data);
        
        if (data.testimonios && data.testimonios.length > 0) {
            testimoniosData = data.testimonios;
            console.log('Usando testimonios reales de la BD');
            iniciarCarruselTestimonios();
            return; // Importante: salir aquí si todo funciona
        }
    } catch (error) {
        console.log('Usando testimonios por defecto');
        // Usar testimonios de respaldo
        testimoniosData = [
            {
                estrellas: '★★★★★',
                comentario: 'El mejor café que he probado en Lima. La calidad es excepcional y el aroma llena toda la casa.',
                nombre: 'María González',
                fecha: 'Cliente verificado'
            },
            {
                estrellas: '★★★★★',
                comentario: 'Increíble servicio y producto. El café llega súper fresco y el sabor es incomparable.',
                nombre: 'Carlos Mendoza',
                fecha: 'Cliente verificado'
            },
            {
                estrellas: '★★★★★',
                comentario: 'Como barista profesional, puedo confirmar que este café cumple con los más altos estándares.',
                nombre: 'Ana Pérez',
                fecha: 'Cliente verificado'
            },
            {
                estrellas: '★★★★★',
                comentario: 'Excelente café artesanal. El proceso de tostado se nota en cada sorbo. Muy recomendado.',
                nombre: 'Roberto Silva',
                fecha: 'Cliente verificado'
            },
            {
                estrellas: '★★★★★',
                comentario: 'La entrega fue rápida y el café llegó perfectamente empacado. Sabor auténtico peruano.',
                nombre: 'Carmen López',
                fecha: 'Cliente verificado'
            }
        ];
        iniciarCarruselTestimonios();
    }
}

function iniciarCarruselTestimonios() {
    if (testimoniosData.length === 0) return;
    
    // Mostrar testimonios iniciales
    mostrarTestimoniosCarrusel();
    
    // Crear indicadores si hay suficientes testimonios
    setTimeout(crearIndicadores, 500);
    
    // Iniciar rotación automática cada 5 segundos
    if (carruselInterval) clearInterval(carruselInterval);
    
    carruselInterval = setInterval(() => {
        const testimoniosPorPagina = window.innerWidth < 768 ? 1 : 3;
        currentTestimonioIndex += testimoniosPorPagina;
        
        // Si llegamos al final, volver al inicio
        if (currentTestimonioIndex >= testimoniosData.length) {
            currentTestimonioIndex = 0;
        }
        
        mostrarTestimoniosCarrusel();
        actualizarIndicadores();
    }, 5000); // 5 segundos
}

function mostrarTestimoniosCarrusel() {
    const container = document.querySelector('.testimonials-grid');
    if (!container) return;
    
    // Determinar cuántos testimonios mostrar (3 en desktop, 1 en móvil)
    const testimoniosPorPagina = window.innerWidth < 768 ? 1 : 3;
    
    // Obtener testimonios para esta "página"
    const testimoniosAMostrar = [];
    for (let i = 0; i < testimoniosPorPagina; i++) {
        const index = (currentTestimonioIndex + i) % testimoniosData.length;
        testimoniosAMostrar.push(testimoniosData[index]);
    }
    
    // Aplicar efecto de fade out
    container.style.opacity = '0';
    container.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        // Cambiar contenido
        container.innerHTML = testimoniosAMostrar.map(testimonio => `
            <div class="testimonial-card testimonial-carrusel">
                <div class="stars">${testimonio.estrellas}</div>
                <p class="testimonial-text">${testimonio.comentario}</p>
                <div class="testimonial-author">- ${testimonio.nombre}</div>
                <div class="testimonio-fecha">${testimonio.fecha}</div>
            </div>
        `).join('');
        
        // Aplicar efecto de fade in
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
    }, 300); // Esperar 300ms para el fade out
}

function crearIndicadores() {
    const testimoniosSection = document.querySelector('.testimonials');
    if (!testimoniosSection || testimoniosData.length <= 3) return;
    
    // Limpiar indicadores existentes
    const indicadoresExistentes = testimoniosSection.querySelector('.carrusel-indicadores');
    if (indicadoresExistentes) {
        indicadoresExistentes.remove();
    }
    
    const testimoniosPorPagina = window.innerWidth < 768 ? 1 : 3;
    const totalPaginas = Math.ceil(testimoniosData.length / testimoniosPorPagina);
    
    const indicadoresHTML = `
        <div class="carrusel-indicadores">
            ${Array.from({length: totalPaginas}, (_, i) => 
                `<div class="indicador ${i === 0 ? 'activo' : ''}" onclick="irAPagina(${i})"></div>`
            ).join('')}
        </div>
    `;
    
    testimoniosSection.insertAdjacentHTML('beforeend', indicadoresHTML);
}

function irAPagina(pagina) {
    pausarCarrusel();
    const testimoniosPorPagina = window.innerWidth < 768 ? 1 : 3;
    currentTestimonioIndex = pagina * testimoniosPorPagina;
    mostrarTestimoniosCarrusel();
    actualizarIndicadores(pagina);
    
    // Reanudar después de 10 segundos
    setTimeout(reanudarCarrusel, 10000);
}

function actualizarIndicadores(paginaActiva = null) {
    const indicadores = document.querySelectorAll('.indicador');
    if (paginaActiva === null) {
        const testimoniosPorPagina = window.innerWidth < 768 ? 1 : 3;
        paginaActiva = Math.floor(currentTestimonioIndex / testimoniosPorPagina);
    }
    
    indicadores.forEach((indicador, index) => {
        indicador.classList.toggle('activo', index === paginaActiva);
    });
}

// Pausar carrusel cuando el usuario está interactuando
function pausarCarrusel() {
    if (carruselInterval) {
        clearInterval(carruselInterval);
    }
}

function reanudarCarrusel() {
    iniciarCarruselTestimonios();
}

// Controles manuales
function siguienteTestimonio() {
    pausarCarrusel();
    const testimoniosPorPagina = window.innerWidth < 768 ? 1 : 3;
    currentTestimonioIndex += testimoniosPorPagina;
    if (currentTestimonioIndex >= testimoniosData.length) {
        currentTestimonioIndex = 0;
    }
    mostrarTestimoniosCarrusel();
    actualizarIndicadores();
    
    // Reanudar después de 10 segundos
    setTimeout(reanudarCarrusel, 10000);
}

function anteriorTestimonio() {
    pausarCarrusel();
    const testimoniosPorPagina = window.innerWidth < 768 ? 1 : 3;
    currentTestimonioIndex -= testimoniosPorPagina;
    if (currentTestimonioIndex < 0) {
        currentTestimonioIndex = Math.max(0, testimoniosData.length - testimoniosPorPagina);
    }
    mostrarTestimoniosCarrusel();
    actualizarIndicadores();
    
    // Reanudar después de 10 segundos
    setTimeout(reanudarCarrusel, 10000);
}

// Pausar cuando el mouse está sobre los testimonios
document.addEventListener('DOMContentLoaded', function() {
    const testimoniosSection = document.querySelector('.testimonials');
    if (testimoniosSection) {
        testimoniosSection.addEventListener('mouseenter', pausarCarrusel);
        testimoniosSection.addEventListener('mouseleave', reanudarCarrusel);
    }
});

// ===== FORMULARIO DE TESTIMONIOS =====
async function enviarTestimonioNuevo(e) {
    e.preventDefault();
    
    const nombreEl = document.getElementById('nombreTestimonio');
    const calificacionEl = document.getElementById('calificacionTestimonio');
    const comentarioEl = document.getElementById('comentarioTestimonio');
    const btnEl = document.getElementById('btnEnviar');
    
    if (!nombreEl || !calificacionEl || !comentarioEl) {
        mostrarMensajeEstado('Error: No se encontró el formulario', 'error');
        return;
    }
    
    const nombre = nombreEl.value.trim();
    const calificacion = parseInt(calificacionEl.value);
    const comentario = comentarioEl.value.trim();
    
    // Validaciones
    if (!nombre || nombre.length < 2) {
        mostrarMensajeEstado('Ingresa tu nombre completo', 'error');
        return;
    }
    
    if (!calificacion || calificacion < 1 || calificacion > 5) {
        mostrarMensajeEstado('Selecciona una calificación', 'error');
        return;
    }
    
    if (!comentario || comentario.length < 10) {
        mostrarMensajeEstado('Escribe un comentario más detallado (mínimo 10 caracteres)', 'error');
        return;
    }
    
    // Mostrar estado de carga
    if (btnEl) {
        btnEl.disabled = true;
        btnEl.textContent = 'Enviando...';
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/testimonios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre, calificacion, comentario })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            mostrarMensajeEstado(data.mensaje || '¡Testimonio enviado exitosamente!', 'success');
            document.getElementById('testimonioForm').reset();
            
            // Recargar testimonios si fue aprobado
            if (data.estado === 'aprobado') {
                setTimeout(() => cargarTestimoniosDB(), 1000);
            }
        } else {
            mostrarMensajeEstado(data.error || 'Error enviando testimonio', 'error');
        }
        
    } catch (error) {
        console.error('Error:', error);
        // Para demo, simular éxito
        const estrellas = '★'.repeat(calificacion);
        const nuevoTestimonio = {
            estrellas,
            comentario,
            nombre,
            fecha: 'Hace unos momentos'
        };
        
        testimoniosData.unshift(nuevoTestimonio);
        mostrarMensajeEstado('¡Testimonio agregado exitosamente! (Modo demo)', 'success');
        document.getElementById('testimonioForm').reset();
        
        // Actualizar carrusel
        setTimeout(() => {
            pausarCarrusel();
            currentTestimonioIndex = 0;
            mostrarTestimoniosCarrusel();
            crearIndicadores();
            setTimeout(reanudarCarrusel, 3000);
        }, 1000);
        
    } finally {
        // Restaurar botón
        if (btnEl) {
            btnEl.disabled = false;
            btnEl.textContent = 'Enviar Testimonio';
        }
    }
}

function mostrarMensajeEstado(mensaje, tipo) {
    const mensajeEl = document.getElementById('mensajeEstado');
    if (mensajeEl) {
        mensajeEl.innerHTML = mensaje;
        mensajeEl.style.display = 'block';
        mensajeEl.className = `mensaje-estado ${tipo}`;
        
        if (tipo === 'success') {
            setTimeout(() => {
                mensajeEl.style.display = 'none';
            }, 5000);
        }
        
        // Scroll hacia el mensaje
        mensajeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Limpiar intervalo cuando se cierra la página
window.addEventListener('beforeunload', function() {
    if (carruselInterval) {
        clearInterval(carruselInterval);
    }
});

// Recrear indicadores cuando cambia el tamaño de ventana
window.addEventListener('resize', function() {
    clearTimeout(window.resizeTimeout);
    window.resizeTimeout = setTimeout(() => {
        crearIndicadores();
        // Ajustar índice actual si es necesario
        const testimoniosPorPagina = window.innerWidth < 768 ? 1 : 3;
        if (currentTestimonioIndex >= testimoniosData.length) {
            currentTestimonioIndex = 0;
        }
        mostrarTestimoniosCarrusel();
    }, 250);
});
 // Función para voltear las tarjetas
        function flipCard(element) {
            const card = element.closest('.benefit-card');
            card.classList.toggle('flipped');
        }

        // Event listeners para todas las tarjetas
        document.addEventListener('DOMContentLoaded', function() {
            const cards = document.querySelectorAll('.benefit-card');
            
            cards.forEach(card => {
                // Clic en la tarjeta para voltear
                card.addEventListener('click', function(e) {
                    // No voltear si se hace clic en el botón de cerrar
                    if (!e.target.classList.contains('flip-back-btn')) {
                        this.classList.toggle('flipped');
                    }
                });

                // Efecto hover mejorado
                card.addEventListener('mouseenter', function() {
                    if (!this.classList.contains('flipped')) {
                        this.style.transform = 'translateY(-10px) scale(1.02)';
                    }
                });

                card.addEventListener('mouseleave', function() {
                    if (!this.classList.contains('flipped')) {
                        this.style.transform = 'translateY(0) scale(1)';
                    }
                });
            });

            // Animación de entrada secuencial
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver(function(entries) {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.animationDelay = entry.target.dataset.delay || '0s';
                        entry.target.classList.add('animate-in');
                    }
                });
            }, observerOptions);

            cards.forEach((card, index) => {
                card.dataset.delay = `${index * 0.2}s`;
                observer.observe(card);
            });
        });

        // Efecto de partículas (opcional)
        function createParticle() {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = '4px';
            particle.style.height = '4px';
            particle.style.background = 'rgba(212, 165, 116, 0.6)';
            particle.style.borderRadius = '50%';
            particle.style.pointerEvents = 'none';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = '100%';
            particle.style.animation = 'floatUp 4s linear forwards';
            
            document.querySelector('.benefits').appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 4000);
        }

        // Crear partículas ocasionalmente
        setInterval(createParticle, 2000);

        // CSS para animación de partículas
        const style = document.createElement('style');
        style.textContent = `
            @keyframes floatUp {
                to {
                    transform: translateY(-100vh) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);