const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const pool = require('../database/database');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// --- SERVIR TUS ARCHIVOS HTML ---

// 1. Configurar la carpeta donde están tus .html
app.use(express.static(path.join(__dirname, '../frontend')));

// 2. Ruta Raíz: Abre index.html automáticamente
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// 3. Ruta para el registro: Si alguien escribe /registro en la URL
app.get('/registro', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/sigin.html'));
});

// 4. Ruta para el Home: (Página de éxito)
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/home.html'));
});

// --- API ENDPOINTS (Lógica detrás de los formularios) ---

app.post('/api/registro', async (req, res) => {
    const { email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO usuarios (email, password) VALUES ($1, $2)', [email, hashedPassword]);
        res.status(201).json({ success: true });
    } catch (err) {
        console.error("ERROR /api/registro:", err);
        res.status(500).json({
            success: false,
            message: "Error al registrar usuario",
            error: String(err),
        });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (result.rows.length > 0) {
            const match = await bcrypt.compare(password, result.rows[0].password);
            if (match) return res.json({ success: true });
        }
        res.status(401).json({ success: false, message: "Credenciales incorrectas" });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// Health Check para AWS
app.get('/health', (req, res) => res.status(200).send('OK'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});