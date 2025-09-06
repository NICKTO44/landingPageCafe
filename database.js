const mysql = require('mysql2/promise');
require('dotenv').config();

class Database {
    constructor() {
        this.pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'cafe_testimonios',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
    }

    // Crear tabla de testimonios
    async createTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS testimonios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                calificacion INT NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
                comentario TEXT NOT NULL,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                estado ENUM('pendiente', 'aprobado', 'rechazado') DEFAULT 'pendiente',
                ip_address VARCHAR(45),
                INDEX idx_estado (estado),
                INDEX idx_fecha (fecha_creacion)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;
        
        try {
            await this.pool.execute(query);
            console.log('Tabla testimonios creada/verificada');
        } catch (error) {
            console.error('Error creando tabla:', error);
            throw error;
        }
    }

    // Insertar nuevo testimonio
    async insertTestimonio(datos) {
        const query = `
            INSERT INTO testimonios (nombre, calificacion, comentario, ip_address, estado)
            VALUES (?, ?, ?, ?, ?)
        `;
        
        // Auto-aprobar testimonios de 3+ estrellas
        const estado = datos.calificacion >= 3 ? 'aprobado' : 'pendiente';
        
        try {
            const [result] = await this.pool.execute(query, [
                datos.nombre,
                datos.calificacion,
                datos.comentario,
                datos.ip,
                estado
            ]);
            
            return { id: result.insertId, estado };
        } catch (error) {
            console.error('Error insertando testimonio:', error);
            throw error;
        }
    }

    // Obtener testimonios aprobados
    async getTestimoniosAprobados(limit = 6) {
        const query = `
            SELECT id, nombre, calificacion, comentario, fecha_creacion
            FROM testimonios 
            WHERE estado = 'aprobado'
            ORDER BY fecha_creacion DESC 
            LIMIT ?
        `;
        
        try {
            const [rows] = await this.pool.execute(query, [limit]);
            return rows;
        } catch (error) {
            console.error('Error obteniendo testimonios:', error);
            throw error;
        }
    }

    // Obtener testimonios pendientes (para moderación)
    async getTestimoniosPendientes() {
        const query = `
            SELECT id, nombre, calificacion, comentario, fecha_creacion
            FROM testimonios 
            WHERE estado = 'pendiente'
            ORDER BY fecha_creacion DESC
        `;
        
        try {
            const [rows] = await this.pool.execute(query);
            return rows;
        } catch (error) {
            console.error('Error obteniendo pendientes:', error);
            throw error;
        }
    }

    // Moderar testimonio
    async moderarTestimonio(id, estado) {
        const query = `
            UPDATE testimonios 
            SET estado = ? 
            WHERE id = ?
        `;
        
        try {
            const [result] = await this.pool.execute(query, [estado, id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error moderando testimonio:', error);
            throw error;
        }
    }
}

module.exports = Database;