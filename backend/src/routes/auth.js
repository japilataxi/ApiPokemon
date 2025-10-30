// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if(!username || !password) return res.status(400).json({ error: 'username & password required' });
    const hashed = await bcrypt.hash(password, 10);
    const q = 'INSERT INTO users(username, password) VALUES($1,$2) RETURNING id, username';
    const r = await pool.query(q, [username, hashed]);
    res.json({ user: r.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'username exists' });
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const q = 'SELECT id, username, password FROM users WHERE username=$1';
    const r = await pool.query(q, [username]);
    const user = r.rows[0];
    if (!user) return res.status(401).json({ error: 'invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
