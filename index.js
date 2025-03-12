const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'myDB'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL as ID ' + db.threadId);
});

app.get('/', (req, res) => {
  db.query('SELECT * FROM MyGuests', (err, results) => {
    if (err) {
      console.error('Error executing query: ' + err.stack);
      res.status(500).send('Error fetching users');
      return;
    }
    res.json(results);
  });
});

app.post('/addusers', (req, res) => {
  const { firstname, lastname, email } = req.body;
  db.query(
    'INSERT INTO MyGuests (firstname, lastname, email) VALUES (?, ?, ?)', 
    [firstname, lastname, email], 
    (err, result) => {
      if (err) {
        console.error('Error executing query: ' + err.stack);
        res.status(400).send('Error creating user');
        return;
      }
      res.status(201).send('User created successfully');
    }
  );
});

app.put('/updateuser/:id', (req, res) => {
  const { firstname, lastname, email } = req.body;
  const userId = req.params.id;
  if (!userId) {
    return res.status(400).send('User ID is required');
  }
  db.query(
    'UPDATE MyGuests SET firstname = ?, lastname = ?, email = ? WHERE id = ?', 
    [firstname, lastname, email, userId], 
    (err, result) => {
      if (err) {
        console.error('Error executing query: ' + err.stack);
        return res.status(400).send('Error updating user');
      }
      if (result.affectedRows === 0) {
        return res.status(404).send('User not found');
      }
      res.send('User updated successfully');
    }
  );
});

app.delete('/deleteusers/:id', (req, res) => {
  const userId = req.params.id;
  if (!userId) {
    return res.status(400).send('User ID is required');
  }
  db.query('DELETE FROM MyGuests WHERE id = ?', [userId], (err, result) => {
    if (err) {
      console.error('Error executing query: ' + err.stack);
      return res.status(400).send('Error deleting user');
    }
    if (result.affectedRows === 0) {
      return res.status(404).send('User not found');
    }
    res.send('User deleted successfully');
  });
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});