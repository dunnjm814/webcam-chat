let Peer = require('simple-peer')
let socket = io()
const video = document.querySelector('video')
const darkMode = document.querySelector('#theme')
let client = {}


// get stream

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => {
    socket.emit("NewClient")
    video.srcObject = stream;
    video.play()

    // init a peer
    function InitPeer(type) {
      let peer = new Peer({ initiator: (type === 'init') ? true : false, stream: stream, trickle: false })
      peer.on('stream', (stream) => {
        createVideo(stream)
      })
      peer.on('close', () => {
        document.getElementById('peerVideo').remove()
        peer.destroy()
      })
      return peer;
    }
    // for peer of type init
    function makePeer() {
      client.gotAnswer = false;
      let peer = InitPeer('init')
      peer.on('signal', (data) => {
        if (!client.gotAnswer) {
          socket.emit('Offer', data)
        }
      })
      client.peer = peer;
    }

    // for peer of type not init
    function frontAnswer(offer) {
      let peer = InitPeer('notInit')
      peer.on('signal', (data) => {
        socket.emit('Answer', data)
      })
      peer.signal(offer)
      client.peer = peer
    }

    function signalAnswer(answer) {
      client.gotAnswer = true
      let peer = client.peer
      peer.signal(answer)
    }

    function createVideo(stream) {
      createDiv()

      let video = document.createElement('video')
      video.id = 'peerVideo'
      video.srcObject = stream
      video.setAttribute('class', 'embed-responsive-item')
      document.querySelector('#peer-div').appendChild(video)
      video.play()

      video.addEventListener('click', () => {
                if (video.volume != 0)
                    video.volume = 0
                else
                    video.volume = 1
            })
    }

    function sessionActive() {
      console.write("session active")
    }

    function removePeer() {
            document.getElementById("peerVideo").remove();
            document.getElementById("muteText").remove();
            if (client.peer) {
                client.peer.destroy()
            }
        }

    socket.on('BackOffer', frontAnswer)
    socket.on('BackAnswer', signalAnswer)
    socket.on('SessionActive', sessionActive)
    socket.on('CreatePeer', makePeer)
    socket.on('Disconnect', removePeer)
  })
.catch(err => document.write(err))

darkMode.addEventListener("click", () => {
  if (darkMode.checked == true) {
    document.body.style.backgroundColor = "#212529";
    if (document.querySelector("#muteText")) {
      document.querySelector("#muteText").style.color = "#fff";
    }
  } else {
    document.body.style.backgroundColor = "#fff";
    if (document.querySelector("#muteText")) {
      document.querySelector("#muteText").style.color = "#212529";
    }
  }
});

function createDiv() {
  let div = document.createElement('div')
  div.setAttribute('class', "centered")
  div.id = "muteText"
  div.innerHTML = "Click to Mute/Unmute"
  document.querySelector('#peerDiv').appendChild(div)
  if (darkMode.checked == true) {
    document.querySelector("#muteText").style.color = "#fff";
  }
}
