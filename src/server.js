const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const http = require('http');
const socketIo = require('socket.io');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;


const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const onlineUsers = {};

app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

// 連接到MongoDB
mongoose.connect('mongodb://localhost:27017/appDatabase');

// 定義用戶模型
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});
const User = mongoose.model('User', userSchema);

// 定義留言模型
const messageSchema = new mongoose.Schema({
  subject: String,
  content: String,
  author: String,
  createdAt: { type: Date, default: Date.now },
});
const Message = mongoose.model('Message', messageSchema);

// 注册新用户
app.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({
      username: req.body.username,
      password: hashedPassword,
    });
    await newUser.save();
    res.status(201).send('User created');
  } catch (error) {
    res.status(500).send('Error registering new user: ' + error.message);
  }
});

// 用户登入
app.post('/login', async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (user && (await bcrypt.compare(req.body.password, user.password))) {
    res.cookie('username', user.username, { httpOnly: true, maxAge: 900000 }); // maxAge in milliseconds
    res.status(200).json({ message: 'Logged in' });
  } else {
    res.status(400).send('Not Authorized');
  }
});


// 用户登出
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.send('Logged out');
});

// Socket.IO通信
io.on('connection', (socket) => {

  // 當用戶登入時
  socket.on('user-login', (username) => {
      onlineUsers[socket.id] = username;
      io.emit('online-users', Object.values(onlineUsers));
  });

  // 當用戶斷開連接時
  socket.on('disconnect', () => {
      delete onlineUsers[socket.id];
      io.emit('online-users', Object.values(onlineUsers));
  });


  // 發布留言
  socket.on('postMessage', async (msg) => {
    console.log('Received message:', msg);
    console.log('A user connected with username:', socket.handshake.query.username);
    try {
      const newMessage = new Message({
        subject: msg.subject,
        content: msg.content,
        author: msg.author,
      });
      const savedMessage = await newMessage.save();
      io.emit('newMessage', savedMessage); 
      socket.emit('messagePosted'); // 告诉发送消息的客户端消息已发布 告訴發送消息的客戶端消息已發布
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  // 監聽來自客戶端的請求消息event
  socket.on('requestMessages', async () => {
    try {
      const messages = await Message.find().sort({ createdAt: -1 });
      socket.emit('loadMessages', messages); 
    } catch (error) {
      console.error('Error retrieving messages:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
    socket.broadcast.emit('user-disconnected');
  });

  socket.on('initiate-call', (data) => {
    const recipientSocketId = Object.keys(onlineUsers).find(key => onlineUsers[key] === data.to);
    if (recipientSocketId) {
        io.to(recipientSocketId).emit('incoming-call', { from: onlineUsers[socket.id] });
    } else {
        socket.emit('call-error', { message: `${data.to} is not online.` });
    }
  });


  socket.on('video-offer', (data) => {
    socket.broadcast.emit('video-offer', { offer: data.offer });
  });

  socket.on('video-answer', (data) => {
      socket.broadcast.emit('video-answer', { answer: data.answer });
  });

  socket.on('new-ice-candidate', (data) => {
      socket.broadcast.emit('new-ice-candidate', { candidate: data.candidate });
  });
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

