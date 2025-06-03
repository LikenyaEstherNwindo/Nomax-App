const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000;

const cors = require('cors');

app.use(cors());
// Middleware
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'node_user',
  password: 'your_password',
  database: 'NOMAXDB'
});

// Connect to DB
db.connect(err => {
  if (err) throw err;
  console.log('Connected to database');
});

// === TRIPS ===

app.get('/trips/:id', (req, res) => {
  const tripId = req.params.id;
  const sql = 'SELECT * FROM Trips WHERE id = ?';

  db.query(sql, [tripId], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0) return res.status(404).send({ message: 'Trip not found' });
    res.send(results[0]);
  });
});

// Create Trip
app.post('/trips', (req, res) => {
  const {
    id, name, region, division, date, time, duration, price, availableSeats,
    transport, busNumber, guide, image, description, popular, mostVisited, recent
  } = req.body;

  const sql = `INSERT INTO Trips VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const values = [id, name, region, division, date, time, duration, price, availableSeats,
    transport, busNumber, guide, image, description, popular, mostVisited, recent];

  db.query(sql, values, err => {
    if (err) return res.status(400).send(err);
    res.send('Trip added');
  });
});

// Edit Trip
app.put('/trips/:id', (req, res) => {
  const {
    name, region, division, date, time, duration, price, availableSeats,
    transport, busNumber, guide, image, description, popular, mostVisited, recent
  } = req.body;

  const sql = `UPDATE Trips SET name=?, region=?, division=?, date=?, time=?, duration=?, price=?, availableSeats=?, transport=?, busNumber=?, guide=?, image=?, description=?, popular=?, mostVisited=?, recent=? WHERE id=?`;
  const values = [name, region, division, date, time, duration, price, availableSeats,
    transport, busNumber, guide, image, description, popular, mostVisited, recent, req.params.id];

  db.query(sql, values, err => {
    if (err) return res.status(400).send(err);
    res.send('Trip updated');
  });
});

// Delete Trip
app.delete('/trips/:id', (req, res) => {
  db.query('DELETE FROM Trips WHERE id = ?', [req.params.id], err => {
    if (err) return res.status(400).send(err);
    res.send('Trip deleted');
  });
});

// Get all Trips
app.get('/trips', (req, res) => {
  db.query('SELECT * FROM Trips', (err, results) => {
    if (err) return res.status(400).send(err);
    res.json(results);
  });
});
// Get all Users
app.get('/users', (req, res) => {
  db.query('SELECT * FROM Users', (err, results) => {
    if (err) return res.status(400).send(err);
    res.json(results);
  });
});
// Add a new User
app.post('/users', (req, res) => {
  const { id, name, email, password, role } = req.body;
  db.query(
    'INSERT INTO Users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
    [id, name, email, password, role],
    err => {
      if (err) return res.status(400).send(err);
      res.send('User added');
    }
  );
});
// Delete a User
app.delete('/users/:id', (req, res) => {
  db.query('DELETE FROM Users WHERE id = ?', [req.params.id], err => {
    if (err) return res.status(400).send(err);
    res.send('User deleted');
  });
});
// Get all bookings
app.get('/bookings', (req, res) => {
  db.query('SELECT * FROM Bookings', (err, results) => {
    if (err) return res.status(400).send(err);
    res.json(results);
  });
});
// Add a new booking
app.post('/bookings', (req, res) => {
  const {
    id, userId, tripId, date, passengers,
    totalPrice, status, paymentMethod, ticketNumber
  } = req.body;

  db.query(
    'INSERT INTO Bookings (id, userId, tripId, date, passengers, totalPrice, status, paymentMethod, ticketNumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, userId, tripId, date, passengers, totalPrice, status, paymentMethod, ticketNumber],
    err => {
      if (err) return res.status(400).send(err);
      res.send('Booking added');
    }
  );
});
// Update a booking
app.put('/bookings/:id', (req, res) => {
  const {
    userId, tripId, date, passengers,
    totalPrice, status, paymentMethod, ticketNumber
  } = req.body;

  db.query(
    `UPDATE Bookings SET 
     userId = ?, tripId = ?, date = ?, passengers = ?, 
     totalPrice = ?, status = ?, paymentMethod = ?, ticketNumber = ? 
     WHERE id = ?`,
    [userId, tripId, date, passengers, totalPrice, status, paymentMethod, ticketNumber, req.params.id],
    err => {
      if (err) return res.status(400).send(err);
      res.send('Booking updated');
    }
  );
});
// Delete a booking
app.delete('/bookings/:id', (req, res) => {
  db.query('DELETE FROM Bookings WHERE id = ?', [req.params.id], err => {
    if (err) return res.status(400).send(err);
    res.send('Booking deleted');
  });
});

// Get bookings for a specific user
app.get('/bookings/user/:userId', (req, res) => {
  const userId = req.params.userId;

  db.query('SELECT * FROM Bookings WHERE userId = ?', [userId], (err, results) => {
    if (err) return res.status(400).send(err);
    res.json(results);
  });
});

app.get('/reviews', (req, res) => {
  const tripId = req.query.tripId;

  let query = 'SELECT * FROM Reviews';
  const params = [];

  if (tripId) {
    query += ' WHERE tripId = ?';
    params.push(tripId);
  }

  db.query(query, params, (err, results) => {
    if (err) return res.status(400).send(err);
    res.json(results);
  });
});
app.get('/user-reviews/:userId', (req, res) => {
  const userId = req.params.userId;

  const query = 'SELECT * FROM Reviews WHERE userId = ?';
  
  db.query(query, [userId], (err, results) => {
    if (err) return res.status(400).send(err);
    res.json(results);
  });
});

app.post('/reviews', (req, res) => {
  const { userId, tripId, rating, comment, date } = req.body;

  if (!userId || !tripId || !rating || !comment || !date) {
    return res.status(400).send('Missing required review fields');
  }

  const query = `INSERT INTO Reviews (userId, tripId, rating, comment, date) VALUES (?, ?, ?, ?, ?)`;

  db.query(query, [userId, tripId, rating, comment, date], (err, result) => {
    if (err) return res.status(400).send(err);
    res.status(201).send('Review added successfully');
  });
});
app.post('/reviews', (req, res) => {
  const { userId, tripId, rating, comment, date } = req.body;

  if (!userId || !tripId || !rating || !comment || !date) {
    return res.status(400).send('Missing required review fields');
  }

  const query = `INSERT INTO Reviews (userId, tripId, rating, comment, date) VALUES (?, ?, ?, ?, ?)`;

  db.query(query, [userId, tripId, rating, comment, date], (err, result) => {
    if (err) return res.status(400).send(err);
    res.status(201).send('Review added successfully');
  });
});
app.delete('/reviews/:id', (req, res) => {
  const reviewId = req.params.id;

  db.query('DELETE FROM Reviews WHERE id = ?', [reviewId], (err, result) => {
    if (err) return res.status(400).send(err);
    if (result.affectedRows === 0) return res.status(404).send('Review not found');
    res.send('Review deleted successfully');
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
