const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const pool = require('../database/database');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/registro', async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO usuarios (email, password) VALUES ($1, $2)',
      [email, hashedPassword]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error("ERROR /api/registro:", err);
    res.status(500).json({ success: false, message: "Error al registrar usuario" });
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

app.get('/health', (req, res) => res.status(200).send('OK'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`API en ${PORT}`));
