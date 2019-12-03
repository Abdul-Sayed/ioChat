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
// button to delete chat history
const clearBtn = document.querySelector('#clearBtn');
// ul of online users
const usersUl = document.querySelector('#users');
// form for message submission
const messageForm = document.querySelector('#message-form');
// input field for message
const message = document.querySelector('#message');
// div displaying chat messages
const chat = document.querySelector('#chat');
// div displaying who's currently typing
const typing = document.querySelector('#typing');


/*   Sockets Code   */

// Establish client websocket connection to served port
const PORT = "http://localhost:4001/";
const socket = io.connect(PORT);

if (socket !== undefined) {
  console.log("Connected to socket...");


  /*   WebSocket Emissions */

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
    chat.scrollTop = chat.scrollHeight;
  })

  // Emit form input message to server
  messageForm.addEventListener('submit', e => {
    e.preventDefault();
    if (message.value) socket.emit('send message', message.value);
    message.value = ''
  })

  // Emit client typing to server
  message.addEventListener('keypress', () => {
    socket.emit('typing', currentUser)
  })


  /*   WebSocket Listeners */

  // Listen for serverside emission: 'output' to handle database cached messages upon initialization
  socket.on("output", (data) => {
    console.log(data);
    if (data.length) {
      chat.innerHTML = '';
      data.map(chatMessage => (
        chat.innerHTML += (`
            <div class="card" style="align-self: center">
              <span><strong class="mr-15">${chatMessage.user}:</strong><em class="speech-bubble">${chatMessage.message}</em></span>
            </div>
          `)
      ))
      chat.scrollTop = chat.scrollHeight;
    }
  });

  // Listen for serverside emissions: 'currentUser', "newUser" and "response message", and use data in callback
  // socket.on('name of emitted data', function(data) {...});
  socket.on('currentUser', user => {
    console.log(`Current user is ${user}`);
    if (!currentUser) currentUser = user;
  })

  socket.on('newUser', newUser => {
    console.log(`${newUser} joined chat`);
  });

  // Listen for serverside emission: "sending users"
  socket.on('sending users', (users) => {
    console.log(`Participating users: ${users}`);
    const usersHTML = ""
    usersUl.innerHTML = users.map(user => usersHTML.concat(`<li>${user} joined chat</li>`)).join('');
  })

  socket.on('response message', data => {
    let side = 'start';
    if (currentUser === data.user) side = 'end';
    chat.innerHTML += (`<div class="card" style="align-self: flex-${side}">
  <span><strong class="mr-15">${data.user}:</strong><em class="speech-bubble">${data.message}</em></span>
  </div>`);
    chat.scrollTop = chat.scrollHeight;
    typing.innerHTML = ''
  });

  // Listen for serverside emission: "typing", and output data to DOM
  socket.on('typing', screenname => {
    typing.innerHTML = `<p><em>${screenname} is typing...</em></p>`
  })


  // Handle Chat Clear
  clearBtn.addEventListener("click", () => {
    socket.emit("clear");
    chat.innerHTML = '';
  });

}