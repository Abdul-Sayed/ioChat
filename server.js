// express server
const express = require('express');
const app = express();
const socket = require('socket.io');

// Serve static html file in public folder
app.use(express.static('public'));

const PORT = 3001;

const server = app.listen(process.env.PORT || PORT, () => {
  console.log(`Listening on port ${PORT}`)
});


// Setup socket to use the express server thats running
const io = socket(server);

const users = [];
const connections = [];

// Listen for when a client connection instance is established, and fire a callback
io.on('connection', (socket) => {
  connections.push(socket);
  console.log(`New Connection Established with id: ${socket.id}`);
  console.log(`${connections.length} participants connected`)


  // Listen for client emissions: "new user", and "send message"
  // Re-emit recieved data to all clients (including to sender client)
  // io.sockets.emit('name of emission', {data sent to clients})
  // io.emit('name of emission', {data sent to clients})
  socket.on('new user', username => {
    console.log(`${username} connected`);
    users.push(username);
    socket.username = username;
    io.to(`${socket.id}`).emit('currentUser', username);
    io.sockets.emit('newUser', username);
    sendUsernames();
  })

  socket.on('send message', message => {
    console.log(`NSA: ${socket.username} said "${message}"`);
    io.emit('response message', { message: message, user: socket.username });
  })

  // Emit users array to all clients
  const sendUsernames = () => {
    io.sockets.emit('sending users', users)
  }

  // Listen for client emission called typing
  // Re-Broadcast recieved data to all clients BESIDES sender client
  // socket.broadcast.emit('name of emission', {data sent to clients})
  socket.on('typing', data => {
    socket.broadcast.emit('typing', data)
  })


  // listen for client disconnection
  socket.on('disconnect', () => {
    users.splice(users.indexOf(socket.username), 1);
    connections.splice(connections.indexOf(socket), 1);
    console.log(`disconnecting: ${socket.username}. Session id ${socket.id} cleared. ${connections.length} connections remaining. ${users.length} left in chat`);
    sendUsernames();
  });


})
