const express = require('express');
const app = express();
const path = require('path');
const guestRoutes = require('./routes/guest');
const db = require('./db'); // adjust path if needed
const { execFile } = require('child_process');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 1. Main route FIRST, pass isAdmin (true for testing)
app.get('/', (req, res) => {
  res.render('index', { isAdmin: true }); // Set to true for testing
});

// 2. Register guest routes AFTER main /
app.use('/', guestRoutes);

app.post('/search', async (req, res) => {
  const { fullName } = req.body;
  try {
    // Find all guests with the same family_name as the entered full name
    const [guests] = await db.execute(
      'SELECT * FROM guests WHERE family_name = ?',
      [fullName]
    );
    res.json(guests);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/accepted-guests', async (req, res) => {
  try {
    const [guests] = await db.execute(
      'SELECT name FROM guests WHERE rsvp_response = "accepted"'
    );
    res.json(guests);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/dietary-requirements', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT name FROM dietary_requirements WHERE is_active = 1'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/admin/add-guest', async (req, res) => {
  const { family_name, names } = req.body;
  if (!family_name || !Array.isArray(names) || names.length === 0) {
    return res.status(400).json({ error: 'Missing family_name or names' });
  }
  try {
    for (const name of names) {
      await db.execute(
        'INSERT INTO guests (name, family_name) VALUES (?, ?)',
        [name, family_name]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/ask-guest', (req, res) => {
  const { question } = req.body;
  const scriptPath = path.join(__dirname, 'query_guest.py');
  execFile('python3', [scriptPath, question], (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: stderr || error.message });
    }
    res.json({ answer: stdout.trim() });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

console.log('Starting app...');
console.log('PORT:', process.env.PORT);
console.log('DB HOST:', process.env.DB_HOST); // or your DB env var
