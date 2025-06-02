const express = require('express');
const router = express.Router();
const pool = require('../db');

// Home page
router.get('/', (req, res) => {
  res.render('index');
});

// Search guest
router.post('/search', async (req, res) => {
  const { fullName } = req.body;
  const [guests] = await pool.query(
    'SELECT * FROM guests WHERE family_name = ?',
    [fullName]
  );
  res.json(guests);
});

// RSVP
router.post('/rsvp', async (req, res) => {
  const { guestId, response, dietary, additionalCount, hasKids } = req.body;
  await pool.query(
    `UPDATE guests SET 
      rsvp_response = ?, 
      dietary_requirements = ?, 
      additional_guests = ?, 
      has_children = ? 
     WHERE id = ?`,
    [response, dietary, additionalCount, hasKids, guestId]
  );
  res.json({ message: 'RSVP recorded' });
});

// Accepted guests
router.get('/accepted-guests', async (req, res) => {
  const [guests] = await pool.query(
    'SELECT name FROM guests WHERE rsvp_response = "accepted"'
  );
  res.json(guests);
});

module.exports = router;
