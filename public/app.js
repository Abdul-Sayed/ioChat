/*   Sockets Code   */

// Establish client websocket connection to served port
const PORT = "http://localhost:3001/";
const socket = io.connect(PORT);


/*   Variable Declarations */
// h1 greeting
const greeting = document.querySelector('#banner');
// section with login form
const userFormArea = document.querySelector('#user-form-area');
// form for username with input and button
const userForm = document.querySelector('#user-form');
// input element for username
const username = document.querySelector('#username');
// current logged in user
let currentUser;
// button for username submit
const loginButton = document.querySelector('#login');
// section with ul of online users and message form
const messageArea = document.querySelector('#message-area');
// ul of online users
const usersUl = document.querySelector('#users');
// form for message submission
const messageForm = document.querySelector('#message-form');
// text area for message input
const message = document.querySelector('#message');
// div displaying chat messages
const chat = document.querySelector('#chat');


/*   Functions */

// Emit form input username to server
userForm.addEventListener('submit', e => {
  e.preventDefault();
  if (username.value) {
    socket.emit('new user', username.value);
    userFormArea.style.display = "none";
    greeting.style.display = "none";
    messageArea.style.display = "block";
    username.value = '';
  }
})


// Emit form input message to server
messageForm.addEventListener('submit', e => {
  e.preventDefault();
  if (message.value) socket.emit('send message', message.value);
  message.value = ''
})


// Listen for serverside emissions: 'currentUser', "newUser" and "response message", and use data in callback
// socket.on('name of emitted data', function(data) {...});
socket.on('currentUser', user => {
  console.log(`Current user is ${user}`);
  if (!currentUser) currentUser = user;
})

socket.on('newUser', newUser => {
  console.log(`${newUser} joined chat`);
});

socket.on('response message', data => {
  let side = 'left';
  if (currentUser === data.user) side = 'right';
  chat.innerHTML += (`
  <div class="card" style="text-align:${side}">
  <span><strong class="mr-15">${data.user}:</strong><em class="speech-bubble">${data.message}</em></span>
  </div>`)
});


// Listen for serverside emission: "sending users"
socket.on('sending users', (users) => {
  console.log(`Participating users: ${users}`);
  const usersHTML = ""
  usersUl.innerHTML = users.map(user => usersHTML.concat(`<li>${user}</li>`)).join('');
})



/*  Helper Methods */
Array.prototype.unique = function () {
  return this.filter(function (value, index, self) {
    return self.indexOf(value) === index;
  });
}

Array.prototype.diff = function (arr2) { return this.filter(x => arr2.includes(x)); }
