var serverPathUrl = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
var cettiaUrl = window.location.protocol + '//' + window.location.host + serverPathUrl + "cettia";

var socket = cettia.open(cettiaUrl).on('chat', onChatMessage);	

var logDiv = document.getElementById('log');
var msgInput = document.getElementById('msgInput');
msgInput.addEventListener('keypress', function(e) {
	if (e.keyCode == 13) {
		sendMessage();
	}
});
document.getElementById('sendButton').addEventListener('click', function() {
	sendMessage();
});

function onChatMessage(msg) {
	show(msg, false);
}

// Send a new chat message
function sendMessage() {
	var value = msgInput.value;
	if (value) {
		var message = {
			text: msgInput.value,
			sentAt: new Date().toLocaleTimeString()
		};

		socket.send('chat', message);
		show(message, true);
		msgInput.value = '';
	}
}

function show(message, me) {
	var msgAlign = me ? "right" : "left";
	var msgLog = "<div class='blockquote-" + msgAlign + "'>"
	msgLog += message.text + "<br>";
	msgLog += "<span class='time'>" + message.sentAt + "</span></div>"
	
	var old = logDiv.innerHTML;
	logDiv.innerHTML = msgLog + old;
}
