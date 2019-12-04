# ioChat

### Websocket chat app using node, express, socket.io, vanilla JS DOM manipulation, and plain ole CSS

**ioChat** is a real time chat app that persists messages and has a Skype inspired design. It was built to practice [Socket.io](https://socket.io/), a real-time event based bidirection communication library for Javascript. Chat messages left by app users are cached in a [MongoDB](https://www.mongodb.com/) server to allow a persisted history upon susequent sign in.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites & Install Dependencies

node, express, mongodb, socket.io, socket.io-client, nodemon

These are provided as dependencies in the package.json, and therefore can be installed with

```
npm install
```

## Run Server
```
nodemon server.js
```

## Run App
Open public/index.html


<img src="https://i.ibb.co/NyZ4Wck/homescreen.png" alt="homescreen" border="0">

<img src="https://i.ibb.co/34FwST9/chatscreen.png" alt="chatscreen" border="0">

## Author

**Abdul Sayed**

## Acknowledgments

- Inspiration: Skype from the old days
