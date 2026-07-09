const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const mainRoutes = require('./routes/mainRoutes');
const roomRoutes = require('./routes/roomRoutes');
const chatRoutes = require('./routes/chatRoutes');
const chatSocket = require('./sockets/chatSocket');
const http = require('http');
const { Server } = require('socket.io');

const app = express();

//general configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from React app
app.use(express.static(path.join(__dirname, 'client')));
app.use(express.static(path.join(__dirname, 'client/dist')));

// implementing routes to middlewares
app.use('/auth', authRoutes);
app.use('/rooms', roomRoutes);
app.use('/chats', chatRoutes);
app.use('/', mainRoutes);

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});



// setting up our socketio server 
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL || '*' : 'http://localhost:5173',
        credentials: true
    }
});

chatSocket(io);




const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;
const db_path = MONGODB_URI;



//starting our main server when connected to database successfully
mongoose.connect(db_path).then(() => {
    console.log("Connected to database");
    server.listen(PORT, () => {  
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((err) => {
    console.log(err);
});