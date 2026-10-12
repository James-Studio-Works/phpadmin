const express = require('express');
const path = require('path');
const fs = require('fs');
const { nanoid } = require('nanoid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Data storage (file-based for simplicity; resets on Render free tier restarts)
const DATA_DIR = path.join(__dirname, 'data');
const PASTES_FILE = path.join(DATA_DIR, 'pastes.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load pastes
let pastes = {};
try {
  if (fs.existsSync(PASTES_FILE)) {
    pastes = JSON.parse(fs.readFileSync(PASTES_FILE, 'utf8'));
  }
} catch (err) {
  console.error('Error loading pastes:', err);
  pastes = {};
}

// Save pastes helper
function savePastes() {
  try {
    fs.writeFileSync(PASTES_FILE, JSON.stringify(pastes, null, 2));
  } catch (err) {
    console.error('Error saving pastes:', err);
  }
}

// API: Create a new paste
app.post('/api/pastes', (req, res) => {
  try {
    const { title = '', content, language = 'text' } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content is required' });
    }

    if (content.length > 5_000_000) { // ~5MB limit
      return res.status(400).json({ error: 'Content too large (max 5MB)' });
    }

    const id = nanoid(10); // short unique id
    const paste = {
      id,
      title: (title || '').toString().slice(0, 200),
      content,
      language: (language || 'text').toString().slice(0, 50),
      createdAt: new Date().toISOString(),
      views: 0
    };

    pastes[id] = paste;
    savePastes();

    res.status(201).json({ id, url: `/p/${id}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create paste' });
  }
});

// API: Get a paste
app.get('/api/pastes/:id', (req, res) => {
  const { id } = req.params;
  const paste = pastes[id];

  if (!paste) {
    return res.status(404).json({ error: 'Paste not found' });
  }

  // Increment views
  paste.views = (paste.views || 0) + 1;
  savePastes();

  res.json(paste);
});

// API: List recent pastes (last 50)
app.get('/api/pastes', (req, res) => {
  const list = Object.values(pastes)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 50)
    .map(p => ({
      id: p.id,
      title: p.title || 'Untitled',
      language: p.language,
      createdAt: p.createdAt,
      views: p.views || 0,
      preview: p.content.slice(0, 100) + (p.content.length > 100 ? '...' : '')
    }));

  res.json(list);
});

// Serve the view page for a paste (SPA-style fallback)
app.get('/p/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'view.html'));
});

// Home
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check for Render
app.get('/health', (req, res) => {
  res.json({ status: 'ok', pastes: Object.keys(pastes).length });
});

app.listen(PORT, () => {
  console.log(`phpadmin running on http://localhost:${PORT}`);
  console.log(`Loaded ${Object.keys(pastes).length} pastes`);
});
