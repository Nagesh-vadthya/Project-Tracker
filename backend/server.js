const express = require('express');
const cors = require('cors');
const db = require('./database');
const path = require('path');

const app = express();
const PORT = 3000;

//  New CI/CD test log
console.log("✅ New deployment: Server is running with latest changes!");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
// Get all tasks
app.get('/api/tasks', (req, res) => {
    db.all('SELECT * FROM tasks ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Create new task
app.post('/api/tasks', (req, res) => {
    const { title, description } = req.body;
    
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }
    
    db.run(
        'INSERT INTO tasks (title, description) VALUES (?, ?)',
        [title, description],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID, title, description, status: 'pending' });
        }
    );
});

// Update task status
app.put('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    db.run(
        'UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ message: 'Task updated successfully' });
        }
    );
});

// Delete task
app.delete('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM tasks WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Task deleted successfully' });
    });
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});