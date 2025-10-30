// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const pokeRoutes = require('./routes/pokemon');

const app = express();
app.use(cors());
app.use(express.json());

// crear tablas al iniciar (usamos init.sql)
const initSql = fs.readFileSync(__dirname + '/models/init.sql', 'utf8');
(async () => {
  try {
    await pool.query(initSql);
    console.log('DB initialized');
  } catch (err) {
    console.error('DB init error', err);
  }
})();

app.use('/auth', authRoutes);
app.use('/pokemon', pokeRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log('Backend listening on', PORT));
