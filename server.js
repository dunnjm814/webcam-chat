const express = require('express');
const app = express();
const http = require('http').Server(app)
const io = require('socket.io')(http)
const port = process.env.PORT || 3000


app.use(express.static(__dirname + '/public'))
let clients = 0

io.on('connection', (socket) => {
  socket.on('NewClient', () => {
    if (clients < 2) {
      if (clients === 1) {
        // if one client, there is one user, second user should run makePeer
        this.emit('CreatePeer')
      }
    } else {
      this.emit('SessionActive')
      clients++
    }
  })
  socket.on('Offer', sendOffer)
  socket.on('Answer', sendAnswer)
  socket.on('Disconnect', disconnect)
})

function disconnect() {
  if (clients > 0) {
    if (clients <= 2) this.broadcast.emit("Disconnect");
    clients--;
  }
}

function sendOffer(offer) {
  this.broadcast.emit("BackOffer", offer)
}

function sendAnswer(data) {
  this.broadcast.emit("BackAnswer", data)
}

http.listen(port, () => {
  console.log(`Active on port: ${port}`)
})
