// Use express server to serve static html file in public folder
const express = require('express');
const app = express();
app.use(express.static('public'));

const PORT = process.env.PORT || 4001;
const server = app.listen(process.env.PORT || PORT, () => {
  console.log(`Starting Express Server on port ${PORT}`)
});

// Setup socket to use the express server thats running on PORT
const socket = require('socket.io');
const io = socket(server);

const connections = [];
const users = [];

// Connect to MongoDB
const mongo = require('mongodb').MongoClient;

const CONNECTION_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1/mongochat'

mongo.connect(CONNECTION_URI, function (err, db) {
  if (err) {
    throw err;
  } else { console.log('MongoDB connected...') }

  // Listen for when a client connection is established, and use that socket instance in the callback
  io.on('connection', socket => {
    connections.push(socket);
    console.log(`New Connection Established with id: ${socket.id}`);
    console.log(`${connections.length} participants connected`)

    // Define mongodb collection/document: 'chats'
    let chats = db.collection('chats');

    // Get chat objects from the chats document
    chats.find().limit(100).sort({ _id: 1 }).toArray((err, res) => {
      if (err) {
        throw err;
      } else {
        // Emit the chat objects to connecting client
        console.log(`Database response is: ${JSON.stringify(res, null, 3)}`)
        socket.emit('output', res);
      }
    });


    // Listen for client emissions: "new user", and "send message"
    // Emit currentUser to the new user who connected
    // Re-emit username to all clients (including to sender client)
    // io.sockets.emit('emission name', {data sent to clients}) or io.emit('emission name', {data sent to clients})
    // Emit user array to all clients
    socket.on('new user', username => {
      console.log(`${username} connected`);
      socket.username = username;
      users.push(username);
      io.to(`${socket.id}`).emit('currentUser', username);
      io.sockets.emit('newUser', username);
      io.sockets.emit('sending users', users)
    })

    socket.on('send message', message => {
      console.log(`NSA: ${socket.username} said "${message}"`);
      io.emit('response message', { user: socket.username, message: message });
      // Insert chat object into chats document to persist the messages
      chats.insert({ user: socket.username, message: message });
    })

    // Listen for client emission: "typing"
    // Re-Broadcast recieved data to all clients BESIDES sender client
    // socket.broadcast.emit('name of emission', {data sent to clients})
    socket.on('typing', handle => {
      socket.broadcast.emit('typing', handle)
    })

    // listen for client disconnection
    socket.on('disconnect', () => {
      users.splice(users.indexOf(socket.username), 1);
      connections.splice(connections.indexOf(socket), 1);
      console.log(`disconnecting: ${socket.username}. Session id ${socket.id} cleared. ${connections.length} connections remaining. ${users.length} members left in chat`);
      io.sockets.emit('sending users', users)
    });


    // Listen for client emission: "clear"
    socket.on('clear', () => {
      // Remove all chat objects from document (for all clients)
      chats.remove({}, () => {
        console.log('Database cleared')
      });
    });

  });
});