// ===== ARCHIVO COMPLETO: server.js =====

// 1. IMPORTAR DEPENDENCIAS
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const Database = require('./database');

// 2. CONFIGURACIÓN INICIAL
const app = express();
const PORT = process.env.PORT || 3000;
const db = new Database();

// 3. MIDDLEWARE (configuración del servidor)
app.use(helmet());
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500', 'http://localhost:8080', 'https://landingpagecafe-production.up.railway.app'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// 4. RATE LIMITING (prevenir spam)
const testimonioLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 3, // máximo 3 testimonios por IP cada 15 minutos
    message: { error: 'Demasiados testimonios. Intenta de nuevo en 15 minutos.' }
});

// 5. FUNCIONES AUXILIARES
function getClientIP(req) {
    return req.headers['x-forwarded-for'] || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null);
}

function filtrarContenido(texto) {
    const palabrasProhibidas = ['estafa', 'robo', 'fraude', 'basura', 'horrible'];
    const textoLower = texto.toLowerCase();
    return !palabrasProhibidas.some(palabra => textoLower.includes(palabra));
}

// 6. RUTAS

// RUTA 1: Obtener testimonios para mostrar en la web
app.get('/api/testimonios', async (req, res) => {
    try {
        const testimonios = await db.getTestimoniosAprobados();
        
        const testimoniosFormateados = testimonios.map(t => ({
            id: t.id,
            nombre: t.nombre,
            estrellas: '★'.repeat(t.calificacion) + '☆'.repeat(5 - t.calificacion),
            calificacion: t.calificacion,
            comentario: t.comentario,
            fecha: new Date(t.fecha_creacion).toLocaleDateString('es-PE')
        }));
        
        res.json({ testimonios: testimoniosFormateados });
    } catch (error) {
        console.error('Error en GET /api/testimonios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// RUTA 2: Recibir nuevo testimonio del formulario
app.post('/api/testimonios', testimonioLimit, async (req, res) => {
    try {
        const { nombre, calificacion, comentario } = req.body;
        
        // Validaciones
        if (!nombre || !calificacion || !comentario) {
            return res.status(400).json({ 
                error: 'Todos los campos son obligatorios' 
            });
        }
        
        if (nombre.length < 2 || nombre.length > 100) {
            return res.status(400).json({ 
                error: 'El nombre debe tener entre 2 y 100 caracteres' 
            });
        }
        
        if (calificacion < 1 || calificacion > 5) {
            return res.status(400).json({ 
                error: 'La calificación debe ser entre 1 y 5 estrellas' 
            });
        }
        
        if (comentario.length < 10 || comentario.length > 1000) {
            return res.status(400).json({ 
                error: 'El comentario debe tener entre 10 y 1000 caracteres' 
            });
        }
        
        if (!filtrarContenido(comentario) || !filtrarContenido(nombre)) {
            return res.status(400).json({ 
                error: 'El contenido contiene palabras no permitidas' 
            });
        }
        
        // Insertar testimonio
        const resultado = await db.insertTestimonio({
            nombre: nombre.trim(),
            calificacion: parseInt(calificacion),
            comentario: comentario.trim(),
            ip: getClientIP(req)
        });
        
        res.json({
            success: true,
            mensaje: resultado.estado === 'aprobado' ? 
                'Testimonio publicado inmediatamente' : 
                'Testimonio recibido, será revisado pronto',
            id: resultado.id,
            estado: resultado.estado
        });
        
    } catch (error) {
        console.error('Error en POST /api/testimonios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// RUTA 3: Panel de administración
app.get('/admin/testimonios', async (req, res) => {
    const { password } = req.query;
    
    if (password !== (process.env.ADMIN_PASSWORD || 'cafe2024admin')) {
        return res.status(401).json({ error: 'Acceso no autorizado' });
    }
    
    try {
        const pendientes = await db.getTestimoniosPendientes();
        res.json({ testimonios: pendientes });
    } catch (error) {
        console.error('Error en admin:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// RUTA 4: Moderar testimonio
app.post('/admin/moderar', async (req, res) => {
    const { password, id, accion } = req.body;
    
    if (password !== (process.env.ADMIN_PASSWORD || 'cafe2024admin')) {
        return res.status(401).json({ error: 'Acceso no autorizado' });
    }
    
    if (!['aprobado', 'rechazado'].includes(accion)) {
        return res.status(400).json({ error: 'Acción inválida' });
    }
    
    try {
        const exito = await db.moderarTestimonio(id, accion);
        res.json({ success: exito });
    } catch (error) {
        console.error('Error moderando:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 7. INICIALIZAR SERVIDOR
async function iniciarServidor() {
    try {
        await db.createTable();
        
        // ✅ CAMBIO PRINCIPAL: agregar '0.0.0.0' para Railway
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
            console.log(`📝 Admin endpoint: /admin/testimonios?password=${process.env.ADMIN_PASSWORD || 'cafe2024admin'}`);
        });
    } catch (error) {
        console.error('Error iniciando servidor:', error);
        process.exit(1);
    }
}

iniciarServidor();