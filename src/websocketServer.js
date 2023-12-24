const WebSocket = require('ws');
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');

const wsServer = new WebSocket.Server({ port: 8081 });
console.log('WebSocket server listening on port 8081');

// MongoDB connection settings
const uri = "mongodb://localhost:27017/";
const client = new MongoClient(uri);
let usersCollection;

async function main() {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("appDatabase");
    usersCollection = db.collection("users");
}

main();

wsServer.on('connection', function(socket) {
    socket.on('message', async function(data) {
        // Ensure message is a string
        const message = data.toString();

        const parts = message.split('|');
        const action = parts[0];

        try {
            switch(action) {
                case 'LOGIN':
                    const username = parts[1];
                    const password = parts[2];
                    const user = await usersCollection.findOne({ username });
                    if (user && await bcrypt.compare(password, user.password)) {
                        socket.send('LOGIN_RESPONSE|SUCCESS');
                    } else {
                        socket.send('LOGIN_RESPONSE|FAILURE');
                    }
                    break;
                case 'REGISTER':
                    const regUsername = parts[1];
                    const regPassword = parts[2];
                    const existingUser = await usersCollection.findOne({ username: regUsername });
                    if (!existingUser) {
                        const hashedPassword = await bcrypt.hash(regPassword, 10);
                        await usersCollection.insertOne({ username: regUsername, password: hashedPassword });
                        socket.send('REGISTER_RESPONSE|SUCCESS');
                    } else {
                        socket.send('REGISTER_RESPONSE|FAILURE');
                    }
                    break;
                case 'LOGOUT':
                    // 登出操作通常涉及到会话管理，这里只是打印日志
                    console.log('User has logged out');
                    break;
            }
        } catch (error) {
            console.error('Error handling message: ', error);
            socket.send('ERROR|' + error.message);
        }
    });

    socket.on('close', () => {
        console.log('WebSocket connection closed');
    });
});
