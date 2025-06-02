const express = require('express');
const app = express();
const path = require('path');
const guestRoutes = require('./routes/guest');
const db = require('./db'); // adjust path if needed

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

console.log('Starting app...');
console.log('PORT:', process.env.PORT);
console.log('DB HOST:', process.env.DB_HOST); // or your DB env var
