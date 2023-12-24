const express = require('express');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const path = require('path');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// MongoDB connection settings
const uri = "mongodb://localhost:27017/";
const client = new MongoClient(uri);
let usersCollection;

async function main() {
    try {
        // Connect to the MongoDB server
        await client.connect();
        console.log("Connected to MongoDB");

        // Connect to the database and collection
        const db = client.db("appDatabase");
        usersCollection = db.collection("users");

        // The rest of your app logic here

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

// Handle process shutdown gracefully
process.on('SIGINT', () => {
    console.log('\nClosing database connection...');
    client.close().then(() => {
        console.log('Database connection closed.');
        process.exit(0);
    });
});
