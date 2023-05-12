const localVideo = document.getElementById("local-video");
const remoteVideo = document.getElementById("remote-video");

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then((stream) => {
    localVideo.srcObject = stream;
  })
  .catch((err) => {
    console.log(err);
  });
  const configuration = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };
  const peerConnection = new RTCPeerConnection(configuration);
  
  peerConnection.addEventListener("icecandidate", (event) => {
    if (event.candidate) {
      // Send the candidate to the remote peer
    }
  });
  
  peerConnection.addEventListener("track", (event) => {
    remoteVideo.srcObject = event.streams[0];
  });
  
  localVideo.srcObject.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localVideo.srcObject);
  });
  const ws = new WebSocket("ws://localhost:3000");

  ws.addEventListener("open", () => {
    console.log("WebSocket connection established");
  });
  
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
  
    if (message.type === "offer") {
      peerConnection.setRemoteDescription(new RTCSessionDescription(message.offer))
        .then(() => peerConnection.createAnswer())
        .then((answer) => peerConnection.setLocalDescription(answer))
        .then(() => {
          ws.send(JSON.stringify({ type: "answer", answer: peerConnection.localDescription }));
        });
    } else if (message.type === "answer") {
      peerConnection.setRemoteDescription(new RTCSessionDescription(message.answer));
    } else if (message.type === "candidate") {
      peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
    }
  });
  
  function sendOffer() {
    peerConnection.createOffer()
      .then((offer) => peerConnection.setLocalDescription(offer))
      .then(() => {
        ws.send(JSON.stringify({ type: "offer", offer: peerConnection.localDescription }));
      });
  }
<button onclick="sendOffer()">Call</button>
    