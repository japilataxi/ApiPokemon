// routes/pokemon.js
const express = require('express');
const axios = require('axios');
const pool = require('../db');
const router = express.Router();

// helper para verificar token opcionalmente (no requerido para búsquedas públicas)
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
function extractUser(req){
  const auth = req.headers.authorization;
  if(!auth) return null;
  try {
    const token = auth.split(' ')[1];
    return jwt.verify(token, JWT_SECRET);
  } catch { return null; }
}

// Buscar sugerencias y detalles
router.get('/search', async (req, res) => {
  try {
    const q = (req.query.q || '').toLowerCase();
    if (!q) return res.json({ results: [] });

    // obtenemos lista completa (1 vez por request)
    const listResp = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=100000');
    const matches = listResp.data.results
      .filter(p => p.name.includes(q))
      .slice(0, 20);

    const detailed = await Promise.all(matches.slice(0,10).map(async m => {
      const d = await axios.get(m.url);
      return {
        name: m.name,
        image: d.data.sprites.front_default || d.data.sprites.other?.['official-artwork']?.front_default || null,
        types: d.data.types.map(t => t.type.name),
        height: d.data.height,
        weight: d.data.weight
      };
    }));

    // guardar búsqueda en DB (si hay usuario, guardar username)
    const user = extractUser(req);
    await pool.query('INSERT INTO searches(username, query, created_at) VALUES($1, $2, NOW())', [user?.username || null, q]);

    res.json({ results: detailed });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'server error' });
  }
});

// endpoint random limit=10
router.get('/random', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '10', 10), 50);
    const listResp = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=100000');
    const all = listResp.data.results;
    // sample simple
    const shuffled = all.sort(() => 0.5 - Math.random()).slice(0, limit);
    const detailed = await Promise.all(shuffled.map(async m => {
      const d = await axios.get(m.url);
      return {
        name: m.name,
        image: d.data.sprites.front_default || d.data.sprites.other?.['official-artwork']?.front_default || null
      };
    }));
    res.json({ results: detailed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;
