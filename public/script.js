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
    
    // SOLO cargar testimonios UNA VEZ
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

// ===== SISTEMA DE TESTIMONIOS CON CARRUSEL (SOLO UNO) =====
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
            return;
        }
    } catch (error) {
        console.log('Usando testimonios por defecto');
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
    
    mostrarTestimoniosCarrusel();
    setTimeout(crearIndicadores, 500);
    
    if (carruselInterval) clearInterval(carruselInterval);
    
    carruselInterval = setInterval(() => {
        const testimoniosPorPagina = window.innerWidth < 768 ? 1 : 3;
        currentTestimonioIndex += testimoniosPorPagina;
        
        if (currentTestimonioIndex >= testimoniosData.length) {
            currentTestimonioIndex = 0;
        }
        
        mostrarTestimoniosCarrusel();
        actualizarIndicadores();
    }, 5000);
}

function mostrarTestimoniosCarrusel() {
    const container = document.querySelector('.testimonials-grid');
    if (!container) return;
    
    const testimoniosPorPagina = window.innerWidth < 768 ? 1 : 3;
    const testimoniosAMostrar = [];
    
    for (let i = 0; i < testimoniosPorPagina; i++) {
        const index = (currentTestimonioIndex + i) % testimoniosData.length;
        testimoniosAMostrar.push(testimoniosData[index]);
    }
    
    container.style.opacity = '0';
    container.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        container.innerHTML = testimoniosAMostrar.map(testimonio => `
            <div class="testimonial-card testimonial-carrusel">
                <div class="stars">${testimonio.estrellas}</div>
                <p class="testimonial-text">${testimonio.comentario}</p>
                <div class="testimonial-author">- ${testimonio.nombre}</div>
                <div class="testimonio-fecha">${testimonio.fecha}</div>
            </div>
        `).join('');
        
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
    }, 300);
}

function crearIndicadores() {
    const testimoniosSection = document.querySelector('.testimonials');
    if (!testimoniosSection || testimoniosData.length <= 3) return;
    
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

function pausarCarrusel() {
    if (carruselInterval) {
        clearInterval(carruselInterval);
    }
}

function reanudarCarrusel() {
    iniciarCarruselTestimonios();
}

function siguienteTestimonio() {
    pausarCarrusel();
    const testimoniosPorPagina = window.innerWidth < 768 ? 1 : 3;
    currentTestimonioIndex += testimoniosPorPagina;
    if (currentTestimonioIndex >= testimoniosData.length) {
        currentTestimonioIndex = 0;
    }
    mostrarTestimoniosCarrusel();
    actualizarIndicadores();
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
    setTimeout(reanudarCarrusel, 10000);
}

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
            
            if (data.estado === 'aprobado') {
                setTimeout(() => cargarTestimoniosDB(), 1000);
            }
        } else {
            mostrarMensajeEstado(data.error || 'Error enviando testimonio', 'error');
        }
        
    } catch (error) {
        console.error('Error:', error);
        
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
        
        setTimeout(() => {
            pausarCarrusel();
            currentTestimonioIndex = 0;
            mostrarTestimoniosCarrusel();
            crearIndicadores();
            setTimeout(reanudarCarrusel, 3000);
        }, 1000);
        
    } finally {
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
        
        mensajeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    const testimoniosSection = document.querySelector('.testimonials');
    if (testimoniosSection) {
        testimoniosSection.addEventListener('mouseenter', pausarCarrusel);
        testimoniosSection.addEventListener('mouseleave', reanudarCarrusel);
    }
});

window.addEventListener('resize', function() {
    clearTimeout(window.resizeTimeout);
    window.resizeTimeout = setTimeout(() => {
        crearIndicadores();
        const testimoniosPorPagina = window.innerWidth < 768 ? 1 : 3;
        if (currentTestimonioIndex >= testimoniosData.length) {
            currentTestimonioIndex = 0;
        }
        mostrarTestimoniosCarrusel();
    }, 250);
});

window.addEventListener('beforeunload', function() {
    if (carruselInterval) {
        clearInterval(carruselInterval);
    }
});

// ===== BENEFITS CARDS =====
function flipCard(element) {
    const card = element.closest('.benefit-card');
    card.classList.toggle('flipped');
}

document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.benefit-card');
    
    cards.forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.classList.contains('flip-back-btn')) {
                this.classList.toggle('flipped');
            }
        });

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

// ===== PARTICLES EFFECT =====
function createParticle() {
    const benefitsSection = document.querySelector('.benefits');
    if (!benefitsSection) return;
    
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
    
    benefitsSection.appendChild(particle);
    
    setTimeout(() => {
        if (particle.parentNode) {
            particle.remove();
        }
    }, 4000);
}

setInterval(createParticle, 2000);

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

// ===== FORMULARIO OPTIMIZADO =====
document.addEventListener('DOMContentLoaded', function() {
    const optimizedForm = document.getElementById('optimizedOrderForm');
    if (optimizedForm) {
        const submitBtn = document.getElementById('submitBtn');
        const loadingSpinner = document.querySelector('.loading-spinner');
        const btnText = document.querySelector('.btn-text');
        const successMessage = document.getElementById('successMessage');
        const stepDots = document.querySelectorAll('.step-dot');
        const messagePreview = document.getElementById('messagePreview');

        function updateMessagePreview() {
            const name = document.getElementById('customerName')?.value || '';
            const phone = document.getElementById('whatsappNumber')?.value || '';
            const zone = document.getElementById('deliveryZone')?.value || '';
            const selectedProducts = Array.from(document.querySelectorAll('input[name="products"]:checked'))
                .map(cb => cb.value);

            if (name && phone) {
                let message = `🟢 *NUEVO PEDIDO - CAFÉ DON CARLOS PORROA*\n\n`;
                message += `👤 *Cliente:* ${name}\n`;
                message += `📱 *WhatsApp:* +51 ${phone}\n`;
                
                if (selectedProducts.length > 0) {
                    message += `☕ *Productos de interés:*\n`;
                    selectedProducts.forEach(product => {
                        message += `• ${product}\n`;
                    });
                }
                
                if (zone) {
                    message += `📍 *Zona de entrega:* ${zone}\n`;
                }
                
                message += `\n¡Gracias por elegir nuestro café artesanal! 🚀`;
                
                if (messagePreview) {
                    messagePreview.textContent = message;
                    messagePreview.style.display = 'block';
                }
            } else {
                if (messagePreview) {
                    messagePreview.style.display = 'none';
                }
            }
        }

        const customerNameInput = document.getElementById('customerName');
        const whatsappInput = document.getElementById('whatsappNumber');
        const deliveryInput = document.getElementById('deliveryZone');
        const productCheckboxes = document.querySelectorAll('input[name="products"]');

        if (customerNameInput) customerNameInput.addEventListener('input', updateMessagePreview);
        if (whatsappInput) whatsappInput.addEventListener('input', updateMessagePreview);
        if (deliveryInput) deliveryInput.addEventListener('input', updateMessagePreview);
        
        productCheckboxes.forEach(cb => {
            cb.addEventListener('change', updateMessagePreview);
        });

        function updateSteps(currentStep) {
            stepDots.forEach((dot, index) => {
                dot.classList.remove('active', 'completed');
                if (index < currentStep) {
                    dot.classList.add('completed');
                } else if (index === currentStep) {
                    dot.classList.add('active');
                }
            });
        }

        function validatePeruvianPhone(phone) {
            const cleaned = phone.replace(/\s+/g, '');
            return /^9\d{8}$/.test(cleaned);
        }

        if (whatsappInput) {
            whatsappInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 9) value = value.slice(0, 9);
                
                if (value.length > 3 && value.length <= 6) {
                    value = value.slice(0, 3) + ' ' + value.slice(3);
                } else if (value.length > 6) {
                    value = value.slice(0, 3) + ' ' + value.slice(3, 6) + ' ' + value.slice(6);
                }
                
                e.target.value = value;
                updateMessagePreview();
            });
        }

        optimizedForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('customerName')?.value.trim() || '';
            const phone = document.getElementById('whatsappNumber')?.value.trim() || '';
            
            if (!name) {
                alert('Por favor ingresa tu nombre completo');
                return;
            }
            
            if (!validatePeruvianPhone(phone)) {
                alert('Por favor ingresa un número de WhatsApp peruano válido (9 dígitos)');
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                if (loadingSpinner) loadingSpinner.style.display = 'inline-block';
                if (btnText) btnText.textContent = 'Enviando...';
            }
            updateSteps(1);

            setTimeout(() => {
                updateSteps(2);
                
                const zone = document.getElementById('deliveryZone')?.value || '';
                const selectedProducts = Array.from(document.querySelectorAll('input[name="products"]:checked'))
                    .map(cb => cb.value);

                let whatsappMessage = `🟢 *NUEVO PEDIDO - CAFÉ DON CARLOS PORROA*%0A%0A`;
                whatsappMessage += `👤 *Cliente:* ${name}%0A`;
                whatsappMessage += `📱 *WhatsApp:* +51 ${phone}%0A`;
                
                if (selectedProducts.length > 0) {
                    whatsappMessage += `☕ *Productos de interés:*%0A`;
                    selectedProducts.forEach(product => {
                        whatsappMessage += `• ${product}%0A`;
                    });
                }
                
                if (zone) {
                    whatsappMessage += `📍 *Zona de entrega:* ${zone}%0A`;
                }
                
                whatsappMessage += `%0A¡Gracias por elegir nuestro café artesanal! 🚀`;

                const whatsappURL = `https://wa.me/51927391918?text=${whatsappMessage}`;
                
                if (optimizedForm && successMessage) {
                    optimizedForm.style.display = 'none';
                    successMessage.classList.add('show');
                }
                
                const manualLink = document.getElementById('manualWhatsApp');
                if (manualLink) {
                    manualLink.href = whatsappURL;
                }
                
                setTimeout(() => {
                    window.open(whatsappURL, '_blank');
                }, 1000);
                
            }, 2000);
        });
    }
});

// Productos animation
function observeProducts() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('animate-in');
                }, index * 200);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.product-card').forEach(card => {
        observer.observe(card);
    });
}

document.addEventListener('DOMContentLoaded', observeProducts);

// ===== SISTEMA DE ANIMACIONES SUAVES =====

class SmoothScrollAnimations {
    constructor() {
        this.observer = null;
        this.animatedElements = new Set();
        this.init();
    }

    init() {
        this.addStyles();
        this.setupObserver();
        this.initElements();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Animaciones suaves y elegantes */
            .smooth-reveal {
                opacity: 0;
                transform: translateY(20px);
                transition: all 0.6s ease-out;
            }

            .smooth-reveal.visible {
                opacity: 1;
                transform: translateY(0);
            }

            /* Fade sutil */
            .fade-in-subtle {
                opacity: 0;
                transition: opacity 0.8s ease-out;
            }

            .fade-in-subtle.visible {
                opacity: 1;
            }

            /* Slide muy sutil */
            .slide-up-gentle {
                opacity: 0;
                transform: translateY(15px);
                transition: all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }

            .slide-up-gentle.visible {
                opacity: 1;
                transform: translateY(0);
            }

            /* Para tarjetas con hover mejorado */
            .card-enhance {
                transition: all 0.3s ease;
            }

            .card-enhance:hover {
                transform: translateY(-5px);
                box-shadow: 0 15px 35px rgba(0,0,0,0.1);
            }

            /* Animación escalonada muy sutil */
            .stagger-gentle {
                opacity: 0;
                transform: translateY(10px);
                transition: all 0.5s ease-out;
            }

            .stagger-gentle.visible {
                opacity: 1;
                transform: translateY(0);
            }

            /* Parallax muy sutil solo para hero */
            .parallax-subtle {
                transition: transform 0.1s linear;
            }

            /* Respeto por usuarios que prefieren menos movimiento */
            @media (prefers-reduced-motion: reduce) {
                .smooth-reveal,
                .fade-in-subtle,
                .slide-up-gentle,
                .stagger-gentle {
                    transition: none;
                    opacity: 1;
                    transform: none;
                }
                
                .parallax-subtle {
                    transform: none !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    setupObserver() {
        const options = {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                }
            });
        }, options);
    }

    animateElement(element) {
        if (this.animatedElements.has(element)) return;
        
        const delay = parseInt(element.dataset.animationDelay || 0);
        
        setTimeout(() => {
            element.classList.add('visible');
            this.animatedElements.add(element);
        }, delay);
    }

    initElements() {
        // Aplicar animaciones muy sutiles automáticamente
        
        // Secciones principales - solo fade sutil
        const sections = document.querySelectorAll('section:not(.hero)');
        sections.forEach((section, index) => {
            section.classList.add('fade-in-subtle');
            section.dataset.animationDelay = (index * 100).toString();
            this.observer.observe(section);
        });

        // Product cards - slide muy sutil + hover
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach((card, index) => {
            card.classList.add('slide-up-gentle', 'card-enhance');
            card.dataset.animationDelay = (index * 100).toString();
            this.observer.observe(card);
        });

        // Benefit cards - solo fade + hover
        const benefitCards = document.querySelectorAll('.benefit-card');
        benefitCards.forEach((card, index) => {
            card.classList.add('fade-in-subtle', 'card-enhance');
            card.dataset.animationDelay = (index * 150).toString();
            this.observer.observe(card);
        });

        // Testimonials - stagger muy sutil
        const testimonialCards = document.querySelectorAll('.testimonial-card');
        testimonialCards.forEach((card, index) => {
            card.classList.add('stagger-gentle');
            card.dataset.animationDelay = (index * 80).toString();
            this.observer.observe(card);
        });

        // Títulos principales - reveal sutil
        const mainTitles = document.querySelectorAll('h2');
        mainTitles.forEach(title => {
            title.classList.add('smooth-reveal');
            this.observer.observe(title);
        });

        // Solo parallax muy sutil en hero
        this.setupSubtleParallax();
    }

    setupSubtleParallax() {
        const hero = document.querySelector('.hero');
        if (!hero) return;

        let ticking = false;

        const updateParallax = () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * 0.3; // Muy sutil
            
            if (window.innerWidth > 768) { // Solo en desktop
                hero.style.backgroundPositionY = rate + 'px';
            }
            
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        });
    }

    // Método para activar animaciones manualmente si es necesario
    triggerAnimation(element) {
        if (element && !this.animatedElements.has(element)) {
            this.animateElement(element);
        }
    }

    // Método para reiniciar animaciones si es necesario
    reset() {
        this.animatedElements.clear();
        document.querySelectorAll('.visible').forEach(el => {
            el.classList.remove('visible');
        });
    }
}

// Smooth scrolling mejorado y más suave
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Inicializar el sistema suave
let smoothAnimations;

document.addEventListener('DOMContentLoaded', () => {
    // Esperar un poco para que todo esté cargado
    setTimeout(() => {
        smoothAnimations = new SmoothScrollAnimations();
        initSmoothScrolling();
    }, 100);
});

// Exportar para uso si es necesario
window.smoothAnimations = smoothAnimations;

// ===== CONTADORES ANIMADOS Y NEWSLETTER =====

// Contador animado para estadísticas del footer
function animateCounters() {
    const counters = document.querySelectorAll('.counter-animation');
    
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.animated) {
                animateCounter(entry.target);
            }
        });
    }, observerOptions);

    counters.forEach(counter => {
        observer.observe(counter);
    });
}

function animateCounter(element) {
    const target = parseInt(element.dataset.target);
    const duration = 2000;
    const startTime = performance.now();
    
    const updateCounter = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.round(target * easeOutQuart);
        
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.dataset.animated = 'true';
        }
    };
    
    requestAnimationFrame(updateCounter);
}

// Newsletter form handler
function handleNewsletterSubmit() {
    const form = document.querySelector('.newsletter-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('.newsletter-input').value;
            
            if (!email) {
                alert('Por favor ingresa tu email');
                return;
            }
            
            // Validar email básico
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Por favor ingresa un email válido');
                return;
            }
            
            const button = this.querySelector('.newsletter-button');
            const originalText = button.textContent;
            
            // Simular carga
            button.textContent = 'Enviando...';
            button.disabled = true;
            
            // Simular respuesta después de 1 segundo
            setTimeout(() => {
                button.textContent = '¡Suscrito!';
                button.style.background = '#28a745';
                
                // Mensaje de WhatsApp para newsletter
                const whatsappMessage = `¡Hola! Me gustaría suscribirme al newsletter del café.%0A%0A📧 Email: ${email}%0A%0A¡Quiero recibir novedades sobre sus cafés artesanales!`;
                
                setTimeout(() => {
                    // Abrir WhatsApp
                    window.open(`https://wa.me/51927391918?text=${whatsappMessage}`, '_blank');
                    
                    // Resetear formulario después de enviar
                    setTimeout(() => {
                        button.textContent = originalText;
                        button.style.background = '';
                        button.disabled = false;
                        this.reset();
                    }, 2000);
                }, 1000);
                
            }, 1000);
        });
    }
}

// Animaciones para trust elements
function animateTrustElements() {
    const trustItems = document.querySelectorAll('.trust-item');
    
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 150);
            }
        });
    }, observerOptions);

    trustItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = 'all 0.6s ease';
        observer.observe(item);
    });
}

// Smooth scroll para links del footer
function initFooterLinks() {
    const footerLinks = document.querySelectorAll('.footer-links a[href^="#"]');
    
    footerLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Inicializar todas las funciones cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Esperar un poco para que otros scripts se carguen
    setTimeout(() => {
        animateCounters();
        handleNewsletterSubmit();
        animateTrustElements();
        initFooterLinks();
    }, 100);
});