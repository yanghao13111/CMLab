const express = require('express');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

// MongoDB connection settings
const uri = "mongodb://localhost:27017/";
const client = new MongoClient(uri);
let usersCollection;

async function main() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");

        const db = client.db("appDatabase");
        usersCollection = db.collection("users");

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    }
}

main();

// Register endpoint
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await usersCollection.findOne({ username });
        if (user) {
            return res.status(400).json({ success: false, message: 'Username already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await usersCollection.insertOne({ username, password: hashedPassword });
        res.json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await usersCollection.findOne({ username });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Incorrect username or password' });
        }
        const match = await bcrypt.compare(password, user.password);
        if (match) {
            res.cookie('username', username, { httpOnly: true });
            res.json({ success: true, message: 'Logged in successfully' });
        } else {
            res.status(401).json({ success: false, message: 'Incorrect username or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Logout endpoint
app.post('/logout', (req, res) => {
    res.clearCookie('username');
    res.json({ success: true, message: 'Logged out successfully' });
});
