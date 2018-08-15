const serverPathUrl = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
const cettiaUrl = window.location.protocol + '//' + window.location.host + serverPathUrl + "cettia";
const socket = cettia.open(cettiaUrl);	

const peers = new Map();

const nodes = new vis.DataSet();
const edges = new vis.DataSet();

const container = document.getElementById('peers');
const network = new vis.Network(container, {nodes, edges}, {});

const messageInputField = document.getElementById('messageTa');
const outputDiv = document.getElementById('output');

let clientId = sessionStorage.getItem("clientId");
if (!clientId) {
	clientId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	  });
	sessionStorage.setItem("clientId", clientId);
}

messageInputField.addEventListener('keypress', event => {
	if (event.keyCode == 13) {
		sendP2PMessage(messageInputField.value);
		messageInputField.value = '';
	}
});

document.getElementById('sendButton').addEventListener('click', event => {	
	sendP2PMessage(messageInputField.value);
	messageInputField.value = '';
});


socket.on('peer.connected', peerConnected);
socket.on('peer.disconnected', peerDisconnected); 

socket.on('offer', offerReceived);
socket.on('answer', answerReceived);
socket.on('ice', iceReceived);

socket.on('open', () => {
  socket.send('connect', {clientId});
  nodes.add({id:clientId, label:clientId, color:{background:'#C3E186'}});	
	document.getElementById('socketSessionIdOutput').innerText = clientId;
});

const configuration = {
  iceServers: [{ urls: 'stun:stun.stunprotocol.org:3478' }] 
}; 
 
function peerConnected(msg) {
	const peerKey = msg.id;	
	
	const rtcPeerConnection = new RTCPeerConnection(configuration);
	rtcPeerConnection.onicecandidate = onIceCandidate.bind(rtcPeerConnection, peerKey);
	
	const dataChannel = rtcPeerConnection.createDataChannel("dataChannel");
	dataChannel.onopen = handleChannelStatusChange.bind(dataChannel, peerKey);
	dataChannel.onclose = handleChannelStatusChange.bind(dataChannel, peerKey);
	dataChannel.onmessage = onDataChannelMessage.bind(dataChannel, peerKey);
		
	rtcPeerConnection.createOffer()
	  .then(offer => rtcPeerConnection.setLocalDescription(offer))
	  .then(() => socket.send('offer', {receiver:peerKey, id:clientId, localDescription:rtcPeerConnection.localDescription}))
	  .catch(reason => console.log(reason));

	peers.set(peerKey, {rtcPeerConnection, dataChannel});
}

function peerDisconnected(msg) {
	const peerKey = msg.id;
	const peer = peers.get(peerKey);
	if (peer) {		
		if (peer.dataChannel) {
			peer.dataChannel.close();
		}
		
		if (peer.rtcPeerConnection) {
			peer.rtcPeerConnection.close();
		}
		
		peers.delete(peerKey);
	}
}

function offerReceived(msg) {
	const peerKey = msg.id;
	const offer = msg.localDescription;
	let dataChannel;
	
	let rtcPeerConnection = new RTCPeerConnection(configuration);
	rtcPeerConnection.onicecandidate = onIceCandidate.bind(rtcPeerConnection, peerKey);
	rtcPeerConnection.ondatachannel = (event) => {
		let dataChannel = event.channel;		
		dataChannel.onopen = handleChannelStatusChange.bind(dataChannel, peerKey);
		dataChannel.onclose = handleChannelStatusChange.bind(dataChannel, peerKey);
		dataChannel.onmessage = onDataChannelMessage.bind(dataChannel, peerKey);
		peers.set(peerKey, {rtcPeerConnection, dataChannel});
	};
	
	rtcPeerConnection.setRemoteDescription(offer)
	.then(() => rtcPeerConnection.createAnswer())
    .then(answer => rtcPeerConnection.setLocalDescription(answer))
	.then(() => socket.send('answer', {receiver:peerKey, id:clientId, localDescription:rtcPeerConnection.localDescription}))
	.catch(reason => console.log(reason));	

	peers.set(peerKey, {rtcPeerConnection});
}

function answerReceived(msg) {
	const peerKey = msg.id;
	const answer = msg.localDescription;
	const peer = peers.get(peerKey);
	if (peer) {
		peer.rtcPeerConnection.setRemoteDescription(answer);
	}
}

function iceReceived(msg) {
	const peerKey = msg.id;
	const ice = msg.candidate;
	const peer = peers.get(peerKey);
	if (peer) {
		peer.rtcPeerConnection.addIceCandidate(ice);
	}
}

function handleChannelStatusChange(peerKey, event) {
	const dataChannel = event.currentTarget;
	if (dataChannel) {
		const state = dataChannel.readyState;		
		if (state === "open") {	
			nodes.remove(peerKey);
			edges.remove(clientId+'-'+peerKey);					
			nodes.add({id:peerKey, label:peerKey});
			edges.add({id:clientId+'-'+peerKey, from:clientId, to:peerKey});
			
			for (let key of peers.keys()) {
			  if (key !== peerKey) {
				  
				  const connections = edges.get({
					  filter: edge => edge.from === key && edge.to === peerKey ||
					                  edge.from === peerKey && edge.to === key
				  });
				  if (!connections || connections.length === 0) {				  
					  edges.add({from:key, to:peerKey});
				  }
			  }
			}			
		}
		else {
			nodes.remove(peerKey);
		}
	}
}

function onIceCandidate(peerKey, event) {
    if (event.candidate) { 
    	socket.send('ice', {receiver:peerKey, id:clientId, candidate:event.candidate})
    } 
}

function onDataChannelMessage(peerKey, event) {
	outputDiv.innerHTML = `<p>Message '<strong>${event.data}</strong>' received from ${peerKey}</p>`
		+ outputDiv.innerHTML;
}

function sendP2PMessage(msg) {
	outputDiv.innerHTML = `<p>Sent message '<strong>${msg}</strong>' to peers</p>`
		+ outputDiv.innerHTML;
	
	for (let peer of peers.values()) {
		if (peer.dataChannel && peer.dataChannel.readyState === 'open') {
			peer.dataChannel.send(msg);
		}
	}
}
