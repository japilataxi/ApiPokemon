// js/app.js
const API = (window.location.hostname === 'localhost') ? 'http://localhost:4000' : (localStorage.getItem('API_URL') || '');

const token = localStorage.getItem('token');
const userLabel = document.getElementById('userLabel');
if (!token) { location.href = '/'; } else { userLabel.textContent = localStorage.getItem('username') || ''; }

document.getElementById('logout').addEventListener('click', () => {
  localStorage.removeItem('token'); localStorage.removeItem('username'); location.href = '/';
});

const searchInput = document.getElementById('searchInput');
const suggestionsDiv = document.getElementById('suggestions');
const results = document.getElementById('results');
const randomBtn = document.getElementById('randomBtn');

let debounceTimer = null;
searchInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  const q = searchInput.value.trim();
  if (!q) { suggestionsDiv.innerHTML = ''; return; }
  debounceTimer = setTimeout(() => fetchSuggestions(q), 300);
});

async function fetchSuggestions(q){
  const res = await fetch(API + '/pokemon/search?q=' + encodeURIComponent(q), {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const data = await res.json();
  suggestionsDiv.innerHTML = '';
  (data.results || []).forEach(p => {
    const el = document.createElement('div');
    el.className = 'suggestion';
    el.textContent = p.name;
    el.onclick = () => { renderPokemon([p]); suggestionsDiv.innerHTML = ''; searchInput.value = p.name; };
    suggestionsDiv.appendChild(el);
  });
}

function renderPokemon(list){
  results.innerHTML = '';
  list.forEach(p => {
    const c = document.createElement('div');
    c.className = 'card';
    c.innerHTML = `<img src="${p.image || ''}" alt="${p.name}" style="width:96px;height:96px"/><h4>${p.name}</h4>
      <small>Tipos: ${(p.types||[]).join(', ')}</small>
      <div>Alt: ${p.height || '-'} / Peso: ${p.weight || '-'}</div>`;
    results.appendChild(c);
  });
}

randomBtn.addEventListener('click', async ()=>{
  const r = await fetch(API + '/pokemon/random?limit=10', { headers:{ 'Authorization':'Bearer ' + token }});
  const d = await r.json();
  renderPokemon(d.results || []);
});
